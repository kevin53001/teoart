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
    const [
      { count: nbInscrits },
      { count: nbCommandes },
      { count: nbColoriages },
      { data: topAcheteurs },
      { data: topColoristes },
      { data: topCommentateurs },
      { data: topLikeurs },
      { data: statsParUsager },
      { data: caData }
    ] = await Promise.all([
      supabase.from('profils').select('*', { count: 'exact', head: true }),
      supabase.from('commandes').select('*', { count: 'exact', head: true }),
      supabase.from('coloriages').select('*', { count: 'exact', head: true }),

      // Top acheteurs : nombre de commandes par user
      supabase.rpc('top_acheteurs', { limit_n: 10 }),

      // Top coloristes : nombre de coloriages partagés par user
      supabase.from('coloriages')
        .select('user_id, profils(prenom, nom)')
        .order('created_at', { ascending: false }),

      // Top commentateurs
      supabase.rpc('top_commentateurs', { limit_n: 10 }),

      // Top likeurs
      supabase.rpc('top_likeurs', { limit_n: 10 }),

      // Stats par usager pour le tableau
      supabase.from('profils')
        .select('id, prenom, nom, email, created_at'),

      // CA total depuis commandes
      supabase.from('commandes').select('montant_total')
    ])

    // Calcul CA
    const caTotal = (caData || []).reduce((sum, c) => sum + (c.montant_total || 0), 0)

    // Coloriages par user
    const coloriagesParUser = {}
    ;(nbColoriages ? [] : []).forEach(() => {})
    const coloriagesRaw = await supabase.from('coloriages').select('user_id')
    ;(coloriagesRaw.data || []).forEach(c => {
      coloriagesParUser[c.user_id] = (coloriagesParUser[c.user_id] || 0) + 1
    })

    // Commandes par user
    const commandesParUser = {}
    const commandesRaw = await supabase.from('commandes').select('user_id, montant_total')
    ;(commandesRaw.data || []).forEach(c => {
      commandesParUser[c.user_id] = {
        nb: (commandesParUser[c.user_id]?.nb || 0) + 1,
        total: (commandesParUser[c.user_id]?.total || 0) + (c.montant_total || 0)
      }
    })

    // Commentaires par user
    const commentsRaw1 = await supabase.from('commentaires_coloriages').select('user_id')
    const commentsRaw2 = await supabase.from('commentaires_pensees').select('user_id')
    const commentairesParUser = {}
    ;[...(commentsRaw1.data || []), ...(commentsRaw2.data || [])].forEach(c => {
      commentairesParUser[c.user_id] = (commentairesParUser[c.user_id] || 0) + 1
    })

    // Likes par user
    const likesRaw1 = await supabase.from('likes_coloriages').select('user_id')
    const likesRaw2 = await supabase.from('likes_pensees').select('user_id')
    const likesParUser = {}
    ;[...(likesRaw1.data || []), ...(likesRaw2.data || [])].forEach(l => {
      likesParUser[l.user_id] = (likesParUser[l.user_id] || 0) + 1
    })

    // Tableau usagers enrichi
    const usagers = (statsParUsager || []).map(u => ({
      id: u.id,
      prenom: u.prenom,
      nom: u.nom,
      email: u.email,
      inscrit_le: u.created_at,
      nb_commandes: commandesParUser[u.id]?.nb || 0,
      ca_genere: commandesParUser[u.id]?.total || 0,
      nb_coloriages: coloriagesParUser[u.id] || 0,
      nb_commentaires: commentairesParUser[u.id] || 0,
      nb_likes: likesParUser[u.id] || 0
    }))

    res.status(200).json({
      global: {
        nb_inscrits: nbInscrits || 0,
        nb_commandes: nbCommandes || 0,
        nb_coloriages: nbColoriages || 0,
        ca_total: caTotal
      },
      usagers
    })
  } catch (err) {
    console.error('admin-stats error:', err)
    res.status(500).json({ error: err.message })
  }
}
