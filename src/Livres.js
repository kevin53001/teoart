import React from 'react';
import OngletsLateraux from './OngletsLateraux';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import BoutonsFlottants from './BoutonsFlottants';
import Cloche from './Cloche';
import PopupFicheIllu from './PopupFicheIllu';
import BandeLegale from './BandeLegale';
import { usePanier } from './PanierContext';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";
const BANNER_MAX = '1200px';
const SPEED = '80s';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;

const BARRES = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.40 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`), opacite: 0.30 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`), opacite: 0.20 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`), opacite: 0.15 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`), opacite: 0.10 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.05 },
];

const CATEGORIES = ['Tout', 'Animaux', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Halloween', 'Kawaii/Chibi', 'Manga', 'Noël', 'Portrait'];

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





// ─── ZoomSocial ──────────────────────────────────────────────────────────────
function VignetteVisuel({ item, taille = 150, onClick, badge = null, jAi = false, jeVeux = false, onToggleJAi, onToggleJeVeux, onPanier = null, dansPanier = false }) {
  const cardRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const url = cheminVersUrl(item.visuel_presentation);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    el.style.transform = `rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.04)`;
    if (wrapRef.current) wrapRef.current.style.transform = 'perspective(800px)';
  };
  const handleMouseLeave = () => {
    if (cardRef.current) { cardRef.current.style.transform = ''; cardRef.current.classList.remove('shining'); }
    if (wrapRef.current) wrapRef.current.style.transform = '';
  };
  const handleMouseEnter = () => {
    const el = cardRef.current;
    el.classList.remove('shining'); void el.offsetWidth; el.classList.add('shining');
  };

  return (
    <div ref={wrapRef} style={{ perspective: '800px' }}>
      <div ref={cardRef} className="teoart-card"
        onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}
        style={{ width: `${taille}px`, cursor: 'pointer', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#111', overflow: 'hidden', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.6)', willChange: 'transform' }}>
        {url
          ? <img src={url} alt={item.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />
        }
        {badge && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', background: badge.bg, border: badge.border, borderRadius: '4px', padding: '1px 5px', fontSize: '8px', color: badge.color }}>{badge.label}</div>
        )}
        {onToggleJAi && (
          <div onClick={e => { e.stopPropagation(); onToggleJAi(); }}
            style={{ position: 'absolute', top: '5px', left: '5px', borderRadius: '4px', padding: '2px 5px', fontSize: '9px', fontWeight: 'bold', zIndex: 20, cursor: 'pointer', background: jAi ? '#00d4d4' : 'rgba(0,0,0,0.55)', color: jAi ? '#000' : 'rgba(255,255,255,0.45)', border: jAi ? 'none' : '1px solid rgba(255,80,80,0.4)' }}>
            {jAi ? "✓ J'ai" : "✕ J'ai"}
          </div>
        )}
        {onToggleJeVeux && (
          <div onClick={e => { e.stopPropagation(); onToggleJeVeux(); }}
            style={{ position: 'absolute', top: '4px', right: badge ? '50px' : '4px', zIndex: 20, cursor: 'pointer', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              {jeVeux
                ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
                : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              }
            </svg>
          </div>
        )}
        <div className="badge-panier-v" onClick={e => { e.stopPropagation(); onPanier ? onPanier() : (onClick && onClick()); }} title={dansPanier ? 'Déjà dans le panier' : onPanier ? 'Ajouter au panier' : 'Voir la fiche'}
          style={dansPanier ? { background: 'rgba(0,212,212,0.25)', border: '2px solid #00d4d4', boxShadow: '0 0 8px rgba(0,212,212,0.4)' } : {}}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={dansPanier ? '#00d4d4' : '#000'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1.4" fill={dansPanier ? '#00d4d4' : '#000'} /><circle cx="19" cy="21" r="1.4" fill={dansPanier ? '#00d4d4' : '#000'} />
            <path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" />
          </svg>
        </div>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.85)' }}>
          <p style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nom}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{item.annee}{item.prix ? ` · ${item.prix} €` : ''}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Vignette illustration dépliée — cliquable → popup ───────────────────────
function VignetteIllu({ illu, taille, jAi, jeVeux, aColorie, onToggleJAi, onToggleJeVeux, onClick }) {
  const urlIllu = (() => {
    if (!illu.visuels) return null;
    const cle = Object.keys(illu.visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
    if (cle) return cheminVersUrl(illu.visuels[cle]);
    if (illu.visuels['B']) return cheminVersUrl(illu.visuels['B']);
    if (illu.visuels['b']) return cheminVersUrl(illu.visuels['b']);
    return null;
  })();

  return (
    <div onClick={onClick}
      style={{ width: `${taille}px`, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', position: 'relative', cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,212,0.4)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'scale(1)'; }}>
      {urlIllu
        ? <img src={urlIllu} alt={illu.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />
      }
      {/* Badge J'ai */}
      <div onClick={e => { e.stopPropagation(); onToggleJAi && onToggleJAi(); }}
        style={{ position: 'absolute', top: '3px', left: '3px', borderRadius: '3px', padding: '1px 4px', fontSize: '8px', fontWeight: 'bold', zIndex: 10, cursor: 'pointer', background: jAi ? '#00d4d4' : 'rgba(0,0,0,0.6)', color: jAi ? '#000' : 'rgba(255,255,255,0.4)', border: jAi ? 'none' : '1px solid rgba(255,80,80,0.35)' }}>
        {jAi ? '✓' : '✕'}
      </div>
      {/* Coeur Je veux */}
      <div onClick={e => { e.stopPropagation(); onToggleJeVeux && onToggleJeVeux(); }}
        style={{ position: 'absolute', top: '3px', right: '3px', zIndex: 10, cursor: 'pointer', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" width="12" height="12">
          {jeVeux
            ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
            : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          }
        </svg>
      </div>
      {aColorie && (
        <div style={{ position: 'absolute', bottom: `${taille > 80 ? 22 : 18}px`, left: '3px', zIndex: 10, width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,210,80,0.2)', border: '1px solid rgba(255,210,80,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>🎨</div>
      )}
      <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.8)' }}>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
      </div>
    </div>
  );
}

function VisuelsItem({ item }) {
  const visuels = [item.visuel_presentation, item.visuel_front, item.visuel_back].filter(Boolean);
  const [idx, setIdx] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setZoom(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (visuels.length === 0) return (
    <div style={{ width: '110px', height: '110px', borderRadius: '10px', background: 'linear-gradient(135deg,#0a0a0a,#1a1a1a)', border: '1px solid rgba(255,210,80,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: '40px' }}>📁</span>
    </div>
  );

  return (
    <>
      {zoom && (
        <div onClick={() => setZoom(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button onClick={() => setZoom(false)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 10000 }}>✕</button>
          <img src={cheminVersUrl(visuels[idx])} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '10px', display: 'block' }} />
          {visuels.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + visuels.length) % visuels.length); }}
              style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>‹</button>
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % visuels.length); }}
              style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>›</button>
            <p style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', zIndex: 10000 }}>{idx + 1} / {visuels.length}</p>
          </>}
        </div>
      )}
      <div style={{ flexShrink: 0 }}>
        <img src={cheminVersUrl(visuels[idx])} alt={item.nom} onClick={() => setZoom(true)}
          style={{ width: '110px', borderRadius: '10px', display: 'block', marginBottom: '6px', cursor: 'zoom-in' }} />
        {visuels.length > 1 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {visuels.map((v, i) => (
              <img key={i} src={cheminVersUrl(v)} alt="" onClick={() => setIdx(i)}
                style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: `2px solid ${i === idx ? '#00d4d4' : 'transparent'}`, opacity: i === idx ? 1 : 0.4 }} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

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
        style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', cursor: 'pointer', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', willChange: 'transform' }} />
    </div>
  );
}

function SectionTitre({ couleur, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, transparent, ${couleur}66)` }} />
      {/* POINT 7 : police x2 */}
      <p style={{ color: couleur, fontSize: '26px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>{label}</p>
      <div style={{ flex: 1, height: '2px', background: `linear-gradient(to left, transparent, ${couleur}66)` }} />
    </div>
  );
}

const PAYS_ZONES = {
  'france': 'France', 'belgique': 'Belgique',
  'allemagne': 'Allemagne / Espagne / Italie / Portugal / Pays-Bas',
  'espagne': 'Allemagne / Espagne / Italie / Portugal / Pays-Bas',
  'italie': 'Allemagne / Espagne / Italie / Portugal / Pays-Bas',
  'portugal': 'Allemagne / Espagne / Italie / Portugal / Pays-Bas',
  'pays-bas': 'Allemagne / Espagne / Italie / Portugal / Pays-Bas',
  'autriche': 'Zone Euro — autres pays', 'finlande': 'Zone Euro — autres pays',
  'grèce': 'Zone Euro — autres pays', 'grece': 'Zone Euro — autres pays',
  'irlande': 'Zone Euro — autres pays', 'luxembourg': 'Zone Euro — autres pays',
  'malte': 'Zone Euro — autres pays', 'slovaquie': 'Zone Euro — autres pays',
  'slovénie': 'Zone Euro — autres pays', 'slovenie': 'Zone Euro — autres pays',
  'estonie': 'Zone Euro — autres pays', 'lettonie': 'Zone Euro — autres pays',
  'lituanie': 'Zone Euro — autres pays', 'chypre': 'Zone Euro — autres pays',
  'croatie': 'Zone Euro — autres pays', 'grande-bretagne': 'Zone Euro — autres pays',
};

// Résout un pays (quelle que soit la casse) vers la clé de zone dans prix_relie
function resoudrePays(pays, prixData) {
  if (!pays || !prixData) return null;
  const zones = Object.keys(prixData);
  // 1. Correspondance directe insensible à la casse
  const directe = zones.find(z => z.toLowerCase() === pays.toLowerCase());
  if (directe) return directe;
  // 2. Via le mapping PAYS_ZONES
  const zoneViaMap = PAYS_ZONES[pays.toLowerCase()];
  if (zoneViaMap) {
    const trouvee = zones.find(z => z.toLowerCase() === zoneViaMap.toLowerCase());
    if (trouvee) return trouvee;
  }
  return null;
}

// ─── Bouton panier PDF (livre ou recueil) ────────────────────────────────────
function BoutonPanierPdf({ item, type, ajouterLivrePdf, ajouterRecueil, estDansPanier }) {
  const [ajoutConfirme, setAjoutConfirme] = React.useState(false);
  const dansPanier = estDansPanier(type === 'recueil' ? 'recueil' : 'livre_pdf', item.id);
  const handleAjouter = () => {
    if (dansPanier) return;
    const imageUrl = cheminVersUrl(item.visuel_presentation);
    if (type === 'recueil') ajouterRecueil({ ...item, image: imageUrl });
    else ajouterLivrePdf({ ...item, image: imageUrl });
    setAjoutConfirme(true);
    setTimeout(() => setAjoutConfirme(false), 2000);
  };
  return (
    <button onClick={handleAjouter} disabled={dansPanier}
      style={{ background: dansPanier ? 'rgba(0,212,212,0.15)' : ajoutConfirme ? 'rgba(0,212,212,0.3)' : '#ff3eb5', border: dansPanier ? '1px solid rgba(0,212,212,0.4)' : 'none', borderRadius: '10px', padding: '10px 20px', color: dansPanier ? '#00d4d4' : '#000', fontWeight: 'bold', fontSize: '13px', cursor: dansPanier ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', transition: 'all .2s' }}>
      {dansPanier ? '✓ Dans le panier' : ajoutConfirme ? '✓ Ajouté !' : (
        <>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1.4" fill="#000" /><circle cx="19" cy="21" r="1.4" fill="#000" />
            <path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" />
          </svg>
          Ajouter au panier — Version PDF
        </>
      )}
    </button>
  );
}

function Livres() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recueils, setRecueils] = React.useState([]);
  const [tousLivres, setTousLivres] = React.useState([]);
  const [tousLesLivres, setTousLesLivres] = React.useState([]);
  const [toutes, setToutes] = React.useState([]); // toutes illustrations pour similaires popup
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [collection, setCollection] = React.useState({});
  const [itemsAuto, setItemsAuto] = React.useState({ recueils: new Set(), livres: new Set() });
  const [collectionIllus, setCollectionIllus] = React.useState({});
  const [coloriages, setColoriages] = React.useState({});
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const [showKawaiiMenu, setShowKawaiiMenu] = React.useState(false);
  const moisPatreon = getMoisPatreonDisponibles();
  const { nbArticles, ajouterLivrePdf, ajouterRecueil, ajouterRelie, estDansPanier } = usePanier();

  // Popup recueil/livre
  const [popupItem, setPopupItem] = React.useState(null);
  const [popupType, setPopupType] = React.useState(null);
  const [contenuPopup, setContenuPopup] = React.useState([]);
  const [itemOuvert, setItemOuvert] = React.useState(null);
  const [illustrationsOuvertes, setIllustrationsOuvertes] = React.useState([]);
  const [loadingIllus, setLoadingIllus] = React.useState(false);

  // Version reliée
  const [modeRelie, setModeRelie] = React.useState(false);
  const [userPays, setUserPays] = React.useState('');
  const [popupRelie, setPopupRelie] = React.useState(false);
  const [reliePaysSaisi, setReliePaysSaisi] = React.useState('');
  const [reliePaysFiltre, setReliePaysFiltre] = React.useState([]);
  const [relieLuAccepte, setRelieLuAccepte] = React.useState(false);

  // Popup fiche illustration
  const [popupIllu, setPopupIllu] = React.useState(null);
  const [popupIlluListe, setPopupIlluListe] = React.useState([]);
  const [popupIlluIndex, setPopupIlluIndex] = React.useState(null);
  const [confirmation, setConfirmation] = React.useState(null);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUserId(user.id);

      const { data: profil } = await supabase.from('profils').select('pseudo, pays').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || 'Anonyme');
      if (profil?.pays) setUserPays(profil.pays);

      const { data: r } = await supabase.from('recueils').select('id, nom, slug, annee, visuel_presentation, visuel_front, visuel_back, prix, description, relie_disponible, statut_relie, prix_relie, description_relie').eq('statut', 'published').order('annee', { ascending: false });
      const { data: l } = await supabase.from('livres').select('id, nom, slug, annee, recueils_ids, visuel_presentation, visuel_front, visuel_back, prix, description, relie_disponible, statut_relie, prix_relie, description_relie').in('statut', ['published', 'dossier']).order('nom');

      // Toutes les illustrations pour la PopupFiche (similaires)
      const { data: illus } = await supabase.from('illustrations').select('id, nom, annee, categorie, visuels, prix, description, tags, livres_ids, recueils_ids').eq('statut', 'published').order('nom');
      setToutes(illus || []);

      setRecueils(r || []);
      setTousLesLivres(l || []);
      setTousLivres((l || []).filter(li => li.visuel_presentation));

      const { data: coll } = await supabase.from('collection_livres').select('item_id, item_type, j_ai, je_veux').eq('user_id', user.id);
      const collMap = {};
      (coll || []).forEach(c => { collMap[`${c.item_type}_${c.item_id}`] = { j_ai: c.j_ai, je_veux: c.je_veux }; });

      const { data: collIllus } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto').eq('user_id', user.id);
      const collIllusMap = {};
      (collIllus || []).forEach(c => { collIllusMap[c.illustration_id] = { j_ai: c.j_ai, je_veux: c.je_veux, j_ai_auto: c.j_ai_auto || false }; });
      setCollectionIllus(collIllusMap);

      const { data: colos } = await supabase.from('coloriages').select('illustration_id').eq('user_id', user.id);
      const colosMap = {};
      (colos || []).forEach(c => { colosMap[c.illustration_id] = true; });
      setColoriages(colosMap);

      const { data: illusAuto } = await supabase.from('collection').select('illustration_id').eq('user_id', user.id).eq('j_ai_auto', true);
      if (illusAuto && illusAuto.length > 0) {
        const illuIds = illusAuto.map(i => i.illustration_id);
        const { data: illusAvecRecueils } = await supabase.from('illustrations').select('recueils_ids, livres_ids').in('id', illuIds.slice(0, 100));
        const recueilsAuto = new Set(); const livresAuto = new Set();
        (illusAvecRecueils || []).forEach(i => {
          (i.recueils_ids || []).forEach(rid => recueilsAuto.add(rid));
          (i.livres_ids || []).forEach(lid => livresAuto.add(lid));
        });
        recueilsAuto.forEach(rid => { if (!collMap[`recueil_${rid}`]) collMap[`recueil_${rid}`] = { j_ai: true, je_veux: false }; });
        livresAuto.forEach(lid => { if (!collMap[`livre_${lid}`]) collMap[`livre_${lid}`] = { j_ai: true, je_veux: false }; });
        setItemsAuto({ recueils: recueilsAuto, livres: livresAuto });
      }

      setCollection(collMap);
      setLoading(false);

      if (location.state?.ouvrirItem) {
        const item = location.state.ouvrirItem;
        if (item.type === 'recueil') {
          const recueilTrouve = (r || []).find(rec => rec.id === item.id);
          if (recueilTrouve) {
            const livresDuRecueil = (l || []).filter(li => li.recueils_ids && li.recueils_ids.includes(recueilTrouve.id));
            setContenuPopup(livresDuRecueil); setPopupItem(recueilTrouve); setPopupType('recueil');
          }
        } else {
          const livreTrouve = (l || []).find(li => li.id === item.id);
          if (livreTrouve) { setPopupItem(livreTrouve); setPopupType('livre'); setModeRelie(false); }
        }
      }
    };
    charger();
  }, [navigate, location.state]);

  const ouvrirRecueil = async (recueil) => {
    const livresDuRecueil = tousLesLivres.filter(l => l.recueils_ids && l.recueils_ids.includes(recueil.id));
    setContenuPopup(livresDuRecueil); setPopupItem(recueil); setPopupType('recueil');
    setItemOuvert(null); setIllustrationsOuvertes([]); setModeRelie(false);
    const key = `recueil_${recueil.id}`;
    if (!collection[key]?.j_ai) {
      const { data: illus } = await supabase.from('illustrations').select('id').eq('statut', 'published').contains('recueils_ids', [recueil.id]);
      const illuIds = (illus || []).map(i => i.id);
      if (illuIds.length > 0) {
        const { data: collLiveR } = await supabase.from('collection').select('illustration_id').eq('user_id', userId).eq('j_ai', true).in('illustration_id', illuIds);
        const cochesSetR = new Set((collLiveR || []).map(c => c.illustration_id));
        if (illuIds.every(id => cochesSetR.has(id))) {
          setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: true } }));
          await supabase.from('collection_livres').upsert({ user_id: userId, item_id: recueil.id, item_type: 'recueil', j_ai: true, je_veux: collection[key]?.je_veux || false }, { onConflict: 'user_id,item_id,item_type' });
        }
      }
    }
  };

  const ouvrirLivre = async (livre) => {
    if (itemOuvert?.id === livre.id) { setItemOuvert(null); setIllustrationsOuvertes([]); return; }
    setItemOuvert(livre); setLoadingIllus(true); setIllustrationsOuvertes([]);
    const { data } = await supabase.from('illustrations').select('id, nom, visuels, annee, prix, categorie, description, tags, livres_ids, recueils_ids').eq('statut', 'published').contains('livres_ids', [livre.id]).order('nom');
    const illus = data || [];
    setIllustrationsOuvertes(illus); setLoadingIllus(false);
    if (illus.length > 0) {
      const key = `livre_${livre.id}`;
      if (!collection[key]?.j_ai) {
        const illuIds = illus.map(i => i.id);
        const { data: collLive } = await supabase.from('collection').select('illustration_id').eq('user_id', userId).eq('j_ai', true).in('illustration_id', illuIds);
        const cochesSet = new Set((collLive || []).map(c => c.illustration_id));
        if (illuIds.every(id => cochesSet.has(id))) {
          setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: true } }));
          await supabase.from('collection_livres').upsert({ user_id: userId, item_id: livre.id, item_type: 'livre', j_ai: true, je_veux: collection[key]?.je_veux || false }, { onConflict: 'user_id,item_id,item_type' });
        }
      }
    }
  };

  const faireToggleJAi = async (itemId, type) => {
    const key = `${type}_${itemId}`; const actuel = collection[key] || {}; const nouveau = !(actuel.j_ai || false);
    setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: nouveau } }));
    const { error } = await supabase.from('collection_livres').upsert({ user_id: userId, item_id: itemId, item_type: type, j_ai: nouveau, je_veux: actuel.je_veux || false }, { onConflict: 'user_id,item_id,item_type' });
    if (error) { console.error(error); setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: actuel.j_ai || false } })); return; }
    try {
      let illuIds = [];
      if (type === 'recueil') { const { data: illus } = await supabase.from('illustrations').select('id').eq('statut', 'published').contains('recueils_ids', [itemId]); illuIds = (illus || []).map(i => i.id); }
      else if (type === 'livre') { const { data: illus } = await supabase.from('illustrations').select('id').eq('statut', 'published').contains('livres_ids', [itemId]); illuIds = (illus || []).map(i => i.id); }
      if (illuIds.length > 0) {
        await supabase.from('collection').upsert(illuIds.map(illuId => ({ user_id: userId, illustration_id: illuId, j_ai: nouveau, j_ai_auto: collectionIllus[illuId]?.j_ai_auto || false, je_veux: collectionIllus[illuId]?.je_veux || false })), { onConflict: 'user_id,illustration_id' });
        setCollectionIllus(prev => { const next = { ...prev }; illuIds.forEach(id => { next[id] = { ...prev[id], j_ai: nouveau }; }); return next; });
      }
    } catch (e) { console.error(e); }
  };

  const toggleJAi = (itemId, type) => {
    const nouveau = !(collection[`${type}_${itemId}`]?.j_ai || false);
    // Décochage d'un item de la sélection initiale → confirmation
    const estAuto = type === 'recueil' ? itemsAuto.recueils.has(itemId) : itemsAuto.livres.has(itemId);
    if (!nouveau && estAuto) {
      setConfirmation({ itemId, type });
      return;
    }
    faireToggleJAi(itemId, type);
  };

  const toggleJeVeux = async (itemId, type) => {
    const key = `${type}_${itemId}`; const actuel = collection[key] || {}; const nouveau = !(actuel.je_veux || false);
    setCollection(prev => ({ ...prev, [key]: { ...prev[key], je_veux: nouveau } }));
    const { error } = await supabase.from('collection_livres').upsert({ user_id: userId, item_id: itemId, item_type: type, j_ai: actuel.j_ai || false, je_veux: nouveau }, { onConflict: 'user_id,item_id,item_type' });
    if (error) { console.error(error); setCollection(prev => ({ ...prev, [key]: { ...prev[key], je_veux: actuel.je_veux || false } })); }
  };

  const faireToggleJAiIllu = async (illuId) => {
    const nouveau = !(collectionIllus[illuId]?.j_ai || false);
    setCollectionIllus(prev => ({ ...prev, [illuId]: { ...prev[illuId], j_ai: nouveau } }));
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, j_ai: nouveau, j_ai_auto: false, je_veux: collectionIllus[illuId]?.je_veux || false }, { onConflict: 'user_id,illustration_id' });
  };

  const toggleJAiIllu = (illuId) => {
    const actuel = collectionIllus[illuId] || {};
    const nouveau = !(actuel.j_ai || false);
    // Si on décoche une illustration cochée automatiquement → demander confirmation
    if (!nouveau && actuel.j_ai_auto) {
      setConfirmation({ illuId });
      return;
    }
    faireToggleJAiIllu(illuId);
  };

  const toggleJeVeuxIllu = async (illuId) => {
    const nouveau = !(collectionIllus[illuId]?.je_veux || false);
    setCollectionIllus(prev => ({ ...prev, [illuId]: { ...prev[illuId], je_veux: nouveau } }));
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, je_veux: nouveau, j_ai: collectionIllus[illuId]?.j_ai || false, j_ai_auto: collectionIllus[illuId]?.j_ai_auto || false }, { onConflict: 'user_id,illustration_id' });
  };

  // Ouvrir popup fiche illustration depuis les dépliés
  const ouvrirPopupIllu = (illu, liste) => {
    const idx = liste.findIndex(i => i.id === illu.id);
    setPopupIllu(illu); setPopupIlluListe(liste); setPopupIlluIndex(idx);
  };
  const popupIlluSuivant = () => { const next = (popupIlluIndex + 1) % popupIlluListe.length; setPopupIllu(popupIlluListe[next]); setPopupIlluIndex(next); };
  const popupIlluPrecedent = () => { const prev = (popupIlluIndex - 1 + popupIlluListe.length) % popupIlluListe.length; setPopupIllu(popupIlluListe[prev]); setPopupIlluIndex(prev); };

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;
  const TAILLE_RECUEIL = isMobile ? 130 : 170;
  const TAILLE_LIVRE = isMobile ? 110 : 140;
  const TAILLE_ILLUS = isMobile ? 85 : 100;

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "var(--font-texte)", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .zoom-social { display: flex; flex-direction: column; gap: 8px; padding: 10px 14px; background: rgba(0,0,0,0.7); border-top: 1px solid rgba(255,255,255,0.08); }
        .zoom-like-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.5); font-size: 12px; transition: color .2s; padding: 0; }
        .zoom-like-btn.actif { color: #ff4d7d; }
        .zoom-like-btn:hover { color: #ff4d7d; }
        .zoom-commentaire-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 6px 10px; color: #fff; font-size: 11px; width: 100%; resize: none; font-family: inherit; }
        .zoom-commentaire-input:focus { outline: none; border-color: rgba(0,212,212,0.4); }
        .zoom-commentaire-input::placeholder { color: rgba(255,255,255,0.3); }
        .zoom-commentaire { display: flex; gap: 6px; align-items: flex-start; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .zoom-commentaire:last-child { border-bottom: none; }

        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .teoart-card::before {
          content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.02) 10%, rgba(255,225,110,0.07) 25%, rgba(255,235,150,0.12) 40%, rgba(255,245,170,0.08) 50%, rgba(255,235,140,0.11) 62%, rgba(255,220,100,0.06) 75%, rgba(255,210,80,0.02) 88%, transparent 100%);
          transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen;
        }
        .teoart-card.shining::before { animation: shine 1.0s ease-in-out forwards; }
        @keyframes shine { 0% { left: -150%; } 100% { left: 220%; } }
        .teoart-card:hover { border-color: rgba(255,210,80,0.5) !important; box-shadow: 0 4px 8px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255,210,80,0.15) !important; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        img { -webkit-user-drag: none; user-drag: none; pointer-events: auto; }
        * { -webkit-user-select: none; user-select: none; }
        input, textarea { -webkit-user-select: text; user-select: text; }
        .badge-panier-v { position: absolute; bottom: 6px; right: 6px; z-index: 20; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; background: #ff3eb5; display: flex; align-items: center; justify-content: center; transition: transform .2s; box-shadow: 0 2px 8px rgba(255,62,181,0.6); }
        .badge-panier-v:hover { transform: scale(1.15); }
        .dropdown-cat { position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.96); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 200; min-width: 220px; box-shadow: 0 8px 32px rgba(0,0,0,0.7); }
        .dropdown-item { display: block; width: 100%; padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; background: none; border: none; text-align: left; font-family: inherit; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .dropdown-item-patreon { display: block; width: 100%; padding: 6px 10px; color: rgba(255,210,80,0.75); font-size: 12px; cursor: pointer; border-radius: 6px; background: none; border: none; text-align: left; font-family: inherit; }
        .dropdown-item-patreon:hover { background: rgba(255,210,80,0.12); color: rgba(255,210,80,1); }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .popup-anim { animation: slideDown 0.25s ease; }
        .shining-logo { position: relative; overflow: hidden; }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        @keyframes scrollSim { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.35); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,212,0.6); }
      `}</style>

      <BoutonsFlottants />
      <Cloche />

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
        <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/accueil' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/accueil')} />
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px', ...(location.pathname === '/livres' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/livres')} />
            <div style={{ position: 'relative', width: `${P}px`, height: `${P}px`, flexShrink: 0, marginTop: isMobile ? '-8px' : '0', overflow: 'visible' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, display: 'block', ...(location.pathname === '/catalogue' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={e => { e.stopPropagation(); setShowCategories(v => !v); setShowPatreonMenu(false); setShowKawaiiMenu(false); }} />
              {showCategories && (
                <div className="dropdown-cat" onClick={e => e.stopPropagation()}>
                  {CATEGORIES.map(cat => (
                    cat === 'Kawaii/Chibi' ? (
                      <div key={cat}>
                        <button className="dropdown-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', color: '#ff3eb5' }}
                          onClick={() => setShowKawaiiMenu(v => !v)}>
                          <span>{cat}</span>
                          <span style={{ fontSize: '11px', transition: 'transform .2s', transform: showKawaiiMenu ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                        </button>
                        {showKawaiiMenu && (
                          <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,62,181,0.3)', marginLeft: '14px', marginTop: '4px' }}>
                            <button className="dropdown-item" style={{ color: '#ff3eb5' }} onClick={() => { navigate('/catalogue', { state: { categorie: 'Kawaii/Chibi' } }); setShowCategories(false); setShowKawaiiMenu(false); }}>
                              Tout Kawaii/Chibi
                            </button>
                            {['Astro', 'Creepy', 'Monsters', 'Princess', 'Divers'].map(sc => (
                              <button key={sc} className="dropdown-item" style={{ color: '#ff3eb5' }}
                                onClick={() => { navigate('/catalogue', { state: { categorie: 'Kawaii/Chibi', sousCategorie: sc } }); setShowCategories(false); setShowKawaiiMenu(false); }}>
                                {sc}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                    <button key={cat} className="dropdown-item"
                      style={cat === 'Tout' ? { fontWeight: 'bold', fontSize: '15px' } : {}}
                      onClick={() => { navigate('/catalogue', { state: { categorie: cat } }); setShowCategories(false); }}>
                      {cat}
                    </button>
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

      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
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

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 200}px` }}>
          {loading ? <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p> : (
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

              <SectionTitre couleur="#00d4d4" label="Recueils" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '40px' }}>
                {recueils.map(r => (
                  <VignetteVisuel key={r.id} item={r} taille={TAILLE_RECUEIL}
                    jAi={collection[`recueil_${r.id}`]?.j_ai || false}
                    jeVeux={collection[`recueil_${r.id}`]?.je_veux || false}
                    onToggleJAi={() => toggleJAi(r.id, 'recueil')}
                    onToggleJeVeux={() => toggleJeVeux(r.id, 'recueil')}
                    onClick={() => ouvrirRecueil(r)}
                    dansPanier={estDansPanier((!r.relie_disponible || r.statut_relie !== 'published') ? 'recueil' : 'relie', r.id)}
                    onPanier={(!r.relie_disponible || r.statut_relie !== 'published') && r.prix ? () => {
                      const imageUrl = cheminVersUrl(r.visuel_presentation);
                      ajouterRecueil({ ...r, image: imageUrl });
                    } : null} />
                ))}
                {Array.from({ length: 10 }).map((_, i) => <div key={`fantome-r-${i}`} style={{ width: `${TAILLE_RECUEIL}px`, height: 0 }} />)}
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,210,80,0.2), transparent)', marginBottom: '40px' }} />

              <SectionTitre couleur="rgba(255,255,255,0.6)" label="Tous les livres" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                {tousLivres.map(l => (
                  <VignetteVisuel key={l.id} item={l} taille={TAILLE_LIVRE}
                    jAi={collection[`livre_${l.id}`]?.j_ai || false}
                    jeVeux={collection[`livre_${l.id}`]?.je_veux || false}
                    onToggleJAi={() => toggleJAi(l.id, 'livre')}
                    onToggleJeVeux={() => toggleJeVeux(l.id, 'livre')}
                    onClick={() => { setPopupItem(l); setPopupType('livre'); setItemOuvert(null); setIllustrationsOuvertes([]); setModeRelie(false); }}
                    dansPanier={estDansPanier((!l.relie_disponible || l.statut_relie !== 'published') ? 'livre_pdf' : 'relie', l.id)}
                    onPanier={(!l.relie_disponible || l.statut_relie !== 'published') && l.prix ? () => {
                      const imageUrl = cheminVersUrl(l.visuel_presentation);
                      ajouterLivrePdf({ ...l, image: imageUrl });
                    } : null} />
                ))}
                {Array.from({ length: 10 }).map((_, i) => <div key={`fantome-l-${i}`} style={{ width: `${TAILLE_LIVRE}px`, height: 0 }} />)}
              </div>

            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

      {/* ── POPUP RECUEIL OU LIVRE ── */}
      {popupItem && (
        <div onClick={() => { setPopupItem(null); setItemOuvert(null); setModeRelie(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} className="popup-anim"
            style={{ background: '#111', border: `1px solid ${popupType === 'recueil' ? 'rgba(0,212,212,0.3)' : 'rgba(255,210,80,0.25)'}`, borderRadius: '20px', maxWidth: '860px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '24px' }}>

            <button onClick={() => { setPopupItem(null); setItemOuvert(null); setModeRelie(false); }} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer' }}>✕</button>

            {/* ── LIGNE HAUTE : visuel + infos + tableau pays ── */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' }}>
              <VisuelsItem item={popupItem} />

              {/* Zone centrale : infos + prix + boutons */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                {/* Label type */}
                <p style={{ color: popupType === 'recueil' ? '#00d4d4' : 'rgba(255,210,80,0.8)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  {popupType === 'recueil' ? 'Recueil' : 'Livre'}
                </p>
                {/* Nom */}
                <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{popupItem.nom}</p>

                {/* ── PRIX bien visible ── */}
                {!modeRelie ? (
                  popupItem.prix ? (
                    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px', background: 'rgba(255,62,181,0.12)', border: '1px solid rgba(255,62,181,0.35)', borderRadius: '10px', padding: '6px 14px', marginBottom: '10px' }}>
                      <span style={{ color: '#ff3eb5', fontSize: '26px', fontWeight: 'bold' }}>{popupItem.prix}</span>
                      <span style={{ color: 'rgba(255,62,181,0.7)', fontSize: '15px', fontWeight: 'bold' }}>€</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginLeft: '4px' }}>Version PDF</span>
                    </div>
                  ) : null
                ) : (
                  (() => {
                    const prixData = popupItem.prix_relie ? (typeof popupItem.prix_relie === 'string' ? JSON.parse(popupItem.prix_relie) : popupItem.prix_relie) : null;
                    const paysActif = userPays;
                    const zoneKey = resoudrePays(paysActif, prixData);
                    const infoPays = zoneKey ? prixData[zoneKey] : null;
                    return (
                      <div style={{ marginBottom: '10px' }}>
                        {infoPays ? (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', background: 'rgba(255,210,80,0.1)', border: '1px solid rgba(255,210,80,0.4)', borderRadius: '10px', padding: '6px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                              <span style={{ color: 'rgba(255,210,80,1)', fontSize: '26px', fontWeight: 'bold' }}>{infoPays.prix}</span>
                              <span style={{ color: 'rgba(255,210,80,0.7)', fontSize: '15px', fontWeight: 'bold' }}>{infoPays.symbole || '€'}</span>
                              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginLeft: '4px' }}>Version Reliée</span>
                            </div>
                            <span style={{ color: 'rgba(255,210,80,0.55)', fontSize: '10px', marginTop: '2px' }}>✓ Frais de port inclus</span>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px', background: 'rgba(255,210,80,0.08)', border: '1px solid rgba(255,210,80,0.3)', borderRadius: '10px', padding: '6px 14px' }}>
                            <span style={{ color: 'rgba(255,210,80,0.8)', fontSize: '18px', fontWeight: 'bold' }}>Prix variable</span>
                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>selon le pays</span>
                          </div>
                        )}
                        <p style={{ color: 'rgba(255,210,80,0.6)', fontSize: '11px', marginTop: '6px' }}>📦 Délai estimé : entre 7 jours et 3 semaines selon le pays</p>
                        {infoPays && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>⏱ Pour {paysActif} : {infoPays.delai}</p>}
                      </div>
                    );
                  })()
                )}

                {/* ── Infos secondaires ── */}
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginBottom: '12px' }}>
                  {popupItem.annee}
                  {popupType === 'recueil' ? ` · ${contenuPopup.length} livre${contenuPopup.length > 1 ? 's' : ''}` : ''}
                </p>

                {/* ── Boutons J'ai / Je veux ── */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <button onClick={() => toggleJAi(popupItem.id, popupType)}
                    style={{ background: collection[`${popupType}_${popupItem.id}`]?.j_ai ? '#00d4d4' : 'rgba(255,255,255,0.07)', border: collection[`${popupType}_${popupItem.id}`]?.j_ai ? 'none' : '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 12px', color: collection[`${popupType}_${popupItem.id}`]?.j_ai ? '#000' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    {collection[`${popupType}_${popupItem.id}`]?.j_ai ? "✓ J'ai" : "✕ J'ai"}
                  </button>
                  <button onClick={() => toggleJeVeux(popupItem.id, popupType)}
                    style={{ background: collection[`${popupType}_${popupItem.id}`]?.je_veux ? 'rgba(255,77,125,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${collection[`${popupType}_${popupItem.id}`]?.je_veux ? 'rgba(255,77,125,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg viewBox="0 0 24 24" width="11" height="11">
                      {collection[`${popupType}_${popupItem.id}`]?.je_veux
                        ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
                        : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                      }
                    </svg>
                    Je veux
                  </button>
                </div>

                {/* ── Sélecteur PDF / Relié (boutons premium + coches) ── */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {/* Bouton PDF */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div onClick={() => setModeRelie(false)} style={{ cursor: 'pointer', padding: '7px 16px', borderRadius: '10px', background: !modeRelie ? 'linear-gradient(135deg, #ff3eb5, #c9007a)' : 'rgba(255,62,181,0.08)', border: !modeRelie ? 'none' : '1px solid rgba(255,62,181,0.25)', boxShadow: !modeRelie ? '0 4px 14px rgba(255,62,181,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none', transition: 'all .25s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px' }}>📄</span>
                      <span style={{ color: !modeRelie ? '#fff' : 'rgba(255,62,181,0.4)', fontSize: '12px', fontWeight: 'bold', transition: 'color .2s', letterSpacing: '0.5px' }}>PDF</span>
                    </div>
                    <div onClick={() => setModeRelie(false)} style={{ cursor: 'pointer', width: '28px', height: '16px', borderRadius: '8px', background: !modeRelie ? '#00d4d4' : 'rgba(255,255,255,0.1)', border: !modeRelie ? 'none' : '1px solid rgba(255,255,255,0.2)', position: 'relative', transition: 'all .25s', boxShadow: !modeRelie ? '0 0 8px rgba(0,212,212,0.6)' : 'none' }}>
                      <div style={{ position: 'absolute', top: '2px', left: !modeRelie ? '14px' : '2px', width: '12px', height: '12px', borderRadius: '50%', background: !modeRelie ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'left .25s', boxShadow: !modeRelie ? '0 0 4px rgba(0,212,212,0.8)' : 'none' }} />
                    </div>
                  </div>

                  {/* Bouton Relié */}
                  {popupItem.relie_disponible && popupItem.statut_relie === 'published' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div onClick={() => setModeRelie(true)} style={{ cursor: 'pointer', padding: '7px 16px', borderRadius: '10px', background: modeRelie ? 'linear-gradient(135deg, #ffd24d, #c48a00)' : 'rgba(255,210,80,0.08)', border: modeRelie ? 'none' : '1px solid rgba(255,210,80,0.25)', boxShadow: modeRelie ? '0 4px 14px rgba(255,210,80,0.45), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none', transition: 'all .25s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px' }}>📚</span>
                        <span style={{ color: modeRelie ? '#000' : 'rgba(255,210,80,0.4)', fontSize: '12px', fontWeight: 'bold', transition: 'color .2s', letterSpacing: '0.5px' }}>Relié</span>
                      </div>
                      <div onClick={() => setModeRelie(true)} style={{ cursor: 'pointer', width: '28px', height: '16px', borderRadius: '8px', background: modeRelie ? '#00d4d4' : 'rgba(255,255,255,0.1)', border: modeRelie ? 'none' : '1px solid rgba(255,255,255,0.2)', position: 'relative', transition: 'all .25s', boxShadow: modeRelie ? '0 0 8px rgba(0,212,212,0.6)' : 'none' }}>
                        <div style={{ position: 'absolute', top: '2px', left: modeRelie ? '14px' : '2px', width: '12px', height: '12px', borderRadius: '50%', background: modeRelie ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'left .25s', boxShadow: modeRelie ? '0 0 4px rgba(0,212,212,0.8)' : 'none' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Bouton Ajouter au panier ── */}
                {!modeRelie ? (
                  popupItem.prix ? (
                    <BoutonPanierPdf
                      item={popupItem}
                      type={popupType}
                      ajouterLivrePdf={ajouterLivrePdf}
                      ajouterRecueil={ajouterRecueil}
                      estDansPanier={estDansPanier}
                    />
                  ) : null
                ) : (
                  popupItem.relie_disponible && popupItem.statut_relie === 'published' && (
                    <button onClick={() => { setPopupRelie(true); setReliePaysSaisi(''); setReliePaysFiltre([]); setRelieLuAccepte(false); }}
                      style={{ background: 'rgba(255,210,80,1)', border: 'none', borderRadius: '10px', padding: '10px 20px', color: '#000', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1.4" fill="#000" /><circle cx="19" cy="21" r="1.4" fill="#000" />
                        <path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" />
                      </svg>
                      Ajouter au panier — Version Reliée
                    </button>
                  )
                )}
              </div>

              {/* ── Tableau pays — 3ème colonne, visible uniquement en mode Relié ── */}
              {modeRelie && popupItem.relie_disponible && (() => {
                const prixData = popupItem.prix_relie ? (typeof popupItem.prix_relie === 'string' ? JSON.parse(popupItem.prix_relie) : popupItem.prix_relie) : null;
                if (!prixData) return null;
                const zones = Object.keys(prixData);
                return (
                  <div style={{ width: '180px', flexShrink: 0, background: 'rgba(255,210,80,0.06)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '10px', padding: '10px 14px', alignSelf: 'flex-start' }}>
                    <p style={{ color: 'rgba(255,210,80,0.8)', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>📦 Pays disponibles</p>
                    {zones.map(z => (
                      <div key={z} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>{z}</p>
                        <p style={{ color: 'rgba(255,210,80,0.7)', fontSize: '10px' }}>{prixData[z].prix} {prixData[z].symbole || '€'} · {prixData[z].delai}</p>
                      </div>
                    ))}
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', marginTop: '6px', fontStyle: 'italic' }}>Monaco, Andorre et Suisse exclus.</p>
                  </div>
                );
              })()}
            </div>

            {/* ── DESCRIPTION — alignée avec la colonne centrale ── */}
            {(() => {
              const desc = modeRelie ? (popupItem.description_relie || popupItem.description) : popupItem.description;
              return desc ? (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.7', marginBottom: '20px', whiteSpace: 'pre-line', maxHeight: 'calc(1.7em * 10)', overflowY: 'auto', paddingRight: '6px', paddingLeft: '128px' }}>{desc}</p>
              ) : null;
            })()}

            {/* CONTENU RECUEIL */}
            {popupType === 'recueil' && contenuPopup.length > 0 && (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Contenu du recueil</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {contenuPopup.map(livre => {
                    const estDossier = !livre.visuel_presentation;
                    const estOuvert = itemOuvert?.id === livre.id;
                    return (
                      <div key={livre.id}>
                        <div onClick={() => ouvrirLivre(livre)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${estOuvert ? 'rgba(0,212,212,0.4)' : estDossier ? 'rgba(255,210,80,0.25)' : 'rgba(255,255,255,0.08)'}`, background: estOuvert ? 'rgba(0,212,212,0.04)' : 'rgba(255,255,255,0.02)', transition: 'all .2s' }}>
                          {/* POINT 8 : dossiers sans visuel → icône 📁 */}
                          {estDossier ? (
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg,#0a0a0a,#111)', border: '1px solid rgba(255,210,80,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '18px', opacity: 0.8 }}>📁</span>
                            </div>
                          ) : (
                            <img src={cheminVersUrl(livre.visuel_presentation)} alt={livre.nom} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ color: estDossier ? 'rgba(255,210,80,0.85)' : '#fff', fontSize: '13px', fontWeight: 'bold' }}>{livre.nom}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{estDossier ? 'Dossier' : 'Livre'}{livre.annee ? ` · ${livre.annee}` : ''}</p>
                          </div>
                          <span style={{ color: estOuvert ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '18px', transition: 'transform .2s', transform: estOuvert ? 'rotate(90deg)' : 'none' }}>›</span>
                        </div>

                        {estOuvert && (
                          <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', border: '1px solid rgba(0,212,212,0.08)' }}>
                            {loadingIllus ? (
                              <p style={{ color: '#00d4d4', textAlign: 'center', fontSize: '12px' }}>Chargement...</p>
                            ) : illustrationsOuvertes.length === 0 ? (
                              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: '12px' }}>Aucune illustration trouvée.</p>
                            ) : (
                              <>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                  {illustrationsOuvertes.length} illustration{illustrationsOuvertes.length > 1 ? 's' : ''} — cliquer pour ouvrir la fiche
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                  {illustrationsOuvertes.map(illu => (
                                    <VignetteIllu key={illu.id} illu={illu} taille={TAILLE_ILLUS}
                                      jAi={collectionIllus[illu.id]?.j_ai || false}
                                      jeVeux={collectionIllus[illu.id]?.je_veux || false}
                                      aColorie={coloriages[illu.id] || false}
                                      onToggleJAi={() => toggleJAiIllu(illu.id)}
                                      onToggleJeVeux={() => toggleJeVeuxIllu(illu.id)}
                                      onClick={() => ouvrirPopupIllu(illu, illustrationsOuvertes)}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONTENU LIVRE */}
            {popupType === 'livre' && (
              <PopupContenuLivre livre={popupItem} taille={TAILLE_ILLUS}
                collectionIllus={collectionIllus} coloriages={coloriages}
                onToggleJAi={toggleJAiIllu} onToggleJeVeux={toggleJeVeuxIllu}
                onClickIllu={(illu, liste) => ouvrirPopupIllu(illu, liste)} />
            )}
          </div>
        </div>
      )}

      {/* ── POPUP FICHE ILLUSTRATION ── */}
      {popupIllu && (
        <PopupFicheIllu
          illu={popupIllu}
          illustrations={toutes}
          jAi={collectionIllus[popupIllu.id]?.j_ai || false}
          jeVeux={collectionIllus[popupIllu.id]?.je_veux || false}
          aColorié={coloriages[popupIllu.id] || false}
          onToggleJAi={() => toggleJAiIllu(popupIllu.id)}
          onToggleJeVeux={() => toggleJeVeuxIllu(popupIllu.id)}
          onClose={() => setPopupIllu(null)}
          onOpenSimilaire={(illu) => setPopupIllu(illu)}
          onSuivant={popupIlluListe.length > 1 ? popupIlluSuivant : () => {}}
          onPrecedent={popupIlluListe.length > 1 ? popupIlluPrecedent : () => {}}
          userPseudo={userPseudo}
          userId={userId}
          onColoUploaded={() => setColoriages(prev => ({ ...prev, [popupIllu.id]: true }))}
        />
      )}

      {confirmation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,210,80,0.4)', borderRadius: '16px', padding: '28px 32px', maxWidth: '420px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>🤔</p>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Attends, t'es sûr·e ?</p>
            {confirmation.illuId ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.8', marginBottom: '24px' }}>
                Cette illustration fait partie d'un livre ou recueil que tu as sélectionné lors de ta première visite.<br /><br />
                Tu veux vraiment la retirer de ta collection ? Elle ne disparaîtra pas dans un trou noir, mais quand même... c'est du travail de Kevin ! 😅
              </p>
            ) : confirmation.type === 'recueil' ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.8', marginBottom: '24px' }}>
                Ce recueil faisait partie de ta sélection initiale. Si tu le décoches, toutes ses illustrations seront retirées aussi.<br /><br />
                C'est un grand geste... Kevin en a peut-être perdu le sommeil pour le créer. Tu es vraiment sûr·e ? 😢
              </p>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.8', marginBottom: '24px' }}>
                Ce livre faisait partie de ta sélection initiale. Si tu le décoches, toutes ses illustrations seront retirées aussi.<br /><br />
                Des heures de travail, des pages de coloriage, des crayons usés jusqu'au bout... tout ça pour rien ? 😩
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmation(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>Non, je la garde !</button>
              <button onClick={() => {
                if (confirmation.illuId) faireToggleJAiIllu(confirmation.illuId);
                else faireToggleJAi(confirmation.itemId, confirmation.type);
                setConfirmation(null);
              }} style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 20px', color: '#ff8080', cursor: 'pointer', fontSize: '13px' }}>Oui, je décoche</button>
            </div>
          </div>
        </div>
      )}
      {/* ── POPUP COMMANDE RELIÉE ── */}
      {popupRelie && popupItem && (
        <div onClick={() => { setPopupRelie(false); setRelieLuAccepte(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} className="popup-anim"
            style={{ background: '#111', border: '1px solid rgba(255,210,80,0.35)', borderRadius: '20px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px 28px 24px', position: 'relative' }}>
            <button onClick={() => { setPopupRelie(false); setRelieLuAccepte(false); }} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer' }}>✕</button>

            <p style={{ color: 'rgba(255,210,80,0.9)', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', paddingRight: '24px' }}>
              📚 Comment se déroule la commande d'un livre relié ?
            </p>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: '1.8' }}>
                Lorsque vous commandez un livre relié sur la boutique, je m'occupe personnellement du suivi de votre commande du début à la fin.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: '1.8', marginTop: '10px' }}>
                Une fois votre commande enregistrée, je transmets les informations nécessaires à Amazon, qui assure l'impression à la demande et l'expédition du livre. Vous recevrez ensuite les informations de suivi dès qu'elles seront disponibles.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: '1.8', marginTop: '10px' }}>
                En cas de problème (colis perdu, livre endommagé, erreur d'impression, etc.), il vous suffit de me contacter directement. Je me charge des démarches auprès d'Amazon afin de trouver la solution la plus adaptée à votre situation.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: '1.8', marginTop: '10px' }}>
                Vous bénéficiez ainsi d'un interlocuteur unique tout au long du processus, sans avoir à gérer vous-même les échanges avec Amazon. Cela me permet également de suivre personnellement chaque commande et de vous accompagner si nécessaire.
              </p>
            </div>

            {/* Pays */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px' }}>🌍 Votre pays de résidence</p>
              {userPays ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'rgba(0,212,212,0.1)', border: '1px solid rgba(0,212,212,0.35)', borderRadius: '8px', padding: '8px 14px', color: '#00d4d4', fontSize: '13px', fontWeight: 'bold', flex: 1 }}>
                    {userPays}
                  </div>
                  <button onClick={() => setUserPays('')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer' }}>Modifier</button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={reliePaysSaisi}
                    onChange={e => {
                      const val = e.target.value;
                      setReliePaysSaisi(val);
                      if (val.length >= 2) {
                        const prixData = popupItem.prix_relie ? (typeof popupItem.prix_relie === 'string' ? JSON.parse(popupItem.prix_relie) : popupItem.prix_relie) : {};
                        const zones = Object.keys(prixData);
                        const correspondants = Object.keys(PAYS_ZONES).filter(p => p.startsWith(val.toLowerCase()) && zones.includes(PAYS_ZONES[p]));
                        // Afficher avec la casse correcte (première lettre maj)
                        const correspondantsAffiches = correspondants.map(p => p.charAt(0).toUpperCase() + p.slice(1));
                        setReliePaysFiltre(correspondantsAffiches);
                      } else {
                        setReliePaysFiltre([]);
                      }
                    }}
                    placeholder="Tapez votre pays (ex: France, Belgique...)"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                  />
                  {reliePaysFiltre.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid rgba(255,210,80,0.3)', borderRadius: '8px', zIndex: 10, marginTop: '2px', overflow: 'hidden' }}>
                      {reliePaysFiltre.map(p => (
                        <button key={p} onClick={() => { setReliePaysSaisi(p); setReliePaysFiltre([]); }}
                          style={{ display: 'block', width: '100%', padding: '9px 14px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,210,80,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Prix selon pays saisi */}
              {(() => {
                const paysCheck = userPays || reliePaysSaisi;
                if (!paysCheck || reliePaysFiltre.length > 0) return null;
                const prixData = popupItem.prix_relie ? (typeof popupItem.prix_relie === 'string' ? JSON.parse(popupItem.prix_relie) : popupItem.prix_relie) : null;
                if (!prixData) return null;
                const zoneKey = resoudrePays(paysCheck, prixData);
                const info = zoneKey ? prixData[zoneKey] : null;
                if (info) return (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,210,80,0.08)', border: '1px solid rgba(255,210,80,0.25)', borderRadius: '8px', padding: '8px 12px' }}>
                    <span style={{ color: 'rgba(255,210,80,1)', fontSize: '20px', fontWeight: 'bold' }}>{info.prix} {info.symbole || '€'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>· délai estimé : {info.delai}</span>
                  </div>
                );
                return <p style={{ color: 'rgba(255,100,100,0.7)', fontSize: '11px', marginTop: '6px' }}>⚠️ La commande n'est pas disponible dans votre pays pour l'instant.</p>;
              })()}
            </div>

            {/* Case lu et accepté */}
            <div onClick={() => setRelieLuAccepte(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '20px', padding: '10px 12px', background: relieLuAccepte ? 'rgba(0,212,212,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${relieLuAccepte ? 'rgba(0,212,212,0.35)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', transition: 'all .2s' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${relieLuAccepte ? '#00d4d4' : 'rgba(255,255,255,0.3)'}`, background: relieLuAccepte ? '#00d4d4' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s', boxShadow: relieLuAccepte ? '0 0 6px rgba(0,212,212,0.5)' : 'none' }}>
                {relieLuAccepte && <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
              </div>
              <span style={{ color: relieLuAccepte ? '#00d4d4' : 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.5' }}>
                J'ai lu et j'accepte les conditions de commande d'un livre relié.
              </span>
            </div>

            {/* Boutons Annuler / Valider */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setPopupRelie(false); setRelieLuAccepte(false); }}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Annuler
              </button>
              <button
                disabled={!relieLuAccepte || (!(userPays || reliePaysSaisi))}
                onClick={async () => {
                  const paysChoisi = userPays || reliePaysSaisi;
                  // Sauvegarder le pays dans Mes Infos si pas déjà renseigné
                  if (!userPays && paysChoisi && userId) {
                    await supabase.from('profils').update({ pays: paysChoisi }).eq('id', userId);
                    setUserPays(paysChoisi);
                  }
                  // Récupérer le prix et délai selon le pays
                  const prixData = popupItem.prix_relie ? (typeof popupItem.prix_relie === 'string' ? JSON.parse(popupItem.prix_relie) : popupItem.prix_relie) : null;
                  const zoneKey = resoudrePays(paysChoisi, prixData);
                  const infoPays = zoneKey && prixData ? prixData[zoneKey] : null;
                  const prixRelie = infoPays ? infoPays.prix : 0;
                  const delai = infoPays ? infoPays.delai : 'délai variable';
                  const imageUrl = cheminVersUrl(popupItem.visuel_presentation);
                  ajouterRelie({ ...popupItem, image: imageUrl }, paysChoisi, prixRelie, delai);
                  setPopupRelie(false);
                  setRelieLuAccepte(false);
                }}
                style={{ background: (relieLuAccepte && (userPays || reliePaysSaisi)) ? 'rgba(255,210,80,1)' : 'rgba(255,210,80,0.2)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: (relieLuAccepte && (userPays || reliePaysSaisi)) ? '#000' : 'rgba(255,210,80,0.3)', fontWeight: 'bold', fontSize: '13px', cursor: (relieLuAccepte && (userPays || reliePaysSaisi)) ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all .2s' }}>
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      <BandeLegale />
      <OngletsLateraux userId={userId} onOuvrirFiche={(illu) => setPopupIllu(illu)} />
    </div>
  );
}

function PopupContenuLivre({ livre, taille, collectionIllus, coloriages, onToggleJAi, onToggleJeVeux, onClickIllu }) {
  const [illustrations, setIllustrations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.from('illustrations')
      .select('id, nom, visuels, annee, prix, categorie, description, tags, livres_ids, recueils_ids')
      .eq('statut', 'published')
      .contains('livres_ids', [livre.id])
      .order('nom')
      .then(({ data }) => { setIllustrations(data || []); setLoading(false); });
  }, [livre.id]);

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center', fontSize: '12px' }}>Chargement...</p>;
  if (illustrations.length === 0) return <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: '12px' }}>Aucune illustration trouvée.</p>;

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
        {illustrations.length} illustration{illustrations.length > 1 ? 's' : ''} — cliquer pour ouvrir la fiche
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {illustrations.map(illu => (
          <VignetteIllu key={illu.id} illu={illu} taille={taille}
            jAi={collectionIllus?.[illu.id]?.j_ai || false}
            jeVeux={collectionIllus?.[illu.id]?.je_veux || false}
            aColorie={coloriages?.[illu.id] || false}
            onToggleJAi={() => onToggleJAi && onToggleJAi(illu.id)}
            onToggleJeVeux={() => onToggleJeVeux && onToggleJeVeux(illu.id)}
            onClick={() => onClickIllu && onClickIllu(illu, illustrations)}
          />
        ))}
      </div>
    </div>
  );
}

export default Livres;