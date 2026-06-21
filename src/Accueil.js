import React from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import GuideFlottant from './GuideFlottant';
import BoutonsFlottants from './BoutonsFlottants';
import Cloche from './Cloche';
import Tchat from './Tchat';
import PopupFicheIllu from './PopupFicheIllu';
import BandeLegale from './BandeLegale';
import { usePanier } from './PanierContext';

const R2 = 'https://images.kevinteoart.fr';
const BANNER_MAX = '1200px';
const SPEED = '80s';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const PATREON_URL = 'https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink';

const BARRES = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.40 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`), opacite: 0.30 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`), opacite: 0.20 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`), opacite: 0.15 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`), opacite: 0.10 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.05 },
];

const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";

const CATEGORIES = ['Tout', 'Animaux', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Halloween', 'Kawaii/Chibi', 'Manga', 'Noël', 'Portrait'];
const CATEGORIES_TRIEES_AVEC_SPECIALES = [...CATEGORIES.filter(c => c !== 'Tout'), 'Calendrier', 'FREE'].sort((a, b) => a.localeCompare(b, 'fr'));
const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
function getMoisPatreonDisponibles() {
  const maintenant = new Date();
  const moisCourant = maintenant.getMonth();
  const anneeCourante = maintenant.getFullYear();
  if (anneeCourante < 2026) return [];
  if (anneeCourante > 2026) return MOIS_FR.map(m => `Patreon - ${m} 2026`);
  return MOIS_FR.slice(0, moisCourant + 1).map(m => `Patreon - ${m} 2026`);
}

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
  return null;
}

function moisCibleComingSoon() {
  // Avant le 15 : les coming_soon ciblent le mois courant
  // A partir du 15 : les coming_soon ciblent le mois suivant
  const MOIS = ['Janvier','\u0046\u00e9vrier','Mars','Avril','Mai','Juin','Juillet','Ao\u00fbt','Septembre','Octobre','Novembre','D\u00e9cembre'];
  const d = new Date();
  const offset = d.getDate() >= 15 ? 1 : 0;
  return MOIS[(d.getMonth() + offset) % 12];
}

