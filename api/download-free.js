const { createClient } = require('@supabase/supabase-js');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const supabase = createClient(
  'https://jwwxegkyvrvdgazjxhsy.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { userId, itemId, itemType, fichierPdf } = req.body;

  if (!userId || !itemId || !itemType || !fichierPdf) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  try {
    // Vérifier que l'item est bien gratuit (prix = 0)
    const table = itemType === 'livre' ? 'livres' : itemType === 'recueil' ? 'recueils' : 'illustrations';
    const { data: item } = await supabase.from(table).select('prix').eq('id', itemId).single();
    if (!item || parseFloat(item.prix || 0) !== 0) {
      return res.status(403).json({ error: 'Cet item n\'est pas gratuit' });
    }

    // Générer URL signée R2 (valable 60 secondes)
    const nomFichier = fichierPdf.split('/').pop();
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fichierPdf,
      ResponseContentDisposition: `attachment; filename="${nomFichier}"`,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    // Enregistrer le téléchargement en base
    await supabase.from('telechargements_gratuits').insert({
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      fichier: fichierPdf,
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({ url });
  } catch (err) {
    console.error('download-free error:', err);
    return res.status(500).json({ error: err.message });
  }
};