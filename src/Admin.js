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
  return MOTS_INTERDITS.some(mot => t.includes(mot.toLowerCase()))
}

const STATUT_LABEL = {
  en_attente: 'En attente',
  expediee: 'Expédiée',
  livree: 'Livrée'
}

const STATUT_COLOR = {
  en_attente: { bg: 'rgba(255,215,0,0.12)', border: '#ffd70044', color: '#ffd700' },
  expediee: { bg: 'rgba(0,229,255,0.10)', border: '#00e5ff44', color: '#00e5ff' },
  livree: { bg: 'rgba(34,197,94,0.10)', border: '#22c55e44', color: '#22c55e' }
}

const s = {
  shell: { display:'flex', height:'100vh', background:'#07070f', fontFamily:'sans-serif', fontSize:'13px', color:'#e0e0f0', overflow:'hidden' },
  sidebar: { width:'172px', flexShrink:0, borderRight:'1px solid #00e5ff1a', background:'#05050d', display:'flex', flexDirection:'column' },
  sidebarLogo: { padding:'18px 16px 14px', borderBottom:'1px solid #00e5ff1a' },
  logoName: { fontSize:'14px', fontWeight:600, color:'#e8e8f8', letterSpacing:'0.01em' },
  logoSub: { fontSize:'11px', color:'#00e5ff77', marginTop:'3px' },
  navItem: (active) => ({
    display:'flex', alignItems:'center', gap:'9px', padding:'9px 16px', cursor:'pointer',
    fontSize:'13px', color: active ? '#00e5ff' : '#6a6a8a',
    borderLeft: active ? '2px solid #00e5ff' : '2px solid transparent',
    background: active ? 'rgba(0,229,255,0.06)' : 'transparent',
    fontWeight: active ? 500 : 400, transition:'all 0.15s'
  }),
  navIcon: { fontSize:'17px' },
  sidebarBottom: { marginTop:'auto', padding:'14px 16px', borderTop:'1px solid #00e5ff1a' },
  liveDot: { width:'6px', height:'6px', borderRadius:'50%', background:'#22c55e', display:'inline-block', marginRight:'6px', animation:'pulse 2s infinite' },
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar: { height:'46px', flexShrink:0, borderBottom:'1px solid #00e5ff1a', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', background:'#05050d' },
  topbarTitle: { fontSize:'14px', fontWeight:500, color:'#e8e8f8' },
  topbarDate: { fontSize:'11px', color:'#44445a' },
  content: { flex:1, overflow:'auto', padding:'16px' },

  // Stats
  statGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'16px' },
  statCard: (accent) => ({ background:'#0d0d1a', border:`1px solid ${accent}33`, borderRadius:'10px', padding:'12px 14px' }),
  statLabel: { fontSize:'10px', color:'#6a6a8a', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' },
  statValue: (color) => ({ fontSize:'22px', fontWeight:500, color }),
  statSub: { fontSize:'10px', color:'#44445a', marginTop:'3px' },

  // Grid 2 colonnes
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  sectionTitle: { fontSize:'10px', fontWeight:500, color:'#6a6a8a', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' },

  // Commande card
  cmdCard: (statut) => ({
    background:'#0d0d1a', border:`1px solid ${STATUT_COLOR[statut]?.border || '#ffd70033'}`,
    borderRadius:'10px', padding:'14px', marginBottom:'10px'
  }),
  cmdHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' },
  cmdTitle: { fontSize:'13px', fontWeight:500, color:'#e8e8f8' },
  badge: (statut) => ({
    display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 9px',
    borderRadius:'20px', fontSize:'10px', fontWeight:500,
    background: STATUT_COLOR[statut]?.bg, border:`1px solid ${STATUT_COLOR[statut]?.border}`,
    color: STATUT_COLOR[statut]?.color
  }),
  infoGrid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px', fontSize:'11px', marginBottom:'10px' },
  infoBlock: { },
  infoLbl: { color:'#44445a', marginBottom:'2px', fontSize:'10px' },
  infoVal: { color:'#b0b0d0' },
  divider: { borderTop:'1px solid #ffffff0a', margin:'10px 0' },
  actionsRow: { display:'flex', gap:'6px', flexWrap:'wrap' },

  // Boutons
  btnGold: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(255,215,0,0.12)', border:'1px solid #ffd70044', color:'#ffd700', fontFamily:'sans-serif' },
  btnCyan: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(0,229,255,0.10)', border:'1px solid #00e5ff44', color:'#00e5ff', fontFamily:'sans-serif' },
  btnGreen: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(34,197,94,0.10)', border:'1px solid #22c55e44', color:'#22c55e', fontFamily:'sans-serif' },
  btnGhost: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'transparent', border:'1px solid #ffffff1a', color:'#6a6a8a', fontFamily:'sans-serif' },
  btnDanger: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(255,62,181,0.12)', border:'1px solid #ff3eb544', color:'#ff3eb5', fontFamily:'sans-serif' },
  btnPink: { fontSize:'11px', padding:'5px 11px', borderRadius:'6px', cursor:'pointer', background:'rgba(255,62,181,0.12)', border:'1px solid #ff3eb544', color:'#ff3eb5', fontFamily:'sans-serif' },

  // Formulaire suivi inline
  suiviForm: { background:'#0a0a18', border:'1px solid #00e5ff1a', borderRadius:'8px', padding:'12px', marginTop:'10px' },
  input: { width:'100%', background:'#12121f', border:'1px solid #ffffff1a', borderRadius:'6px', padding:'6px 10px', color:'#e0e0f0', fontSize:'12px', fontFamily:'sans-serif', outline:'none', marginBottom:'8px', boxSizing:'border-box' },
  inputRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },

  // Commentaires
  cmtCard: (flagged) => ({
    background: flagged ? 'rgba(255,62,181,0.04)' : '#0d0d1a',
    border: flagged ? '1px solid #ff3eb544' : '1px solid #ffffff0f',
    borderRadius:'10px', padding:'12px 14px', marginBottom:'8px'
  }),
  cmtHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' },
  cmtUser: { fontSize:'11px', color:'#44445a' },
  cmtText: { fontSize:'12px', color:'#c0c0e0', lineHeight:'1.5' },
  flagTag: { display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'10px', fontWeight:500, color:'#ff3eb5', background:'rgba(255,62,181,0.12)', border:'1px solid #ff3eb533', padding:'2px 8px', borderRadius:'20px' },

  // Tableau usagers
  tableWrap: { background:'#0d0d1a', border:'1px solid #00e5ff1a', borderRadius:'10px', overflow:'hidden' },
  th: { padding:'9px 12px', textAlign:'left', fontSize:'10px', fontWeight:500, color:'#6a6a8a', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #ffffff0a', background:'#0a0a15', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' },
  td: { padding:'8px 12px', fontSize:'12px', borderBottom:'1px solid #ffffff06', color:'#c0c0e0' },
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
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const intervalRef = useRef(null)

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
  }, [userId])

  const chargerCommentaires = useCallback(async () => {
    if (!userId) return
    const [{ data: cColo }, { data: cPensees }] = await Promise.all([
      supabase.from('commentaires_coloriages').select('id, contenu, created_at, user_id, coloriage_id, profils(prenom, nom)').order('created_at', { ascending: false }).limit(100),
      supabase.from('commentaires_pensees').select('id, contenu, created_at, user_id, pensee_id, profils(prenom, nom)').order('created_at', { ascending: false }).limit(100)
    ])
    const tous = [
      ...(cColo || []).map(c => ({ ...c, table: 'commentaires_coloriages', ref: `coloriage #${c.coloriage_id}` })),
      ...(cPensees || []).map(c => ({ ...c, table: 'commentaires_pensees', ref: `pensée #${c.pensee_id}` }))
    ].sort((a, b) => {
      const aFlag = contientMotInterdit(a.contenu)
      const bFlag = contientMotInterdit(b.contenu)
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

  useEffect(() => {
    if (!userId) return
    chargerTout()
    intervalRef.current = setInterval(chargerTout, 30000)
    return () => clearInterval(intervalRef.current)
  }, [userId, chargerTout])

  // Actions commandes
  const majStatut = async (id, statut) => {
    const suivi = suiviData[id] || {}
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-commande', userId, commande_article_id: id, statut, ...suivi })
    })
    const data = await res.json()
    if (data.ok) {
      showToast(`Statut mis à jour — client notifié`)
      setSuiviOpen(null)
      chargerCommandes()
    } else {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  const validerSuivi = async (id) => {
    const suivi = suiviData[id] || {}
    const cmd = commandes.find(c => c.id === id)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-commande', userId, commande_article_id: id, statut: cmd.statut, ...suivi })
    })
    const data = await res.json()
    if (data.ok) {
      showToast('Infos de suivi enregistrées — client notifié')
      setSuiviOpen(null)
      chargerCommandes()
    } else {
      showToast('Erreur', 'error')
    }
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

  const cmdEnAttente = commandes.filter(c => c.statut === 'en_attente')
  const cmtSignales = commentaires.filter(c => contientMotInterdit(c.contenu))

  return (
    <div style={s.shell}>
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

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoName}>Kevin Teo'Art</div>
          <div style={s.logoSub}>Administration</div>
        </div>
        {[
          { id:'dashboard', icon:'ti-layout-dashboard', label:'Dashboard' },
          { id:'commandes', icon:'ti-package', label:`Commandes${cmdEnAttente.length > 0 ? ` (${cmdEnAttente.length})` : ''}` },
          { id:'usagers', icon:'ti-users', label:'Usagers' },
          { id:'moderation', icon:'ti-message-circle', label:`Modération${cmtSignales.length > 0 ? ` (${cmtSignales.length})` : ''}` },
        ].map(n => (
          <div key={n.id} style={s.navItem(onglet === n.id)} onClick={() => setOnglet(n.id)}>
            <i className={`ti ${n.icon}`} style={s.navIcon} aria-hidden="true" />
            {n.label}
          </div>
        ))}
        <div style={s.sidebarBottom}>
          <div style={{ display:'flex', alignItems:'center', fontSize:'11px', color:'#22c55e' }}>
            <span style={s.liveDot} />
            Temps réel
          </div>
          <div
            style={{ fontSize:'11px', color:'#44445a', marginTop:'10px', cursor:'pointer' }}
            onClick={() => navigate('/accueil')}
          >
            ← Retour au site
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        <div style={s.topbar}>
          <span style={s.topbarTitle}>
            { onglet === 'dashboard' && 'Dashboard' }
            { onglet === 'commandes' && 'Commandes reliées' }
            { onglet === 'usagers' && 'Tableau des usagers' }
            { onglet === 'moderation' && 'Modération des commentaires' }
          </span>
          <span style={s.topbarDate}>{new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</span>
        </div>

        <div style={s.content}>
          {loading && <div style={{ color:'#44445a', textAlign:'center', marginTop:'40px' }}>Chargement...</div>}

          {/* ======== DASHBOARD ======== */}
          {!loading && onglet === 'dashboard' && (
            <>
              {/* Ligne 1 : Inscrits / Commandes / CA */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'10px' }}>
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
              </div>

              {/* Ligne 2 : Coloriages + Pensées */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
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

              <div style={s.grid2}>
                {/* Commandes en attente */}
                <div>
                  <div style={s.sectionTitle}>Commandes reliées en attente ({cmdEnAttente.length})</div>
                  {cmdEnAttente.length === 0 && <div style={{ color:'#44445a', fontSize:'12px' }}>Aucune commande en attente</div>}
                  {cmdEnAttente.slice(0, 3).map(cmd => (
                    <CmdCard
                      key={cmd.id} cmd={cmd}
                      suiviOpen={suiviOpen} setSuiviOpen={setSuiviOpen}
                      suiviData={suiviData} setSuiviData={setSuiviData}
                      majStatut={majStatut} validerSuivi={validerSuivi}
                      s={s} fmtDate={fmtDate}
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
                    <CmtCard key={c.id} c={c} flagged={true} supprimerCommentaire={supprimerCommentaire} s={s} fmtDate={fmtDate} />
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
              {['en_attente', 'expediee', 'livree'].map(statut => {
                const liste = commandes.filter(c => c.statut === statut)
                if (liste.length === 0) return null
                return (
                  <div key={statut} style={{ marginBottom:'24px' }}>
                    <div style={s.sectionTitle}>{STATUT_LABEL[statut]} ({liste.length})</div>
                    {liste.map(cmd => (
                      <CmdCard
                        key={cmd.id} cmd={cmd}
                        suiviOpen={suiviOpen} setSuiviOpen={setSuiviOpen}
                        suiviData={suiviData} setSuiviData={setSuiviData}
                        majStatut={majStatut} validerSuivi={validerSuivi}
                        s={s} fmtDate={fmtDate} full
                      />
                    ))}
                  </div>
                )
              })}
              {commandes.length === 0 && <div style={{ color:'#44445a', fontSize:'12px' }}>Aucune commande reliée</div>}
            </>
          )}

          {/* ======== USAGERS ======== */}
          {!loading && onglet === 'usagers' && (
            <div style={s.tableWrap}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {[
                      { col:'prenom', label:'Prénom / Nom' },
                      { col:'email', label:'Email' },
                      { col:'inscrit_le', label:'Inscrit le' },
                      { col:'nb_commandes', label:'Commandes' },
                      { col:'ca_genere', label:'CA généré' },
                      { col:'nb_coloriages', label:'Coloriages' },
                      { col:'nb_commentaires', label:'Commentaires' },
                      { col:'nb_likes', label:'Likes' },
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
                      <td style={{ ...s.td, color:'#ffd700', fontWeight:500 }}>{u.nb_commandes}</td>
                      <td style={{ ...s.td, color:'#ffd700' }}>{fmtEur(u.ca_genere)}</td>
                      <td style={s.td}>{u.nb_coloriages}</td>
                      <td style={s.td}>{u.nb_commentaires}</td>
                      <td style={s.td}>{u.nb_likes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ======== MODÉRATION ======== */}
          {!loading && onglet === 'moderation' && (
            <>
              {cmtSignales.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <div style={s.sectionTitle}>Signalés ({cmtSignales.length})</div>
                  {cmtSignales.map(c => (
                    <CmtCard key={c.id} c={c} flagged={true} supprimerCommentaire={supprimerCommentaire} s={s} fmtDate={fmtDate} />
                  ))}
                </div>
              )}
              <div>
                <div style={s.sectionTitle}>Tous les commentaires ({commentaires.filter(c => !contientMotInterdit(c.contenu)).length} normaux)</div>
                {commentaires.filter(c => !contientMotInterdit(c.contenu)).map(c => (
                  <CmtCard key={c.id} c={c} flagged={false} supprimerCommentaire={supprimerCommentaire} s={s} fmtDate={fmtDate} />
                ))}
              </div>
            </>
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
function CmdCard({ cmd, suiviOpen, setSuiviOpen, suiviData, setSuiviData, majStatut, validerSuivi, s, fmtDate, full }) {
  const isOpen = suiviOpen === cmd.id
  const sd = suiviData[cmd.id] || {}

  const updateSuivi = (field, val) => {
    setSuiviData(prev => ({ ...prev, [cmd.id]: { ...prev[cmd.id], [field]: val } }))
  }

  return (
    <div style={s.cmdCard(cmd.statut)}>
      <div style={s.cmdHeader}>
        <span style={s.cmdTitle}>{cmd.nom_article}</span>
        <span style={s.badge(cmd.statut)}>{STATUT_LABEL[cmd.statut]}</span>
      </div>

      <div style={s.infoGrid}>
        <div style={s.infoBlock}>
          <div style={s.infoLbl}>Nom</div>
          <div style={s.infoVal}>{cmd.client.prenom} {cmd.client.nom}</div>
        </div>
        <div style={s.infoBlock}>
          <div style={s.infoLbl}>Email</div>
          <div style={{ ...s.infoVal, color:'#00e5ff88', fontSize:'10px' }}>{cmd.client.email}</div>
        </div>
        <div style={s.infoBlock}>
          <div style={s.infoLbl}>Téléphone</div>
          <div style={s.infoVal}>{cmd.client.telephone || '—'}</div>
        </div>
        <div style={s.infoBlock}>
          <div style={s.infoLbl}>Adresse</div>
          <div style={s.infoVal}>{cmd.client.adresse || '—'}</div>
        </div>
        <div style={s.infoBlock}>
          <div style={s.infoLbl}>Code postal / Ville</div>
          <div style={s.infoVal}>{cmd.client.code_postal} {cmd.client.ville}</div>
        </div>
        <div style={s.infoBlock}>
          <div style={s.infoLbl}>Pays</div>
          <div style={s.infoVal}>{cmd.client.pays}</div>
        </div>
        <div style={s.infoBlock}>
          <div style={s.infoLbl}>Commandé le</div>
          <div style={s.infoVal}>{fmtDate(cmd.date_commande)}</div>
        </div>
        {cmd.livreur && (
          <div style={s.infoBlock}>
            <div style={s.infoLbl}>Livreur</div>
            <div style={s.infoVal}>{cmd.livreur}</div>
          </div>
        )}
        {cmd.date_livraison_estimee && (
          <div style={s.infoBlock}>
            <div style={s.infoLbl}>Livraison est.</div>
            <div style={s.infoVal}>{cmd.date_livraison_estimee}</div>
          </div>
        )}
      </div>

      {cmd.lien_suivi && (
        <div style={{ fontSize:'11px', marginBottom:'8px' }}>
          <span style={{ color:'#44445a' }}>Suivi : </span>
          <a href={cmd.lien_suivi} target="_blank" rel="noreferrer" style={{ color:'#00e5ff' }}>{cmd.numero_suivi || cmd.lien_suivi}</a>
        </div>
      )}
      {cmd.numero_suivi && !cmd.lien_suivi && (
        <div style={{ fontSize:'11px', marginBottom:'8px' }}>
          <span style={{ color:'#44445a' }}>N° suivi : </span>
          <span style={{ color:'#c0c0e0' }}>{cmd.numero_suivi}</span>
        </div>
      )}

      <div style={s.divider} />
      <div style={s.actionsRow}>
        {cmd.statut === 'en_attente' && (
          <button style={s.btnGold} onClick={() => majStatut(cmd.id, 'expediee')}>
            Expédiée + notifier client
          </button>
        )}
        {cmd.statut === 'expediee' && (
          <button style={s.btnGreen} onClick={() => majStatut(cmd.id, 'livree')}>
            Livrée + notifier client
          </button>
        )}
        <button style={s.btnCyan} onClick={() => setSuiviOpen(isOpen ? null : cmd.id)}>
          {isOpen ? 'Fermer' : (cmd.livreur ? 'Modifier suivi' : 'Ajouter suivi')}
        </button>
      </div>

      {isOpen && (
        <div style={s.suiviForm}>
          <div style={{ fontSize:'11px', color:'#6a6a8a', marginBottom:'8px' }}>Infos de suivi — validées, elles notifient le client automatiquement</div>
          <input
            style={s.input} placeholder="Transporteur (ex: Colissimo, Mondial Relay...)"
            value={sd.livreur || cmd.livreur || ''}
            onChange={e => updateSuivi('livreur', e.target.value)}
          />
          <div style={s.inputRow}>
            <input
              style={s.input} placeholder="Numéro de suivi"
              value={sd.numero_suivi || cmd.numero_suivi || ''}
              onChange={e => updateSuivi('numero_suivi', e.target.value)}
            />
            <input
              style={s.input} placeholder="Lien de suivi (URL)"
              value={sd.lien_suivi || cmd.lien_suivi || ''}
              onChange={e => updateSuivi('lien_suivi', e.target.value)}
            />
          </div>
          <input
            style={s.input} placeholder="Date de livraison estimée (ex: 20–25 juin)"
            value={sd.date_livraison_estimee || cmd.date_livraison_estimee || ''}
            onChange={e => updateSuivi('date_livraison_estimee', e.target.value)}
          />
          <input
            style={s.input} placeholder="Note optionnelle pour le client"
            value={sd.note_client || cmd.note_client || ''}
            onChange={e => updateSuivi('note_client', e.target.value)}
          />
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button style={s.btnCyan} onClick={() => validerSuivi(cmd.id)}>Valider + notifier client</button>
            <button style={s.btnGhost} onClick={() => setSuiviOpen(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Composant CmtCard ----
function CmtCard({ c, flagged, supprimerCommentaire, s, fmtDate }) {
  const prenom = c.profils?.prenom || 'Anonyme'
  const nom = c.profils?.nom || ''
  return (
    <div style={s.cmtCard(flagged)}>
      <div style={s.cmtHeader}>
        <span style={s.cmtUser}>{prenom} {nom} — {c.ref} — {fmtDate(c.created_at)}</span>
        {flagged && (
          <span style={s.flagTag}>
            <i className="ti ti-alert-triangle" style={{ fontSize:'12px' }} aria-hidden="true" />
            Mot signalé
          </span>
        )}
      </div>
      <div style={s.cmtText}>"{c.contenu}"</div>
      <div style={{ ...s.divider, margin:'8px 0' }} />
      <div style={s.actionsRow}>
        <button style={s.btnDanger} onClick={() => supprimerCommentaire(c.id, c.table)}>Supprimer</button>
        {flagged && <button style={s.btnGhost} onClick={() => {}}>Ignorer</button>}
      </div>
    </div>
  )
}