// api/confirm-payment.js
// Appelé par le client après succès Stripe.
// Récupère les articles de la commande, génère les signed URLs R2 (PDF),
// les écrit dans commandes_articles, et marque commande_recente = true.

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // clé service, pas anon
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, // https://<accountid>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME; // ex: "kevinteoart"
const URL_EXPIRY = 3600; // 1 heure

async function genererSignedUrl(fichierPdf) {
  if (!fichierPdf) return null;
  try {
    const cmd = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: fichierPdf,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fichierPdf.split('/').pop())}"`,
    });
    return await getSignedUrl(r2, cmd, { expiresIn: URL_EXPIRY });
  } catch (e) {
    console.error('Erreur signed URL R2:', e.message, fichierPdf);
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { paymentIntentId, userId, articles } = req.body;
    // articles : [ { type, id, nom, image } ] — envoyés par le client au moment du succès

    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId manquant' });
    if (!userId)          return res.status(400).json({ error: 'userId manquant' });
    if (!articles?.length) return res.status(400).json({ error: 'Articles manquants' });

    // 1. Vérifier que le paiement est bien réussi côté Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return res.status(400).json({ error: `Paiement non confirmé (status: ${pi.status})` });
    }

    // 2. Pour chaque article, récupérer le fichier_pdf depuis Supabase et générer l'URL signée
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
        // Pas de PDF pour les reliés — on les enregistre quand même pour le suivi
        lignes.push({
          user_id:             userId,
          commande_id:         paymentIntentId,
          nom:                 article.nom,
          type:                article.type,
          lien_telechargement: null,
          commande_recente:    true,
        });
        continue;
      }

      const signedUrl = await genererSignedUrl(fichierPdf);

      lignes.push({
        user_id:             userId,
        commande_id:         paymentIntentId,
        nom:                 article.nom,
        type:                article.type,
        lien_telechargement: signedUrl,
        commande_recente:    true,
      });
    }

    // 3. Insérer dans commandes_articles (upsert par commande_id + type + nom pour éviter doublons)
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
