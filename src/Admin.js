import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

const ADMIN_USER_ID = 'd5865b2c-d5b0-4422-bd74-010ef651735c'

// Liste de mots à signaler (FR + EN)
const MOTS_INTERDITS = [
  // Insultes françaises
  'connard','connasse','salope','pute','putain','enculé','enculée','fdp','fils de pute',
  'batard','bâtard','merde','emmerdeur','emmerde','cul','couille','couilles','branleur',
  'branleuse','abruti','abrutie','crétin','crétine','idiot','idiote','imbécile','débile',
  'nul','nulle','taré','tarée','dégueulasse','ordure','pourriture','déchet','raclure',
  'salopard','fumier','bouffon','con','conne','gros con','pauvre con','va te faire','ntm',
  'nique','niquer','ta gueule','ferme ta gueule','pd','pédé','gouine','baltringue',
  'tocard','tocarde','mongol','mongole','attardé','attardée','rebeu','renoi','bamboula',
  'négro','nègre','youpin','youpine','bougnoule','bicot','feuj','raton','chorba',
  'haine','haïr','tuer','mort','crève','crever','suicide','toi t as pas de talent',
  // Insultes anglaises
  'fuck','fucking','fucker','motherfucker','bitch','asshole','bastard','dickhead',
  'dick','cock','pussy','cunt','whore','slut','idiot','moron','retard','stupid',
  'dumbass','dumb','loser','piece of shit','shit','bullshit','crap','damn','hell',
  'son of a bitch','go to hell','kill yourself','kys','hate','ugly','disgusting',
  'pathetic','worthless','trash','garbage','scum','freak','faggot','fag','dyke',
  'nigger','nigga','chink','spic','wetback','kike','cracker','redneck','nazi',
  'racist','sexist','bigot','die','kill','murder','stupid bitch','dumb bitch',
  'no talent','talentless','awful','terrible','worst','disgusting work'
]