// ── Jauges ──
function UneBarre({ pct, couleur, label, delai = 0, hauteur = 8 }) {
  const [anim, setAnim] = React.useState(0);
  const [affiche, setAffiche] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setAnim(pct), 200 + delai);
    let start = null;
    const duree = 2200;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duree, 1);
      setAffiche(Math.round(prog * pct));
      if (prog < 1) requestAnimationFrame(step);
    };
    const t2 = setTimeout(() => requestAnimationFrame(step), 200 + delai);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pct, delai]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', minWidth: '120px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: `${Math.max(hauteur, 26)}px`, background: 'rgba(255,255,255,0.06)', borderRadius: `${Math.max(hauteur, 26)}px`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${anim}%`, backgroundImage: couleur, borderRadius: `${Math.max(hauteur, 26)}px`, transition: `width 2.2s cubic-bezier(0.4,0,0.2,1) ${delai}ms`, minWidth: anim > 0 ? '40px' : '0' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.9)', zIndex: 2 }}>{affiche}%</span>
        </div>
      </div>
    </div>
  );
}

function TripleJauge({ pctJai, pctColo, pctJeVeux }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <UneBarre pct={pctJai}    couleur="linear-gradient(90deg,#003333,#004444 20%,#00aaaa 60%,#00d4d4)"  label="✓ J'ai"     delai={0}   hauteur={14} />
      <UneBarre pct={pctColo}   couleur="linear-gradient(90deg,#332800,#554200 20%,#cc9000 60%,#ffd250)"  label="🎨 Colorié"  delai={200} hauteur={14} />
      <UneBarre pct={pctJeVeux} couleur="linear-gradient(90deg,#330020,#550035 20%,#cc1880 60%,#ff3eb5)"  label="♡ Je veux"  delai={400} hauteur={14} />
    </div>
  );
}

// ── Bouton style MonCompte ──
function BoutonAction({ label, icone, couleur, couleurRgb, onClick, disabled, isMobile }) {
  const ref = React.useRef(null);
  const handleMouseEnter = () => {
    const el = ref.current; if (!el) return;
    el.classList.remove('shining'); void el.offsetWidth; el.classList.add('shining');
  };
  return (
    <button ref={ref} className="btn-onglet" onMouseEnter={handleMouseEnter} onClick={onClick} disabled={disabled}
      style={{
        background: `linear-gradient(135deg, rgba(${couleurRgb},0.22), rgba(${couleurRgb},0.10))`,
        border: `1px solid rgba(${couleurRgb},0.55)`,
        color: couleur,
        boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
        borderRadius: '14px',
        padding: isMobile ? '10px 8px' : '14px 8px 10px',
        cursor: disabled ? 'default' : 'pointer',
        fontWeight: 'bold',
        flex: isMobile ? '1 1 calc(50% - 4px)' : '1 1 0',
        minWidth: isMobile ? 'calc(50% - 4px)' : '0',
        opacity: disabled ? 0.55 : 1,
        transition: 'transform .2s, box-shadow .2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '8px',
      }}>
      <div style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icone && React.cloneElement(icone, {
          style: {
            ...(icone.props.style || {}),
            width: isMobile ? '36px' : '48px',
            height: isMobile ? '36px' : '48px',
          }
        })}
      </div>
      <span style={{ fontSize: isMobile ? '11px' : '12px', lineHeight: '1.3', textAlign: 'center' }}>{label}</span>
    </button>
  );
}

// ── Popup fiche illustration (pour favoris + best sellers) ──
function EncartDefilant({ titre, pastille, couleur, images, onZoom, onFiche }) {
  // On garde les deux derniers index : current et previous
  const [cur, setCur] = React.useState(0);
  const [prev, setPrev] = React.useState(null);
  const [fading, setFading] = React.useState(false);
  const timerRef = React.useRef(null);
  const FADE = 1200; // durée fondue ms

  const goTo = React.useCallback((next) => {
    if (next === cur) return;
    setPrev(cur);
    setCur(next);
    setFading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPrev(null);
      setFading(false);
    }, FADE);
  }, [cur]);

  React.useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setCur(c => {
        const next = (c + 1) % images.length;
        setPrev(c);
        setFading(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => { setPrev(null); setFading(false); }, FADE);
        return next;
      });
    }, 4500);
    return () => { clearInterval(t); clearTimeout(timerRef.current); };
  }, [images.length]);

  if (images.length === 0) return (
    <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center' }}>{titre}<br/>Aucune image</p>
    </div>
  );

  const imgCur = images[cur];
  const imgPrev = prev !== null ? images[prev] : null;
  const handleClick = () => {
    if (onFiche && imgCur.illu) onFiche(imgCur.illu);
    else if (onZoom) onZoom(images, cur);
  };

  return (
    <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: `1px solid ${couleur}30`, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
      <div style={{ background: `linear-gradient(135deg, ${couleur}44, ${couleur}22)`, border: `1px solid ${couleur}55`, borderBottom: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', boxShadow: `inset 0 1px 0 ${couleur}30, 0 2px 8px rgba(0,0,0,0.3)` }}>
        {pastille && <img src={pastille} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 }} />}
        <p style={{ color: couleur, fontSize: '12px', fontWeight: 'bold', margin: 0, textShadow: `0 0 8px ${couleur}80` }}>{titre}</p>
      </div>
      <div
        style={{ flex: 1, position: 'relative', padding: '12px', cursor: onFiche && imgCur.illu ? 'pointer' : 'zoom-in' }}
        onClick={handleClick}
      >
        {/* Image précédente — s'efface */}
        {imgPrev && (
          <img src={imgPrev.url} alt=""
            style={{
              position: 'absolute', inset: '12px',
              width: 'calc(100% - 24px)', height: 'calc(100% - 24px)',
              objectFit: 'contain', borderRadius: '8px',
              opacity: fading ? 0 : 1,
              transition: `opacity ${FADE}ms ease`,
            }}
          />
        )}
        {/* Image courante — apparaît */}
        <img src={imgCur.url} alt={imgCur.nom}
          style={{
            position: 'absolute', inset: '12px',
            width: 'calc(100% - 24px)', height: 'calc(100% - 24px)',
            objectFit: 'contain', borderRadius: '8px',
            opacity: fading ? 1 : 1,
            transition: `opacity ${FADE}ms ease`,
          }}
        />
        {/* Spacer pour maintenir la hauteur */}
        <div style={{ width: '100%', height: '160px' }} />
        {imgCur.coloriste && (
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.72)', borderRadius: '4px', padding: '2px 7px', fontSize: '9px', color: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
            Réalisé par {imgCur.coloriste}
          </div>
        )}
        {/* Flèches navigation — toujours visibles, indépendantes du clic image */}
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); goTo((cur - 1 + images.length) % images.length); }}
              style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '26px', height: '26px', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, lineHeight: 1 }}>‹</button>
            <button onClick={e => { e.stopPropagation(); goTo((cur + 1) % images.length); }}
              style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '26px', height: '26px', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, lineHeight: 1 }}>›</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '8px' }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} style={{ width: i === cur ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === cur ? couleur : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
      <div style={{ padding: '4px 12px 10px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{imgCur.nom}</p>
      </div>
    </div>
  );
}

// ── Encart Patreon spécial ──
function EncartPatreon({ images, onZoom }) {
  const [idx, setIdx] = React.useState(0);
  const [prevP, setPrevP] = React.useState(null);
  const [fadingP, setFadingP] = React.useState(false);
  const timerPRef = React.useRef(null);
  const FADEP = 1200;
  const mois = moisCibleComingSoon();

  React.useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setIdx(c => {
        const next = (c + 1) % images.length;
        setPrevP(c);
        setFadingP(true);
        clearTimeout(timerPRef.current);
        timerPRef.current = setTimeout(() => { setPrevP(null); setFadingP(false); }, FADEP);
        return next;
      });
    }, 4500);
    return () => { clearInterval(t); clearTimeout(timerPRef.current); };
  }, [images.length]);

  if (images.length === 0) return (
    <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center' }}>🌟 Nouveautés Patreon<br/>Aucune image</p>
    </div>
  );

  const img = images[idx];
  return (
    <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,80,0.3)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
      <div style={{ background: 'linear-gradient(135deg, #ffd25044, #ffd25022)', border: '1px solid #ffd25055', borderBottom: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', boxShadow: 'inset 0 1px 0 #ffd25030, 0 2px 8px rgba(0,0,0,0.3)' }}>
        <img src={`${R2}/site/pastille_patreon.png`} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 }} />
        <p style={{ color: '#ffd250', fontSize: '12px', fontWeight: 'bold', margin: 0, textShadow: '0 0 8px #ffd25080' }}>Nouveautés Patreon</p>
      </div>
      <div style={{ padding: '6px 12px 0', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,210,80,0.85)', fontSize: '11px', fontWeight: 'bold' }}>
          Ça arrive en {mois} sur{' '}
          <span onClick={(e) => { e.stopPropagation(); window.open(PATREON_URL, '_blank'); }} style={{ textDecoration: 'underline', cursor: 'pointer', color: '#4da6ff', fontSize: '13px', fontWeight: 'bold' }}>Patreon</span> !
        </p>
      </div>
      <div style={{ flex: 1, position: 'relative', padding: '8px 12px', cursor: 'zoom-in', minHeight: '140px' }}
        onClick={() => onZoom && onZoom(images, idx)}>
        {prevP !== null && images[prevP] && (
          <img src={images[prevP].url} alt=""
            style={{ position: 'absolute', inset: '8px 12px', width: 'calc(100% - 24px)', height: 'calc(100% - 16px)', objectFit: 'contain', borderRadius: '8px', opacity: fadingP ? 0 : 1, transition: `opacity ${FADEP}ms ease` }}
          />
        )}
        <img src={img.url} alt={img.nom}
          onError={() => { if (images.length > 1) setIdx(i => (i + 1) % images.length); }}
          style={{ position: 'absolute', inset: '8px 12px', width: 'calc(100% - 24px)', height: 'calc(100% - 16px)', objectFit: 'contain', borderRadius: '8px', opacity: 1 }}
        />
        <div style={{ width: '100%', height: '140px' }} />
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '6px' }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => {
              if (i === idx) return;
              setPrevP(idx); setFadingP(true);
              clearTimeout(timerPRef.current);
              timerPRef.current = setTimeout(() => { setPrevP(null); setFadingP(false); }, FADEP);
              setIdx(i);
            }} style={{ width: i === idx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === idx ? '#ffd250' : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
      <div style={{ padding: '4px 12px 8px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.nom}</p>
      </div>
    </div>
  );
}

// ── Social coloriages (identique Catalogue) ──
function ZoomSocialAccueil({ coloId, pseudo, userId, userPseudo }) {
  const [likes, setLikes] = React.useState([]);
  const [commentaires, setCommentaires] = React.useState([]);
  const [texte, setTexte] = React.useState('');
  const [envoi, setEnvoi] = React.useState(false);
  const jaLike = likes.some(l => l.user_id === userId);

  React.useEffect(() => {
    if (!coloId) return;
    const charger = async () => {
      const { data: l } = await supabase.from('likes_coloriages').select('user_id').eq('coloriage_id', coloId);
      const { data: commentsRaw } = await supabase.from('commentaires_coloriages').select('id, texte, created_at, user_id').eq('coloriage_id', coloId).order('created_at', { ascending: true });
      setLikes(l || []);
      if (commentsRaw && commentsRaw.length > 0) {
        const uids = [...new Set(commentsRaw.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils_publics').select('id, pseudo').in('id', uids);
        const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
        setCommentaires(commentsRaw.map(c => ({ ...c, pseudo: pm[c.user_id] || 'Anonyme' })));
      } else setCommentaires([]);
    };
    charger();
  }, [coloId]);

  const toggleLike = async () => {
    if (!coloId || !userId) return;
    if (jaLike) { await supabase.from('likes_coloriages').delete().eq('coloriage_id', coloId).eq('user_id', userId); setLikes(prev => prev.filter(l => l.user_id !== userId)); }
    else { await supabase.from('likes_coloriages').insert({ coloriage_id: coloId, user_id: userId }); setLikes(prev => [...prev, { user_id: userId }]); }
  };

  const envoyerCommentaire = async () => {
    if (!texte.trim() || !coloId || !userId) return;
    setEnvoi(true);
    const { data } = await supabase.from('commentaires_coloriages').insert({ coloriage_id: coloId, user_id: userId, texte: texte.trim() }).select('id, texte, created_at, user_id').single();
    if (data) setCommentaires(prev => [...prev, { ...data, pseudo: userPseudo }]);
    setTexte(''); setEnvoi(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 14px', background: 'rgba(0,0,0,0.7)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: jaLike ? '#ff4d7d' : 'rgba(255,255,255,0.5)', fontSize: '12px', padding: 0, transition: 'color .2s' }}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            {jaLike ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
              : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />}
          </svg>
          <span>{likes.length > 0 ? likes.length : ''} {jaLike ? "J'aime ✓" : "J'aime"}</span>
        </button>
        {pseudo && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>🎨 par <span style={{ color: 'rgba(255,210,80,0.7)' }}>{pseudo}</span></span>}
      </div>
      {commentaires.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
          {commentaires.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(255,210,80,0.7)', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.pseudo}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', lineHeight: 1.4 }}>{c.texte}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
        <textarea
          rows={1} placeholder="Ajouter un commentaire…" value={texte}
          onChange={e => setTexte(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerCommentaire(); } }}
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '11px', resize: 'none', fontFamily: 'inherit', outline: 'none' }}
        />
        <button onClick={envoyerCommentaire} disabled={!texte.trim() || envoi}
          style={{ background: texte.trim() ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${texte.trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '5px 10px', color: texte.trim() ? '#00d4d4' : 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: texte.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

function PopupColoAccueil({ img, userId, userPseudo, onClose, onPrecedent, onSuivant, total, index }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', overflow: 'hidden', maxWidth: '480px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', fontSize: '18px', cursor: 'pointer', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        {/* Flèches navigation */}
        {total > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); onPrecedent(); }} style={{ position: 'absolute', left: '8px', top: '40%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '22px', cursor: 'pointer', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={e => { e.stopPropagation(); onSuivant(); }} style={{ position: 'absolute', right: '8px', top: '40%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '22px', cursor: 'pointer', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            <p style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.35)', fontSize: '11px', zIndex: 5, pointerEvents: 'none' }}>{index + 1} / {total}</p>
          </>
        )}
        <img src={img.url} alt={img.nom} style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block', background: '#000' }} />
        <ZoomSocialAccueil coloId={img.coloId} pseudo={img.pseudo} userId={userId} userPseudo={userPseudo} />
      </div>
    </div>
  );
}

// ── Popup zoom image simple ──
function PopupZoom({ images, indexDepart, onClose }) {
  const [idx, setIdx] = React.useState(indexDepart);
  const touchStartX = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [images.length, onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (!touchStartX.current) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) setIdx(i => diff > 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length);
        touchStartX.current = null;
      }}>
      <button onClick={onClose} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 10000 }}>✕</button>
      <img src={images[idx].url} alt={images[idx].nom} onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '10px', display: 'block' }} />
      {images.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
          style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>‹</button>
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
          style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>›</button>
        <p style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', zIndex: 10000 }}>{idx + 1} / {images.length}</p>
      </>}
    </div>
  );
}

// ── Logo premium ──
function LogoPremium({ onClick, isMobile, L }) {
  const ref = React.useRef(null);
  const wrapRef = React.useRef(null);
  const handleMouseMove = (e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    el.style.transform = `rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.08)`;
    if (wrapRef.current) wrapRef.current.style.transform = 'perspective(600px)';
  };
  const handleMouseLeave = () => {
    if (ref.current) { ref.current.style.transform = ''; ref.current.classList.remove('shining-logo'); }
    if (wrapRef.current) wrapRef.current.style.transform = '';
  };
  const handleMouseEnter = () => {
    const el = ref.current; if (!el) return;
    el.classList.remove('shining-logo'); void el.offsetWidth; el.classList.add('shining-logo');
  };
  return (
    <div ref={wrapRef} style={{ perspective: '600px', flexShrink: 0, zIndex: 10 }}>
      <img ref={ref} src={`${R2}/site/Logo.png`} alt="logo"
        onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}
        style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', cursor: 'pointer', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease', willChange: 'transform' }} />
    </div>
  );
}

// ── Page principale ──
function Accueil() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [stats, setStats] = React.useState({ totalIllus: 0, jAi: 0, colorie: 0, jeVeux: 0 });
  const [nouveautes, setNouveautes] = React.useState([]);
  const [coloriages, setColoriages] = React.useState([]);
  const [bestSellers, setBestSellers] = React.useState([]);
  const [favoris, setFavoris] = React.useState([]);
  const [illusBS, setIllusBS] = React.useState([]); // objets illu pour PopupFicheIllu
  const [illusFav, setIllusFav] = React.useState([]); // objets illu pour PopupFicheIllu
  const [popup, setPopup] = React.useState(null); // { images, index } pour zoom image
  const [popupFiche, setPopupFiche] = React.useState(null); // illu pour popup fiche
  const [popupFicheListe, setPopupFicheListe] = React.useState([]);
  const [popupFicheIndex, setPopupFicheIndex] = React.useState(0);
  const [popupColo, setPopupColo] = React.useState(null); // { url, coloId, pseudo, coloriste } pour popup coloriage social
  const [popupColoIndex, setPopupColoIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [collection, setCollection] = React.useState({});
  const [coloriagesMap, setColoriagesMap] = React.useState({});
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const [showKawaiiMenu, setShowKawaiiMenu] = React.useState(false);
  const [guideOuvert, setGuideOuvert] = React.useState(false);
  const [guidePart, setGuidePart] = React.useState(0);
  const [zoomGuide, setZoomGuide] = React.useState(null);
  const touchStartXGuide = React.useRef(null);
  const guideRef = React.useRef(null);
  const moisPatreon = getMoisPatreonDisponibles();
  const { nbArticles } = usePanier();

  React.useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  React.useEffect(() => {
    const blockContext = (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); };
    const blockDrag = (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); };
    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('dragstart', blockDrag);
    return () => {
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('dragstart', blockDrag);
    };
  }, []);

  React.useEffect(() => {
    const handler = () => { setShowCategories(false); setShowPatreonMenu(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUserId(user.id);

      const { data: profil } = await supabase.from('profils').select('pseudo').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || profil?.prenom || 'Anonyme');

      // Chargement collection pour j_ai / je_veux dans les popups
      const { data: coll } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto, j_ai_achete').eq('user_id', user.id);
      const collMap = {};
      (coll || []).forEach(c => { collMap[c.illustration_id] = { j_ai: c.j_ai, je_veux: c.je_veux, j_ai_auto: c.j_ai_auto || false, j_ai_achete: c.j_ai_achete || false }; });
      setCollection(collMap);
      const { data: colosCollection } = await supabase.from('coloriages').select('illustration_id').eq('user_id', user.id);
      const colosMap = {};
      (colosCollection || []).forEach(c => { colosMap[c.illustration_id] = true; });
      setColoriagesMap(colosMap);
      const { count: total } = await supabase.from('illustrations').select('id', { count: 'exact', head: true }).eq('statut', 'published');
      const { count: jAiCount } = await supabase.from('collection').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('j_ai', true);
      const { count: colorieCount } = await supabase.from('coloriages').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: jeVeuxCount } = await supabase.from('collection').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('je_veux', true);
      setStats({ totalIllus: total || 0, jAi: jAiCount || 0, colorie: colorieCount || 0, jeVeux: jeVeuxCount || 0 });

      // Nouveautés coming soon
      const { data: nvx } = await supabase.from('illustrations').select('id, nom, visuels').eq('statut', 'coming_soon');
      setNouveautes((nvx || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom })).filter(i => i.url));

      // Derniers coloriages partagés — 50 derniers, circulaire
      const { data: colosRaw } = await supabase
        .from('coloriages')
        .select('id, image_url, illustration_id, user_id')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);
      let colosData = [];
      if (colosRaw && colosRaw.length > 0) {
        const uids = [...new Set(colosRaw.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils_publics').select('id, pseudo').in('id', uids);
        const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
        colosData = colosRaw.map(c => ({ url: c.image_url, nom: `🎨 ${pm[c.user_id] || 'Coloriste'}`, coloriste: pm[c.user_id] || null, coloId: c.id, pseudo: pm[c.user_id] || null }));
      }
      // Filtrer les images cassées avant affichage
      const testerUrl = (url) => new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
      const resultats = await Promise.allSettled(colosData.map(c => testerUrl(c.url)));
      colosData = colosData.filter((_, i) => resultats[i].value === true);
      setColoriages(colosData);

      // Best sellers — avec données illu pour popup fiche
      const { data: bs } = await supabase.from('illustrations').select('id, nom, annee, categorie, prix, visuels, description, tags, livres_ids, recueils_ids').eq('statut', 'published').eq('best_seller', true).limit(12);
      setBestSellers((bs || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom, illu: i })).filter(i => i.url));
      setIllusBS((bs || []).filter(i => getVisuelB(i.visuels)))

      // Favoris TeoArt — avec données illu pour popup fiche
      const { data: fav } = await supabase.from('illustrations').select('id, nom, annee, categorie, prix, visuels, description, tags, livres_ids, recueils_ids').eq('statut', 'published').eq('favori', true).limit(12);
      setFavoris((fav || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom, illu: i })).filter(i => i.url));
      setIllusFav((fav || []).filter(i => getVisuelB(i.visuels)));

      setLoading(false);
    };
    charger();
  }, [navigate]);

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;

  const pctJai = stats.totalIllus > 0 ? (stats.jAi / stats.totalIllus) * 100 : 0;
  const pctColo = stats.jAi > 0 ? (stats.colorie / stats.jAi) * 100 : 0;
  const illusManquantes = stats.totalIllus - stats.jAi;
  const pctJeVeux = illusManquantes > 0 ? (stats.jeVeux / illusManquantes) * 100 : 0;

  const BTNS = [
    { label: 'Constitue ta collection', pastille: `${R2}/site/pastille_mon_compte.png`, couleur: '#ff3eb5',              couleurRgb: '255,62,181',  onClick: () => navigate('/mon-compte'),   disabled: false },
    { label: 'Partage tes coloriages',  pastille: `${R2}/site/pastille_colos.png`,        couleur: '#00d4d4',              couleurRgb: '0,212,212',   onClick: null,                            disabled: true  },
    { label: 'Viens me découvrir',      pastille: `${R2}/site/pastille_logomini.png`,    couleur: 'rgba(255,210,80,0.9)', couleurRgb: '255,210,80',  onClick: () => navigate('/presentation'), disabled: false },
    { label: 'Plonge dans mes pensées', pastille: `${R2}/site/pastille_pensees.png`,    couleur: '#a78bfa',              couleurRgb: '167,139,250', onClick: () => navigate('/pensees'),      disabled: false },
    { label: 'Catalogue complet',       pastille: `${R2}/site/pastille_categories.png`, couleur: '#00d4d4',              couleurRgb: '0,212,212',   onClick: () => navigate('/catalogue'),    disabled: false },
    { label: 'Bibliothèque',            pastille: `${R2}/site/pastille_livres.png`,     couleur: '#ff3eb5',              couleurRgb: '255,62,181',  onClick: () => navigate('/livres'),       disabled: false },
  ];

  const anyPopup = popup || popupFiche;

  const toggleJAi = async (illuId) => {
    if (!userId) return;
    const nouveau = !(collection[illuId]?.j_ai || false);
    setCollection(prev => ({ ...prev, [illuId]: { ...prev[illuId], j_ai: nouveau } }));
    await supabase.from('collection').upsert(
      { user_id: userId, illustration_id: illuId, j_ai: nouveau, j_ai_auto: collection[illuId]?.j_ai_auto || false, j_ai_achete: collection[illuId]?.j_ai_achete || false, je_veux: collection[illuId]?.je_veux || false },
      { onConflict: 'user_id,illustration_id' }
    );
  };

  const toggleJeVeux = async (illuId) => {
    if (!userId) return;
    const nouveau = !(collection[illuId]?.je_veux || false);
    setCollection(prev => ({ ...prev, [illuId]: { ...prev[illuId], je_veux: nouveau } }));
    await supabase.from('collection').upsert(
      { user_id: userId, illustration_id: illuId, je_veux: nouveau, j_ai: collection[illuId]?.j_ai || false, j_ai_auto: collection[illuId]?.j_ai_auto || false, j_ai_achete: collection[illuId]?.j_ai_achete || false },
      { onConflict: 'user_id,illustration_id' }
    );
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "var(--font-texte)", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        .dropdown-cat { position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.96); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 200; min-width: 220px; box-shadow: 0 8px 32px rgba(0,0,0,0.7); }
        .dropdown-item { display: block; width: 100%; padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; background: none; border: none; text-align: left; font-family: inherit; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .dropdown-item-patreon { display: block; width: 100%; padding: 6px 10px; color: rgba(255,210,80,0.75); font-size: 12px; cursor: pointer; border-radius: 6px; background: none; border: none; text-align: left; font-family: inherit; }
        .dropdown-item-patreon:hover { background: rgba(255,210,80,0.12); color: rgba(255,210,80,1); }
        .shining-logo { position: relative; overflow: hidden; }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        .btn-onglet { position: relative; overflow: hidden; }
        .btn-onglet::before { content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%; background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%, transparent 100%); transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen; }
        .btn-onglet.shining::before { animation: btn-shine 0.8s ease-in-out forwards; }
        @keyframes btn-shine { 0% { left: -150%; } 100% { left: 220%; } }
        .btn-onglet:hover { transform: scale(1.04); }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.35); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,212,0.6); }
      `}</style>

      {/* Popup zoom image */}
      {popup && <PopupZoom images={popup.images} indexDepart={popup.index} onClose={() => setPopup(null)} />}
      {popupColo && <PopupColoAccueil
        img={popupColo}
        userId={userId}
        userPseudo={userPseudo}
        onClose={() => setPopupColo(null)}
        total={coloriages.filter(c => c.coloId).length}
        index={popupColoIndex}
        onPrecedent={() => {
          const colosAvecId = coloriages.filter(c => c.coloId);
          const prev = (popupColoIndex - 1 + colosAvecId.length) % colosAvecId.length;
          setPopupColoIndex(prev);
          setPopupColo(colosAvecId[prev]);
        }}
        onSuivant={() => {
          const colosAvecId = coloriages.filter(c => c.coloId);
          const next = (popupColoIndex + 1) % colosAvecId.length;
          setPopupColoIndex(next);
          setPopupColo(colosAvecId[next]);
        }}
      />}

      {/* Popup fiche illustration */}
      {popupFiche && userId && (
        <PopupFicheIllu
          illu={popupFiche}
          illustrations={popupFicheListe}
          jAi={collection[popupFiche.id]?.j_ai || false}
          jAiAchete={collection[popupFiche.id]?.j_ai_achete || false}
          jeVeux={collection[popupFiche.id]?.je_veux || false}
          aColorié={coloriagesMap[popupFiche.id] || false}
          onToggleJAi={() => toggleJAi(popupFiche.id)}
          onToggleJeVeux={() => toggleJeVeux(popupFiche.id)}
          onClose={() => setPopupFiche(null)}
          onOpenSimilaire={(illu) => setPopupFiche(illu)}
          onSuivant={popupFicheListe.length > 1 ? () => {
            const next = (popupFicheIndex + 1) % popupFicheListe.length;
            setPopupFiche(popupFicheListe[next]);
            setPopupFicheIndex(next);
          } : () => {}}
          onPrecedent={popupFicheListe.length > 1 ? () => {
            const prev = (popupFicheIndex - 1 + popupFicheListe.length) % popupFicheListe.length;
            setPopupFiche(popupFicheListe[prev]);
            setPopupFicheIndex(prev);
          } : () => {}}
          userId={userId}
          userPseudo={userPseudo}
        />
      )}

      {/* Boutons flottants (déco + scroll-to-top) */}
      <BoutonsFlottants />

      {/* Cloche */}
      <Cloche hidden={anyPopup} />
      <Tchat hidden={anyPopup} />

      {/* Bannière haut */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* Navigation */}
      {!anyPopup && (
        <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
          <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
              <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/accueil' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/accueil')} />
              <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px', ...(location.pathname === '/livres' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/livres')} />
              <div style={{ position: 'relative', width: `${P}px`, height: `${P}px`, flexShrink: 0, marginTop: isMobile ? '-8px' : '0', overflow: 'visible' }}>
                <img src={`${R2}/site/pastille_categories.png`} alt="Catalogue" className="pastille" style={{ width: `${P}px`, height: `${P}px`, display: 'block', ...(location.pathname === '/catalogue' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={e => { e.stopPropagation(); setShowCategories(v => !v); setShowPatreonMenu(false); setShowKawaiiMenu(false); }} />
                {showCategories && (
                  <div className="dropdown-cat" onClick={e => e.stopPropagation()}>
                    <button className="dropdown-item" style={{ fontWeight: 'bold', fontSize: '15px' }} onClick={() => { navigate('/catalogue', { state: { categorie: 'Tout' } }); setShowCategories(false); }}>Tout</button>
                    {CATEGORIES_TRIEES_AVEC_SPECIALES.map(cat => (
                      cat === 'Kawaii/Chibi' ? (
                        <div key={cat}>
                          <button className="dropdown-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', color: '#ff3eb5' }} onClick={() => setShowKawaiiMenu(v => !v)}>
                            <span>{cat}</span><span style={{ fontSize: '11px', transition: 'transform .2s', transform: showKawaiiMenu ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                          </button>
                          {showKawaiiMenu && (
                            <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,62,181,0.3)', marginLeft: '14px', marginTop: '4px' }}>
                              <button className="dropdown-item" style={{ color: '#ff3eb5' }} onClick={() => { navigate('/catalogue', { state: { categorie: 'Kawaii/Chibi' } }); setShowCategories(false); setShowKawaiiMenu(false); }}>Tout Kawaii/Chibi</button>
                              {['Astro', 'Creepy', 'Monsters', 'Princess', 'Divers'].map(sc => (
                                <button key={sc} className="dropdown-item" style={{ color: '#ff3eb5' }} onClick={() => { navigate('/catalogue', { state: { categorie: 'Kawaii/Chibi', sousCategorie: sc } }); setShowCategories(false); setShowKawaiiMenu(false); }}>{sc}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button key={cat} className="dropdown-item" style={cat === 'FREE' ? { color: '#ffd250', fontWeight: 'bold' } : {}} onClick={() => { navigate('/catalogue', { state: { categorie: cat } }); setShowCategories(false); }}>{cat}</button>
                      )
                    ))}
                    <div style={{ height: '1px', background: 'rgba(255,210,80,0.2)', margin: '6px 8px' }} />
                    <button className="dropdown-item" style={{ color: 'rgba(255,210,80,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }} onClick={() => setShowPatreonMenu(v => !v)}>
                      <span>⭐ Patreon 2026</span>
                      <span style={{ fontSize: '11px', transition: 'transform .2s', transform: showPatreonMenu ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                    </button>
                    {showPatreonMenu && (
                      <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,210,80,0.2)', marginLeft: '14px', marginTop: '4px' }}>
                        {moisPatreon.map(mois => (
                          <button key={mois} className="dropdown-item-patreon"
                            onClick={() => { navigate('/catalogue', { state: { sousCategorie: mois } }); setShowCategories(false); setShowPatreonMenu(false); }}>
                            {mois.replace('Patreon - ', '')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <LogoPremium onClick={() => navigate('/presentation')} isMobile={isMobile} L={L} />
            <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, flexShrink: 0 }}>
              <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/pensees' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/pensees')} />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => navigate('/panier')} />
                {nbArticles > 0 && <div style={{ position: 'absolute', top: isMobile ? '12px' : '16px', right: '-4px', background: '#ff3eb5', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000', border: '2px solid #000', zIndex: 5 }}>{nbArticles}</div>}
              </div>
              <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/mon-compte' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/mon-compte')} />
            </div>
          </div>
        </div>
      )}

      {/* Barres + Contenu */}
      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
        {/* Barres fond */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {BARRES.map((barre, i) => (
              <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content', opacity: barre.opacite }}>
                  {[...barre.images, ...barre.images].map((img, j) => (
                    <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', display: 'block' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 400}px` }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* ── Encart message d'accueil ── */}
            <div style={{ background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', padding: isMobile ? '24px 20px' : '36px 40px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: isMobile ? '20px' : '26px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.5px' }}>
                Bienvenue dans mon Univers
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.9', marginBottom: '28px' }}>
                Vous êtes ici dans un endroit étrange où les dessins s'accumulent plus vite que les bonnes résolutions.<br /><br />
                Au programme : des illustrations à colorier, des livres, des recueils, votre collection personnelle, les coloriages de la communauté et probablement quelques découvertes imprévues en chemin.<br /><br />
                Prenez un panier, quelques crayons et partez explorer les lieux. Le plus difficile sera probablement de savoir où vous arrêter.
              </p>

              {/* Boutons style MonCompte */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: 'center' }}>
                {BTNS.map((btn, i) => (
                  <BoutonAction key={i}
                    label={btn.label}
                    icone={btn.pastille ? <img src={btn.pastille} alt="" style={{ objectFit: 'contain', flexShrink: 0, display: 'block' }} />
                      : btn.emoji ? <span style={{ fontSize: '24px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{btn.emoji}</span>
                      : null}
                    couleur={btn.couleur} couleurRgb={btn.couleurRgb}
                    onClick={btn.onClick || undefined} disabled={btn.disabled}
                    isMobile={isMobile} />
                ))}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontStyle: 'italic' }}>Si tu veux en savoir plus sur le fonctionnement du site, je t'invite à scroller un peu plus bas.</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontStyle: 'italic' }}>Sinon, bienvenue dans mon monde numérique, fais comme chez toi.</p>
              </div>
            </div>

            {/* ── Triple jauge ── */}
            {!loading && (
              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '16px', padding: '18px 24px' }}>
                <TripleJauge pctJai={pctJai} pctColo={pctColo} pctJeVeux={pctJeVeux} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '10px', textAlign: 'center' }}>
                  {stats.jAi} / {stats.totalIllus} illustrations possédées · {stats.colorie} / {stats.jAi} coloriées · {stats.jeVeux} / {illusManquantes} parmi les illustrations manquantes
                </p>
              </div>
            )}

            {/* ── Guide du site — encart déroulant tunnel ── */}
            {!loading && (() => {
              // Desktop : 4 parties / Mobile : 6 parties
              const PARTS_COULEURS_DESKTOP = ['#00d4d4', '#ffd250', '#ff3eb5', '#00d4d4'];
              const PARTS_COULEURS_MOBILE  = ['#00d4d4', '#00d4d4', '#ffd250', '#ffd250', '#ff3eb5', '#00d4d4', '#ffd250'];
              const PARTS_COULEURS = isMobile ? PARTS_COULEURS_MOBILE : PARTS_COULEURS_DESKTOP;
              const nbParts = PARTS_COULEURS.length;
              const couleur = PARTS_COULEURS[guidePart];
              const T = 72;

              // Swipe mobile
              const handleTouchStart = (e) => { touchStartXGuide.current = e.touches[0].clientX; };
              const handleTouchEnd = (e) => {
                if (touchStartXGuide.current === null) return;
                const diff = touchStartXGuide.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0 && guidePart < nbParts - 1) {
                    setGuidePart(p => p + 1);
                    setTimeout(() => guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                  }
                  if (diff < 0 && guidePart > 0) {
                    setGuidePart(p => p - 1);
                    setTimeout(() => guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                  }
                }
                touchStartXGuide.current = null;
              };

              const renderItem = (item, i, arr, avecSousmenu, espacementMobile = 20) => {
                const isLast = i === arr.length - 1;
                if (isMobile) {
                  return (
                    <div key={i} style={{ marginBottom: isLast ? 0 : `${espacementMobile}px`, paddingBottom: isLast ? 0 : `${espacementMobile}px`, borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ color: item.couleur, fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>{item.titre}</p>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <div onClick={item.lien ? () => navigate(item.lien) : undefined} style={{ width: '52px', height: '52px', borderRadius: '12px', background: `${item.couleur}15`, border: `1px solid ${item.couleur}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: item.lien ? 'pointer' : 'default' }}>
                          <img src={item.pastille} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                        </div>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.6', textAlign: 'center' }}>{item.texte}</p>
                      {avecSousmenu && item.sousmenu && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
                          {item.sousmenu.map((sub, si) => {
                            const titreParts = sub.titre.replace(' — ', '\n').replace(' - ', '\n').split('\n');
                            return (
                              <div key={si} style={{ background: `${sub.couleur}10`, border: `1px solid ${sub.couleur}25`, borderRadius: '8px', padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <p style={{ color: sub.couleur, fontSize: '10px', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.3 }}>
                                  {titreParts.map((t, ti) => <span key={ti}>{t}{ti < titreParts.length - 1 && <br/>}</span>)}
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', lineHeight: '1.4', textAlign: 'center' }}>{sub.texte}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div key={i} style={{ marginBottom: isLast ? 0 : '24px', paddingBottom: isLast ? 0 : '24px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div onClick={item.lien ? () => navigate(item.lien) : undefined} style={{ flexShrink: 0, width: `${T}px`, height: `${T}px`, borderRadius: '14px', background: `${item.couleur}15`, border: `1px solid ${item.couleur}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: item.lien ? 'pointer' : 'default', transition: 'transform .2s, filter .2s' }} onMouseEnter={e => { if (item.lien) { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.filter = 'brightness(1.2)'; } }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.filter = ''; }}>
                        <img src={item.pastille} alt="" style={{ width: `${T - 8}px`, height: `${T - 8}px`, objectFit: 'contain', display: 'block' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: item.couleur, fontSize: '15px', fontWeight: 'bold', marginBottom: '5px' }}>{item.titre}</p>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.7' }}>{item.texte}</p>
                      </div>
                    </div>
                    {avecSousmenu && item.sousmenu && (
                      <div style={{ marginTop: '14px', marginLeft: `${T + 16}px`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {item.sousmenu.map((sub, si) => (
                          <div key={si} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '8px', background: `${sub.couleur}18`, border: `1px solid ${sub.couleur}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '12px', color: sub.couleur, fontWeight: 'bold' }}>{sub.emoji}</span>
                            </div>
                            <div>
                              <p style={{ color: sub.couleur, fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>{sub.titre}</p>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.6' }}>{sub.texte}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              };

              // Données des parties
              const ITEM_CATALOGUE = { pastille: `${R2}/site/pastille_categories.png`, lien: '/catalogue', titre: 'Le Catalogue', couleur: '#00d4d4', texte: "C'est le cœur du site : toutes mes illustrations à colorier sont là, classées par catégorie et par année. Tu peux filtrer, rechercher, trier. Chaque vignette est cliquable pour ouvrir la fiche complète.", sousmenu: [{ emoji: '✓', couleur: '#00d4d4', titre: "La Collection — J'ai", texte: "Coche \"J'ai\" sur une illustration pour l'ajouter à ta collection personnelle. Tu peux suivre ta progression avec la jauge en haut de cette page." }, { emoji: '♡', couleur: '#ff4d7d', titre: 'La Collection — Je veux', texte: "Tu craques pour une illustration mais tu ne l'as pas encore ? Coche \"Je veux\" pour la mettre en liste de souhaits." }, { emoji: '🎨', couleur: '#ffd250', titre: "J'ai colorié", texte: "Tu as colorié une de mes illustrations ? Partage-la depuis la fiche illustration ! Les coloriages partagés apparaissent dans la fiche et dans les \"Derniers coloriages\" ci-dessus." }] };
              const ITEM_LIVRES = { pastille: `${R2}/site/pastille_livres.png`, lien: '/livres', titre: 'Les Livres & Recueils — Version PDF et relié (quand il existe)', couleur: '#ffd250', texte: "Mes illustrations sont regroupées en livres thématiques et en recueils annuels. Tu peux cocher \"J'ai\" directement sur un livre ou un recueil pour cocher toutes ses illustrations d'un coup." };
              const ITEMS_P1_DESKTOP = [ITEM_CATALOGUE, ITEM_LIVRES];
              const ITEMS_P4 = [
                { pastille: `${R2}/site/pastille_logomini.png`, lien: '/presentation', titre: 'La Présentation', couleur: '#00d4d4', texte: "C'est ici que je me présente ! Qui je suis, pourquoi je dessine, d'où vient Kevin Teo'Art. Un coin plus personnel pour mieux me connaître avant de plonger dans le catalogue." },
                { pastille: `${R2}/site/pastille_pensees.png`, lien: '/pensees', titre: 'Les Pensées', couleur: '#00d4d4', texte: "Une section un peu à part : des textes que j'écris, présentés dans une roue interactive. Tu peux liker, commenter, et même soumettre tes propres pensées (elles seront validées avant publication)." },
                { pastille: `${R2}/site/pastille_panier.png`, lien: null, titre: 'Le Panier & les Achats', couleur: '#ffd250', texte: "Tu peux ajouter des illustrations à ton panier et les télécharger en PDF haute résolution. Des réductions s'appliquent automatiquement : -15% dès 3 illustrations, -25% dès 6, -35% dès 10 et d'autres encore qui viendront se cumuler automatiquement..." },
                { pastille: `${R2}/site/pastille_mon_compte.png`, lien: '/mon-compte', titre: 'Mon Compte', couleur: '#ff3eb5', texte: "Ton espace personnel : consulte ta collection complète, tes favoris, tes coloriages partagés, tes informations et tes commandes. Tu peux aussi y mettre à jour ta photo de profil et tes coordonnées." },
              ];

              // Bloc 1ère connexion (commun)
              const blocPremiereConnexion = (
                <div style={{ background: 'rgba(0,212,212,0.06)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '12px', padding: isMobile ? '10px 12px' : '14px 18px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: isMobile ? '12px' : '13px', lineHeight: '1.8' }}>
                    <span style={{ color: '#00d4d4', fontWeight: 'bold' }}>💡 Ta première connexion — </span>
                    Lors de ta première connexion, tu as sélectionné les recueils et livres que tu possèdes déjà. Toutes les illustrations présentes dans ces livres et recueils ont été automatiquement cochées dans ta collection (badge J'ai). Tu pourras avoir l'impression que certains livres sont cochés alors que tu ne les as pas, c'est que ces livres sont présents dans un des recueils que tu as sélectionné. Bref, c'est maintenant à toi de jouer pour compléter ta collection…
                  </p>
                </div>
              );

              // Contenu selon desktop (4 parties) ou mobile (6 parties)
              const partieContenu = isMobile ? [
                // Mobile P1 — 1ère connexion
                <div key="mp1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {blocPremiereConnexion}
                </div>,
                // Mobile P2 — Le Catalogue
                <div key="mp2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {renderItem(ITEM_CATALOGUE, 0, [ITEM_CATALOGUE], true)}
                </div>,
                // Mobile P3 — Les Livres & Recueils (image Guide_1)
                <div key="mp3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {renderItem(ITEM_LIVRES, 0, [ITEM_LIVRES], false)}
                </div>,
                // Mobile P4 — Image Guide_1
                <div key="mp4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <img src={`${R2}/site/Guide_1.png`} alt="Guide 1" onClick={() => setZoomGuide(`${R2}/site/Guide_1.png`)} style={{ width: '100%', borderRadius: '8px', cursor: 'zoom-in' }} />
                </div>,
                // Mobile P5 — Image Guide_2
                <div key="mp5" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <img src={`${R2}/site/Guide_2.png`} alt="Guide 2" onClick={() => setZoomGuide(`${R2}/site/Guide_2.png`)} style={{ width: '100%', borderRadius: '8px', cursor: 'zoom-in' }} />
                </div>,
                // Mobile P6 — Présentation, Pensées (espacement réduit)
                <div key="mp6" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ITEMS_P4.slice(0, 2).map((item, i, arr) => renderItem(item, i, arr, false, 8))}
                </div>,
                // Mobile P7 — Panier, Mon Compte (espacement réduit)
                <div key="mp7" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ITEMS_P4.slice(2).map((item, i, arr) => renderItem(item, i, arr, false, 8))}
                </div>,
              ] : [
                // Desktop P1 — 1ère connexion + Catalogue + Livres
                <div key="p1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {blocPremiereConnexion}
                  {ITEMS_P1_DESKTOP.map((item, i, arr) => renderItem(item, i, arr, true))}
                </div>,
                // Desktop P2 — Image Guide_1
                <div key="p2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <img src={`${R2}/site/Guide_1.png`} alt="Guide 1" onClick={() => setZoomGuide(`${R2}/site/Guide_1.png`)} style={{ height: '460px', width: '460px', objectFit: 'contain', borderRadius: '12px', cursor: 'zoom-in', boxShadow: '0 0 30px rgba(255,210,80,0.15)' }} />
                </div>,
                // Desktop P3 — Image Guide_2
                <div key="p3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <img src={`${R2}/site/Guide_2.png`} alt="Guide 2" onClick={() => setZoomGuide(`${R2}/site/Guide_2.png`)} style={{ height: '460px', width: '460px', objectFit: 'contain', borderRadius: '12px', cursor: 'zoom-in', boxShadow: '0 0 30px rgba(255,62,181,0.15)' }} />
                </div>,
                // Desktop P4 — Présentation, Pensées, Panier, Mon Compte
                <div key="p4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {ITEMS_P4.map((item, i, arr) => renderItem(item, i, arr, false))}
                </div>,
              ];

              return (
                <div ref={guideRef} style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${couleur}40`, borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.3s', position: 'relative' }}>
                  <div onClick={() => setGuideOuvert(o => !o)} style={{ background: guideOuvert ? 'linear-gradient(135deg, rgba(0,212,212,0.36), rgba(0,212,212,0.16))' : 'linear-gradient(135deg, rgba(0,212,212,0.55), rgba(0,212,212,0.28))', borderBottom: guideOuvert ? `1px solid ${couleur}40` : 'none', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', boxShadow: 'inset 0 1px 0 rgba(0,212,212,0.5)', transition: 'background 0.3s' }}>
                    <p style={{ color: '#00d4d4', fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Comment fonctionne le site ?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      {!guideOuvert && <span style={{ color: '#ff3eb5', fontSize: '11px', fontStyle: 'italic', textAlign: 'right', lineHeight: '1.3' }}>{isMobile ? <>Toucher<br/>pour ouvrir</> : 'Toucher pour ouvrir'}</span>}
                      <span style={{ color: '#00d4d4', fontSize: '18px', display: 'inline-block', transition: 'transform 0.3s', transform: guideOuvert ? 'rotate(180deg)' : 'none', animation: guideOuvert ? 'none' : 'guideBounce 1.8s ease-in-out infinite' }}>▾</span>
                    </div>
                  </div>
                  <style>{`@keyframes guideBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }`}</style>
                  {guideOuvert && (
                    <div
                      onTouchStart={isMobile ? handleTouchStart : undefined}
                      onTouchEnd={isMobile ? handleTouchEnd : undefined}
                      style={{ padding: isMobile ? '16px 12px' : '28px 60px', position: 'relative', minHeight: isMobile ? 'auto' : '540px', display: 'flex', flexDirection: 'column' }}>
                      {/* Flèches navigation mobile — discrètes et cliquables */}
                      {isMobile && (
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, pointerEvents: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                          <div onClick={() => { if (guidePart > 0) { setGuidePart(p => p - 1); setTimeout(() => guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); } }}
                            style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: guidePart > 0 ? 0.6 : 0, transition: 'opacity 0.3s', cursor: guidePart > 0 ? 'pointer' : 'default', pointerEvents: 'auto', height: '100%' }}>
                            <span style={{ color: couleur, fontSize: '22px', lineHeight: 1 }}>‹</span>
                          </div>
                          <div onClick={() => { if (guidePart < nbParts - 1) { setGuidePart(p => p + 1); setTimeout(() => guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); } }}
                            style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: guidePart < nbParts - 1 ? 0.6 : 0, transition: 'opacity 0.3s', cursor: guidePart < nbParts - 1 ? 'pointer' : 'default', pointerEvents: 'auto', height: '100%' }}>
                            <span style={{ color: couleur, fontSize: '22px', lineHeight: 1 }}>›</span>
                          </div>
                        </div>
                      )}
                      {!isMobile && guidePart > 0 && (
                        <button onClick={() => setGuidePart(p => p - 1)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: couleur, border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#000', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px ${couleur}80`, transition: 'all 0.2s', zIndex: 2 }}>◀</button>
                      )}
                      {!isMobile && guidePart < nbParts - 1 && (
                        <button onClick={() => setGuidePart(p => p + 1)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: couleur, border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#000', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px ${couleur}80`, transition: 'all 0.2s', zIndex: 2 }}>▶</button>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                        {PARTS_COULEURS.map((c, i) => (
                          <div key={i} onClick={() => setGuidePart(i)} style={{ width: guidePart === i ? '24px' : '8px', height: '8px', borderRadius: '4px', background: guidePart === i ? c : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }} />
                        ))}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: (isMobile ? (guidePart === 3 || guidePart === 4) : (guidePart === 1 || guidePart === 2)) ? 'center' : 'flex-start' }}>
                        {partieContenu[guidePart]}
                      </div>
                    </div>
                  )}
                  {zoomGuide && ReactDOM.createPortal(
                    <div onClick={() => setZoomGuide(null)} style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out' }}>
                      <img src={zoomGuide} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }} />
                      <button onClick={() => setZoomGuide(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>,
                    document.body
                  )}
                </div>
              );
            })()}

            {/* ── 4 encarts défilants — 2x2 sur mobile ── */}
            {!loading && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '12px',
              }}>
                <EncartPatreon
                  images={nouveautes}
                  onZoom={(imgs, i) => setPopup({ images: imgs, index: i })}
                />
                <EncartDefilant titre="Derniers coloriages" pastille={`${R2}/site/pastille_colos.png`} couleur="#00d4d4"
                  images={coloriages}
                  onZoom={(imgs, i) => {
                    const img = imgs[i];
                    if (img.coloId) {
                      const colosAvecId = coloriages.filter(c => c.coloId);
                      const idx = colosAvecId.findIndex(c => c.coloId === img.coloId);
                      setPopupColoIndex(idx >= 0 ? idx : 0);
                      setPopupColo(img);
                    } else setPopup({ images: imgs, index: i });
                  }}
                />
                <EncartDefilant titre="Best sellers" pastille={`${R2}/site/pastille_best.png`} couleur="#ff3eb5"
                  images={bestSellers}
                  onFiche={(illu) => { const idx = illusBS.findIndex(i => i.id === illu.id); setPopupFicheListe(illusBS); setPopupFicheIndex(idx >= 0 ? idx : 0); setPopupFiche(illu); }}
                  onZoom={(imgs, i) => setPopup({ images: imgs, index: i })}
                />
                <EncartDefilant titre="Favoris TeoArt" pastille={`${R2}/site/pastille_favoris.png`} couleur="#a78bfa"
                  images={favoris}
                  onFiche={(illu) => { const idx = illusFav.findIndex(i => i.id === illu.id); setPopupFicheListe(illusFav); setPopupFicheIndex(idx >= 0 ? idx : 0); setPopupFiche(illu); }}
                  onZoom={(imgs, i) => setPopup({ images: imgs, index: i })}
                />
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Bannière bas */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open(PATREON_URL, '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>
      <GuideFlottant pageKey="accueil" userId={userId} isMobile={isMobile} />
      <BandeLegale />
    </div>
  );
}

export default Accueil;