import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const ADMIN_USER_ID = 'd5865b2c-d5b0-4422-bd74-010ef651735c'

// ─── EMAIL BREVO ───────────────────────────────────────────────
async function envoyerEmailBrevo(destinataire, sujet, contenuHtml) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
    body: JSON.stringify({
      sender: { name: "Kevin Teo'Art", email: 'kevinteoart@outlook.fr' },
      to: [{ email: destinataire }],
      subject: sujet,
      htmlContent: contenuHtml
    })
  })
  if (!res.ok) throw new Error(`Brevo error: ${await res.text()}`)
}

function emailExpedition({ prenom, nom, titre, livreur, numero_suivi, lien_suivi, date_livraison_estimee, note_client }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222">
      <h2 style="color:#333">Votre commande est en route !</h2>
      <p>Bonjour ${prenom} ${nom},</p>
      <p>Votre exemplaire de <strong>${titre}</strong> a été expédié.</p>
      ${livreur ? `<p><strong>Transporteur :</strong> ${livreur}</p>` : ''}
      ${numero_suivi ? `<p><strong>Numéro de suivi :</strong> ${numero_suivi}</p>` : ''}
      ${lien_suivi ? `<p><a href="${lien_suivi}" style="color:#0066cc">Suivre ma commande</a></p>` : ''}
      ${date_livraison_estimee ? `<p><strong>Livraison estimée :</strong> ${date_livraison_estimee}</p>` : ''}
      ${note_client ? `<p><em>${note_client}</em></p>` : ''}
      <p>Pour toute question : <a href="mailto:kevinteoart@outlook.fr">kevinteoart@outlook.fr</a></p>
      <p>Merci pour votre confiance,<br><strong>Kevin Teo'Art</strong></p>
    </div>`
}

function emailLivraison({ prenom, nom, titre, note_client }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222">
      <h2 style="color:#333">Votre commande est livrée !</h2>
      <p>Bonjour ${prenom} ${nom},</p>
      <p>Votre exemplaire de <strong>${titre}</strong> a bien été livré.</p>
      ${note_client ? `<p><em>${note_client}</em></p>` : ''}
      <p>J'espère qu'il vous plaira ! Pour toute question : <a href="mailto:kevinteoart@outlook.fr">kevinteoart@outlook.fr</a></p>
      <p>Bonne lecture,<br><strong>Kevin Teo'Art</strong></p>
    </div>`
}

