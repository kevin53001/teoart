// api/confirm-payment.js
// Deux rôles dans un seul fichier (limite 12 fonctions Vercel Hobby) :
// 1. Appelé par le client après succès Stripe → body JSON classique
// 2. Appelé par Stripe via webhook → header stripe-signature
// Dans les deux cas, insère dans commandes_articles.
// L'upsert avec onConflict empêche les doublons si les deux s'exécutent.

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Logique partagée : récupère les fichier_pdf et insère dans commandes_articles
async function insererCommande({ userId, paymentIntentId, articles, remisesDetail, montantPayeCentimes, ignorerDoublons }) {
  // Répartition proportionnelle des prix
  const totalBrutCentimes = articles.reduce((s, a) => s + Math.round((a.prixBrut || 0) * 100), 0);

  const prixParArticle = articles.map(a => {
    const brutCentimes = Math.round((a.prixBrut || 0) * 100);
    if (totalBrutCentimes <= 0) return Math.round(montantPayeCentimes / articles.length) / 100;
    return Math.round((brutCentimes / totalBrutCentimes) * montantPayeCentimes) / 100;
  });

  // Ajustement du dernier article pour compenser les arrondis (somme exacte)
  if (prixParArticle.length > 0) {
    const sommeCentimes = prixParArticle.reduce((s, p) => s + Math.round(p * 100), 0);
    const ecartCentimes = montantPayeCentimes - sommeCentimes;
    if (ecartCentimes !== 0) {
      prixParArticle[prixParArticle.length - 1] =
        Math.round(prixParArticle[prixParArticle.length - 1] * 100 + ecartCentimes) / 100;
    }
  }

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
      user_id:          userId,
      commande_id:      paymentIntentId,
      nom:              article.nom,
      type:             article.type,
      fichier_pdf:      fichierPdf,
      prix,
      commande_recente: true,
    };

    if (i === 0 && remisesDetail?.length > 0) ligne.remises = remisesDetail;
    lignes.push(ligne);
  }

  if (lignes.length > 0) {
    const { error } = await supabase
      .from('commandes_articles')
      .upsert(lignes, { onConflict: 'commande_id,type,nom', ignoreDuplicates: ignorerDoublons });
    if (error) throw new Error(`Supabase upsert: ${error.message}`);
  }

  return lignes.length;
}

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  // ── CAS 1 : Webhook Stripe (header stripe-signature présent) ──────────────
  if (sig) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
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
      const { data: snapshot, error: snapErr } = await supabase
        .from('paniers_en_attente')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single();

      if (snapErr || !snapshot) {
        console.warn('Webhook: pas de snapshot pour', paymentIntentId);
        return res.status(200).json({ warning: 'pas de snapshot' });
      }

      const { user_id: userId, articles, remises_detail: remisesDetail } = snapshot;
      const montantPayeCentimes = pi.amount_received || pi.amount || 0;

      // ignorerDoublons: true — ne pas écraser si confirm-payment client a déjà inséré
      const nb = await insererCommande({ userId, paymentIntentId, articles, remisesDetail, montantPayeCentimes, ignorerDoublons: true });

      // Nettoyer le snapshot
      await supabase.from('paniers_en_attente').delete().eq('payment_intent_id', paymentIntentId);

      console.log(`Webhook: commande insérée pour ${paymentIntentId} (${nb} articles)`);
      return res.status(200).json({ ok: true, nb });

    } catch (err) {
      console.error('Webhook error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── CAS 2 : Appel client (pas de stripe-signature) ────────────────────────
  try {
    const body = JSON.parse(rawBody.toString());
    const { paymentIntentId, userId, articles, remisesDetail } = body;

    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId manquant' });
    if (!userId)          return res.status(400).json({ error: 'userId manquant' });
    if (!articles?.length) return res.status(400).json({ error: 'Articles manquants' });

    // Vérifier que le paiement est bien réussi côté Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return res.status(400).json({ error: `Paiement non confirmé (status: ${pi.status})` });
    }

    const montantPayeCentimes = pi.amount_received || pi.amount || 0;

    // ignorerDoublons: false — le client est autoritatif, peut écraser en cas de retry
    const nb = await insererCommande({ userId, paymentIntentId, articles, remisesDetail, montantPayeCentimes, ignorerDoublons: false });

    return res.status(200).json({ ok: true, nb });

  } catch (err) {
    console.error('confirm-payment error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// bodyParser désactivé : requis pour vérifier la signature Stripe (raw body).
// Pour l'appel client, on parse le JSON manuellement depuis le raw body.
handler.config = { api: { bodyParser: false } };

module.exports = handler;