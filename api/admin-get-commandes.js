import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const adminId = process.env.ADMIN_USER_ID
  const { userId } = req.query
  if (userId !== adminId) return res.status(403).json({ error: 'Accès refusé' })

  try {
    // Récupère tous les articles reliés avec infos commande
    const { data: articles, error } = await supabase
      .from('commandes_articles')
      .select('*, commandes(user_id, created_at, montant_total)')
      .eq('type', 'relie')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enrichit avec les infos profil client
    const userIds = [...new Set((articles || []).map(a => a.commandes?.user_id).filter(Boolean))]

    const { data: profils } = await supabase
      .from('profils')
      .select('id, prenom, nom, email, telephone, adresse, code_postal, ville, pays')
      .in('id', userIds)

    const profilMap = {}
    ;(profils || []).forEach(p => { profilMap[p.id] = p })

    // Récupère emails auth
    const emailMap = {}
    for (const uid of userIds) {
      const { data } = await supabase.auth.admin.getUserById(uid)
      if (data?.user?.email) emailMap[uid] = data.user.email
    }

    const result = (articles || []).map(a => {
      const uid = a.commandes?.user_id
      const profil = profilMap[uid] || {}
      return {
        id: a.id,
        commande_id: a.commande_id,
        nom_article: a.nom,
        sous_type: a.sousType,
        statut: a.statut || 'en_attente',
        livreur: a.livreur,
        numero_suivi: a.numero_suivi,
        lien_suivi: a.lien_suivi,
        date_livraison_estimee: a.date_livraison_estimee,
        note_client: a.note_client,
        notif_envoyee_expedition: a.notif_envoyee_expedition,
        notif_envoyee_livraison: a.notif_envoyee_livraison,
        date_commande: a.commandes?.created_at,
        client: {
          id: uid,
          prenom: profil.prenom || '',
          nom: profil.nom || '',
          email: profil.email || emailMap[uid] || '',
          telephone: profil.telephone || '',
          adresse: profil.adresse || '',
          code_postal: profil.code_postal || '',
          ville: profil.ville || '',
          pays: profil.pays || ''
        }
      }
    })

    res.status(200).json({ commandes: result })
  } catch (err) {
    console.error('admin-get-commandes error:', err)
    res.status(500).json({ error: err.message })
  }
}