function contientMotInterdit(texte) {
  if (!texte) return false
  const t = texte.toLowerCase()
  return MOTS_INTERDITS.some(mot => {
    const m = mot.toLowerCase()
    // Expressions avec espace : includes simple
    if (m.includes(' ')) return t.includes(m)
    // Mots seuls : mot entier uniquement (évite "hell" dans "hello", "con" dans "économie"...)
    try {
      return new RegExp('\\b' + m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(t)
    } catch (e) { return t.includes(m) }
  })
}

const STATUT_LABEL = {
  en_attente: 'En attente',
  expediee: 'Expédiée',
  livree: 'Livrée',
  archivee: 'Archivée'
}

const STATUT_COLOR = {
  en_attente: { bg: 'rgba(239,68,68,0.12)', border: '#ef444444', color: '#ef4444' },
  expediee:   { bg: 'rgba(255,215,0,0.12)',  border: '#ffd70044', color: '#ffd700' },
  livree:     { bg: 'rgba(34,197,94,0.10)',  border: '#22c55e44', color: '#22c55e' },
  archivee:   { bg: 'rgba(100,100,130,0.10)', border: '#64648244', color: '#646482' }
}

const NATURE_LITIGE = ['Retard', 'Produit endommagé', 'Non reçu', 'Rétractation', 'Autre']
const TRAITEMENT_LITIGE = ['En cours', 'Retour', 'Remboursement', 'Remplacement', 'Annulation']
const STATUT_LITIGE_COLOR = { ouvert: '#ef4444', resolu: '#ffd700', cloture: '#646482' }

const s = {
  shell: (isMobile) => ({ display:'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : '100vh', minHeight: '100vh', background:'#07070f', fontFamily:'sans-serif', fontSize:'13px', color:'#e0e0f0', overflow: isMobile ? 'visible' : 'hidden' }),
  sidebar: (isMobile) => ({ width: isMobile ? '100%' : '172px', flexShrink:0, borderRight: isMobile ? 'none' : '1px solid #00e5ff55', borderBottom: isMobile ? '1px solid #00e5ff55' : 'none', background:'linear-gradient(180deg, #08081a 0%, #002a3a 100%)', display:'flex', flexDirection: isMobile ? 'row' : 'column', overflowX: isMobile ? 'auto' : 'visible' }),
  sidebarLogo: { padding:'14px 16px 12px', borderBottom:'1px solid #00e5ff1a' },
  logoImg: { width:'88px', height:'88px', borderRadius:'50%', marginBottom:'8px', display:'block' },
  logoName: { fontSize:'13px', fontWeight:600, color:'#e8e8f8', letterSpacing:'0.01em' },
  logoSub: { fontSize:'10px', color:'#00e5ff77', marginTop:'2px' },
  navItem: (active, isMobile) => ({
    display:'flex', alignItems:'center', gap:'9px', padding: isMobile ? '12px 14px' : '9px 16px', cursor:'pointer',
    fontSize:'13px', color: active ? '#00e5ff' : '#6a6a8a', whiteSpace: isMobile ? 'nowrap' : 'normal', flexShrink: isMobile ? 0 : 1,
    borderLeft: isMobile ? 'none' : (active ? '2px solid #00e5ff' : '2px solid transparent'),
    borderBottom: isMobile ? (active ? '2px solid #00e5ff' : '2px solid transparent') : 'none',
    background: active ? 'rgba(0,229,255,0.06)' : 'transparent',
    fontWeight: active ? 500 : 400, transition:'all 0.15s'
  }),
  navIcon: { fontSize:'17px' },
  sidebarBottom: { marginTop:'auto', padding:'14px 16px', borderTop:'1px solid #00e5ff1a' },
  liveDot: { width:'6px', height:'6px', borderRadius:'50%', background:'#22c55e', display:'inline-block', marginRight:'6px', animation:'pulse 2s infinite' },
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth: 0 },
  topbar: (isMobile) => ({ height: isMobile ? 'auto' : '46px', minHeight: isMobile ? '46px' : '46px', flexShrink:0, borderBottom:'1px solid #00e5ff66', display:'flex', alignItems:'center', justifyContent:'space-between', padding: isMobile ? '10px 14px' : '0 20px', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? '4px' : '0', background:'linear-gradient(90deg, #07070f 0%, #003a50 100%)' }),
  topbarTitle: { fontSize:'14px', fontWeight:500, background:'linear-gradient(90deg, #e8e8f8 0%, #00e5ff 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  topbarDate: { fontSize:'11px', color:'#44445a' },
  content: (isMobile) => ({ flex:1, overflow:'auto', padding: isMobile ? '12px' : '16px' }),

  // Stats
  statGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'16px' },
  statCard: (accent) => ({ background:'#0d0d1a', border:`1px solid ${accent}44`, borderRadius:'10px', padding:'10px 12px' }),
  statLabel: { fontSize:'10px', color:'#6a6a8a', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.05em' },
  statValue: (color) => ({ fontSize:'20px', fontWeight:500, color }),
  statSub: { fontSize:'10px', color:'#44445a', marginTop:'2px' },

  // Grid 2 colonnes
  grid2: (isMobile) => ({ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'12px' }),
  sectionTitle: { fontSize:'10px', fontWeight:500, color:'#6a6a8a', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' },

  // Commande card
  cmdCard: (statut) => ({
    background: statut === 'archivee' ? 'rgba(100,100,130,0.05)' : statut === 'en_attente' ? 'rgba(239,68,68,0.06)' : statut === 'expediee' ? 'rgba(255,215,0,0.06)' : 'rgba(34,197,94,0.05)',
    border:`1px solid ${STATUT_COLOR[statut]?.border || '#ef444444'}`,
    borderRadius:'10px', padding:'14px', marginBottom:'10px'
  }),
  // Litige
  litigeForm: { background:'#0a0a18', border:'1px solid #ef444433', borderRadius:'8px', padding:'12px', marginTop:'10px' },
  radioRow: { display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'8px' },
  radioBtn: (active, color) => ({ fontSize:'11px', padding:'4px 10px', borderRadius:'6px', cursor:'pointer', fontFamily:'sans-serif', background: active ? `${color}22` : 'transparent', border:`1px solid ${active ? color : '#ffffff1a'}`, color: active ? color : '#6a6a8a', transition:'all 0.15s' }),
  cmdHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' },
  cmdTitle: { fontSize:'13px', fontWeight:500, color:'#f0f0ff' },
  badge: (statut) => ({
    display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 9px',
    borderRadius:'20px', fontSize:'10px', fontWeight:500,
    background: STATUT_COLOR[statut]?.bg, border:`1px solid ${STATUT_COLOR[statut]?.border}`,
    color: STATUT_COLOR[statut]?.color
  }),
  infoGrid: (isMobile) => ({ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap:'6px', fontSize:'11px', marginBottom:'10px' }),
  infoBlock: { },
  infoLbl: { color:'#555570', marginBottom:'2px', fontSize:'10px' },
  infoVal: { color:'#d0d0f0' },
  divider: { borderTop:'1px solid #ffffff12', margin:'10px 0' },
  actionsRow: { display:'flex', gap:'6px', flexWrap:'wrap' },

  // Boutons
  btnGold: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(255,215,0,0.14)', border:'1px solid #ffd70055', color:'#ffd700', fontFamily:'sans-serif' },
  btnCyan: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(0,229,255,0.12)', border:'1px solid #00e5ff55', color:'#00e5ff', fontFamily:'sans-serif' },
  btnGreen: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(34,197,94,0.12)', border:'1px solid #22c55e55', color:'#22c55e', fontFamily:'sans-serif' },
  btnGhost: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'transparent', border:'1px solid #ffffff1a', color:'#6a6a8a', fontFamily:'sans-serif' },
  btnDanger: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(255,62,181,0.14)', border:'1px solid #ff3eb555', color:'#ff3eb5', fontFamily:'sans-serif' },
  btnPink: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(255,62,181,0.14)', border:'1px solid #ff3eb555', color:'#ff3eb5', fontFamily:'sans-serif' },

  // Formulaire suivi inline
  suiviForm: { background:'#0a0a18', border:'1px solid #00e5ff1a', borderRadius:'8px', padding:'12px', marginTop:'10px' },
  input: { width:'100%', background:'#12121f', border:'1px solid #ffffff1a', borderRadius:'6px', padding:'6px 10px', color:'#e0e0f0', fontSize:'12px', fontFamily:'sans-serif', outline:'none', marginBottom:'8px', boxSizing:'border-box' },
  inputRow: (isMobile) => ({ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'8px' }),

  // Commentaires — plus visibles
  cmtCard: (flagged) => ({
    background: flagged ? 'rgba(255,62,181,0.08)' : 'rgba(255,255,255,0.03)',
    border: flagged ? '1px solid #ff3eb566' : '1px solid #ffffff18',
    borderRadius:'10px', padding:'12px 14px', marginBottom:'8px'
  }),
  cmtHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' },
  cmtUser: { fontSize:'11px', color:'#44445a' },
  cmtText: { fontSize:'12px', color:'#c0c0e0', lineHeight:'1.5' },
  flagTag: { display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'10px', fontWeight:500, color:'#ff3eb5', background:'rgba(255,62,181,0.12)', border:'1px solid #ff3eb533', padding:'2px 8px', borderRadius:'20px' },

  // Tableau usagers
  tableWrap: { background:'#0d0d1a', border:'1px solid #00e5ff1a', borderRadius:'10px', overflow:'hidden' },
  th: { padding:'9px 7px', textAlign:'left', fontSize:'10px', fontWeight:500, color:'#6a6a8a', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #ffffff0a', background:'#0a0a15', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' },
  td: { padding:'8px 7px', fontSize:'12px', borderBottom:'1px solid #ffffff06', color:'#c0c0e0' },
  trHover: { transition:'background 0.1s' },
}

export default function Admin() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState(null)
  const [onglet, setOnglet] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [commandes, setCommandes] = useState([])
  const [commentaires, setCommentaires] = useState([])
  const [usagers, setUsagers] = useState([])
  const [sortCol, setSortCol] = useState('nb_commandes')
  const [sortDir, setSortDir] = useState('desc')
  const [suiviOpen, setSuiviOpen] = useState(null)
  const [suiviData, setSuiviData] = useState({})
  const [litigeOpen, setLitigeOpen] = useState(null)
  const [litigeData, setLitigeData] = useState({})
  const [litigesExistants, setLitigesExistants] = useState({})
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const intervalRef = useRef(null)
  const [ignores, setIgnores] = useState(new Set()) // IDs de commentaires signalés mais validés par l'admin
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700)

  // ── Chat privé ──
  const [conversations, setConversations] = useState([]) // [{ user_id, pseudo, dernier_message, dernier_at, non_lus }]
  const [conversationActive, setConversationActive] = useState(null) // user_id
  const [messagesChat, setMessagesChat] = useState([])
  const [texteChat, setTexteChat] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [rechercheUsagerChat, setRechercheUsagerChat] = useState('')
  const [suggestionsUsagersChat, setSuggestionsUsagersChat] = useState([])
  const finChatRef = useRef(null)

  // ── Notif admin (nouvel onglet) ──
  const [modeCibleNotif, setModeCibleNotif] = useState('tous') // 'tous' | 'cible'
  const [texteNotifAdmin, setTexteNotifAdmin] = useState('')
  const [rechercheUsagerNotif, setRechercheUsagerNotif] = useState('')
  const [usagerCible, setUsagerCible] = useState(null) // { id, pseudo }
  const [suggestionsUsagers, setSuggestionsUsagers] = useState([])
  const [envoiNotifEnCours, setEnvoiNotifEnCours] = useState(false)
  const [notifsEnvoyees, setNotifsEnvoyees] = useState([])
  const [loadingNotifsEnvoyees, setLoadingNotifsEnvoyees] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Vérif auth admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data?.session?.user?.id
      if (!uid || uid !== ADMIN_USER_ID) {
        navigate('/')
        return
      }
      setUserId(uid)
    })
  }, [navigate])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Chargement données
  const chargerStats = useCallback(async () => {
    if (!userId) return
    const res = await fetch(`/api/admin?action=stats&userId=${userId}`)
    const data = await res.json()
    if (data.global) setStats(data.global)
    if (data.usagers) setUsagers(data.usagers)
  }, [userId])

  const chargerCommandes = useCallback(async () => {
    if (!userId) return
    const res = await fetch(`/api/admin?action=get-commandes&userId=${userId}`)
    const data = await res.json()
    if (data.commandes) setCommandes(data.commandes)
    // Charger les litiges existants
    const { data: litiges } = await supabase.from('litiges').select('*')
    const lMap = {}
    ;(litiges || []).forEach(l => { lMap[l.commande_article_id] = l })
    setLitigesExistants(lMap)
  }, [userId])

  const chargerCommentaires = useCallback(async () => {
    if (!userId) return
    const [{ data: cColo }, { data: cPensees }] = await Promise.all([
      supabase.from('commentaires_coloriages').select('id, texte, created_at, user_id, coloriage_id').order('created_at', { ascending: false }).limit(100),
      supabase.from('commentaires_pensees').select('id, texte, created_at, user_id, pensee_id').order('created_at', { ascending: false }).limit(100)
    ])
    const tous = [
      ...(cColo || []).map(c => ({ ...c, table: 'commentaires_coloriages', ref: `coloriage #${c.coloriage_id}` })),
      ...(cPensees || []).map(c => ({ ...c, table: 'commentaires_pensees', ref: `pensée #${c.pensee_id}` }))
    ]
    // Récupérer les profils séparément
    const userIds = [...new Set(tous.map(c => c.user_id).filter(Boolean))]
    if (userIds.length > 0) {
      const { data: profils } = await supabase.from('profils').select('id, prenom, nom').in('id', userIds)
      const profilsMap = {}
      ;(profils || []).forEach(p => { profilsMap[p.id] = p })
      tous.forEach(c => { c.profils = profilsMap[c.user_id] || null })
    }
    tous.sort((a, b) => {
      const aFlag = contientMotInterdit(a.texte)
      const bFlag = contientMotInterdit(b.texte)
      if (aFlag && !bFlag) return -1
      if (!aFlag && bFlag) return 1
      return new Date(b.created_at) - new Date(a.created_at)
    })
    setCommentaires(tous)
  }, [userId])

  const chargerTout = useCallback(async () => {
    setLoading(true)
    await Promise.all([chargerStats(), chargerCommandes(), chargerCommentaires()])
    setLoading(false)
  }, [chargerStats, chargerCommandes, chargerCommentaires])

  // ── Chat privé : liste des conversations ──
  const chargerConversations = useCallback(async () => {
    const { data: messages } = await supabase
      .from('chat_prive')
      .select('id, user_id, expediteur, contenu, created_at, lu_par_admin')
      .order('created_at', { ascending: false })
    if (!messages || messages.length === 0) { setConversations([]); return }

    const userIds = [...new Set(messages.map(m => m.user_id))]
    const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', userIds)
    const pseudoMap = {}
    ;(profils || []).forEach(p => { pseudoMap[p.id] = p.pseudo || 'Anonyme' })

    const parUser = {}
    messages.forEach(m => {
      if (!parUser[m.user_id]) {
        parUser[m.user_id] = { user_id: m.user_id, pseudo: pseudoMap[m.user_id] || 'Anonyme', dernier_message: m.contenu, dernier_at: m.created_at, non_lus: 0 }
      }
      if (m.expediteur === 'user' && !m.lu_par_admin) {
        parUser[m.user_id].non_lus += 1
      }
    })
    const liste = Object.values(parUser).sort((a, b) => new Date(b.dernier_at) - new Date(a.dernier_at))
    setConversations(liste)
  }, [])

  // ── Chat privé : messages d'une conversation ──
  const ouvrirConversation = useCallback(async (uid) => {
    setConversationActive(uid)
    setLoadingChat(true)
    const { data } = await supabase.from('chat_prive').select('*').eq('user_id', uid).order('created_at', { ascending: true })
    setMessagesChat(data || [])
    setLoadingChat(false)
    await supabase.from('chat_prive').update({ lu_par_admin: true }).eq('user_id', uid).eq('expediteur', 'user').eq('lu_par_admin', false)
    setConversations(prev => prev.map(c => c.user_id === uid ? { ...c, non_lus: 0 } : c))
  }, [])

  // ── Chat privé : recherche d'un usager par pseudo pour démarrer une conversation ──
  const rechercherUsagersChat = useCallback(async (q) => {
    if (!q || q.trim().length === 0) { setSuggestionsUsagersChat([]); return }
    const { data } = await supabase
      .from('profils')
      .select('id, pseudo')
      .ilike('pseudo', `%${q.trim()}%`)
      .order('pseudo', { ascending: true })
      .limit(20)
    setSuggestionsUsagersChat(data || [])
  }, [])

  // ── Chat privé : démarrer (ou rouvrir) une conversation avec l'usager choisi ──
  const demarrerConversationAvec = (usager) => {
    setConversations(prev => prev.some(c => c.user_id === usager.id)
      ? prev
      : [{ user_id: usager.id, pseudo: usager.pseudo || 'Anonyme', dernier_message: '', dernier_at: new Date().toISOString(), non_lus: 0 }, ...prev])
    setRechercheUsagerChat('')
    setSuggestionsUsagersChat([])
    ouvrirConversation(usager.id)
  }

  // ── Chat général (public) — épinglé en haut ──
  const ouvrirGeneral = useCallback(async () => {
    setConversationActive('__general__')
    setLoadingChat(true)
    const limite48h = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    const { data } = await supabase.from('chat_general').select('*').gt('created_at', limite48h).order('created_at', { ascending: true })
    setMessagesChat(data || [])
    setLoadingChat(false)
  }, [])

  const envoyerMessageAdmin = async () => {
    const texte = texteChat.trim()
    if (!texte || !conversationActive) return
    setTexteChat('')
    if (conversationActive === '__general__') {
      const { data } = await supabase.from('chat_general').insert({
        user_id: userId,
        pseudo: 'Kevin Teo\'Art',
        avatar_url: null,
        contenu: texte,
      }).select().single()
      if (data) setMessagesChat(prev => [...prev, data])
      return
    }
    const { data } = await supabase.from('chat_prive').insert({
      user_id: conversationActive,
      expediteur: 'admin',
      contenu: texte,
      lu_par_admin: true,
      lu_par_user: false,
    }).select().single()
    if (data) {
      setMessagesChat(prev => [...prev, data])
      setConversations(prev => prev.map(c => c.user_id === conversationActive ? { ...c, dernier_message: texte, dernier_at: data.created_at } : c))
    }
  }

  const supprimerMessageChat = async (id) => {
    const table = conversationActive === '__general__' ? 'chat_general' : 'chat_prive'
    await supabase.from(table).delete().eq('id', id)
    setMessagesChat(prev => prev.filter(m => m.id !== id))
  }

  // ── Notif admin : recherche d'usager par pseudo (autocomplete) ──
  const rechercherUsagersNotif = useCallback(async (q) => {
    if (!q || q.trim().length === 0) { setSuggestionsUsagers([]); return }
    const { data } = await supabase
      .from('profils')
      .select('id, pseudo')
      .ilike('pseudo', `%${q.trim()}%`)
      .order('pseudo', { ascending: true })
      .limit(20)
    setSuggestionsUsagers(data || [])
  }, [])

  // ── Notif admin : charger l'historique des notifs envoyées manuellement ──
  const chargerNotifsEnvoyees = useCallback(async () => {
    setLoadingNotifsEnvoyees(true)
    const { data } = await supabase
      .from('notifications')
      .select('id, user_id, contenu, created_at, lu')
      .eq('type', 'notif_admin')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!data || data.length === 0) { setNotifsEnvoyees([]); setLoadingNotifsEnvoyees(false); return }
    const userIds = [...new Set(data.map(n => n.user_id))]
    const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', userIds)
    const pseudoMap = {}
    ;(profils || []).forEach(p => { pseudoMap[p.id] = p.pseudo || 'Anonyme' })
    setNotifsEnvoyees(data.map(n => ({ ...n, pseudo: pseudoMap[n.user_id] || 'Anonyme' })))
    setLoadingNotifsEnvoyees(false)
  }, [])

  // ── Notif admin : envoi (tous les usagers ou un usager ciblé) ──
  const envoyerNotifAdmin = async () => {
    const texte = texteNotifAdmin.trim()
    if (!texte) return
    if (modeCibleNotif === 'cible' && !usagerCible) { showToast('Sélectionne un usager', 'error'); return }
    setEnvoiNotifEnCours(true)
    try {
      let destinataires = []
      if (modeCibleNotif === 'tous') {
        const { data: profils } = await supabase.from('profils').select('id')
        destinataires = (profils || []).map(p => p.id)
      } else {
        destinataires = [usagerCible.id]
      }
      if (destinataires.length === 0) { showToast('Aucun destinataire trouvé', 'error'); setEnvoiNotifEnCours(false); return }
      const lignes = destinataires.map(uid => ({ user_id: uid, type: 'notif_admin', contenu: { texte }, lu: false }))
      const { error } = await supabase.from('notifications').insert(lignes)
      if (error) throw error
      showToast(modeCibleNotif === 'tous' ? `Notification envoyée à ${destinataires.length} usagers` : `Notification envoyée à ${usagerCible.pseudo}`)
      setTexteNotifAdmin('')
      setUsagerCible(null)
      setRechercheUsagerNotif('')
      setSuggestionsUsagers([])
      chargerNotifsEnvoyees()
    } catch (e) {
      showToast('Erreur lors de l\'envoi', 'error')
    }
    setEnvoiNotifEnCours(false)
  }

  const supprimerNotifEnvoyee = async (id) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifsEnvoyees(prev => prev.filter(n => n.id !== id))
  }

  useEffect(() => {
    if (userId) chargerConversations()
  }, [userId, chargerConversations])

  useEffect(() => {
    if (onglet === 'chat' && conversationActive === '__general__') ouvrirGeneral()
    else if (onglet === 'chat' && conversationActive) ouvrirConversation(conversationActive)
  }, [onglet]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (onglet === 'notif') chargerNotifsEnvoyees()
  }, [onglet, chargerNotifsEnvoyees])

  useEffect(() => {
    const timer = setTimeout(() => rechercherUsagersNotif(rechercheUsagerNotif), 250)
    return () => clearTimeout(timer)
  }, [rechercheUsagerNotif, rechercherUsagersNotif])

  useEffect(() => {
    const timer = setTimeout(() => rechercherUsagersChat(rechercheUsagerChat), 250)
    return () => clearTimeout(timer)
  }, [rechercheUsagerChat, rechercherUsagersChat])

  // Realtime global : tout nouveau message privé met à jour la liste/badge
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('admin_chat_prive_global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_prive' }, () => {
        chargerConversations()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, chargerConversations])

  // Realtime : nouveaux messages dans la conversation ouverte (privée ou générale)
  useEffect(() => {
    if (!conversationActive) return
    const estGeneral = conversationActive === '__general__'
    const channel = supabase
      .channel(`admin_chat_${conversationActive}`)
      .on('postgres_changes', estGeneral
        ? { event: 'INSERT', schema: 'public', table: 'chat_general' }
        : { event: 'INSERT', schema: 'public', table: 'chat_prive', filter: `user_id=eq.${conversationActive}` },
        (payload) => {
          const msg = payload.new
          setMessagesChat(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
          if (!estGeneral && msg.expediteur === 'user') {
            supabase.from('chat_prive').update({ lu_par_admin: true }).eq('id', msg.id)
          }
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationActive])

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesChat])

  useEffect(() => {
    if (!userId) return
    chargerTout()
    intervalRef.current = setInterval(chargerTout, 30000)
    return () => clearInterval(intervalRef.current)
  }, [userId, chargerTout])

  // Valider commande (statut + suivi en un seul appel)
  const validerCommande = async (id) => {
    const suivi = suiviData[id] || {}
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-commande', userId, commande_article_id: id, ...suivi })
    })
    const data = await res.json()
    if (data.ok) {
      showToast(`Commande mise à jour${suivi.statut && suivi.statut !== 'en_attente' ? ' — client notifié' : ''}`)
      setSuiviOpen(null)
      setSuiviData(prev => { const n = {...prev}; delete n[id]; return n })
      chargerCommandes()
    } else {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  // Archiver une commande livrée
  const archiverCommande = async (id) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-commande', userId, commande_article_id: id, statut: 'archivee' })
    })
    const data = await res.json()
    if (data.ok) { showToast('Commande archivée'); chargerCommandes() }
    else showToast('Erreur', 'error')
  }

  // Sauvegarder un litige
  const sauvegarderLitige = async (cmdId) => {
    const ld = litigeData[cmdId] || {}
    if (!ld.nature) { showToast('Sélectionne une nature de litige', 'error'); return }
    const existant = litigesExistants[cmdId]
    if (existant) {
      await supabase.from('litiges').update({ ...ld }).eq('id', existant.id)
    } else {
      await supabase.from('litiges').insert({ commande_article_id: cmdId, ...ld })
    }
    showToast('Litige enregistré')
    setLitigeOpen(null)
    chargerCommandes()
  }

  // Suppression commentaire
  const supprimerCommentaire = async (id, table) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-comment', userId, commentaire_id: id, table })
    })
    const data = await res.json()
    if (data.ok) {
      showToast('Commentaire supprimé')
      chargerCommentaires()
    } else {
      showToast('Erreur', 'error')
    }
  }

  // Tri tableau usagers
  const trier = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const usagersTries = [...usagers].sort((a, b) => {
    const va = a[sortCol] ?? 0
    const vb = b[sortCol] ?? 0
    const mult = sortDir === 'asc' ? 1 : -1
    if (typeof va === 'string') return mult * va.localeCompare(vb)
    return mult * (va - vb)
  })

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'
  const fmtEur = (n) => n ? `${Number(n).toFixed(2)}€` : '0€'

  if (!userId) return null

  const cmdActives = commandes.filter(c => c.statut !== 'archivee')
  const cmdEnAttente = commandes.filter(c => c.statut === 'en_attente')
  const cmdArchivees = commandes.filter(c => c.statut === 'archivee')
  const cmtSignales = commentaires.filter(c => contientMotInterdit(c.texte) && !ignores.has(c.id))
  const nbNonLusChat = conversations.reduce((s, c) => s + c.non_lus, 0)

  return (
    <div style={s.shell(isMobile)}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width:4px; height:4px }
        ::-webkit-scrollbar-track { background:#07070f }
        ::-webkit-scrollbar-thumb { background:#ffffff18; border-radius:2px }
        input::placeholder { color:#44445a }
        input:focus { border-color:#00e5ff44 !important; outline:none }
        textarea::placeholder { color:#44445a }
        textarea:focus { border-color:#00e5ff44 !important; outline:none }
      `}</style>

      {/* SIDEBAR (desktop) */}
      {!isMobile && (
      <div style={s.sidebar(isMobile)}>
        <div style={s.sidebarLogo}>
          <img src="https://images.kevinteoart.fr/site/Logo.png" alt="Logo" style={s.logoImg} />
          <div style={s.logoName}>Kevin Teo'Art</div>
          <div style={s.logoSub}>Administration</div>
        </div>
        {[
          { id:'dashboard', icon:'ti-layout-dashboard', label:'Dashboard' },
          { id:'commandes', icon:'ti-package', label:`Commandes${cmdEnAttente.length > 0 ? ` (${cmdEnAttente.length})` : ''}` },
          { id:'usagers', icon:'ti-users', label:'Usagers' },
          { id:'moderation', icon:'ti-message-circle', label:`Modération${cmtSignales.length > 0 ? ` (${cmtSignales.length})` : ''}` },
          { id:'chat', icon:'ti-message-2', label:`Chat${nbNonLusChat > 0 ? ` (${nbNonLusChat})` : ''}` },
          { id:'notif', icon:'ti-bell', label:'Notif' },
        ].map(n => (
          <div key={n.id} style={s.navItem(onglet === n.id, isMobile)} onClick={() => setOnglet(n.id)}>
            <i className={`ti ${n.icon}`} style={s.navIcon} aria-hidden="true" />
            {n.label}
          </div>
        ))}
        <div style={s.sidebarBottom}>
          <div style={{ fontSize:'10px', color:'#44445a', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px' }}>Activité</div>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', color:'#22c55e', marginBottom:'6px' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e', display:'inline-block', boxShadow:'0 0 6px #22c55e', animation:'pulse 2s infinite', flexShrink:0 }} />
            Temps réel actif
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', color:'#38bdf8', marginBottom:'6px' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#38bdf8', display:'inline-block', boxShadow:'0 0 6px #38bdf8', flexShrink:0 }} />
            <span>Inscrits aujourd'hui : <strong>{stats?.nb_inscrits_mois ?? '—'}</strong></span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', color:'#f97316', marginBottom:'6px' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#f97316', display:'inline-block', boxShadow:'0 0 6px #f97316', flexShrink:0 }} />
            <span>Visiteurs aujourd'hui : <strong>{stats?.nb_inscrits_mois ?? '—'}</strong></span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', color:'#ef4444', marginBottom:'12px' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444', display:'inline-block', boxShadow:'0 0 6px #ef4444', flexShrink:0 }} />
            Désinscriptions : <strong>0</strong>
          </div>
          <div
            style={{ fontSize:'11px', color:'#44445a', cursor:'pointer' }}
            onClick={() => navigate('/accueil')}
          >
            ← Retour au site
          </div>
        </div>
      </div>
      )}

      {/* MAIN */}
      <div style={s.main}>
        <div style={s.topbar(isMobile)}>
          <span style={s.topbarTitle}>
            { onglet === 'dashboard' && 'Dashboard' }
            { onglet === 'commandes' && 'Commandes reliées' }
            { onglet === 'usagers' && 'Tableau des usagers' }
            { onglet === 'moderation' && 'Modération des commentaires' }
            { onglet === 'chat' && 'Conversations privées' }
            { onglet === 'notif' && 'Notifications manuelles' }
          </span>
          <span style={s.topbarDate}>{new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</span>
        </div>

        {/* NAV HORIZONTALE (mobile) — sous la bande haute */}
        {isMobile && (
          <div style={s.sidebar(isMobile)}>
            {[
              { id:'dashboard', icon:'ti-layout-dashboard', label:'Dash' },
              { id:'commandes', icon:'ti-package', label:`Com.${cmdEnAttente.length > 0 ? ` (${cmdEnAttente.length})` : ''}` },
              { id:'usagers', icon:'ti-users', label:'Usag.' },
              { id:'moderation', icon:'ti-message-circle', label:`Modé.${cmtSignales.length > 0 ? ` (${cmtSignales.length})` : ''}` },
              { id:'chat', icon:'ti-message-2', label:`Chat${nbNonLusChat > 0 ? ` (${nbNonLusChat})` : ''}` },
              { id:'notif', icon:'ti-bell', label:'Notif' },
            ].map(n => (
              <div key={n.id} style={s.navItem(onglet === n.id, isMobile)} onClick={() => setOnglet(n.id)}>
                <i className={`ti ${n.icon}`} style={s.navIcon} aria-hidden="true" />
                {n.label}
              </div>
            ))}
            <div
              style={{ fontSize:'12px', color:'#44445a', cursor:'pointer', padding:'12px 14px', whiteSpace:'nowrap', flexShrink:0, display:'flex', alignItems:'center' }}
              onClick={() => navigate('/accueil')}
            >
              ← Site
            </div>
          </div>
        )}

        <div style={s.content(isMobile)}>
          {loading && <div style={{ color:'#44445a', textAlign:'center', marginTop:'40px' }}>Chargement...</div>}

          {/* ======== DASHBOARD ======== */}
          {!loading && onglet === 'dashboard' && (
            <>
              {/* Stats sur 2 lignes compactes */}
              {isMobile ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'5px', marginBottom:'8px' }}>
                  {[
                    { label:'Inscrits', val: stats?.nb_inscrits ?? '—', color:'#00e5ff' },
                    { label:'Commandes', val: stats?.nb_commandes ?? '—', color:'#00e5ff' },
                    { label:'CA total', val: stats ? fmtEur(stats.ca_total) : '—', color:'#ffd700' },
                    { label:'Coloriages', val: stats?.nb_coloriages ?? '—', color:'#ff3eb5' },
                    { label:'Pensées', val: stats?.nb_pensees ?? '—', color:'#a78bfa' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background:'#0d0d1a', border:`1px solid ${color}44`, borderRadius:'8px', padding:'7px 4px', textAlign:'center' }}>
                      <div style={{ fontSize:'8px', color:'#6a6a8a', textTransform:'uppercase', letterSpacing:'0.02em', marginBottom:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
                      <div style={{ fontSize:'15px', fontWeight:600, color }}>{val}</div>
                    </div>
                  ))}
                </div>
              ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'8px', marginBottom:'8px' }}>
                <div style={s.statCard('#00e5ff')}>
                  <div style={s.statLabel}>Inscrits</div>
                  <div style={s.statValue('#00e5ff')}>{stats?.nb_inscrits ?? '—'}</div>
                  <div style={{ marginTop:'8px', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                    <span style={s.statSub}>Ce mois : <span style={{ color:'#00e5ff' }}>{stats?.nb_inscrits_mois ?? '—'}</span></span>
                    <span style={s.statSub}>M-1 : <span style={{ color:'#b0b0d0' }}>{stats?.nb_inscrits_m1 ?? '—'}</span></span>
                    <span style={s.statSub}>M-2 : <span style={{ color:'#b0b0d0' }}>{stats?.nb_inscrits_m2 ?? '—'}</span></span>
                  </div>
                </div>
                <div style={s.statCard('#00e5ff')}>
                  <div style={s.statLabel}>Commandes</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'10px' }}>
                    <div style={s.statValue('#00e5ff')}>{stats?.nb_commandes ?? '—'}</div>
                    <span style={s.statSub}>Ce mois : <span style={{ color:'#00e5ff' }}>{stats?.nb_commandes_mois ?? '—'}</span></span>
                  </div>
                  <div style={{ marginTop:'6px', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                    <span style={s.statSub}>Panier moy. total : <span style={{ color:'#b0b0d0' }}>{stats ? fmtEur(stats.panier_moyen_total) : '—'}</span></span>
                    <span style={s.statSub}>Ce mois : <span style={{ color:'#00e5ff' }}>{stats ? fmtEur(stats.panier_moyen_mois) : '—'}</span></span>
                  </div>
                  <div style={{ marginTop:'4px' }}>
                    <span style={s.statSub}>Reliés : <span style={{ color:'#b0b0d0' }}>{stats?.nb_relies_total ?? '—'}</span> / mois : <span style={{ color:'#00e5ff' }}>{stats?.nb_relies_mois ?? '—'}</span></span>
                  </div>
                </div>
                <div style={s.statCard('#ffd700')}>
                  <div style={s.statLabel}>CA total</div>
                  <div style={s.statValue('#ffd700')}>{stats ? fmtEur(stats.ca_total) : '—'}</div>
                  <div style={{ marginTop:'8px', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                    <span style={s.statSub}>Ce mois : <span style={{ color:'#ffd700' }}>{stats ? fmtEur(stats.ca_mois) : '—'}</span></span>
                    <span style={s.statSub}>M-1 : <span style={{ color:'#b0b0d0' }}>{stats ? fmtEur(stats.ca_m1) : '—'}</span></span>
                    <span style={s.statSub}>M-2 : <span style={{ color:'#b0b0d0' }}>{stats ? fmtEur(stats.ca_m2) : '—'}</span></span>
                  </div>
                </div>

                <div style={s.statCard('#ff3eb5')}>
                  <div style={s.statLabel}>Coloriages partagés</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'10px' }}>
                    <div style={s.statValue('#ff3eb5')}>{stats?.nb_coloriages ?? '—'}</div>
                    <span style={s.statSub}>Ce mois : <span style={{ color:'#ff3eb5' }}>{stats?.nb_coloriages_mois ?? '—'}</span></span>
                  </div>
                  <div style={{ marginTop:'6px' }}>
                    <span style={s.statSub}>Commentaires : <span style={{ color:'#b0b0d0' }}>{stats?.nb_comments_colo ?? '—'}</span> / mois : <span style={{ color:'#ff3eb5' }}>{stats?.nb_comments_colo_mois ?? '—'}</span></span>
                  </div>
                  <div style={{ marginTop:'4px' }}>
                    <span style={s.statSub}>Likes : <span style={{ color:'#b0b0d0' }}>{stats?.nb_likes_colo ?? '—'}</span> / mois : <span style={{ color:'#ff3eb5' }}>{stats?.nb_likes_colo_mois ?? '—'}</span></span>
                  </div>
                </div>
                <div style={s.statCard('#a78bfa')}>
                  <div style={s.statLabel}>Pensées publiées</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'10px' }}>
                    <div style={s.statValue('#a78bfa')}>{stats?.nb_pensees ?? '—'}</div>
                    <span style={s.statSub}>Ce mois : <span style={{ color:'#a78bfa' }}>{stats?.nb_pensees_mois ?? '—'}</span></span>
                  </div>
                  <div style={{ marginTop:'6px' }}>
                    <span style={s.statSub}>Commentaires : <span style={{ color:'#b0b0d0' }}>{stats?.nb_comments_pensees ?? '—'}</span> / mois : <span style={{ color:'#a78bfa' }}>{stats?.nb_comments_pensees_mois ?? '—'}</span></span>
                  </div>
                  <div style={{ marginTop:'4px' }}>
                    <span style={s.statSub}>Likes : <span style={{ color:'#b0b0d0' }}>{stats?.nb_likes_pensees ?? '—'}</span> / mois : <span style={{ color:'#a78bfa' }}>{stats?.nb_likes_pensees_mois ?? '—'}</span></span>
                  </div>
                </div>
              </div>
              )}

              {nbNonLusChat > 0 && (
                <div style={{ background:'rgba(255,62,181,0.08)', border:'1px solid #ff3eb555', borderRadius:'10px', padding:'12px 16px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ background:'#ff3eb5', color:'#000', fontSize:'12px', fontWeight:700, borderRadius:'10px', minWidth:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 6px', flexShrink:0 }}>{nbNonLusChat}</span>
                  <span style={{ fontSize:'12px', color:'#ff3eb5' }}>
                    {nbNonLusChat > 1 ? `conversations privées contiennent des messages non lus` : `conversation privée contient un message non lu`}
                  </span>
                </div>
              )}

              <div style={s.grid2(isMobile)}>
                {/* Commandes en attente */}
                <div>
                  <div style={s.sectionTitle}>Commandes reliées en attente ({cmdEnAttente.length})</div>
                  {cmdEnAttente.length === 0 && <div style={{ color:'#44445a', fontSize:'12px' }}>Aucune commande en attente</div>}
                  {cmdEnAttente.slice(0, 3).map(cmd => (
                    <CmdCard
                      key={cmd.id} cmd={cmd}
                      suiviOpen={suiviOpen} setSuiviOpen={setSuiviOpen}
                      suiviData={suiviData} setSuiviData={setSuiviData}
                      litigeOpen={litigeOpen} setLitigeOpen={setLitigeOpen}
                      litigeData={litigeData} setLitigeData={setLitigeData}
                      litigeExistant={litigesExistants[cmd.id]}
                      validerCommande={validerCommande}
                      archiverCommande={archiverCommande}
                      sauvegarderLitige={sauvegarderLitige}
                      s={s} fmtDate={fmtDate} isMobile={isMobile}
                    />
                  ))}
                  {cmdEnAttente.length > 3 && (
                    <div style={{ fontSize:'11px', color:'#00e5ff', cursor:'pointer', marginTop:'6px' }} onClick={() => setOnglet('commandes')}>
                      Voir toutes les commandes →
                    </div>
                  )}
                </div>

                {/* Commentaires signalés */}
                <div>
                  <div style={s.sectionTitle}>Commentaires signalés ({cmtSignales.length})</div>
                  {cmtSignales.length === 0 && <div style={{ color:'#44445a', fontSize:'12px' }}>Aucun commentaire signalé</div>}
                  {cmtSignales.slice(0, 3).map(c => (
                    <CmtCard key={c.id} c={c} flagged={true} supprimerCommentaire={supprimerCommentaire} ignorer={(id) => setIgnores(prev => new Set([...prev, id]))} s={s} fmtDate={fmtDate} isMobile={isMobile} />
                  ))}
                  {cmtSignales.length > 3 && (
                    <div style={{ fontSize:'11px', color:'#ff3eb5', cursor:'pointer', marginTop:'6px' }} onClick={() => setOnglet('moderation')}>
                      Voir tous les commentaires →
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ======== COMMANDES ======== */}
          {!loading && onglet === 'commandes' && (
            <>
              {/* Commandes actives */}
              {['en_attente', 'expediee', 'livree'].map(statut => {
                const liste = cmdActives.filter(c => c.statut === statut)
                if (liste.length === 0) return null
                return (
                  <div key={statut} style={{ marginBottom:'24px' }}>
                    <div style={s.sectionTitle}>{STATUT_LABEL[statut]} ({liste.length})</div>
                    {liste.map(cmd => (
                      <CmdCard
                        key={cmd.id} cmd={cmd}
                        suiviOpen={suiviOpen} setSuiviOpen={setSuiviOpen}
                        suiviData={suiviData} setSuiviData={setSuiviData}
                        litigeOpen={litigeOpen} setLitigeOpen={setLitigeOpen}
                        litigeData={litigeData} setLitigeData={setLitigeData}
                        litigeExistant={litigesExistants[cmd.id]}
                        validerCommande={validerCommande}
                        archiverCommande={archiverCommande}
                        sauvegarderLitige={sauvegarderLitige}
                        s={s} fmtDate={fmtDate} full isMobile={isMobile}
                      />
                    ))}
                  </div>
                )
              })}
              {cmdActives.length === 0 && <div style={{ color:'#44445a', fontSize:'12px' }}>Aucune commande en cours</div>}

              {/* Archives */}
              {cmdArchivees.length > 0 && (() => {
                // Grouper par année puis mois
                const groupes = {}
                cmdArchivees.forEach(cmd => {
                  const d = new Date(cmd.date_commande || cmd.created_at || Date.now())
                  const annee = d.getFullYear()
                  const mois = d.toLocaleDateString('fr-FR', { month: 'long' })
                  const key = `${annee}-${String(d.getMonth()).padStart(2,'0')}`
                  if (!groupes[annee]) groupes[annee] = {}
                  if (!groupes[annee][mois]) groupes[annee][mois] = { key, cmds: [] }
                  groupes[annee][mois].cmds.push(cmd)
                })
                return (
                  <div style={{ marginTop:'32px', borderTop:'1px solid #ffffff0a', paddingTop:'20px' }}>
                    <div style={{ ...s.sectionTitle, color:'#646482', marginBottom:'16px' }}>📦 Archives ({cmdArchivees.length})</div>
                    {Object.entries(groupes).sort(([a],[b]) => b-a).map(([annee, moisMap]) => (
                      <div key={annee} style={{ marginBottom:'16px' }}>
                        <div style={{ fontSize:'12px', color:'#646482', fontWeight:600, marginBottom:'8px' }}>{annee}</div>
                        {Object.entries(moisMap).sort(([,a],[,b]) => b.key.localeCompare(a.key)).map(([mois, { cmds }]) => (
                          <div key={mois} style={{ marginBottom:'10px', marginLeft:'10px' }}>
                            <div style={{ fontSize:'10px', color:'#44445a', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>{mois} ({cmds.length})</div>
                            {cmds.map(cmd => (
                              <CmdCard
                                key={cmd.id} cmd={cmd}
                                suiviOpen={suiviOpen} setSuiviOpen={setSuiviOpen}
                                suiviData={suiviData} setSuiviData={setSuiviData}
                                litigeOpen={litigeOpen} setLitigeOpen={setLitigeOpen}
                                litigeData={litigeData} setLitigeData={setLitigeData}
                                litigeExistant={litigesExistants[cmd.id]}
                                validerCommande={validerCommande}
                                archiverCommande={archiverCommande}
                                sauvegarderLitige={sauvegarderLitige}
                                s={s} fmtDate={fmtDate} full archive isMobile={isMobile}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </>
          )}

          {/* ======== USAGERS ======== */}
          {!loading && onglet === 'usagers' && (
            isMobile ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {/* Tri rapide mobile */}
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'4px' }}>
                  {[
                    { col:'nb_commandes', label:'Commandes' },
                    { col:'ca_genere', label:'CA total' },
                    { col:'inscrit_le', label:'Inscrit le' },
                    { col:'nb_signales', label:'Signalés' },
                  ].map(({ col, label }) => (
                    <button key={col} style={sortCol === col ? s.btnCyan : s.btnGhost} onClick={() => trier(col)}>
                      {label} {sortCol === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </button>
                  ))}
                </div>
                {usagersTries.map(u => (
                  <div key={u.id} style={{ background:'#0d0d1a', border:'1px solid #00e5ff1a', borderRadius:'10px', padding:'12px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <div>
                        <div style={{ fontSize:'13px', fontWeight:500, color:'#f0f0ff' }}>{u.prenom} {u.nom}</div>
                        <div style={{ fontSize:'10px', color:'#00e5ff88', marginTop:'2px' }}>{u.email}</div>
                      </div>
                      {u.nb_signales > 0 && (
                        <span style={{ fontSize:'10px', color:'#ef4444', fontWeight:600, background:'rgba(239,68,68,0.12)', border:'1px solid #ef444444', borderRadius:'20px', padding:'2px 8px', flexShrink:0 }}>⚠️ {u.nb_signales}</span>
                      )}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', fontSize:'11px' }}>
                      <div><span style={{ color:'#555570' }}>Inscrit : </span><span style={{ color:'#c0c0e0' }}>{fmtDate(u.inscrit_le)}</span></div>
                      <div><span style={{ color:'#555570' }}>Commandes : </span><span style={{ color:'#ffd700', fontWeight:500 }}>{u.nb_commandes}</span></div>
                      <div><span style={{ color:'#555570' }}>CA total : </span><span style={{ color:'#ffd700' }}>{fmtEur(u.ca_genere)}</span></div>
                      <div><span style={{ color:'#555570' }}>CA mois : </span><span style={{ color: u.ca_mois > 0 ? '#22c55e' : '#44445a' }}>{fmtEur(u.ca_mois)}</span></div>
                      <div><span style={{ color:'#555570' }}>Illustrations : </span><span style={{ color:'#00e5ff' }}>{u.nb_illustrations}</span></div>
                      <div><span style={{ color:'#555570' }}>Livres/Recueils : </span><span style={{ color:'#00e5ff' }}>{u.nb_livres_recueils}</span></div>
                      <div><span style={{ color:'#555570' }}>Coloriages : </span><span style={{ color:'#c0c0e0' }}>{u.nb_coloriages}</span></div>
                      <div><span style={{ color:'#555570' }}>Pensées : </span><span style={{ color:'#c0c0e0' }}>{u.nb_pensees}</span></div>
                      <div><span style={{ color:'#555570' }}>Coms / likes colo : </span><span style={{ color:'#c0c0e0' }}>{u.nb_commentaires} / {u.nb_likes}</span></div>
                      <div><span style={{ color:'#555570' }}>Coms / likes pensées : </span><span style={{ color:'#c0c0e0' }}>{u.nb_comments_pensees} / {u.nb_likes_pensees}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div style={s.tableWrap}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {[
                      { col:'prenom', label:'Nom' },
                      { col:'email', label:'Email' },
                      { col:'inscrit_le', label:'Inscrit' },
                      { col:'nb_illustrations', label:'Illus.' },
                      { col:'nb_livres_recueils', label:'Liv/Rec' },
                      { col:'nb_commandes', label:'Cmd' },
                      { col:'ca_genere', label:'CA tot.' },
                      { col:'ca_mois', label:'CA mois' },
                      { col:'nb_coloriages', label:'Colos' },
                      { col:'nb_commentaires', label:'Com.C' },
                      { col:'nb_likes', label:'Like C' },
                      { col:'nb_pensees', label:'Pens.' },
                      { col:'nb_comments_pensees', label:'Com.P' },
                      { col:'nb_likes_pensees', label:'Like P' },
                      { col:'nb_signales', label:'⚠️' },
                    ].map(({ col, label }) => (
                      <th key={col} style={s.th} onClick={() => trier(col)}>
                        {label} {sortCol === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usagersTries.map(u => (
                    <tr key={u.id} style={{ borderBottom:'1px solid #ffffff06' }}
                      onMouseEnter={e => e.currentTarget.style.background='#0f0f1e'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      <td style={s.td}>{u.prenom} {u.nom}</td>
                      <td style={{ ...s.td, color:'#00e5ff88', fontSize:'11px' }}>{u.email}</td>
                      <td style={s.td}>{fmtDate(u.inscrit_le)}</td>
                      <td style={{ ...s.td, color:'#00e5ff' }}>{u.nb_illustrations}</td>
                      <td style={{ ...s.td, color:'#00e5ff' }}>{u.nb_livres_recueils}</td>
                      <td style={{ ...s.td, color:'#ffd700', fontWeight:500 }}>{u.nb_commandes}</td>
                      <td style={{ ...s.td, color:'#ffd700' }}>{fmtEur(u.ca_genere)}</td>
                      <td style={{ ...s.td, color: u.ca_mois > 0 ? '#22c55e' : '#44445a' }}>{fmtEur(u.ca_mois)}</td>
                      <td style={s.td}>{u.nb_coloriages}</td>
                      <td style={s.td}>{u.nb_commentaires}</td>
                      <td style={s.td}>{u.nb_likes}</td>
                      <td style={s.td}>{u.nb_pensees}</td>
                      <td style={s.td}>{u.nb_comments_pensees}</td>
                      <td style={s.td}>{u.nb_likes_pensees}</td>
                      <td style={{ ...s.td, color: u.nb_signales > 0 ? '#ef4444' : '#44445a', fontWeight: u.nb_signales > 0 ? 600 : 400 }}>{u.nb_signales || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )
          )}

          {/* ======== MODÉRATION ======== */}
          {!loading && onglet === 'moderation' && (
            <>
              {cmtSignales.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <div style={s.sectionTitle}>Signalés ({cmtSignales.length})</div>
                  {cmtSignales.map(c => (
                    <CmtCard key={c.id} c={c} flagged={true} supprimerCommentaire={supprimerCommentaire} ignorer={(id) => setIgnores(prev => new Set([...prev, id]))} s={s} fmtDate={fmtDate} isMobile={isMobile} />
                  ))}
                </div>
              )}
              <div>
                <div style={s.sectionTitle}>Tous les commentaires ({commentaires.filter(c => !contientMotInterdit(c.texte)).length} normaux)</div>
                {commentaires.filter(c => !contientMotInterdit(c.texte)).map(c => (
                  <CmtCard key={c.id} c={c} flagged={false} supprimerCommentaire={supprimerCommentaire} s={s} fmtDate={fmtDate} isMobile={isMobile} />
                ))}
              </div>
            </>
          )}

          {/* ======== CHAT PRIVÉ ======== */}
          {!loading && onglet === 'chat' && (
            isMobile ? (
              conversationActive ? (
                /* Vue fil — mobile plein écran */
                <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 140px)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 4px', borderBottom:'1px solid #ffffff0a', marginBottom:'10px' }}>
                    <button style={s.btnGhost} onClick={() => setConversationActive(null)}>← Retour</button>
                    <span style={{ fontSize:'13px', fontWeight:500, color: conversationActive === '__general__' ? '#00e5ff' : '#f0f0ff' }}>
                      {conversationActive === '__general__' ? 'Chat Général' : (conversations.find(c => c.user_id === conversationActive)?.pseudo || '...')}
                    </span>
                  </div>
                  <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px', padding:'4px' }}>
                    {loadingChat ? (
                      <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'20px' }}>Chargement...</div>
                    ) : messagesChat.length === 0 ? (
                      <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'20px' }}>Aucun message.</div>
                    ) : messagesChat.map(m => {
                      const estMoi = conversationActive === '__general__' ? m.user_id === userId : m.expediteur === 'admin'
                      return (
                      <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: estMoi ? 'flex-end' : 'flex-start' }}>
                        {conversationActive === '__general__' && (
                          <span style={{ fontSize:'10px', color:'#6a6a8a', marginBottom:'2px' }}>{m.pseudo}</span>
                        )}
                        <div style={{ maxWidth:'80%', background: estMoi ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.05)', border:`1px solid ${estMoi ? '#00e5ff44' : '#ffffff18'}`, borderRadius:'10px', padding:'8px 12px', fontSize:'12px', color:'#e0e0f0', wordBreak:'break-word' }}>
                          {m.contenu}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'3px' }}>
                          <span style={{ fontSize:'9px', color:'#44445a' }}>{fmtDate(m.created_at)}</span>
                          <span style={{ fontSize:'10px', color:'#ef4444', cursor:'pointer' }} onClick={() => supprimerMessageChat(m.id)}>Supprimer</span>
                        </div>
                      </div>
                      )
                    })}
                    <div ref={finChatRef} />
                  </div>
                  <div style={{ display:'flex', gap:'8px', paddingTop:'10px' }}>
                    <input style={{ ...s.input, marginBottom:0, flex:1 }} placeholder="Répondre..." value={texteChat} onChange={e => setTexteChat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') envoyerMessageAdmin() }} />
                    <button style={s.btnCyan} onClick={envoyerMessageAdmin} disabled={!texteChat.trim()}>→</button>
                  </div>
                </div>
              ) : (
                /* Liste — mobile */
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  <div style={{ position:'relative' }}>
                    <input
                      style={{ ...s.input, marginBottom:0 }}
                      placeholder="Démarrer une conversation — pseudo..."
                      value={rechercheUsagerChat}
                      onChange={e => setRechercheUsagerChat(e.target.value)}
                    />
                    {suggestionsUsagersChat.length > 0 && (
                      <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:10, background:'#0d0d1a', border:'1px solid #00e5ff44', borderRadius:'8px', marginTop:'4px', maxHeight:'200px', overflowY:'auto' }}>
                        {suggestionsUsagersChat.map(u => (
                          <div key={u.id} onClick={() => demarrerConversationAvec(u)}
                            style={{ padding:'10px 12px', cursor:'pointer', fontSize:'12px', color:'#f0f0ff', borderBottom:'1px solid #ffffff08' }}
                          >
                            {u.pseudo || 'Anonyme'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div onClick={ouvrirGeneral} style={{ background:'rgba(0,229,255,0.05)', border:'1px solid #00e5ff44', borderRadius:'10px', padding:'12px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}>
                    <i className="ti ti-message-2" style={{ fontSize:'15px', color:'#00e5ff' }} aria-hidden="true" />
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#00e5ff' }}>Chat Général</span>
                  </div>
                  {conversations.length === 0 ? (
                    <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'30px' }}>Aucune conversation pour l'instant.</div>
                  ) : conversations.map(c => (
                    <div key={c.user_id} onClick={() => ouvrirConversation(c.user_id)} style={{ background:'#0d0d1a', border:'1px solid #00e5ff1a', borderRadius:'10px', padding:'12px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'10px' }}>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontSize:'13px', fontWeight:500, color:'#f0f0ff' }}>{c.pseudo}</div>
                        <div style={{ fontSize:'11px', color:'#6a6a8a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:'2px' }}>{c.dernier_message}</div>
                      </div>
                      {c.non_lus > 0 && (
                        <span style={{ background:'#ff3eb5', color:'#000', fontSize:'10px', fontWeight:700, borderRadius:'10px', minWidth:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px', flexShrink:0 }}>{c.non_lus}</span>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Desktop — 2 colonnes */
              <div style={{ display:'flex', gap:'14px', height:'calc(100vh - 110px)' }}>
                <div style={{ width:'260px', flexShrink:0, ...s.tableWrap, overflowY:'auto' }}>
                  <div style={{ position:'relative', padding:'10px 10px 0' }}>
                    <input
                      style={{ ...s.input, marginBottom:0 }}
                      placeholder="Démarrer une conversation — pseudo..."
                      value={rechercheUsagerChat}
                      onChange={e => setRechercheUsagerChat(e.target.value)}
                    />
                    {suggestionsUsagersChat.length > 0 && (
                      <div style={{ position:'absolute', top:'100%', left:'10px', right:'10px', zIndex:10, background:'#0d0d1a', border:'1px solid #00e5ff44', borderRadius:'8px', marginTop:'4px', maxHeight:'200px', overflowY:'auto' }}>
                        {suggestionsUsagersChat.map(u => (
                          <div key={u.id} onClick={() => demarrerConversationAvec(u)}
                            style={{ padding:'9px 12px', cursor:'pointer', fontSize:'12px', color:'#f0f0ff', borderBottom:'1px solid #ffffff08' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#0f0f1e' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                          >
                            {u.pseudo || 'Anonyme'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div onClick={ouvrirGeneral}
                    style={{ padding:'12px 14px', cursor:'pointer', borderBottom:'1px solid #00e5ff22', background: conversationActive === '__general__' ? 'rgba(0,229,255,0.1)' : 'rgba(0,229,255,0.03)', display:'flex', alignItems:'center', gap:'8px', marginTop:'10px' }}
                    onMouseEnter={e => { if (conversationActive !== '__general__') e.currentTarget.style.background = 'rgba(0,229,255,0.07)' }}
                    onMouseLeave={e => { if (conversationActive !== '__general__') e.currentTarget.style.background = 'rgba(0,229,255,0.03)' }}
                  >
                    <i className="ti ti-message-2" style={{ fontSize:'14px', color:'#00e5ff' }} aria-hidden="true" />
                    <span style={{ fontSize:'12px', fontWeight:600, color:'#00e5ff' }}>Chat Général</span>
                  </div>
                  {conversations.length === 0 ? (
                    <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'30px 16px' }}>Aucune conversation pour l'instant.</div>
                  ) : conversations.map(c => (
                    <div key={c.user_id} onClick={() => ouvrirConversation(c.user_id)}
                      style={{ padding:'12px 14px', cursor:'pointer', borderBottom:'1px solid #ffffff08', background: conversationActive === c.user_id ? 'rgba(0,229,255,0.06)' : 'transparent', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px' }}
                      onMouseEnter={e => { if (conversationActive !== c.user_id) e.currentTarget.style.background = '#0f0f1e' }}
                      onMouseLeave={e => { if (conversationActive !== c.user_id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontSize:'12px', fontWeight:500, color: conversationActive === c.user_id ? '#00e5ff' : '#f0f0ff' }}>{c.pseudo}</div>
                        <div style={{ fontSize:'10px', color:'#6a6a8a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:'2px' }}>{c.dernier_message}</div>
                      </div>
                      {c.non_lus > 0 && (
                        <span style={{ background:'#ff3eb5', color:'#000', fontSize:'10px', fontWeight:700, borderRadius:'10px', minWidth:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px', flexShrink:0 }}>{c.non_lus}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ flex:1, ...s.tableWrap, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                  {!conversationActive ? (
                    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#44445a', fontSize:'12px' }}>Sélectionne une conversation</div>
                  ) : (
                    <>
                      <div style={{ padding:'12px 16px', borderBottom:'1px solid #ffffff0a', fontSize:'13px', fontWeight:500, color: conversationActive === '__general__' ? '#00e5ff' : '#f0f0ff' }}>
                        {conversationActive === '__general__' ? 'Chat Général' : conversations.find(c => c.user_id === conversationActive)?.pseudo}
                      </div>
                      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px', padding:'14px' }}>
                        {loadingChat ? (
                          <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'20px' }}>Chargement...</div>
                        ) : messagesChat.length === 0 ? (
                          <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'20px' }}>Aucun message.</div>
                        ) : messagesChat.map(m => {
                          const estMoi = conversationActive === '__general__' ? m.user_id === userId : m.expediteur === 'admin'
                          return (
                          <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: estMoi ? 'flex-end' : 'flex-start' }}>
                            {conversationActive === '__general__' && (
                              <span style={{ fontSize:'10px', color:'#6a6a8a', marginBottom:'2px' }}>{m.pseudo}</span>
                            )}
                            <div style={{ maxWidth:'60%', background: estMoi ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.05)', border:`1px solid ${estMoi ? '#00e5ff44' : '#ffffff18'}`, borderRadius:'10px', padding:'8px 12px', fontSize:'12px', color:'#e0e0f0', wordBreak:'break-word' }}>
                              {m.contenu}
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'3px' }}>
                              <span style={{ fontSize:'9px', color:'#44445a' }}>{fmtDate(m.created_at)}</span>
                              <span style={{ fontSize:'10px', color:'#ef4444', cursor:'pointer' }} onClick={() => supprimerMessageChat(m.id)}>Supprimer</span>
                            </div>
                          </div>
                          )
                        })}
                        <div ref={finChatRef} />
                      </div>
                      <div style={{ display:'flex', gap:'8px', padding:'12px 16px', borderTop:'1px solid #ffffff0a' }}>
                        <input style={{ ...s.input, marginBottom:0, flex:1 }} placeholder="Répondre..." value={texteChat} onChange={e => setTexteChat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') envoyerMessageAdmin() }} />
                        <button style={s.btnCyan} onClick={envoyerMessageAdmin} disabled={!texteChat.trim()}>Envoyer</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          )}

          {/* ======== NOTIF ADMIN ======== */}
          {!loading && onglet === 'notif' && (
            isMobile ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {/* Formulaire */}
                <div style={{ ...s.tableWrap, padding:'14px' }}>
                  <div style={{ display:'flex', gap:'6px', marginBottom:'10px' }}>
                    <button style={modeCibleNotif === 'tous' ? s.btnCyan : s.btnGhost} onClick={() => { setModeCibleNotif('tous'); setUsagerCible(null) }}>À tous</button>
                    <button style={modeCibleNotif === 'cible' ? s.btnCyan : s.btnGhost} onClick={() => setModeCibleNotif('cible')}>À un usager</button>
                  </div>
                  {modeCibleNotif === 'cible' && (
                    <div style={{ position:'relative', marginBottom:'8px' }}>
                      <input
                        style={s.input}
                        placeholder="Tape un pseudo..."
                        value={usagerCible ? usagerCible.pseudo : rechercheUsagerNotif}
                        onChange={e => { setUsagerCible(null); setRechercheUsagerNotif(e.target.value) }}
                      />
                      {!usagerCible && suggestionsUsagers.length > 0 && (
                        <div style={{ background:'#0d0d1a', border:'1px solid #00e5ff33', borderRadius:'8px', overflow:'hidden', marginTop:'-4px' }}>
                          {suggestionsUsagers.map(u => (
                            <div key={u.id} onClick={() => { setUsagerCible(u); setSuggestionsUsagers([]) }}
                              style={{ padding:'8px 12px', fontSize:'12px', color:'#e0e0f0', cursor:'pointer', borderBottom:'1px solid #ffffff08' }}>
                              {u.pseudo}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <textarea
                    style={{ ...s.input, minHeight:'80px', resize:'vertical', fontFamily:'inherit' }}
                    placeholder="Texte de la notification..."
                    value={texteNotifAdmin}
                    onChange={e => setTexteNotifAdmin(e.target.value)}
                  />
                  <button style={{ ...s.btnCyan, width:'100%', textAlign:'center', opacity: envoiNotifEnCours ? 0.5 : 1 }}
                    onClick={envoyerNotifAdmin} disabled={!texteNotifAdmin.trim() || envoiNotifEnCours}>
                    {envoiNotifEnCours ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>

                {/* Historique */}
                <div>
                  <div style={s.sectionTitle}>Notifications envoyées</div>
                  {loadingNotifsEnvoyees ? (
                    <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'20px' }}>Chargement...</div>
                  ) : notifsEnvoyees.length === 0 ? (
                    <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'20px' }}>Aucune notification envoyée pour l'instant.</div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                      {notifsEnvoyees.map(n => (
                        <div key={n.id} style={{ background:'#0d0d1a', border:'1px solid #ffffff12', borderRadius:'8px', padding:'10px 12px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px', marginBottom:'4px' }}>
                            <span style={{ fontSize:'11px', color:'#F5C84C', fontWeight:600 }}>{n.pseudo}</span>
                            <span style={{ fontSize:'10px', color:'#ef4444', cursor:'pointer', flexShrink:0 }} onClick={() => supprimerNotifEnvoyee(n.id)}>Supprimer</span>
                          </div>
                          <div style={{ fontSize:'12px', color:'#c0c0e0', lineHeight:'1.4' }}>{n.contenu?.texte}</div>
                          <div style={{ fontSize:'9px', color:'#44445a', marginTop:'4px' }}>{fmtDate(n.created_at)} · {n.lu ? 'Lue' : 'Non lue'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Desktop — 2 colonnes */
              <div style={{ display:'flex', gap:'14px' }}>
                <div style={{ width:'360px', flexShrink:0, ...s.tableWrap, padding:'16px' }}>
                  <div style={s.sectionTitle}>Rédiger une notification</div>
                  <div style={{ display:'flex', gap:'6px', marginBottom:'12px' }}>
                    <button style={modeCibleNotif === 'tous' ? s.btnCyan : s.btnGhost} onClick={() => { setModeCibleNotif('tous'); setUsagerCible(null) }}>À tous</button>
                    <button style={modeCibleNotif === 'cible' ? s.btnCyan : s.btnGhost} onClick={() => setModeCibleNotif('cible')}>À un usager</button>
                  </div>
                  {modeCibleNotif === 'cible' && (
                    <div style={{ position:'relative', marginBottom:'8px' }}>
                      <input
                        style={s.input}
                        placeholder="Tape un pseudo..."
                        value={usagerCible ? usagerCible.pseudo : rechercheUsagerNotif}
                        onChange={e => { setUsagerCible(null); setRechercheUsagerNotif(e.target.value) }}
                      />
                      {!usagerCible && suggestionsUsagers.length > 0 && (
                        <div style={{ background:'#0d0d1a', border:'1px solid #00e5ff33', borderRadius:'8px', overflow:'hidden', marginTop:'-4px', maxHeight:'200px', overflowY:'auto' }}>
                          {suggestionsUsagers.map(u => (
                            <div key={u.id} onClick={() => { setUsagerCible(u); setSuggestionsUsagers([]) }}
                              style={{ padding:'8px 12px', fontSize:'12px', color:'#e0e0f0', cursor:'pointer', borderBottom:'1px solid #ffffff08' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#12121f'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              {u.pseudo}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <textarea
                    style={{ ...s.input, minHeight:'100px', resize:'vertical', fontFamily:'inherit' }}
                    placeholder="Texte de la notification..."
                    value={texteNotifAdmin}
                    onChange={e => setTexteNotifAdmin(e.target.value)}
                  />
                  <button style={{ ...s.btnCyan, opacity: envoiNotifEnCours ? 0.5 : 1 }}
                    onClick={envoyerNotifAdmin} disabled={!texteNotifAdmin.trim() || envoiNotifEnCours}>
                    {envoiNotifEnCours ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>

                <div style={{ flex:1, ...s.tableWrap, padding:'16px', maxHeight:'calc(100vh - 110px)', overflowY:'auto' }}>
                  <div style={s.sectionTitle}>Notifications envoyées</div>
                  {loadingNotifsEnvoyees ? (
                    <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'30px' }}>Chargement...</div>
                  ) : notifsEnvoyees.length === 0 ? (
                    <div style={{ textAlign:'center', color:'#44445a', fontSize:'12px', padding:'30px' }}>Aucune notification envoyée pour l'instant.</div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                      {notifsEnvoyees.map(n => (
                        <div key={n.id} style={{ background:'#0d0d1a', border:'1px solid #ffffff12', borderRadius:'8px', padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#12121f'}
                          onMouseLeave={e => e.currentTarget.style.background = '#0d0d1a'}>
                          <div style={{ minWidth:0, flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                              <span style={{ fontSize:'11px', color:'#F5C84C', fontWeight:600 }}>{n.pseudo}</span>
                              <span style={{ fontSize:'9px', color:'#44445a' }}>{fmtDate(n.created_at)} · {n.lu ? 'Lue' : 'Non lue'}</span>
                            </div>
                            <div style={{ fontSize:'12px', color:'#c0c0e0', lineHeight:'1.4' }}>{n.contenu?.texte}</div>
                          </div>
                          <span style={{ fontSize:'10px', color:'#ef4444', cursor:'pointer', flexShrink:0 }} onClick={() => supprimerNotifEnvoyee(n.id)}>Supprimer</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed', bottom:'24px', right:'24px', zIndex:9999,
          background: toast.type === 'error' ? 'rgba(255,62,181,0.15)' : 'rgba(34,197,94,0.15)',
          border: `1px solid ${toast.type === 'error' ? '#ff3eb544' : '#22c55e44'}`,
          color: toast.type === 'error' ? '#ff3eb5' : '#22c55e',
          padding:'10px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:500
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ---- Composant CmdCard ----
function CmdCard({ cmd, suiviOpen, setSuiviOpen, suiviData, setSuiviData, litigeOpen, setLitigeOpen, litigeData, setLitigeData, litigeExistant, validerCommande, archiverCommande, sauvegarderLitige, s, fmtDate, full, archive, isMobile }) {
  const isOpen = suiviOpen === cmd.id
  const isLitigeOpen = litigeOpen === cmd.id
  const sd = suiviData[cmd.id] || {}
  const ld = litigeData[cmd.id] || (litigeExistant ? { ...litigeExistant } : {})

  const updateSuivi = (field, val) => setSuiviData(prev => ({ ...prev, [cmd.id]: { ...prev[cmd.id], [field]: val } }))
  const updateLitige = (field, val) => setLitigeData(prev => ({ ...prev, [cmd.id]: { ...(prev[cmd.id] || {}), [field]: val } }))

  const statutActuel = sd.statut || cmd.statut

  return (
    <div style={{ ...s.cmdCard(cmd.statut), opacity: archive ? 0.7 : 1 }}>
      {/* Header */}
      <div style={s.cmdHeader}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={s.cmdTitle}>{cmd.nom_article}</span>
          {litigeExistant && litigeExistant.statut_litige === 'ouvert' && (
            <span style={{ fontSize:'10px', color:'#ef4444', background:'rgba(239,68,68,0.12)', border:'1px solid #ef444433', borderRadius:'20px', padding:'2px 7px' }}>⚠️ Litige ouvert</span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <span style={s.badge(cmd.statut)}>{STATUT_LABEL[cmd.statut]}</span>
          {!archive && (
            <button style={s.btnGhost} onClick={() => { setSuiviOpen(isOpen ? null : cmd.id); setLitigeOpen(null) }}>
              {isOpen ? 'Fermer' : 'Modifier'}
            </button>
          )}
        </div>
      </div>

      {/* Infos client */}
      <div style={s.infoGrid(isMobile)}>
        <div style={s.infoBlock}><div style={s.infoLbl}>Nom</div><div style={s.infoVal}>{cmd.client.prenom} {cmd.client.nom}</div></div>
        <div style={s.infoBlock}><div style={s.infoLbl}>Email</div><div style={{ ...s.infoVal, color:'#00e5ff88', fontSize:'10px' }}>{cmd.client.email}</div></div>
        <div style={s.infoBlock}><div style={s.infoLbl}>Téléphone</div><div style={s.infoVal}>{cmd.client.telephone || '—'}</div></div>
        <div style={s.infoBlock}><div style={s.infoLbl}>Adresse</div><div style={s.infoVal}>{cmd.client.adresse || '—'}</div></div>
        <div style={s.infoBlock}><div style={s.infoLbl}>Code postal / Ville</div><div style={s.infoVal}>{cmd.client.code_postal} {cmd.client.ville}</div></div>
        <div style={s.infoBlock}><div style={s.infoLbl}>Pays</div><div style={s.infoVal}>{cmd.client.pays}</div></div>
        <div style={s.infoBlock}><div style={s.infoLbl}>Commandé le</div><div style={s.infoVal}>{fmtDate(cmd.date_commande)}</div></div>
        {cmd.date_commande_amazon && <div style={s.infoBlock}><div style={s.infoLbl}>Commandé Amazon</div><div style={s.infoVal}>{cmd.date_commande_amazon}</div></div>}
        {cmd.date_livraison_estimee && <div style={s.infoBlock}><div style={s.infoLbl}>Livraison est.</div><div style={{ ...s.infoVal, color:'#ffd700' }}>{cmd.date_livraison_estimee}</div></div>}
        {cmd.livreur && <div style={s.infoBlock}><div style={s.infoLbl}>Livreur</div><div style={s.infoVal}>{cmd.livreur}</div></div>}
        {cmd.lien_suivi && <div style={s.infoBlock}><div style={s.infoLbl}>Suivi</div><div style={s.infoVal}><a href={cmd.lien_suivi} target="_blank" rel="noreferrer" style={{ color:'#00e5ff' }}>{cmd.numero_suivi || 'Lien →'}</a></div></div>}
      </div>

      {/* Bouton litige (hors archive) */}
      {!archive && (
        <div style={{ marginTop:'4px' }}>
          <button style={{ ...s.btnDanger, fontSize:'10px' }} onClick={() => { setLitigeOpen(isLitigeOpen ? null : cmd.id); setSuiviOpen(null) }}>
            {isLitigeOpen ? 'Fermer litige' : litigeExistant ? '⚠️ Voir/modifier litige' : '⚠️ Signaler un litige'}
          </button>
          {cmd.statut === 'livree' && (
            <button style={{ ...s.btnGhost, fontSize:'10px', marginLeft:'6px' }} onClick={() => archiverCommande(cmd.id)}>
              📦 Archiver
            </button>
          )}
        </div>
      )}

      {/* Formulaire modification */}
      {isOpen && (
        <div style={s.suiviForm}>
          {/* Ligne 1 : dates Amazon */}
          <div style={s.inputRow(isMobile)}>
            <div>
              <div style={{ ...s.infoLbl, marginBottom:'4px' }}>Date commande Amazon</div>
              <input style={s.input} placeholder="ex: 19/06/2026" value={sd.date_commande_amazon ?? cmd.date_commande_amazon ?? ''} onChange={e => updateSuivi('date_commande_amazon', e.target.value)} />
            </div>
            <div>
              <div style={{ ...s.infoLbl, marginBottom:'4px' }}>Date livraison estimée</div>
              <input style={s.input} type="date" value={sd.date_livraison_estimee ?? cmd.date_livraison_estimee ?? ''} onChange={e => updateSuivi('date_livraison_estimee', e.target.value)} />
            </div>
          </div>

          {/* Statut radio */}
          <div style={{ ...s.infoLbl, marginBottom:'6px' }}>Statut</div>
          <div style={s.radioRow}>
            {[
              { val:'en_attente', label:'🔴 En attente' },
              { val:'expediee',   label:'🟡 Expédiée' },
              { val:'livree',     label:'🟢 Livrée' },
            ].map(({ val, label }) => (
              <button key={val} style={s.radioBtn(statutActuel === val, STATUT_COLOR[val]?.color || '#fff')}
                onClick={() => updateSuivi('statut', val)}>
                {label}
              </button>
            ))}
          </div>

          {/* Infos transporteur */}
          <input style={s.input} placeholder="Transporteur (ex: Colissimo, Mondial Relay...)" value={sd.livreur ?? cmd.livreur ?? ''} onChange={e => updateSuivi('livreur', e.target.value)} />
          <div style={s.inputRow(isMobile)}>
            <input style={s.input} placeholder="Numéro de suivi" value={sd.numero_suivi ?? cmd.numero_suivi ?? ''} onChange={e => updateSuivi('numero_suivi', e.target.value)} />
            <input style={s.input} placeholder="Lien de suivi (URL)" value={sd.lien_suivi ?? cmd.lien_suivi ?? ''} onChange={e => updateSuivi('lien_suivi', e.target.value)} />
          </div>
          <input style={s.input} placeholder="Note optionnelle pour le client" value={sd.note_client ?? cmd.note_client ?? ''} onChange={e => updateSuivi('note_client', e.target.value)} />

          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button style={s.btnCyan} onClick={() => validerCommande(cmd.id)}>Valider</button>
            <button style={s.btnGhost} onClick={() => setSuiviOpen(null)}>Annuler</button>
          </div>
        </div>
      )}

      {/* Formulaire litige */}
      {isLitigeOpen && (
        <div style={s.litigeForm}>
          <div style={{ fontSize:'11px', color:'#ef4444', fontWeight:600, marginBottom:'10px' }}>⚠️ Gestion du litige</div>

          <div style={s.inputRow(isMobile)}>
            <div>
              <div style={{ ...s.infoLbl, marginBottom:'4px' }}>Date d'ouverture</div>
              <input style={s.input} type="date" value={ld.date_ouverture || new Date().toISOString().split('T')[0]} onChange={e => updateLitige('date_ouverture', e.target.value)} />
            </div>
            <div>
              <div style={{ ...s.infoLbl, marginBottom:'4px' }}>Date de résolution</div>
              <input style={s.input} type="date" value={ld.date_resolution || ''} onChange={e => updateLitige('date_resolution', e.target.value)} />
            </div>
          </div>

          <div style={{ ...s.infoLbl, marginBottom:'6px' }}>Nature du litige</div>
          <div style={s.radioRow}>
            {NATURE_LITIGE.map(n => (
              <button key={n} style={s.radioBtn(ld.nature === n, '#ef4444')} onClick={() => updateLitige('nature', n)}>{n}</button>
            ))}
          </div>
          {ld.nature === 'Autre' && (
            <input style={s.input} placeholder="Préciser..." value={ld.detail_nature || ''} onChange={e => updateLitige('detail_nature', e.target.value)} />
          )}

          <div style={{ ...s.infoLbl, margin:'8px 0 6px' }}>Traitement</div>
          <div style={s.radioRow}>
            {TRAITEMENT_LITIGE.map(t => (
              <button key={t} style={s.radioBtn(ld.traitement === t, '#ffd700')} onClick={() => updateLitige('traitement', t)}>{t}</button>
            ))}
          </div>

          <div style={{ ...s.infoLbl, margin:'8px 0 4px' }}>Statut du litige</div>
          <div style={s.radioRow}>
            {[{val:'ouvert',label:'Ouvert'},{val:'resolu',label:'Résolu'},{val:'cloture',label:'Clôturé'}].map(({ val, label }) => (
              <button key={val} style={s.radioBtn(ld.statut_litige === val, STATUT_LITIGE_COLOR[val])} onClick={() => updateLitige('statut_litige', val)}>{label}</button>
            ))}
          </div>

          <textarea
            style={{ ...s.input, resize:'vertical', minHeight:'60px', marginTop:'8px' }}
            placeholder="Notes de suivi du litige..."
            value={ld.notes || ''}
            onChange={e => updateLitige('notes', e.target.value)}
          />

          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button style={s.btnDanger} onClick={() => sauvegarderLitige(cmd.id)}>Enregistrer le litige</button>
            <button style={s.btnGhost} onClick={() => setLitigeOpen(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Composant CmtCard ----
function CmtCard({ c, flagged, supprimerCommentaire, ignorer, s, fmtDate, isMobile }) {
  const prenom = c.profils?.prenom || 'Anonyme'
  const nom = c.profils?.nom || ''
  if (isMobile) {
    return (
      <div style={{ ...s.cmtCard(flagged), display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ ...s.cmtUser, fontWeight: 500 }}>{prenom} {nom}</span>
          {flagged && (
            <span style={s.flagTag}>
              <i className="ti ti-alert-triangle" style={{ fontSize: '12px' }} aria-hidden="true" />
              Signalé
            </span>
          )}
        </div>
        <span style={{ color: '#44445a', fontSize: '10px' }}>{c.ref} · {fmtDate(c.created_at)}</span>
        <span style={s.cmtText}>"{c.texte}"</span>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {flagged && ignorer && (
            <button style={s.btnGreen} onClick={() => ignorer(c.id)}>Valider</button>
          )}
          <button style={s.btnDanger} onClick={() => supprimerCommentaire(c.id, c.table)}>Supprimer</button>
        </div>
      </div>
    )
  }
  return (
    <div style={{ ...s.cmtCard(flagged), display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 14px' }}>
      <span style={{ ...s.cmtUser, whiteSpace: 'nowrap', flexShrink: 0 }}>{prenom} {nom}</span>
      <span style={{ color: '#44445a', fontSize: '10px', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.ref}</span>
      <span style={{ color: '#44445a', fontSize: '10px', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(c.created_at)}</span>
      <span style={{ ...s.cmtText, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>"{c.texte}"</span>
      {flagged && (
        <span style={{ ...s.flagTag, flexShrink: 0 }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: '12px' }} aria-hidden="true" />
          Signalé
        </span>
      )}
      {flagged && ignorer && (
        <button style={{ ...s.btnGreen, flexShrink: 0 }} onClick={() => ignorer(c.id)}>Valider</button>
      )}
      <button style={{ ...s.btnDanger, flexShrink: 0 }} onClick={() => supprimerCommentaire(c.id, c.table)}>Supprimer</button>
    </div>
  )
}