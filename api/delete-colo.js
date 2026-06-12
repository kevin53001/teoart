const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { chemin, userId } = req.body;
    if (!chemin || !userId) return res.status(400).json({ error: 'Paramètres manquants' });

    await R2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: chemin,
    }));

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Delete colo error:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports.config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
