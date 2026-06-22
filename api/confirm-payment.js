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
    const { paymentIntentId, userId, articles, remisesDetail } = req.body;

    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId manquant' });
    if (!userId)          return res.status(400).json({ error: 'userId manquant' });
    if (!articles?.length) return res.status(400).json({ error: 'Articles manquants' });

    // 1. Vérifier que le paiement est bien réussi côté Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return res.status(400).json({ error: `Paiement non confirmé (status: ${pi.status})` });
    }

    // 2. Calculer la répartition du montant réellement payé sur chaque article.
    // On part des prix catalogue (prixBrut, envoyés par le client) comme poids,
    // mais le total enregistré correspond TOUJOURS exactement à pi.amount_received
    // (vérifié côté Stripe) — quelle que soit la promo appliquée côté panier
    // (paliers, badges, PDF -75%...), donc le CA admin reste fiable même si la
    // répartition par article est une approximation proportionnelle.
    const montantPayeCentimes = pi.amount_received || pi.amount || 0;
    const totalBrutCentimes = articles.reduce((s, a) => s + Math.round((a.prixBrut || 0) * 100), 0);

    const prixParArticle = articles.map(a => {
      const brutCentimes = Math.round((a.prixBrut || 0) * 100);
      if (totalBrutCentimes <= 0) {
        // fallback : répartition égale si aucun prix brut connu
        return Math.round(montantPayeCentimes / articles.length) / 100;
      }
      return Math.round((brutCentimes / totalBrutCentimes) * montantPayeCentimes) / 100;
    });

    // Ajustement du dernier article pour compenser les arrondis (somme exacte)
    if (prixParArticle.length > 0) {
      const sommeCentimes = prixParArticle.reduce((s, p) => s + Math.round(p * 100), 0);
      const ecartCentimes = montantPayeCentimes - sommeCentimes;
      if (ecartCentimes !== 0) {
        const dernier = prixParArticle.length - 1;
        prixParArticle[dernier] = Math.round(prixParArticle[dernier] * 100 + ecartCentimes) / 100;
      }
    }

    // 3. Pour chaque article, récupérer le chemin fichier_pdf depuis Supabase
    const lignes = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const prix = prixParArticle[i];
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
          prix,
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
        prix,
        commande_recente: true,
      });
    }

    // 3. Upsert dans commandes_articles
    if (lignes.length > 0) {
      // Ajouter remises sur la première ligne uniquement
      if (remisesDetail && remisesDetail.length > 0) {
        lignes[0].remises = remisesDetail;
      }
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