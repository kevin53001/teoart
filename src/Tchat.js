import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';

// ── Modération — synchronisée avec Admin.js ──────────────────────────────────
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
];

function contientMotInterdit(texte) {
  if (!texte) return false;
  const t = texte.toLowerCase();
  return MOTS_INTERDITS.some(mot => {
    const m = mot.toLowerCase();
    if (m.includes(' ')) return t.includes(m);
    try {
      return new RegExp('\\b' + m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(t);
    } catch (e) { return t.includes(m); }
  });
}

function heureRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const j    = Math.floor(diff / 86400000);
  if (min < 1)  return "à l'instant";
  if (min < 60) return `${min} min`;
  if (h < 24)   return `${h}h`;
  if (j < 7)    return `${j}j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ── Ligne message (chat général) ─────────────────────────────────────────────
function LigneMessageGeneral({ msg, estMoi, avatarLive }) {
  const avatarAffiche = avatarLive || msg.avatar_url || null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: estMoi ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexDirection: estMoi ? 'row-reverse' : 'row' }}>
        {avatarAffiche ? (
          <img src={avatarAffiche} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,212,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#00d4d4', flexShrink: 0 }}>
            {(msg.pseudo || '?')[0].toUpperCase()}
          </div>
        )}
        <span style={{ color: estMoi ? '#00d4d4' : 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: 'bold' }}>{msg.pseudo}</span>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>{heureRelative(msg.created_at)}</span>
      </div>
      <div style={{
        background: estMoi ? 'linear-gradient(135deg, rgba(0,212,212,0.18), rgba(0,212,212,0.08))' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${estMoi ? 'rgba(0,212,212,0.3)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '12px',
        padding: '8px 12px',
        maxWidth: '80%',
        color: '#fff',
        fontSize: '13px',
        lineHeight: '1.5',
        wordBreak: 'break-word',
      }}>
        {msg.contenu}
      </div>
    </div>
  );
}

// ── Ligne message (chat privé) ───────────────────────────────────────────────
function LigneMessagePrive({ msg }) {
  const estAdmin = msg.expediteur === 'admin';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: estAdmin ? 'flex-start' : 'flex-end', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
        <span style={{ color: estAdmin ? '#ffd250' : '#00d4d4', fontSize: '11px', fontWeight: 'bold' }}>{estAdmin ? 'Kevin' : 'Toi'}</span>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>{heureRelative(msg.created_at)}</span>
      </div>
      <div style={{
        background: estAdmin ? 'linear-gradient(135deg, rgba(255,210,80,0.15), rgba(255,210,80,0.06))' : 'linear-gradient(135deg, rgba(0,212,212,0.18), rgba(0,212,212,0.08))',
        border: `1px solid ${estAdmin ? 'rgba(255,210,80,0.3)' : 'rgba(0,212,212,0.3)'}`,
        borderRadius: '12px',
        padding: '8px 12px',
        maxWidth: '80%',
        color: '#fff',
        fontSize: '13px',
        lineHeight: '1.5',
        wordBreak: 'break-word',
      }}>
        {msg.contenu}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
function Tchat({ hidden = false }) {
  const [userId, setUserId] = useState(null);
  const [userPseudo, setUserPseudo] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [ouvert, setOuvert] = useState(false);
  const [onglet, setOnglet] = useState('general'); // 'general' | 'prive'

  const [messagesGeneral, setMessagesGeneral] = useState([]);
  const [avatarsParUser, setAvatarsParUser] = useState({});
  const [messagesPrive, setMessagesPrive] = useState([]);
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [loadingPrive, setLoadingPrive] = useState(false);

  const [texteGeneral, setTexteGeneral] = useState('');
  const [textePrive, setTextePrive] = useState('');
  const [erreurGeneral, setErreurGeneral] = useState('');
  const [erreurPrive, setErreurPrive] = useState('');

  const [nonLuGeneral, setNonLuGeneral] = useState(false);
  const [nonLuPrive, setNonLuPrive] = useState(false);

  const panneauRef = useRef(null);
  const boutonRef = useRef(null);
  const finListeGeneralRef = useRef(null);
  const finListePriveRef = useRef(null);

  // ── Suivi "onglet vu pendant cette ouverture du panneau" — la LED ne s'éteint
  // (et n'est marquée comme lue en base) qu'à la FERMETURE du panneau, et
  // seulement pour les onglets effectivement consultés ──
  const vuGeneralSessionRef = useRef(false);
  const vuPriveSessionRef = useRef(false);
  const messagesGeneralRef = useRef([]);
  useEffect(() => { messagesGeneralRef.current = messagesGeneral; }, [messagesGeneral]);

  // ── Chargement initial user ──
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
      const { data: p } = await supabase.from('profils').select('pseudo, avatar_url, dernier_vu_chat_general').eq('id', data.user.id).single();
      if (p) {
        setUserPseudo(p.pseudo || 'Anonyme');
        setAvatarUrl(p.avatar_url || null);
      }
    });
  }, []);

  // ── Détection messages non lus (LED) — vérifié au montage + toutes les 60s si panneau fermé ──
  const verifierNonLus = useCallback(async () => {
    if (!userId) return;

    // Chat général : y a-t-il des messages depuis dernier_vu_chat_general ?
    const { data: profil } = await supabase.from('profils').select('dernier_vu_chat_general').eq('id', userId).single();
    const ref = profil?.dernier_vu_chat_general;
    const limite48h = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const { count: countGeneral } = await supabase
      .from('chat_general')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', ref || limite48h)
      .neq('user_id', userId);
    setNonLuGeneral((countGeneral || 0) > 0);

    // Chat privé : messages admin non lus
    const { count: countPrive } = await supabase
      .from('chat_prive')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('expediteur', 'admin')
      .eq('lu_par_user', false);
    setNonLuPrive((countPrive || 0) > 0);
  }, [userId]);

  useEffect(() => { verifierNonLus(); }, [verifierNonLus]);

  useEffect(() => {
    if (!userId || ouvert) return;
    const interval = setInterval(verifierNonLus, 60000);
    return () => clearInterval(interval);
  }, [userId, ouvert, verifierNonLus]);

  // ── Chargement messages au changement d'onglet/ouverture ──
  const chargerGeneral = useCallback(async () => {
    setLoadingGeneral(true);
    const limite48h = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const { data } = await supabase
      .from('chat_general')
      .select('*')
      .gt('created_at', limite48h)
      .order('created_at', { ascending: true })
      .limit(500);
    setMessagesGeneral(data || []);
    setLoadingGeneral(false);

    // Récupère l'avatar ACTUEL de chaque expéditeur (et non celui figé au moment de l'envoi)
    const idsUniques = [...new Set((data || []).map(m => m.user_id).filter(Boolean))];
    if (idsUniques.length > 0) {
      const { data: profilsData } = await supabase.from('profils').select('id, avatar_url').in('id', idsUniques);
      const map = {};
      (profilsData || []).forEach(p => { map[p.id] = p.avatar_url || null; });
      setAvatarsParUser(prev => ({ ...prev, ...map }));
    }
  }, []);

  const chargerPrive = useCallback(async () => {
    if (!userId) return;
    setLoadingPrive(true);
    const { data } = await supabase
      .from('chat_prive')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    setMessagesPrive(data || []);
    setLoadingPrive(false);
  }, [userId]);

  useEffect(() => {
    if (!ouvert) return;
    if (onglet === 'general') {
      chargerGeneral();
      vuGeneralSessionRef.current = true;
    } else {
      chargerPrive();
      vuPriveSessionRef.current = true;
    }
  }, [ouvert, onglet, chargerGeneral, chargerPrive]);

  // ── Realtime : chat général ──
  useEffect(() => {
    const channel = supabase
      .channel('chat_general_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_general' }, (payload) => {
        const msg = payload.new;
        if (ouvert && onglet === 'general') {
          setMessagesGeneral(prev => [...prev, msg]);
        } else if (msg.user_id !== userId) {
          setNonLuGeneral(true);
          vuGeneralSessionRef.current = false;
        }
        if (msg.user_id) {
          setAvatarsParUser(prev => {
            if (Object.prototype.hasOwnProperty.call(prev, msg.user_id)) return prev;
            supabase.from('profils').select('avatar_url').eq('id', msg.user_id).single()
              .then(({ data: p }) => setAvatarsParUser(p2 => ({ ...p2, [msg.user_id]: p?.avatar_url || null })));
            return prev;
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ouvert, onglet, userId]);

  // ── Realtime : chat privé ──
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`chat_prive_realtime_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_prive', filter: `user_id=eq.${userId}` }, (payload) => {
        const msg = payload.new;
        if (ouvert && onglet === 'prive') {
          setMessagesPrive(prev => [...prev, msg]);
        } else if (msg.expediteur === 'admin') {
          setNonLuPrive(true);
          vuPriveSessionRef.current = false;
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ouvert, onglet, userId]);

  // ── Auto-scroll vers le bas ──
  useEffect(() => {
    if (ouvert && onglet === 'general') finListeGeneralRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesGeneral, ouvert, onglet]);

  useEffect(() => {
    if (ouvert && onglet === 'prive') finListePriveRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesPrive, ouvert, onglet]);

  // ── Fermeture au clic extérieur ──
  useEffect(() => {
    if (!ouvert) return;
    const handler = (e) => {
      if (
        panneauRef.current && !panneauRef.current.contains(e.target) &&
        boutonRef.current  && !boutonRef.current.contains(e.target)
      ) fermerPanneau();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [ouvert]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fermeture du panneau : commit en base + extinction LED, uniquement pour
  // les onglets effectivement consultés pendant cette ouverture ──
  const fermerPanneau = useCallback(async () => {
    if (vuGeneralSessionRef.current && userId) {
      const liste = messagesGeneralRef.current;
      const dernierMsg = liste.length > 0 ? liste[liste.length - 1] : null;
      // Référence = date du dernier message réellement vu (pas l'heure du
      // navigateur, pour éviter un décalage d'horloge qui rallumerait la LED)
      const ref = dernierMsg ? dernierMsg.created_at : new Date().toISOString();
      await supabase.from('profils').update({ dernier_vu_chat_general: ref }).eq('id', userId);
      setNonLuGeneral(false);
    }
    if (vuPriveSessionRef.current && userId) {
      await supabase.from('chat_prive').update({ lu_par_user: true }).eq('user_id', userId).eq('expediteur', 'admin').eq('lu_par_user', false);
      setNonLuPrive(false);
    }
    setOuvert(false);
  }, [userId]);

  const toggleTchat = () => {
    if (!ouvert) {
      vuGeneralSessionRef.current = false;
      vuPriveSessionRef.current = false;
      setOuvert(true);
    } else {
      fermerPanneau();
    }
  };

  // ── Envoi message général ──
  const envoyerGeneral = async () => {
    const texte = texteGeneral.trim();
    if (!texte || !userId) return;
    if (contientMotInterdit(texte)) {
      setErreurGeneral("Ce message contient des termes non autorisés. Merci de reformuler.");
      return;
    }
    setErreurGeneral('');
    setTexteGeneral('');
    await supabase.from('chat_general').insert({
      user_id: userId,
      pseudo: userPseudo,
      avatar_url: avatarUrl,
      contenu: texte,
    });
  };

  // ── Envoi message privé ──
  const envoyerPrive = async () => {
    const texte = textePrive.trim();
    if (!texte || !userId) return;
    if (contientMotInterdit(texte)) {
      setErreurPrive("Ce message contient des termes non autorisés. Merci de reformuler.");
      return;
    }
    setErreurPrive('');
    setTextePrive('');
    await supabase.from('chat_prive').insert({
      user_id: userId,
      expediteur: 'user',
      contenu: texte,
      lu_par_admin: false,
      lu_par_user: true,
    });
  };

  if (hidden || !userId) return null;

  const nbNonLuTotal = (nonLuGeneral ? 1 : 0) + (nonLuPrive ? 1 : 0);

  return (
    <>
      <style>{`
        .tchat-btn:hover { opacity: 0.8; }
        .tchat-led { animation: tchat-pulse 1.6s ease-in-out infinite; }
        .tchat-led-cyan { animation: tchat-pulse-cyan 1.6s ease-in-out infinite; }
        @keyframes tchat-pulse { 0%,100% { box-shadow: 0 0 6px #ff3eb5; } 50% { box-shadow: 0 0 12px #ff3eb5, 0 0 4px #fff; } }
        @keyframes tchat-pulse-cyan { 0%,100% { box-shadow: 0 0 6px #00d4d4; } 50% { box-shadow: 0 0 12px #00d4d4, 0 0 4px #fff; } }
        .tchat-liste::-webkit-scrollbar { width: 4px; }
        .tchat-liste::-webkit-scrollbar-track { background: transparent; }
        .tchat-liste::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.3); border-radius: 4px; }
      `}</style>

      {/* Bouton flottant — sous la cloche */}
      <div
        ref={boutonRef}
        className="tchat-btn"
        onClick={toggleTchat}
        style={{ position: 'fixed', top: '56px', right: '14px', zIndex: 1000, cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img src={`${R2}/site/pastille_chat.png`} alt="Tchat" style={{ width: '55px', height: '55px', objectFit: 'contain', filter: nbNonLuTotal > 0 ? 'drop-shadow(0 0 4px rgba(255,62,181,0.6))' : 'none' }} />
        {nonLuGeneral && (
          <div className="tchat-led" style={{ position: 'absolute', top: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '50%', background: '#ff3eb5', border: '1.5px solid #000' }} />
        )}
        {nonLuPrive && (
          <div className="tchat-led-cyan" style={{ position: 'absolute', top: '-2px', left: '-2px', width: '14px', height: '14px', borderRadius: '50%', background: '#00d4d4', border: '1.5px solid #000' }} />
        )}
      </div>

      {/* Panneau */}
      {ouvert && ReactDOM.createPortal(
        <div ref={panneauRef} style={{ position: 'fixed', top: '98px', right: '12px', width: '320px', maxHeight: '480px', zIndex: 9999, background: 'rgba(8,16,20,0.97)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Onglets */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <button
              onClick={() => setOnglet('general')}
              style={{
                flex: 1, padding: '10px', background: onglet === 'general' ? 'rgba(0,212,212,0.1)' : 'transparent',
                border: 'none', borderBottom: onglet === 'general' ? '2px solid #00d4d4' : '2px solid transparent',
                color: onglet === 'general' ? '#00d4d4' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              Général
              {nonLuGeneral && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3eb5' }} />}
            </button>
            <button
              onClick={() => setOnglet('prive')}
              style={{
                flex: 1, padding: '10px', background: onglet === 'prive' ? 'rgba(255,210,80,0.1)' : 'transparent',
                border: 'none', borderBottom: onglet === 'prive' ? '2px solid #ffd250' : '2px solid transparent',
                color: onglet === 'prive' ? '#ffd250' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              Avec Kevin
              {nonLuPrive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3eb5' }} />}
            </button>
          </div>

          {/* ── Onglet Général ── */}
          {onglet === 'general' && (
            <>
              <div style={{ padding: '8px 14px', background: 'rgba(0,212,212,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', textAlign: 'center' }}>Les messages sont conservés 48h</p>
              </div>
              <div className="tchat-liste" style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', minHeight: '240px', maxHeight: '320px' }}>
                {loadingGeneral ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>Chargement…</div>
                ) : messagesGeneral.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', marginBottom: '8px' }}>💬</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Aucun message pour l'instant.<br/>Lance la discussion !</p>
                  </div>
                ) : (
                  <>
                    {messagesGeneral.map(m => <LigneMessageGeneral key={m.id} msg={m} estMoi={m.user_id === userId} avatarLive={avatarsParUser[m.user_id]} />)}
                    <div ref={finListeGeneralRef} />
                  </>
                )}
              </div>
              <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                {erreurGeneral && <p style={{ color: '#ff6b6b', fontSize: '10px', marginBottom: '6px' }}>{erreurGeneral}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={texteGeneral}
                    onChange={e => { setTexteGeneral(e.target.value); if (erreurGeneral) setErreurGeneral(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') envoyerGeneral(); }}
                    placeholder="Écris un message..."
                    maxLength={500}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none' }}
                  />
                  <button onClick={envoyerGeneral} disabled={!texteGeneral.trim()} style={{ background: texteGeneral.trim() ? 'linear-gradient(135deg, #00d4d4, #0099aa)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '8px 14px', color: texteGeneral.trim() ? '#000' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '12px', cursor: texteGeneral.trim() ? 'pointer' : 'default' }}>
                    →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Onglet Avec Kevin ── */}
          {onglet === 'prive' && (
            <>
              <div style={{ padding: '8px 14px', background: 'rgba(255,210,80,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <p style={{ color: 'rgba(255,210,80,0.6)', fontSize: '10px', textAlign: 'center' }}>Kevin n'est pas connecté en permanence — il répondra dès que possible.</p>
              </div>
              <div className="tchat-liste" style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', minHeight: '240px', maxHeight: '320px' }}>
                {loadingPrive ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>Chargement…</div>
                ) : messagesPrive.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', marginBottom: '8px' }}>✉️</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Pose ta question à Kevin,<br/>il te répondra ici.</p>
                  </div>
                ) : (
                  <>
                    {messagesPrive.map(m => <LigneMessagePrive key={m.id} msg={m} />)}
                    <div ref={finListePriveRef} />
                  </>
                )}
              </div>
              <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                {erreurPrive && <p style={{ color: '#ff6b6b', fontSize: '10px', marginBottom: '6px' }}>{erreurPrive}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={textePrive}
                    onChange={e => { setTextePrive(e.target.value); if (erreurPrive) setErreurPrive(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') envoyerPrive(); }}
                    placeholder="Écris à Kevin..."
                    maxLength={1000}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none' }}
                  />
                  <button onClick={envoyerPrive} disabled={!textePrive.trim()} style={{ background: textePrive.trim() ? 'linear-gradient(135deg, #ffd250, #c48a00)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '8px 14px', color: textePrive.trim() ? '#000' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '12px', cursor: textePrive.trim() ? 'pointer' : 'default' }}>
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export default Tchat;