// ─── STATS ─────────────────────────────────────────────────────
async function actionStats() {
  const now = new Date()
  const debutAujourdhui = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const aujourdhuiStr = debutAujourdhui.split('T')[0]
  const debutMois    = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const debutMoisM1  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const finMoisM1    = debutMois
  const debutMoisM2  = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString()
  const finMoisM2    = debutMoisM1

  const dans = (arr, d, f) => (arr||[]).filter(x => x.created_at >= d && (!f || x.created_at < f))
  const mois  = arr => dans(arr, debutMois)
  const moisM1 = arr => dans(arr, debutMoisM1, finMoisM1)
  const moisM2 = arr => dans(arr, debutMoisM2, finMoisM2)
  const ca = arr => (arr||[]).reduce((s,c) => s + (c.prix||0), 0)

  const [
    { data: profils },
    { data: commandesRaw },
    { data: coloriagesRaw },
    { data: commentsColoRaw },
    { data: commentsPenseesRaw },
    { data: likesColoRaw },
    { data: likesPenseesRaw },
    { data: penseesRaw },
    { data: reliesRaw },
    { data: collectionIllusRaw },
    { data: collectionLivresRaw },
    { data: livresRaw },
    { data: recueilsRaw },
    { data: illustrationsRaw },
    { data: presenceJoursRaw }
  ] = await Promise.all([
    supabase.from('profils').select('id, prenom, nom, email, created_at'),
    supabase.from('commandes_articles').select('user_id, prix, created_at'),
    supabase.from('coloriages').select('user_id, created_at'),
    supabase.from('commentaires_coloriages').select('user_id, created_at, texte'),
    supabase.from('commentaires_pensees').select('user_id, created_at, texte'),
    supabase.from('likes_coloriages').select('user_id, created_at'),
    supabase.from('likes_pensees').select('user_id, created_at'),
    supabase.from('pensees').select('id, user_id, created_at').neq('source', 'kevin'),
    supabase.from('commandes_articles').select('id, created_at').eq('type', 'relie'),
    supabase.from('collection').select('user_id, illustration_id, j_ai').eq('j_ai', true),
    supabase.from('collection_livres').select('user_id, item_id, item_type, j_ai'),
    supabase.from('livres').select('id').eq('statut', 'published'),
    supabase.from('recueils').select('id').eq('statut', 'published'),
    supabase.from('illustrations').select('id, livres_ids, recueils_ids').eq('statut', 'published'),
    supabase.from('presence_jours').select('user_id, date').gte('date', debutMois.split('T')[0])
  ])

  // Inscrits
  const nb_inscrits       = (profils||[]).length
  const nb_inscrits_mois  = mois(profils).length
  const nb_inscrits_m1    = moisM1(profils).length
  const nb_inscrits_m2    = moisM2(profils).length
  const nb_inscrits_aujourdhui = dans(profils, debutAujourdhui).length

  // Visiteurs aujourd'hui : usagers distincts présents dans presence_jours pour la date du jour
  const nb_visiteurs_aujourdhui = (presenceJoursRaw||[]).filter(p => p.date === aujourdhuiStr).length

  // Commandes
  const cmds_mois          = mois(commandesRaw)
  const nb_commandes       = (commandesRaw||[]).length
  const nb_commandes_mois  = cmds_mois.length
  const ca_total           = ca(commandesRaw)
  const ca_mois            = ca(cmds_mois)
  const ca_m1              = ca(moisM1(commandesRaw))
  const ca_m2              = ca(moisM2(commandesRaw))
  const panier_moyen_total = nb_commandes > 0 ? ca_total / nb_commandes : 0
  const panier_moyen_mois  = nb_commandes_mois > 0 ? ca_mois / nb_commandes_mois : 0

  // Reliés
  const nb_relies_total = (reliesRaw||[]).length
  const nb_relies_mois  = mois(reliesRaw).length

  // Coloriages
  const nb_coloriages       = (coloriagesRaw||[]).length
  const nb_coloriages_mois  = mois(coloriagesRaw).length
  const nb_comments_colo       = (commentsColoRaw||[]).length
  const nb_comments_colo_mois  = mois(commentsColoRaw).length
  const nb_likes_colo          = (likesColoRaw||[]).length
  const nb_likes_colo_mois     = mois(likesColoRaw).length

  // Pensées
  const nb_pensees              = (penseesRaw||[]).length
  const nb_pensees_mois         = mois(penseesRaw).length
  const nb_comments_pensees      = (commentsPenseesRaw||[]).length
  const nb_comments_pensees_mois = mois(commentsPenseesRaw).length
  const nb_likes_pensees         = (likesPenseesRaw||[]).length
  const nb_likes_pensees_mois    = mois(likesPenseesRaw).length

  // Tableau usagers
  const commandesParUser = {}
  ;(commandesRaw||[]).forEach(c => {
    commandesParUser[c.user_id] = {
      nb:    (commandesParUser[c.user_id]?.nb    || 0) + 1,
      total: (commandesParUser[c.user_id]?.total || 0) + (c.prix||0)
    }
  })
  const coloriagesParUser = {}
  ;(coloriagesRaw||[]).forEach(c => { coloriagesParUser[c.user_id] = (coloriagesParUser[c.user_id]||0) + 1 })
  const commentairesParUser = {}
  ;[...(commentsColoRaw||[]), ...(commentsPenseesRaw||[])].forEach(c => { commentairesParUser[c.user_id] = (commentairesParUser[c.user_id]||0) + 1 })
  const likesParUser = {}
  ;[...(likesColoRaw||[]), ...(likesPenseesRaw||[])].forEach(l => { likesParUser[l.user_id] = (likesParUser[l.user_id]||0) + 1 })

  const penseesParUser = {}
  ;(penseesRaw||[]).forEach(p => { penseesParUser[p.user_id] = (penseesParUser[p.user_id]||0) + 1 })
  const commentsPenseesParUser = {}
  ;(commentsPenseesRaw||[]).forEach(c => { commentsPenseesParUser[c.user_id] = (commentsPenseesParUser[c.user_id]||0) + 1 })
  const likesPenseesParUser = {}
  ;(likesPenseesRaw||[]).forEach(l => { likesPenseesParUser[l.user_id] = (likesPenseesParUser[l.user_id]||0) + 1 })

  // Collection : illustrations possédées (j_ai = true)
  const nbIllusParUser = {}
  ;(collectionIllusRaw||[]).forEach(c => { nbIllusParUser[c.user_id] = (nbIllusParUser[c.user_id]||0) + 1 })

  // Collection : livres + recueils possédés (manuel via collection_livres OU détecté auto si toutes les illus sont j_ai=true)
  // Reproduit la logique de Livres.js : un livre/recueil sans ligne explicite dans collection_livres
  // est considéré "j'ai" si toutes ses illustrations sont cochées j_ai=true.
  const illusParUserSet = {} // { user_id: Set(illustration_id) }
  ;(collectionIllusRaw||[]).forEach(c => {
    if (!illusParUserSet[c.user_id]) illusParUserSet[c.user_id] = new Set()
    illusParUserSet[c.user_id].add(c.illustration_id)
  })

  const collectionLivresParUser = {} // { user_id: { 'livre_<id>': j_ai bool, 'recueil_<id>': j_ai bool } }
  ;(collectionLivresRaw||[]).forEach(c => {
    if (!collectionLivresParUser[c.user_id]) collectionLivresParUser[c.user_id] = {}
    collectionLivresParUser[c.user_id][`${c.item_type}_${c.item_id}`] = c.j_ai
  })

  const illusDuLivre = {}   // { livre_id: [illustration_id, ...] }
  const illusDuRecueil = {} // { recueil_id: [illustration_id, ...] }
  ;(illustrationsRaw||[]).forEach(i => {
    ;(i.livres_ids||[]).forEach(lid => { if (!illusDuLivre[lid]) illusDuLivre[lid] = []; illusDuLivre[lid].push(i.id) })
    ;(i.recueils_ids||[]).forEach(rid => { if (!illusDuRecueil[rid]) illusDuRecueil[rid] = []; illusDuRecueil[rid].push(i.id) })
  })

  const nbLivresRecueilsParUser = {}
  ;(profils||[]).forEach(u => {
    const explicite = collectionLivresParUser[u.id] || {}
    const illusUser = illusParUserSet[u.id] || new Set()
    let total = 0

    ;(livresRaw||[]).forEach(l => {
      const key = `livre_${l.id}`
      if (key in explicite) {
        if (explicite[key]) total++
        return
      }
      const illus = illusDuLivre[l.id] || []
      if (illus.length > 0 && illus.every(id => illusUser.has(id))) total++
    })

    ;(recueilsRaw||[]).forEach(r => {
      const key = `recueil_${r.id}`
      if (key in explicite) {
        if (explicite[key]) total++
        return
      }
      const illus = illusDuRecueil[r.id] || []
      if (illus.length > 0 && illus.every(id => illusUser.has(id))) total++
    })

    nbLivresRecueilsParUser[u.id] = total
  })

  // Commentaires signalés par user (mots interdits)
  const MOTS = ['connard','connasse','salope','pute','putain','enculé','enculée','fdp','fils de pute','batard','bâtard','merde','emmerdeur','cul','couille','branleur','abruti','crétin','idiot','imbécile','débile','nul','taré','dégueulasse','ordure','pourriture','déchet','raclure','salopard','fumier','bouffon','con','conne','ntm','nique','niquer','ta gueule','pd','pédé','gouine','mongol','attardé','négro','nègre','youpin','bougnoule','bicot','feuj','raton','haine','haïr','tuer','mort','crève','suicide','fuck','fucking','fucker','motherfucker','bitch','asshole','bastard','dickhead','dick','cock','pussy','cunt','whore','slut','moron','retard','stupid','dumbass','loser','shit','bullshit','kill yourself','kys','hate','faggot','fag','nigger','nigga','chink','die','kill','murder']
  const contientMot = t => t && MOTS.some(m => t.toLowerCase().includes(m))
  const signaledParUser = {}
  ;[...(commentsColoRaw||[]).map(c=>({...c,texte:c.texte})), ...(commentsPenseesRaw||[])].forEach(c => {
    if (contientMot(c.texte)) signaledParUser[c.user_id] = (signaledParUser[c.user_id]||0) + 1
  })

  // CA ce mois par user
  const caMoisParUser = {}
  mois(commandesRaw).forEach(c => {
    caMoisParUser[c.user_id] = (caMoisParUser[c.user_id]||0) + (c.prix||0)
  })

  // Dernière connexion : récupérée depuis auth.users via listUsers paginé (last_sign_in_at)
  const derniereConnexionParUser = {}
  {
    let page = 1
    const perPage = 1000
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) break
      const users = data?.users || []
      users.forEach(au => { derniereConnexionParUser[au.id] = au.last_sign_in_at || null })
      if (users.length < perPage) break
      page++
    }
  }

  // Jours de présence ce mois-ci par usager (1 ligne = 1 jour, déjà dédupliqué par la clé primaire)
  const joursPresentsParUser = {}
  ;(presenceJoursRaw||[]).forEach(p => { joursPresentsParUser[p.user_id] = (joursPresentsParUser[p.user_id]||0) + 1 })

  const usagers = (profils||[]).map(u => ({
    id: u.id, prenom: u.prenom, nom: u.nom, email: u.email, inscrit_le: u.created_at,
    derniere_connexion:    derniereConnexionParUser[u.id]  || null,
    jours_presents_mois:   joursPresentsParUser[u.id]       || 0,
    nb_commandes:          commandesParUser[u.id]?.nb    || 0,
    ca_genere:             commandesParUser[u.id]?.total || 0,
    ca_mois:               caMoisParUser[u.id]           || 0,
    nb_coloriages:         coloriagesParUser[u.id]        || 0,
    nb_commentaires:       commentairesParUser[u.id]      || 0,
    nb_likes:              likesParUser[u.id]             || 0,
    nb_pensees:            penseesParUser[u.id]           || 0,
    nb_comments_pensees:   commentsPenseesParUser[u.id]   || 0,
    nb_likes_pensees:      likesPenseesParUser[u.id]      || 0,
    nb_signales:           signaledParUser[u.id]          || 0,
    nb_illustrations:      nbIllusParUser[u.id]            || 0,
    nb_livres_recueils:    nbLivresRecueilsParUser[u.id]   || 0,
  }))

  return {
    global: {
      nb_inscrits, nb_inscrits_mois, nb_inscrits_m1, nb_inscrits_m2, nb_inscrits_aujourdhui,
      nb_visiteurs_aujourdhui,
      nb_commandes, nb_commandes_mois,
      ca_total, ca_mois, ca_m1, ca_m2,
      panier_moyen_total, panier_moyen_mois,
      nb_relies_total, nb_relies_mois,
      nb_coloriages, nb_coloriages_mois, nb_comments_colo, nb_comments_colo_mois, nb_likes_colo, nb_likes_colo_mois,
      nb_pensees, nb_pensees_mois, nb_comments_pensees, nb_comments_pensees_mois, nb_likes_pensees, nb_likes_pensees_mois
    },
    usagers
  }
}

