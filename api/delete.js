// api/delete.js
// Fusion de delete-account.js + delete-colo.js (limite 12 fonctions Vercel Hobby).
// Routage via le champ "action" du body : 'compte' ou 'colo'.

const { createClient } = require('@supabase/supabase-js');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// ── Suppression complète d'un compte (ex delete-account.js) ──
async function supprimerCompte(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId manquant' });

  await supabase.from('commandes_articles').delete().eq('user_id', userId);
  await supabase.from('commandes').delete().eq('user_id', userId);
  await supabase.from('collection').delete().eq('user_id', userId);
  await supabase.from('collection_livres').delete().eq('user_id', userId);
  await supabase.from('coloriages').delete().eq('user_id', userId);
  await supabase.from('likes_coloriages').delete().eq('user_id', userId);
  await supabase.from('likes_pensees').delete().eq('user_id', userId);
  await supabase.from('commentaires_coloriages').delete().eq('user_id', userId);
  await supabase.from('commentaires_pensees').delete().eq('user_id', userId);
  await supabase.from('pensees_vues').delete().eq('user_id', userId);
  await supabase.from('notifications').delete().eq('user_id', userId);
  await supabase.from('telechargements_gratuits').delete().eq('user_id', userId);
  await supabase.from('profils').delete().eq('id', userId);

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw new Error(`Suppression auth: ${error.message}`);

  return res.status(200).json({ ok: true });
}

// ── Suppression d'un coloriage sur R2 (ex delete-colo.js) ──
async function supprimerColo(req, res) {
  const { chemin, userId } = req.body;
  if (!chemin || !userId) return res.status(400).json({ error: 'Paramètres manquants' });

  await R2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: chemin,
  }));

  return res.status(200).json({ ok: true });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { action } = req.body;
    if (action === 'compte') return await supprimerCompte(req, res);
    if (action === 'colo') return await supprimerColo(req, res);
    return res.status(400).json({ error: 'action invalide (attendu: "compte" ou "colo")' });
  } catch (err) {
    console.error('delete error:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports.config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
