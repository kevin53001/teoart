import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';

const CONFIG_TYPE = {
  nouvelle_illustration:    { couleur: '#00d4d4', icone: `${R2}/site/pastille_categories.png` },
  nouveau_livre_pdf:        { couleur: '#a78bfa', icone: `${R2}/site/pastille_livres.png`     },
  nouveau_livre_relie:      { couleur: '#a78bfa', icone: `${R2}/site/pastille_livres.png`     },
  nouveau_recueil_pdf:      { couleur: '#a78bfa', icone: `${R2}/site/pastille_livres.png`     },
  nouveau_recueil_relie:    { couleur: '#a78bfa', icone: `${R2}/site/pastille_livres.png`     },
  like_coloriage:           { couleur: '#ff3eb5', icone: `${R2}/site/pastille_colos.png`      },
  commentaire_coloriage:    { couleur: '#ffd250', icone: `${R2}/site/pastille_colos.png`      },
  badge_obtenu:             { couleur: '#00cc66', icone: `${R2}/site/pastille_mon_compte.png` },
  nouvelle_pensee:          { couleur: '#a78bfa', icone: `${R2}/site/pastille_pensees.png`    },
  nouvelle_presentation:    { couleur: '#00d4d4', icone: `${R2}/site/pastille_logomini.png`   },
  nouveau_coloriage_partage:{ couleur: '#00d4d4', icone: `${R2}/site/pastille_colos.png`      },
};

function dateRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const j    = Math.floor(diff / 86400000);
  if (min < 2)  return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  if (h < 24)   return `il y a ${h}h`;
  if (j < 7)    return `il y a ${j}j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function texteNotif(n) {
  const c = n.contenu || {};
  const nb = c.count || 1;
  switch (n.type) {
    case 'nouvelle_illustration':
      return nb === 1
        ? `Kevin a encore passé une nuit blanche`
        : `${nb} illustrations ont envahi le catalogue`;
    case 'nouveau_livre_pdf':
      return `Un nouveau livre PDF est sorti du four : ${c.nom || '...'}`;
    case 'nouveau_livre_relie':
      return `Amazon est prêt à te livrer le nouveau livre ${c.nom || '...'}, à un prix défiant toute concurrence. Ça te tente ?`;
    case 'nouveau_recueil_pdf':
      return `Un nouveau recueil PDF est sorti du four : ${c.nom || '...'}`;
    case 'nouveau_recueil_relie':
      return `Amazon est prêt à te livrer le nouveau recueil ${c.nom || '...'}, à un prix défiant toute concurrence. Ça te tente ?`;
    case 'like_coloriage':
    case 'commentaire_coloriage':
      return nb === 1
        ? `Des gens ont craqué pour ton coloriage`
        : `Tes coloriages font un carton dans la communauté`;
    case 'badge_obtenu':
      return `Badge ${c.niveau} dans la poche !${c.remise ? ` -${c.remise}% en cadeau` : ''}`;
    case 'nouvelle_pensee':
      return nb === 1
        ? `Nouvelle pensée dans la nature`
        : `${nb} nouvelles pensées à découvrir`;
    case 'nouvelle_presentation':
      return `Kevin a retouché sa vitrine : ${c.derniere_titre || '...'}`;
    case 'nouveau_coloriage_partage':
      return nb === 1
        ? `Les crayons ont chauffé dans la communauté`
        : `${nb} coloristes ont sorti leurs meilleures couleurs`;
    default:
      return 'Nouvelle notification';
  }
}

// ── Ligne notif ──────────────────────────────────────────────────────────────
function LigneNotif({ notif, onClic }) {
  const cfg = CONFIG_TYPE[notif.type] || { couleur: '#fff', icone: '•' };
  return (
    <div
      onClick={() => onClic(notif)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <img src={cfg.icone} alt="" style={{ width: '22px', height: '22px', flexShrink: 0, marginTop: '1px', objectFit: 'contain' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.5', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {texteNotif(notif)}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '3px 0 0' }}>{dateRelative(notif.created_at)}</p>
      </div>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.couleur, flexShrink: 0, marginTop: '5px', boxShadow: `0 0 6px ${cfg.couleur}` }} />
    </div>
  );
}

// ── Social coloriages (like + commentaires) ──────────────────────────────────
function SocialColo({ coloId, userId, userPseudo }) {
  const [likes, setLikes]           = useState([]);
  const [commentaires, setComments] = useState([]);
  const [texte, setTexte]           = useState('');
  const [envoi, setEnvoi]           = useState(false);
  const jaLike = likes.some(l => l.user_id === userId);

  useEffect(() => {
    if (!coloId) return;
    (async () => {
      const { data: l } = await supabase.from('likes_coloriages').select('user_id').eq('coloriage_id', coloId);
      const { data: cr } = await supabase.from('commentaires_coloriages').select('id, texte, created_at, user_id').eq('coloriage_id', coloId).order('created_at', { ascending: true });
      setLikes(l || []);
      if (cr && cr.length > 0) {
        const uids = [...new Set(cr.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils_publics').select('id, pseudo').in('id', uids);
        const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
        setComments(cr.map(c => ({ ...c, pseudo: pm[c.user_id] || 'Anonyme' })));
      } else setComments([]);
    })();
  }, [coloId]);

  const toggleLike = async () => {
    if (!coloId || !userId) return;
    if (jaLike) {
      await supabase.from('likes_coloriages').delete().eq('coloriage_id', coloId).eq('user_id', userId);
      setLikes(prev => prev.filter(l => l.user_id !== userId));
    } else {
      await supabase.from('likes_coloriages').insert({ coloriage_id: coloId, user_id: userId });
      setLikes(prev => [...prev, { user_id: userId }]);
      // Notif like pour le propriétaire du coloriage (pas pour soi-même) — regroupée tant que non lue
      const { data: colo } = await supabase.from('coloriages').select('user_id').eq('id', coloId).single();
      if (colo && colo.user_id !== userId) {
        const { data: existante } = await supabase.from('notifications')
          .select('id, contenu').eq('user_id', colo.user_id).eq('type', 'like_coloriage').eq('lu', false)
          .order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (existante) {
          const nb = (existante.contenu?.count || 1) + 1;
          await supabase.from('notifications').update({ contenu: { ...existante.contenu, count: nb, coloriage_id: coloId }, created_at: new Date().toISOString() }).eq('id', existante.id);
        } else {
          await supabase.from('notifications').insert({
            user_id: colo.user_id,
            type: 'like_coloriage',
            contenu: { coloriage_id: coloId, count: 1 },
            lu: false,
          });
        }
      }
    }
  };

  const envoyer = async () => {
    if (!texte.trim() || !coloId || !userId) return;
    setEnvoi(true);
    const { data } = await supabase.from('commentaires_coloriages')
      .insert({ coloriage_id: coloId, user_id: userId, texte: texte.trim() })
      .select('id, texte, created_at, user_id').single();
    if (data) setComments(prev => [...prev, { ...data, pseudo: userPseudo }]);
    // Notif commentaire pour le propriétaire du coloriage (pas pour soi-même) — regroupée tant que non lue
    const { data: colo } = await supabase.from('coloriages').select('user_id').eq('id', coloId).single();
    if (colo && colo.user_id !== userId) {
      const { data: existante } = await supabase.from('notifications')
        .select('id, contenu').eq('user_id', colo.user_id).eq('type', 'commentaire_coloriage').eq('lu', false)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (existante) {
        const nb = (existante.contenu?.count || 1) + 1;
        await supabase.from('notifications').update({ contenu: { ...existante.contenu, count: nb, coloriage_id: coloId }, created_at: new Date().toISOString() }).eq('id', existante.id);
      } else {
        await supabase.from('notifications').insert({
          user_id: colo.user_id,
          type: 'commentaire_coloriage',
          contenu: { coloriage_id: coloId, count: 1 },
          lu: false,
        });
      }
    }
    setTexte(''); setEnvoi(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: jaLike ? '#ff4d7d' : 'rgba(255,255,255,0.5)', fontSize: '13px', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            {jaLike
              ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
              : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            }
          </svg>
          {likes.length > 0 ? likes.length : ''} {jaLike ? "J'aime ✓" : "J'aime"}
        </button>
      </div>
      {commentaires.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
          {commentaires.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(255,210,80,0.7)', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.pseudo}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', lineHeight: 1.4 }}>{c.texte}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px' }}>
        <textarea
          rows={1} placeholder="Ajouter un commentaire…" value={texte}
          onChange={e => setTexte(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(); } }}
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '7px 10px', color: '#fff', fontSize: '12px', resize: 'none', fontFamily: 'inherit', outline: 'none' }}
        />
        <button onClick={envoyer} disabled={!texte.trim() || envoi}
          style={{ background: texte.trim() ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${texte.trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '7px 12px', color: texte.trim() ? '#00d4d4' : 'rgba(255,255,255,0.2)', fontSize: '12px', cursor: texte.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap', alignSelf: 'flex-end' }}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

// ── Popup coloriages partagés ────────────────────────────────────────────────
function PopupColoriages({ userId, userPseudo, onClose }) {
  const [colos, setColos]   = useState([]);
  const [idx, setIdx]       = useState(0);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Tous les coloriages avec image_url, du plus récent au plus ancien, sans limite
      const { data } = await supabase
        .from('coloriages')
        .select('id, image_url, user_id, illustration_id, created_at')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) { setLoading(false); return; }

      // Récupérer les pseudos
      const uids = [...new Set(data.map(c => c.user_id))];
      const { data: profils } = await supabase.from('profils_publics').select('id, pseudo').in('id', uids);
      const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });

      // Filtrer les images cassées
      const tester = url => new Promise(resolve => {
        const img = new Image(); img.onload = () => resolve(true); img.onerror = () => resolve(false); img.src = url;
      });
      const resultats = await Promise.allSettled(data.map(c => tester(c.image_url)));
      const valides = data.filter((_, i) => resultats[i].value === true);

      setColos(valides.map(c => ({ id: c.id, url: c.image_url, pseudo: pm[c.user_id] || 'Coloriste', created_at: c.created_at })));
      setLoading(false);
    })();
  }, []);

  // Navigation clavier
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, colos.length - 1));
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(i - 1, 0));
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [colos.length, onClose]);

  // Swipe mobile
  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIdx(i => Math.min(i + 1, colos.length - 1));
      else          setIdx(i => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  const colo = colos[idx];

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Fermer */}
      <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '38px', height: '38px', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>

      {/* Compteur */}
      <p style={{ position: 'absolute', top: '20px', left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
        {loading ? '' : colos.length === 0 ? '' : `${idx + 1} / ${colos.length}`}
      </p>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Chargement…</p>
      ) : colos.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}><img src={`${R2}/site/pastille_colos.png`} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} /></p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Aucun coloriage partagé pour l'instant</p>
        </div>
      ) : (
        <>
          {/* Flèche gauche */}
          {idx > 0 && (
            <button onClick={() => setIdx(i => i - 1)}
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
          )}

          {/* Contenu */}
          <div style={{ width: '100%', maxWidth: '500px', background: '#111', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <img src={colo.url} alt={colo.pseudo}
              style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', display: 'block', background: '#000', flexShrink: 0 }} />
            <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ color: 'rgba(255,210,80,0.8)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><img src={`${R2}/site/pastille_colos.png`} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} /> par <strong>{colo.pseudo}</strong></span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>{dateRelative(colo.created_at)}</span>
            </div>
            <div style={{ overflowY: 'auto', flexShrink: 0 }}>
              <SocialColo coloId={colo.id} userId={userId} userPseudo={userPseudo} />
            </div>
          </div>

          {/* Flèche droite */}
          {idx < colos.length - 1 && (
            <button onClick={() => setIdx(i => i + 1)}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
          )}

          {/* Dots (max 20 affichés) */}
          {colos.length > 1 && colos.length <= 30 && (
            <div style={{ display: 'flex', gap: '5px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '300px' }}>
              {colos.map((_, i) => (
                <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? '14px' : '6px', height: '6px', borderRadius: '3px', background: i === idx ? '#00d4d4' : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all .3s' }} />
              ))}
            </div>
          )}
          {colos.length > 30 && (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '12px' }}>← → pour naviguer</p>
          )}
        </>
      )}
    </div>,
    document.body
  );
}

// ── Composant principal Cloche ───────────────────────────────────────────────
function Cloche({ hidden = false }) {
  const navigate = useNavigate();
  const [notifs, setNotifs]           = useState([]);
  const [ouvert, setOuvert]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [userId, setUserId]           = useState(null);
  const [userPseudo, setUserPseudo]   = useState('');
  const [popupColos, setPopupColos]   = useState(false);
  const dropdownRef = useRef(null);
  const clocheRef   = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
      const { data: p } = await supabase.from('profils').select('pseudo, created_at, dernier_vu_coloriages_partages').eq('id', data.user.id).single();
      if (p) {
        setUserPseudo(p.pseudo || '');
        // Détecter nouveaux coloriages partagés par la communauté
        const refC = p.dernier_vu_coloriages_partages || p.created_at;
        if (refC) {
          const { data: nouveauxColos } = await supabase
            .from('coloriages')
            .select('id')
            .not('image_url', 'is', null)
            .neq('user_id', data.user.id)
            .gt('created_at', refC);
          if (nouveauxColos && nouveauxColos.length > 0) {
            await supabase.from('notifications').delete()
              .eq('user_id', data.user.id)
              .eq('type', 'nouveau_coloriage_partage')
              .eq('lu', false);
            await supabase.from('notifications').insert({
              user_id: data.user.id,
              type: 'nouveau_coloriage_partage',
              contenu: { count: nouveauxColos.length },
              lu: false,
            });
          }
        }
      }
    });
  }, []);

  const chargerNotifs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('lu', false)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifs(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { chargerNotifs(); }, [chargerNotifs]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(chargerNotifs, 60000);
    return () => clearInterval(interval);
  }, [userId, chargerNotifs]);

  useEffect(() => {
    if (!ouvert) return;
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        clocheRef.current   && !clocheRef.current.contains(e.target)
      ) setOuvert(false);
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [ouvert]);

  const supprimerNotif = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const toutSupprimer = async () => {
    if (!userId) return;
    await supabase.from('notifications').delete().eq('user_id', userId).eq('lu', false);
    setNotifs([]);
  };

  const handleClicNotif = async (notif) => {
    await supprimerNotif(notif.id);
    setOuvert(false);

    const maintenant = new Date().toISOString();

    switch (notif.type) {
      case 'nouvelle_illustration':
        navigate('/catalogue', { state: { filtreNouveautes: true } });
        break;
      case 'nouveau_livre_pdf':
      case 'nouveau_livre_relie':
      case 'nouveau_recueil_pdf':
      case 'nouveau_recueil_relie':
        navigate('/livres', { state: { ouvrirItem: notif.contenu?.item_id, itemType: notif.contenu?.item_type } });
        break;
      case 'like_coloriage':
      case 'commentaire_coloriage':
        navigate('/mon-compte', { state: { onglet: 'coloriages', coloId: notif.contenu?.coloriage_id } });
        break;
      case 'badge_obtenu':
        navigate('/mon-compte', { state: { onglet: 'collection' } });
        break;
      case 'nouvelle_pensee':
        if (userId) {
          await supabase.from('profils').update({ dernier_vu_pensees: maintenant }).eq('id', userId);
        }
        navigate('/pensees');
        break;
      case 'nouvelle_presentation':
        if (userId) {
          await supabase.from('profils').update({ dernier_vu_presentation: maintenant }).eq('id', userId);
        }
        navigate('/presentation');
        break;
      case 'nouveau_coloriage_partage':
        if (userId) {
          await supabase.from('profils').update({ dernier_vu_coloriages_partages: maintenant }).eq('id', userId);
        }
        setPopupColos(true);
        break;
      default:
        break;
    }
  };

  const nbNonLues = notifs.length;

  if (hidden) return null;

  return (
    <>
      <style>{`
        @keyframes cloche-swing {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(18deg); }
          30%      { transform: rotate(-14deg); }
          45%      { transform: rotate(10deg); }
          60%      { transform: rotate(-6deg); }
          75%      { transform: rotate(3deg); }
        }
        .cloche-active { animation: cloche-swing 1.2s ease-in-out infinite; transform-origin: top center; }
        .cloche-btn:hover { opacity: 0.8; }
        .notif-dropdown::-webkit-scrollbar { width: 4px; }
        .notif-dropdown::-webkit-scrollbar-track { background: transparent; }
        .notif-dropdown::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.3); border-radius: 4px; }
      `}</style>

      {/* Bouton cloche */}
      <div
        ref={clocheRef}
        className="cloche-btn"
        onClick={() => { setOuvert(v => !v); if (!ouvert) chargerNotifs(); }}
        style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 1000, cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span className={nbNonLues > 0 ? 'cloche-active' : ''} style={{ fontSize: '22px', display: 'inline-block' }}>🔔</span>
        {nbNonLues > 0 && (
          <div style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#ff3eb5', borderRadius: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#fff', padding: '0 4px', boxShadow: '0 0 8px #ff3eb580', border: '1.5px solid #000' }}>
            {nbNonLues > 99 ? '99+' : nbNonLues}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {ouvert && ReactDOM.createPortal(
        <div ref={dropdownRef} style={{ position: 'fixed', top: '44px', right: '12px', width: '300px', maxHeight: '420px', zIndex: 9999, background: 'rgba(8,16,20,0.97)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* En-tête */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(0,212,212,0.08), rgba(0,212,212,0.03))', flexShrink: 0 }}>
            <span style={{ color: '#00d4d4', fontSize: '13px', fontWeight: 700 }}>
              Notifications{nbNonLues > 0 ? ` (${nbNonLues})` : ''}
            </span>
            {nbNonLues > 0 && (
              <button onClick={toutSupprimer}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
                onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
                Tout effacer
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="notif-dropdown" style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>Chargement…</div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '10px' }}>🔕</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Aucune notification</p>
              </div>
            ) : (
              notifs.map(n => <LigneNotif key={n.id} notif={n} onClic={handleClicNotif} />)
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Popup coloriages partagés */}
      {popupColos && (
        <PopupColoriages
          userId={userId}
          userPseudo={userPseudo}
          onClose={() => setPopupColos(false)}
        />
      )}
    </>
  );
}

export default Cloche;