// ─── GET COMMANDES ─────────────────────────────────────────────
async function actionGetCommandes() {
  const { data: articles, error } = await supabase
    .from('commandes_articles')
    .select('*')
    .eq('type', 'relie')
    .order('created_at', { ascending: false })

  if (error) throw error

  const userIds = [...new Set((articles||[]).map(a => a.user_id).filter(Boolean))]
  const { data: profils } = userIds.length > 0
    ? await supabase
        .from('profils')
        .select('id, prenom, nom, email, telephone, adresse, code_postal, ville, pays')
        .in('id', userIds)
    : { data: [] }

  const profilMap = {}
  ;(profils||[]).forEach(p => { profilMap[p.id] = p })

  const emailMap = {}
  for (const uid of userIds) {
    const { data } = await supabase.auth.admin.getUserById(uid)
    if (data?.user?.email) emailMap[uid] = data.user.email
  }

  const commandes = (articles||[]).map(a => {
    const uid = a.user_id
    const p = profilMap[uid] || {}
    return {
      id: a.id, commande_id: a.commande_id, nom_article: a.nom,
      statut: a.statut || 'en_attente',
      livreur: a.livreur, numero_suivi: a.numero_suivi,
      lien_suivi: a.lien_suivi, date_livraison_estimee: a.date_livraison_estimee,
      date_commande_amazon: a.date_commande_amazon,
      note_client: a.note_client,
      notif_envoyee_expedition: a.notif_envoyee_expedition,
      notif_envoyee_livraison: a.notif_envoyee_livraison,
      date_commande: a.created_at,
      client: {
        id: uid, prenom: p.prenom||'', nom: p.nom||'',
        email: p.email || emailMap[uid] || '',
        telephone: p.telephone||'', adresse: p.adresse||'',
        code_postal: p.code_postal||'', ville: p.ville||'', pays: p.pays||''
      }
    }
  })
  return { commandes }
}

