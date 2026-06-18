import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const adminId = process.env.ADMIN_USER_ID
  const { userId, commentaire_id, table } = req.body
  // table = 'commentaires_coloriages' | 'commentaires_pensees'

  if (userId !== adminId) return res.status(403).json({ error: 'Accès refusé' })
  if (!['commentaires_coloriages', 'commentaires_pensees'].includes(table)) {
    return res.status(400).json({ error: 'Table invalide' })
  }

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', commentaire_id)

    if (error) throw error
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('admin-delete-comment error:', err)
    res.status(500).json({ error: err.message })
  }
}
