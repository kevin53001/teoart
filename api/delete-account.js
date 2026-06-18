// api/delete-account.js
// Supprime toutes les données d'un utilisateur et son compte Supabase Auth.
// Appelé depuis MonCompte.js après confirmation de l'utilisateur.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId manquant' });

    // 1. Supprimer les données dans toutes les tables liées
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

    // 2. Supprimer le compte Auth Supabase
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw new Error(`Suppression auth: ${error.message}`);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('delete-account error:', err);
    return res.status(500).json({ error: err.message });
  }
};