// ─── UPDATE COMMANDE ───────────────────────────────────────────
async function actionUpdateCommande(body) {
  const { commande_article_id, statut, livreur, numero_suivi, lien_suivi, date_livraison_estimee, date_commande_amazon, note_client } = body

  const { data: article, error: artErr } = await supabase
    .from('commandes_articles')
    .select('*')
    .eq('id', commande_article_id)
    .single()

  if (artErr || !article) throw new Error('Article introuvable')

  const clientUserId = article.user_id
  if (!clientUserId) throw new Error('user_id client introuvable')

  const { data: profil } = await supabase.from('profils').select('prenom, nom, email').eq('id', clientUserId).single()
  const { data: authData } = await supabase.auth.admin.getUserById(clientUserId)
  const emailClient = profil?.email || authData?.user?.email

  const updateData = {}
  if (statut !== undefined) {
    updateData.statut = statut
    if (statut === 'expediee') updateData.notif_envoyee_expedition = true
    if (statut === 'livree') updateData.notif_envoyee_livraison = true
  }
  if (livreur !== undefined) updateData.livreur = livreur
  if (numero_suivi !== undefined) updateData.numero_suivi = numero_suivi
  if (lien_suivi !== undefined) updateData.lien_suivi = lien_suivi
  if (date_livraison_estimee !== undefined) updateData.date_livraison_estimee = date_livraison_estimee
  if (date_commande_amazon !== undefined) updateData.date_commande_amazon = date_commande_amazon
  if (note_client !== undefined) updateData.note_client = note_client

  const { error: updateErr } = await supabase.from('commandes_articles').update(updateData).eq('id', commande_article_id)
  if (updateErr) throw updateErr

  const prenom = profil?.prenom || ''
  const nom = profil?.nom || ''
  const titre = article.nom || 'votre livre'
  const statutFinal = statut || article.statut

  // Notifier le client seulement si changement de statut significatif
  if (statut && statut !== 'en_attente' && statut !== 'archivee' && emailClient) {
    await supabase.from('notifications').insert({
      user_id: clientUserId,
      type: statut === 'expediee' ? 'commande_expediee' : statut === 'livree' ? 'commande_livree' : 'commande_maj',
      contenu: { titre, livreur, numero_suivi, lien_suivi, date_livraison_estimee, note_client },
      lu: false
    })
    if (statut === 'expediee') {
      await envoyerEmailBrevo(emailClient, `Votre commande "${titre}" est en route !`,
        emailExpedition({ prenom, nom, titre, livreur: livreur || article.livreur, numero_suivi: numero_suivi || article.numero_suivi, lien_suivi: lien_suivi || article.lien_suivi, date_livraison_estimee: date_livraison_estimee || article.date_livraison_estimee, note_client: note_client || article.note_client }))
    } else if (statut === 'livree') {
      await envoyerEmailBrevo(emailClient, `Votre commande "${titre}" a été livrée !`,
        emailLivraison({ prenom, nom, titre, note_client: note_client || article.note_client }))
    }
  }

  return { ok: true }
}

