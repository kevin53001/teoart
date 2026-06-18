// api/refresh-download.js
// Génère une signed URL R2 fraîche (60s) pour un article appartenant à l'utilisateur.
// Appelé à chaque clic sur "Télécharger" dans Mon Compte.

const { createClient } = require('@supabase/supabase-js');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { articleId, userId } = req.body;

    if (!articleId) return res.status(400).json({ error: 'articleId manquant' });
    if (!userId)    return res.status(400).json({ error: 'userId manquant' });

    // 1. Vérifier que l'article appartient bien à cet utilisateur
    const { data: article, error } = await supabase
      .from('commandes_articles')
      .select('id, user_id, fichier_pdf, nom')
      .eq('id', articleId)
      .single();

    if (error || !article) return res.status(404).json({ error: 'Article introuvable' });
    if (article.user_id !== userId) return res.status(403).json({ error: 'Accès refusé' });
    if (!article.fichier_pdf) return res.status(400).json({ error: 'Pas de fichier PDF associé' });

    // 2. Générer une signed URL fraîche valable 60 secondes
    const cmd = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: article.fichier_pdf,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(article.nom + '.pdf')}"`,
    });
    const url = await getSignedUrl(r2, cmd, { expiresIn: 60 });

    return res.status(200).json({ url });

  } catch (err) {
    console.error('refresh-download error:', err);
    return res.status(500).json({ error: err.message });
  }
};
