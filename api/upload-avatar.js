import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, userId } = req.body;
    if (!imageBase64 || !userId) return res.status(400).json({ error: 'Paramètres manquants' });

    // Décoder le base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const key = `avatars/${userId}.jpg`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      CacheControl: 'no-cache',
    }));

    const url = `https://images.kevinteoart.fr/${key}?t=${Date.now()}`;
    return res.status(200).json({ url });
  } catch (e) {
    console.error('upload-avatar error:', e);
    return res.status(500).json({ error: e.message });
  }
}