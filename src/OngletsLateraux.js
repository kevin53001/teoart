import React from 'react';
import ReactDOM from 'react-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";
const PATREON_URL = 'https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink';

const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${relatif.split('/').map(s => encodeURIComponent(s)).join('/')}`;
}

function getVisuelB(visuels) {
  if (!visuels) return null;
  if (visuels['B']) return cheminVersUrl(visuels['B']);
  if (visuels['b']) return cheminVersUrl(visuels['b']);
  const cle = Object.keys(visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
  if (cle) return cheminVersUrl(visuels[cle]);
  const premiere = Object.keys(visuels).find(k => !k.toUpperCase().startsWith('A'));
  return premiere ? cheminVersUrl(visuels[premiere]) : null;
}

function extraireColoriste(url) {
  if (!url) return null;
  const nomFichier = decodeURIComponent(url.split('\\').pop().split('/').pop());
  const match = nomFichier.match(/\s*-\s*C\d*\s*-\s*(.+)\.\w+$/i);
  return match ? match[1].trim() : null;
}

function moisSuivant() {
  const d = new Date();
  return MOIS_FR[(d.getMonth() + 1) % 12];
}

// ─── Config des 4 onglets ─────────────────────────────────────────────────────
const ONGLETS = [
  { id: 'patreon',    pastille: `${R2}/site/pastille_patreon.png`,  couleur: '#ffd250', label: 'Nouveautés Patreon'  },
  { id: 'coloriages', pastille: `${R2}/site/pastille_colos.png`,    couleur: '#00d4d4', label: 'Derniers coloriages' },
  { id: 'bestsellers',pastille: `${R2}/site/pastille_best.png`,     couleur: '#ff3eb5', label: 'Best sellers'        },
  { id: 'favoris',    pastille: `${R2}/site/pastille_favoris.png`,  couleur: '#a78bfa', label: 'Favoris TeoArt'     },
];

// ─── Panneau d'un onglet ──────────────────────────────────────────────────────
function PanneauOnglet({ id, couleur, pastille, label, userId, zoomSocialRef, onClose, onOuvrirFiche }) {
  const [images, setImages] = React.useState([]);
  const [idx, setIdx] = React.useState(0);
  const [prevIdx, setPrevIdx] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [popupZoom, setPopupZoom] = React.useState(null);
  const timerRef = React.useRef(null);
  // Zoom social coloriages
  const [zoomSocialOuvert, setZoomSocialOuvert] = React.useState(false);
  const [zoomIdx, setZoomIdx] = React.useState(0);
  const [likes, setLikes] = React.useState({});
  const [commentaires, setCommentaires] = React.useState({});
  const [nouveauCommentaire, setNouveauCommentaire] = React.useState('');

  React.useEffect(() => {
    const charger = async () => {
      setLoading(true);
      setIdx(0);

      if (id === 'patreon') {
        const { data } = await supabase
          .from('illustrations')
          .select('id, nom, visuels')
          .eq('statut', 'coming_soon')
          .limit(10);
        setImages((data || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom })).filter(i => i.url));

      } else if (id === 'coloriages') {
        const { data } = await supabase
          .from('coloriages')
          .select('id, image_url, user_id, illustration_id, created_at')
          .not('image_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(50);
        if (data && data.length > 0) {
          const uids = [...new Set(data.map(c => c.user_id))];
          const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', uids);
          const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
          const colos = data.map(c => ({ url: c.image_url, nom: `🎨 ${pm[c.user_id] || 'Coloriste'}`, coloId: c.id, illuId: c.illustration_id, userId: c.user_id }));
          const testerUrl = (url) => new Promise(resolve => { const img = new Image(); img.onload = () => resolve(true); img.onerror = () => resolve(false); img.src = url; });
          const resultats = await Promise.allSettled(colos.map(c => testerUrl(c.url)));
          setImages(colos.filter((_, i) => resultats[i].value === true));
        }

      } else if (id === 'bestsellers') {
        const { data } = await supabase
          .from('illustrations')
          .select('id, nom, visuels, prix, description, tags, annee, categorie, livres_ids, recueils_ids')
          .eq('statut', 'published')
          .eq('best_seller', true)
          .limit(10);
        setImages((data || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom, illuId: i.id, illu: i })).filter(i => i.url));

      } else if (id === 'favoris') {
        const { data } = await supabase
          .from('illustrations')
          .select('id, nom, visuels, prix, description, tags, annee, categorie, livres_ids, recueils_ids')
          .eq('statut', 'published')
          .eq('favori', true)
          .limit(10);
        setImages((data || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom, illuId: i.id, illu: i })).filter(i => i.url));
      }

      setLoading(false);
    };
    charger();
  }, [id]);

  // Auto-défilement avec crossfade (pas pour coloriages : navigation manuelle)
  React.useEffect(() => {
    if (id === 'coloriages') return;
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setIdx(prev => {
        setPrevIdx(prev);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setPrevIdx(null), 1200);
        return (prev + 1) % images.length;
      });
    }, 4000);
    return () => { clearInterval(t); clearTimeout(timerRef.current); };
  }, [images.length, id]);

  const ouvrirZoomSocial = async (index) => {
    setZoomIdx(index);
    setZoomSocialOuvert(true);
    const colo = images[index];
    if (!colo) return;
    // Charger likes
    const { data: likesData } = await supabase.from('likes_coloriages').select('user_id').eq('coloriage_id', colo.coloId);
    setLikes(prev => ({ ...prev, [colo.coloId]: likesData || [] }));
    // Charger commentaires
    const { data: commData } = await supabase.from('commentaires_coloriages').select('id, texte, user_id, created_at').eq('coloriage_id', colo.coloId).order('created_at', { ascending: true });
    const uids = [...new Set((commData || []).map(c => c.user_id))];
    const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', uids);
    const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
    setCommentaires(prev => ({ ...prev, [colo.coloId]: (commData || []).map(c => ({ ...c, pseudo: pm[c.user_id] || 'Anonyme' })) }));
  };

  const toggleLike = async () => {
    if (!userId) return;
    const colo = images[zoomIdx];
    if (!colo) return;
    const coloId = colo.coloId;
    const dejaLike = (likes[coloId] || []).some(l => l.user_id === userId);
    if (dejaLike) {
      await supabase.from('likes_coloriages').delete().eq('coloriage_id', coloId).eq('user_id', userId);
      setLikes(prev => ({ ...prev, [coloId]: (prev[coloId] || []).filter(l => l.user_id !== userId) }));
    } else {
      await supabase.from('likes_coloriages').insert({ coloriage_id: coloId, user_id: userId });
      setLikes(prev => ({ ...prev, [coloId]: [...(prev[coloId] || []), { user_id: userId }] }));
    }
  };

  const envoyerCommentaire = async () => {
    if (!userId || !nouveauCommentaire.trim()) return;
    const colo = images[zoomIdx];
    if (!colo) return;
    const coloId = colo.coloId;
    const { data } = await supabase.from('commentaires_coloriages').insert({ coloriage_id: coloId, user_id: userId, texte: nouveauCommentaire.trim(), vu: true }).select('id, texte, created_at, user_id').single();
    if (data) {
      setCommentaires(prev => ({ ...prev, [coloId]: [...(prev[coloId] || []), { ...data, pseudo: 'Moi' }] }));
      setNouveauCommentaire('');
    }
  };

  const naviguerZoom = async (direction) => {
    const next = (zoomIdx + direction + images.length) % images.length;
    await ouvrirZoomSocial(next);
  };

  const img = images[idx];
  const prevImg = prevIdx !== null ? images[prevIdx] : null;
  const coloriste = img ? extraireColoriste(img.url) : null;
  const nomColoriste = img?.nom?.startsWith('🎨') ? img.nom.replace('🎨 ', '') : coloriste;

  return (
    <div style={{
      width: '220px',
      maxHeight: '80vh',
      background: 'rgba(10,10,10,0.45)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderLeft: `2px solid ${couleur}60`,
      borderRadius: '12px 0 0 12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* En-tête — style carte premium */}
      <div style={{
        background: `linear-gradient(135deg, ${couleur}38, ${couleur}18)`,
        borderBottom: `1px solid ${couleur}55`,
        boxShadow: `0 2px 12px ${couleur}30, inset 0 1px 0 ${couleur}30`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Effet shine au montage */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-150%',
          width: '80%', height: '140%',
          background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.04) 75%, transparent 100%)',
          transform: 'skewX(-28deg)',
          animation: 'header-shine 1.2s ease-in-out forwards',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', zIndex: 1 }}>
          <img src={pastille} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ color: couleur, fontSize: '12px', fontWeight: 800, textShadow: `0 0 8px ${couleur}80` }}>{label}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: couleur, fontSize: '16px', cursor: 'pointer', lineHeight: 1, opacity: 0.7, position: 'relative', zIndex: 1 }}>×</button>
      </div>

      {/* Contenu */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Chargement…</span>
        </div>
      ) : images.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center' }}>Aucune image disponible</span>
        </div>
      ) : (
        <>
          {/* Texte Patreon au-dessus de l'image */}
          {id === 'patreon' && (
            <p style={{ textAlign: 'center', color: `${couleur}cc`, fontSize: '10px', fontWeight: 700, padding: '6px 14px 0' }}>
              Ça arrive en {moisSuivant()} sur{' '}
              <span onClick={() => window.open(PATREON_URL, '_blank')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Patreon</span>
            </p>
          )}

          {/* Image avec crossfade */}
          <div style={{ flex: 1, position: 'relative', padding: '12px', minHeight: '180px' }}>
            {prevImg && (
              <img src={prevImg.url} alt=""
                style={{ position: 'absolute', inset: '12px', width: 'calc(100% - 24px)', height: 'calc(100% - 24px)', objectFit: 'contain', borderRadius: '8px', opacity: 0, transition: 'opacity 1.2s ease', pointerEvents: 'none' }}
              />
            )}
            <img
              src={img.url}
              alt={img.nom}
              onClick={async () => {
                if (id === 'coloriages') { await ouvrirZoomSocial(idx); return; }
                if (id === 'patreon') { setPopupZoom(idx); return; }
                if (!img.illuId) return;
                if (img.illu) {
                  onOuvrirFiche && onOuvrirFiche(img.illu);
                } else {
                  const { data } = await supabase
                    .from('illustrations')
                    .select('id, nom, visuels, prix, description, tags, annee, categorie, livres_ids, recueils_ids')
                    .eq('id', img.illuId)
                    .maybeSingle();
                  if (data) onOuvrirFiche && onOuvrirFiche(data);
                }
              }}
              style={{
                position: 'absolute', inset: '12px',
                width: 'calc(100% - 24px)', height: 'calc(100% - 24px)',
                objectFit: 'contain', borderRadius: '8px',
                cursor: (id === 'patreon' || img.illuId) ? 'pointer' : 'default',
              }}
            />
            <div style={{ width: '100%', height: '180px' }} />
            {/* Flèches navigation pour coloriages */}
            {id === 'coloriages' && images.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '28px', height: '28px', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
                <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '28px', height: '28px', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
              </>
            )}
            {nomColoriste && (
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.75)', borderRadius: '4px', padding: '2px 6px', fontSize: '9px', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)' }}>
                {nomColoriste}
              </div>
            )}
          </div>

          {/* Nom */}
          <div style={{ padding: '4px 14px 8px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.nom}</p>
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '0 14px 12px' }}>
              {images.map((_, i) => (
                <div key={i} onClick={() => setIdx(i)}
                  style={{ width: i === idx ? '14px' : '5px', height: '5px', borderRadius: '3px', background: i === idx ? couleur : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          )}
        </>
      )}
      {popupZoom !== null && ReactDOM.createPortal(
        <div onClick={() => setPopupZoom(null)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button onClick={() => setPopupZoom(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setPopupZoom(i => (i - 1 + images.length) % images.length); }}
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          )}
          <img src={images[popupZoom]?.url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }} />
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setPopupZoom(i => (i + 1) % images.length); }}
              style={{ position: 'absolute', right: '64px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          )}
          <p style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{images[popupZoom]?.nom} — {popupZoom + 1} / {images.length}</p>
        </div>,
        document.body
      )}
      {/* ── Zoom social coloriages ── */}
      {zoomSocialOuvert && id === 'coloriages' && images[zoomIdx] && ReactDOM.createPortal(
        <div ref={zoomSocialRef} style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {/* Bouton fermer */}
          <button onClick={() => setZoomSocialOuvert(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

          {/* Image + flèches */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxHeight: '60vh' }}>
            <button onClick={() => naviguerZoom(-1)} style={{ position: 'absolute', left: 0, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>‹</button>
            <img src={images[zoomIdx].url} alt="" style={{ maxWidth: '80vw', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px' }} />
            <button onClick={() => naviguerZoom(1)} style={{ position: 'absolute', right: 0, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>›</button>
          </div>

          {/* Pseudo coloriste + compteur */}
          <p style={{ color: '#00d4d4', fontSize: '13px', marginTop: '12px', fontWeight: 'bold' }}>{images[zoomIdx].nom}</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '2px' }}>{zoomIdx + 1} / {images.length}</p>

          {/* Likes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: userId ? 'pointer' : 'default', fontSize: '22px', lineHeight: 1 }}>
              {(likes[images[zoomIdx].coloId] || []).some(l => l.user_id === userId) ? '❤️' : '🤍'}
            </button>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{(likes[images[zoomIdx].coloId] || []).length} like{(likes[images[zoomIdx].coloId] || []).length !== 1 ? 's' : ''}</span>
          </div>

          {/* Commentaires */}
          <div style={{ width: '100%', maxWidth: '480px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '20vh', overflowY: 'auto' }}>
            {(commentaires[images[zoomIdx].coloId] || []).map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px 10px' }}>
                <span style={{ color: '#00d4d4', fontSize: '11px', fontWeight: 'bold' }}>{c.pseudo} </span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{c.texte}</span>
              </div>
            ))}
          </div>

          {/* Saisie commentaire */}
          {userId && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', width: '100%', maxWidth: '480px' }}>
              <input
                value={nouveauCommentaire}
                onChange={e => setNouveauCommentaire(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && envoyerCommentaire()}
                placeholder="Ajouter un commentaire…"
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}
              />
              <button onClick={envoyerCommentaire} style={{ background: 'rgba(0,212,212,0.2)', border: '1px solid rgba(0,212,212,0.4)', borderRadius: '8px', padding: '8px 14px', color: '#00d4d4', fontSize: '12px', cursor: 'pointer' }}>→</button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
function OngletsLateraux({ userId, onOuvrirFiche }) {
  const [ouvert, setOuvert] = React.useState(null);
  const panneauRef = React.useRef(null);
  const languettesRef = React.useRef(null);
  const zoomSocialRef = React.useRef(null);

  // Fermer au clic en dehors
  React.useEffect(() => {
    if (!ouvert) return;
    const handler = (e) => {
      const dansPanneau = panneauRef.current && panneauRef.current.contains(e.target);
      const dansLanguettes = languettesRef.current && languettesRef.current.contains(e.target);
      const dansZoomSocial = zoomSocialRef.current && zoomSocialRef.current.contains(e.target);
      if (!dansPanneau && !dansLanguettes && !dansZoomSocial) {
        setOuvert(null);
      }
    };
    // Délai pour éviter que le clic d'ouverture déclenche aussi la fermeture
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [ouvert]);

  const toggle = (id) => {
    if (ouvert === id) setOuvert(null); // refermer si on reclique sur le même
    else setOuvert(id); // sinon juste changer d'onglet (le panneau reste ouvert)
  };


  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .onglet-tab {
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .onglet-tab::before {
          content: '';
          position: absolute;
          top: -20%; left: -150%;
          width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.04) 75%, transparent 100%);
          transform: skewX(-28deg);
          z-index: 10;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        .onglet-tab.shining::before { animation: onglet-shine 0.7s ease-in-out forwards; }
        @keyframes onglet-shine { 0% { left: -150%; } 100% { left: 220%; } }
        @keyframes header-shine { 0% { left: -150%; } 100% { left: 220%; } }
        .onglet-tab:hover { transform: translateX(-4px); }
      `}</style>

      {/* Languettes fixes sur le bord droit */}
      <div ref={languettesRef} style={{
        position: 'fixed',
        right: ouvert ? '220px' : '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'right 0.3s ease',
      }}>
        {ONGLETS.map(o => (
          <div
            key={o.id}
            className="onglet-tab"
            onClick={() => toggle(o.id)}
            onMouseEnter={e => { e.currentTarget.classList.remove('shining'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('shining'); }}
            title={o.label}
            style={{
              width: '52px',
              height: '56px',
              background: ouvert === o.id
                ? `linear-gradient(135deg, ${o.couleur}44, ${o.couleur}22)`
                : `linear-gradient(135deg, ${o.couleur}22, ${o.couleur}10)`,
              border: `1px solid ${o.couleur}${ouvert === o.id ? '99' : '55'}`,
              borderRight: 'none',
              borderRadius: '10px 0 0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: ouvert === o.id
                ? `0 0 18px ${o.couleur}60, inset 0 1px 0 ${o.couleur}30`
                : `-2px 0 12px ${o.couleur}30, inset 0 1px 0 ${o.couleur}20`,
              transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
            }}
          >
            <img src={o.pastille} alt={o.label} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
        ))}
      </div>

      {/* Panneaux — tous montés, affichage via CSS pour éviter animation de bas en haut */}
      <div
        ref={panneauRef}
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: ouvert ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(100%)',
          zIndex: 199,
          display: 'flex',
          maxHeight: '80vh',
          transition: 'transform 0.28s ease-out',
          willChange: 'transform',
          pointerEvents: ouvert ? 'auto' : 'none',
        }}
      >
        {ONGLETS.map(o => (
          <div key={o.id} style={{ display: ouvert === o.id ? 'flex' : 'none' }}>
            <PanneauOnglet
              id={o.id}
              couleur={o.couleur}
              pastille={o.pastille}
              label={o.label}
              userId={userId}
              zoomSocialRef={zoomSocialRef}
              onClose={() => setOuvert(null)}
              onOuvrirFiche={(illu) => { onOuvrirFiche && onOuvrirFiche(illu); setOuvert(null); }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default OngletsLateraux;