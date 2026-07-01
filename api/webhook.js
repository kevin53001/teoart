// api/webhook.js
// Reçoit les événements Stripe (payment_intent.succeeded) et insère
// dans commandes_articles depuis le snapshot stocké dans paniers_en_attente.
// Double sécurité : si confirm-payment a déjà tourné côté client,
// l'upsert avec onConflict ignore le doublon sans erreur.

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Nécessaire pour vérifier la signature Stripe (raw body)
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature invalide:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type !== 'payment_intent.succeeded') {
    return res.status(200).json({ ignored: true });
  }

  const pi = event.data.object;
  const paymentIntentId = pi.id;

  try {
    // 1. Récupérer le snapshot panier
    const { data: snapshot, error: snapErr } = await supabase
      .from('paniers_en_attente')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (snapErr || !snapshot) {
      // Pas de snapshot = paiement trop ancien ou create-payment-intent n'a pas reçu userId/articles.
      // confirm-payment côté client aura géré (ou l'admin devra insérer manuellement).
      console.warn('Webhook: pas de snapshot pour', paymentIntentId);
      return res.status(200).json({ warning: 'pas de snapshot' });
    }

    const { user_id: userId, articles, remises_detail: remisesDetail } = snapshot;

    // 2. Calculer la répartition des prix (même logique que confirm-payment)
    const montantPayeCentimes = pi.amount_received || pi.amount || 0;
    const totalBrutCentimes = articles.reduce((s, a) => s + Math.round((a.prixBrut || 0) * 100), 0);

    const prixParArticle = articles.map(a => {
      const brutCentimes = Math.round((a.prixBrut || 0) * 100);
      if (totalBrutCentimes <= 0) return Math.round(montantPayeCentimes / articles.length) / 100;
      return Math.round((brutCentimes / totalBrutCentimes) * montantPayeCentimes) / 100;
    });

    if (prixParArticle.length > 0) {
      const sommeCentimes = prixParArticle.reduce((s, p) => s + Math.round(p * 100), 0);
      const ecartCentimes = montantPayeCentimes - sommeCentimes;
      if (ecartCentimes !== 0) {
        prixParArticle[prixParArticle.length - 1] =
          Math.round(prixParArticle[prixParArticle.length - 1] * 100 + ecartCentimes) / 100;
      }
    }

    // 3. Récupérer les chemins fichier_pdf
    const lignes = [];
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const prix = prixParArticle[i];
      let fichierPdf = null;

      if (article.type === 'illustration') {
        const { data } = await supabase.from('illustrations').select('fichier_pdf').eq('id', article.id).single();
        fichierPdf = data?.fichier_pdf || null;
      } else if (article.type === 'livre_pdf') {
        const { data } = await supabase.from('livres').select('fichier_pdf').eq('id', article.id).single();
        fichierPdf = data?.fichier_pdf || null;
      } else if (article.type === 'recueil') {
        const { data } = await supabase.from('recueils').select('fichier_pdf').eq('id', article.id).single();
        fichierPdf = data?.fichier_pdf || null;
      }

      const ligne = {
        user_id: userId,
        commande_id: paymentIntentId,
        nom: article.nom,
        type: article.type,
        fichier_pdf: fichierPdf,
        prix,
        commande_recente: true,
      };

      if (i === 0 && remisesDetail?.length > 0) ligne.remises = remisesDetail;
      lignes.push(ligne);
    }

    // 4. Upsert (ignore si confirm-payment a déjà inséré)
    if (lignes.length > 0) {
      const { error } = await supabase
        .from('commandes_articles')
        .upsert(lignes, { onConflict: 'commande_id,type,nom', ignoreDuplicates: true });
      if (error) throw new Error(`Supabase upsert: ${error.message}`);
    }

    // 5. Nettoyer le snapshot (optionnel, garde la base propre)
    await supabase.from('paniers_en_attente').delete().eq('payment_intent_id', paymentIntentId);

    console.log(`Webhook: commande insérée pour ${paymentIntentId} (${lignes.length} articles)`);
    return res.status(200).json({ ok: true, nb: lignes.length });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};