// ─── DELETE COMMENT ────────────────────────────────────────────
async function actionDeleteComment(body) {
  const { commentaire_id, table } = body
  if (!['commentaires_coloriages', 'commentaires_pensees'].includes(table)) throw new Error('Table invalide')
  const { error } = await supabase.from(table).delete().eq('id', commentaire_id)
  if (error) throw error
  return { ok: true }
}

// ─── BACKFILL PRIX (rattrapage commandes antérieures au fix prix) ──
async function actionBackfillPrix() {
  const { data: lignes, error } = await supabase
    .from('commandes_articles')
    .select('id, commande_id, nom, type')
    .is('prix', null)
  if (error) throw error
  if (!lignes?.length) return { ok: true, message: 'Rien à rattraper.' }

  const [{ data: illus }, { data: livres }, { data: recueils }] = await Promise.all([
    supabase.from('illustrations').select('nom, prix'),
    supabase.from('livres').select('nom, prix'),
    supabase.from('recueils').select('nom, prix'),
  ])
  const prixParNom = (type) => {
    if (type === 'illustration') return Object.fromEntries((illus || []).map(i => [i.nom, i.prix || 0]))
    if (type === 'livre_pdf')    return Object.fromEntries((livres || []).map(l => [l.nom, l.prix || 0]))
    if (type === 'recueil')      return Object.fromEntries((recueils || []).map(r => [r.nom, r.prix || 0]))
    return {}
  }

  const parCommande = {}
  for (const l of lignes) {
    if (!parCommande[l.commande_id]) parCommande[l.commande_id] = []
    parCommande[l.commande_id].push(l)
  }

  const resultats = { traitees: 0, erreurs: [] }

  for (const [commandeId, items] of Object.entries(parCommande)) {
    try {
      const pi = await stripe.paymentIntents.retrieve(commandeId)
      const montantCentimes = pi.amount_received || pi.amount || 0

      const poids = items.map(it => {
        if (it.type === 'relie') return 25
        const table = prixParNom(it.type)
        return table[it.nom] || 0
      })
      const totalPoids = poids.reduce((s, p) => s + p, 0)

      const prixCentimes = items.map((_, i) => {
        if (totalPoids <= 0) return Math.round(montantCentimes / items.length)
        return Math.round((poids[i] / totalPoids) * montantCentimes)
      })
      const somme = prixCentimes.reduce((s, p) => s + p, 0)
      const ecart = montantCentimes - somme
      if (ecart !== 0) prixCentimes[prixCentimes.length - 1] += ecart

      for (let i = 0; i < items.length; i++) {
        const { error: updErr } = await supabase
          .from('commandes_articles')
          .update({ prix: prixCentimes[i] / 100 })
          .eq('id', items[i].id)
        if (updErr) throw updErr
      }
      resultats.traitees += items.length
    } catch (e) {
      resultats.erreurs.push({ commandeId, message: e.message })
    }
  }

  return resultats
}

