import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';

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

// ── Social coloriages (like + commentaires) ──────────────────────────────────
// likes, jaLike, toggleLike sont gérés par PopupColoriages et passés en props
// pour que le double-clic sur l'image puisse aussi déclencher le like.
function SocialColo({ coloId, userId, userPseudo, likes, jaLike, toggleLike }) {
  const [commentaires, setComments] = useState([]);
  const [texte, setTexte]           = useState('');
  const [envoi, setEnvoi]           = useState(false);

  useEffect(() => {
    if (!coloId) return;
    (async () => {
      const { data: cr } = await supabase.from('commentaires_coloriages').select('id, texte, created_at, user_id').eq('coloriage_id', coloId).order('created_at', { ascending: true });
      if (cr && cr.length > 0) {
        const uids = [...new Set(cr.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils_publics').select('id, pseudo').in('id', uids);
        const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
        setComments(cr.map(c => ({ ...c, pseudo: pm[c.user_id] || 'Anonyme' })));
      } else setComments([]);
    })();
  }, [coloId]);

  const envoyer = async () => {
    if (!texte.trim() || !coloId || !userId) return;
    setEnvoi(true);
    const { data } = await supabase.from('commentaires_coloriages')
      .insert({ coloriage_id: coloId, user_id: userId, texte: texte.trim() })
      .select('id, texte, created_at, user_id').single();
    if (data) setComments(prev => [...prev, { ...data, pseudo: userPseudo }]);
    // La notif est gérée par le trigger Supabase on_commentaire_coloriage
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
// Props :
//   userId       (string)        — utilisateur connecté
//   userPseudo   (string)        — pseudo utilisateur connecté
//   onClose      (function)      — callback fermeture
//   filtreIds    (array|null)    — ids précis à afficher, null = tous
//   filtreUserId (string|null)   — filtre par auteur (MonCompte : mes coloriages uniquement)
//   idDepart     (string|null)   — id du coloriage à afficher en premier (prioritaire sur idxDepart)
//   idxDepart    (int)           — index d'ouverture (fallback si idDepart absent)
//   onSupprimer  (function|null) — si fourni, affiche le bouton supprimer (MonCompte uniquement)
function PopupColoriages({ userId, userPseudo, onClose, filtreIds = null, filtreUserId = null, idxDepart = 0, idDepart = null, onSupprimer = null }) {
  const [colos, setColos]       = useState([]);
  const [idx, setIdx]           = useState(idxDepart);
  const [loading, setLoading]   = useState(true);
  const [confirmation, setConfirmation] = useState(null);
  const [suppression, setSuppression]   = useState(false);
  const touchStartX = useRef(null);

  // ── Like géré ici pour être partagé entre le bouton SocialColo et le double-clic image
  const [likes, setLikes]   = useState([]);
  const jaLike = likes.some(l => l.user_id === userId);
  const [heartAnim, setHeartAnim] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase
        .from('coloriages')
        .select('id, image_url, user_id, illustration_id, created_at')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false });

      // Filtre par liste d'ids (Cloche — notifs)
      if (filtreIds && filtreIds.length > 0) {
        query = query.in('id', filtreIds);
      }

      // Filtre par auteur (MonCompte — mes coloriages uniquement)
      if (filtreUserId) {
        query = query.eq('user_id', filtreUserId);
      }

      const { data } = await query;
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

      const liste = valides.map(c => ({ id: c.id, url: c.image_url, pseudo: pm[c.user_id] || 'Coloriste', created_at: c.created_at }));
      setColos(liste);
      if (idDepart) {
        const found = liste.findIndex(c => c.id === idDepart);
        if (found !== -1) setIdx(found);
      }
      setLoading(false);
    })();
  }, [filtreIds, filtreUserId, idDepart]);

  // Recharger les likes à chaque changement de coloriage
  const colo = colos[idx];
  useEffect(() => {
    if (!colo?.id) { setLikes([]); return; }
    (async () => {
      const { data: l } = await supabase.from('likes_coloriages').select('user_id').eq('coloriage_id', colo.id);
      setLikes(l || []);
    })();
  }, [colo?.id]);

  const toggleLike = async () => {
    if (!colo?.id || !userId) return;
    if (jaLike) {
      await supabase.from('likes_coloriages').delete().eq('coloriage_id', colo.id).eq('user_id', userId);
      setLikes(prev => prev.filter(l => l.user_id !== userId));
    } else {
      await supabase.from('likes_coloriages').insert({ coloriage_id: colo.id, user_id: userId });
      setLikes(prev => [...prev, { user_id: userId }]);
    }
  };

  // Double-clic image : like + animation cœur (like seulement si pas déjà liké)
  const handleDoubleClic = async () => {
    if (!jaLike) await toggleLike();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
  };

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

  // Suppression (MonCompte uniquement)
  const handleSupprimer = async (colo) => {
    if (!onSupprimer) return;
    setSuppression(true);
    await onSupprimer(colo);
    // Retirer le colo supprimé de la liste locale
    setColos(prev => {
      const next = prev.filter(c => c.id !== colo.id);
      // Ajuster l'index si nécessaire
      setIdx(i => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
    setSuppression(false);
    setConfirmation(null);
    // Fermer le popup si plus aucun coloriage
    if (colos.length <= 1) onClose();
  };


  return ReactDOM.createPortal(
    <>
      {/* Popup principale */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      >
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
              <div style={{ position: 'relative', flexShrink: 0, userSelect: 'none', WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none' }} onDoubleClick={handleDoubleClic}>
                <img src={colo.url} alt={colo.pseudo}
                  style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', display: 'block', background: '#000', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none' }} />
                {heartAnim && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', animation: 'heartPop 0.8s ease forwards' }}>
                    <svg viewBox="0 0 24 24" width="80" height="80" style={{ filter: 'drop-shadow(0 0 12px rgba(255,77,125,0.8))' }}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ color: 'rgba(255,210,80,0.8)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><img src={`${R2}/site/pastille_colos.png`} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} /> par <strong>{colo.pseudo}</strong></span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>{dateRelative(colo.created_at)}</span>
              </div>
              <div style={{ overflowY: 'auto', flexShrink: 0 }}>
                <SocialColo coloId={colo.id} userId={userId} userPseudo={userPseudo} likes={likes} jaLike={jaLike} toggleLike={toggleLike} />
              </div>
              {/* Bouton supprimer — MonCompte uniquement */}
              {onSupprimer && (
                <div style={{ padding: '8px 16px 12px', flexShrink: 0 }}>
                  <button
                    onClick={() => setConfirmation(colo)}
                    style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,100,100,0.7)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    🗑 Supprimer ce coloriage
                  </button>
                </div>
              )}
            </div>

            {/* Flèche droite */}
            {idx < colos.length - 1 && (
              <button onClick={() => setIdx(i => i + 1)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
            )}

            {/* Dots */}
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
      </div>

      {/* Popup confirmation suppression — au-dessus de la popup principale */}
      {confirmation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '16px', padding: '28px 32px', maxWidth: '380px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>🗑</p>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>Supprimer ce coloriage ?</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '24px' }}>Cette action est irréversible. L'image sera supprimée définitivement.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmation(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>Annuler</button>
              <button onClick={() => handleSupprimer(confirmation)} disabled={suppression} style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 20px', color: '#ff8080', cursor: 'pointer', fontSize: '13px', opacity: suppression ? 0.6 : 1 }}>{suppression ? 'Suppression...' : 'Oui, supprimer'}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes heartPop {
          0%   { opacity: 0; transform: scale(0.3); }
          30%  { opacity: 1; transform: scale(1.2); }
          60%  { opacity: 1; transform: scale(1.0); }
          100% { opacity: 0; transform: scale(1.1); }
        }
      `}</style>
    </>,
    document.body
  );
}

export default PopupColoriages;