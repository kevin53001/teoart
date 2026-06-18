// api/confirm-payment.js
// Appelé par le client après succès Stripe.
// Stocke le chemin R2 brut dans commandes_articles.
// La signed URL est générée à la demande via api/refresh-download.js

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { paymentIntentId, userId, articles } = req.body;

    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId manquant' });
    if (!userId)          return res.status(400).json({ error: 'userId manquant' });
    if (!articles?.length) return res.status(400).json({ error: 'Articles manquants' });

    // 1. Vérifier que le paiement est bien réussi côté Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return res.status(400).json({ error: `Paiement non confirmé (status: ${pi.status})` });
    }

    // 2. Pour chaque article, récupérer le chemin fichier_pdf depuis Supabase
    const lignes = [];

    for (const article of articles) {
      let fichierPdf = null;

      if (article.type === 'illustration') {
        const { data } = await supabase
          .from('illustrations')
          .select('fichier_pdf')
          .eq('id', article.id)
          .single();
        fichierPdf = data?.fichier_pdf || null;

      } else if (article.type === 'livre_pdf') {
        const { data } = await supabase
          .from('livres')
          .select('fichier_pdf')
          .eq('id', article.id)
          .single();
        fichierPdf = data?.fichier_pdf || null;

      } else if (article.type === 'recueil') {
        const { data } = await supabase
          .from('recueils')
          .select('fichier_pdf')
          .eq('id', article.id)
          .single();
        fichierPdf = data?.fichier_pdf || null;

      } else if (article.type === 'relie') {
        // Pas de PDF pour les reliés — enregistrement pour suivi uniquement
        lignes.push({
          user_id:          userId,
          commande_id:      paymentIntentId,
          nom:              article.nom,
          type:             article.type,
          fichier_pdf:      null,
          commande_recente: true,
        });
        continue;
      }

      lignes.push({
        user_id:          userId,
        commande_id:      paymentIntentId,
        nom:              article.nom,
        type:             article.type,
        fichier_pdf:      fichierPdf, // chemin R2 brut, pas de signed URL
        commande_recente: true,
      });
    }

    // 3. Upsert dans commandes_articles
    if (lignes.length > 0) {
      const { error } = await supabase
        .from('commandes_articles')
        .upsert(lignes, { onConflict: 'commande_id,type,nom', ignoreDuplicates: false });
      if (error) throw new Error(`Supabase insert: ${error.message}`);
    }

    return res.status(200).json({ ok: true, nb: lignes.length });

  } catch (err) {
    console.error('confirm-payment error:', err);
    return res.status(500).json({ error: err.message });
  }
};