// ─── HANDLER PRINCIPAL ─────────────────────────────────────────
export default async function handler(req, res) {
  const userId = req.method === 'GET' ? req.query.userId : req.body?.userId
  const action = req.method === 'GET' ? req.query.action : req.body?.action

  if (userId !== ADMIN_USER_ID) return res.status(403).json({ error: 'Accès refusé' })

  try {
    if (action === 'stats') {
      if (req.method !== 'GET') return res.status(405).end()
      return res.status(200).json(await actionStats())
    }
    if (action === 'get-commandes') {
      if (req.method !== 'GET') return res.status(405).end()
      return res.status(200).json(await actionGetCommandes())
    }
    if (action === 'update-commande') {
      if (req.method !== 'POST') return res.status(405).end()
      return res.status(200).json(await actionUpdateCommande(req.body))
    }
    if (action === 'delete-comment') {
      if (req.method !== 'POST') return res.status(405).end()
      return res.status(200).json(await actionDeleteComment(req.body))
    }
    if (action === 'backfill-prix') {
      if (req.method !== 'GET') return res.status(405).end()
      return res.status(200).json(await actionBackfillPrix())
    }
    return res.status(400).json({ error: 'Action inconnue' })
  } catch (err) {
    console.error('admin error:', err)
    return res.status(500).json({ error: err.message })
  }
}