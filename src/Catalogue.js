import React from 'react';
import OngletsLateraux from './OngletsLateraux';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import BoutonsFlottants from './BoutonsFlottants';
import BandeLegale from './BandeLegale';
import { usePanier } from './PanierContext';
import PopupFicheIllu from './PopupFicheIllu';
import Cloche from './Cloche';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";

const BARRES = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.40 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`), opacite: 0.30 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`), opacite: 0.20 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`), opacite: 0.15 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`), opacite: 0.10 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.05 },
];

const BANNER_MAX = '1200px';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const SPEED = '80s';

const CATEGORIES = ['Tout', 'Animaux', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Halloween', 'Kawaii/Chibi', 'Manga', 'Noël', 'Portrait'];

// Helpers utilisés par IlluCard (cheminVersUrl, getVisuelsOrdonnes, getVisuelPresentation)
function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${relatif.split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
}
function getVisuelsOrdonnes(visuels) {
  if (!visuels) return [];
  const result = []; const valeursAjoutees = new Set();
  Object.entries(visuels).forEach(([k, v]) => { if (k.toUpperCase() === 'A') return; if ((k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation')) && v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); } });
  ['B', 'b'].forEach(k => { if (visuels[k] && !valeursAjoutees.has(visuels[k])) { result.push(visuels[k]); valeursAjoutees.add(visuels[k]); } });
  Object.entries(visuels).forEach(([k, v]) => { if (k.toUpperCase() === 'A') return; if (/^C\d*$/i.test(k) && v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); } });
  Object.entries(visuels).forEach(([k, v]) => { if (k.toUpperCase() === 'A') return; if (v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); } });
  return result;
}
function getVisuelPresentation(visuels) {
  if (!visuels) return null;
  const cle = Object.keys(visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
  if (cle) return cheminVersUrl(visuels[cle]);
  if (visuels['B']) return cheminVersUrl(visuels['B']);
  if (visuels['b']) return cheminVersUrl(visuels['b']);
  return null;
}
const ANNEES = [2021, 2022, 2023, 2024, 2025, 2026];

const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

// Mois Patreon 2026 disponibles jusqu'au mois courant inclus
function getMoisPatreonDisponibles() {
  const maintenant = new Date();
  const moisCourant = maintenant.getMonth(); // 0-indexed
  const anneeCourante = maintenant.getFullYear();
  if (anneeCourante < 2026) return [];
  if (anneeCourante > 2026) return MOIS_FR.map(m => `Patreon - ${m} 2026`);
  return MOIS_FR.slice(0, moisCourant + 1).map(m => `Patreon - ${m} 2026`);
}

// Bandeau promo
const PALIERS_PROMO = [
  { texte: '✦ Dès 3 illustrations : -15%', mention: '(hors livres et recueils)', couleur: '#00d4d4', glow: 'glowPromo0' },
  { texte: '✦ Dès 6 illustrations : -25%', mention: '(hors livres et recueils)', couleur: 'rgba(255,210,80,0.95)', glow: 'glowPromo1' },
  { texte: '✦ Dès 10 illustrations : -35%', mention: '(hors livres et recueils)', couleur: '#ff3eb5', glow: 'glowPromo2' },
  { texte: '✦ Dès 2 livres PDF : -15% sur tes livres ✦', mention: null, couleur: '#b47fff', glow: 'glowPromo3' },
  { texte: '✦ Dès 2 recueils : -20% sur tes recueils ✦', mention: null, couleur: '#00ffcc', glow: 'glowPromo4' },
];

function BandeauPromo() {
  const items = [...PALIERS_PROMO, ...PALIERS_PROMO, ...PALIERS_PROMO];
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '8px 0 0', position: 'relative', zIndex: 40, overflow: 'hidden' }}>
      <div style={{ maxWidth: '860px', width: '92%', background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', backdropFilter: 'blur(8px)', position: 'relative' }}>
        <div style={{ display: 'flex', animation: 'scrollPromo 30s linear infinite', width: 'max-content', alignItems: 'center', height: '36px' }}>
          {items.map((p, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px', whiteSpace: 'nowrap', padding: '0 40px', animation: `${p.glow} 2.5s ease-in-out infinite`, animationDelay: `${(i % 5) * 0.3}s` }}>
              <span style={{ color: p.couleur, fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{p.texte}</span>
              {p.mention && (
                <span style={{ color: p.couleur, fontSize: '9px', fontWeight: 'normal', opacity: 0.75 }}>{p.mention}</span>
              )}
              {!p.mention && ''}
            </span>
          ))}
        </div>
      </div>
    </div>
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

function Catalogue() {
  const navigate = useNavigate();
  const location = useLocation();
  const [illustrations, setIllustrations] = React.useState([]);
  const [collection, setCollection] = React.useState({});
  const [coloriages, setColoriages] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [categorie, setCategorie] = React.useState('Tout');
  const [sousCategorie, setSousCategorie] = React.useState(''); // POINT 10/11
  const [annees, setAnnees] = React.useState([]);
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const [showKawaiiMenu, setShowKawaiiMenu] = React.useState(false);

  const [recherche, setRecherche] = React.useState('');
  const [filtreCollection, setFiltreCollection] = React.useState('tout');
  const [tri, setTri] = React.useState('az');
  const [vueCompacte, setVueCompacte] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [popup, setPopup] = React.useState(null);
  const [popupIndex, setPopupIndex] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [confirmation, setConfirmation] = React.useState(null);
  const [popupColo, setPopupColo] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const PAR_PAGE = 40;

  const moisPatreon = getMoisPatreonDisponibles();
  const { nbArticles, ajouterIllustration, estDansPanier } = usePanier();

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

  // Fermer dropdowns au clic extérieur
  React.useEffect(() => {
    const handler = () => { setShowCategories(false); setShowPatreonMenu(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Pré-filtrer depuis la nav des autres pages
  React.useEffect(() => {
    if (location.state?.categorie) {
      setCategorie(location.state.categorie);
      setSousCategorie(location.state.sousCategorie || '');
      setPage(1);
    } else if (location.state?.sousCategorie) {
      setSousCategorie(location.state.sousCategorie);
      setCategorie('Tout');
      setPage(1);
    }
  }, [location.state]);

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUserId(user.id);
      const { data: profil } = await supabase.from('profils').select('pseudo').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || 'Anonyme');
      const { data: illus } = await supabase
        .from('illustrations')
        .select('id, nom, annee, categorie, sous_categorie, sous_categorie_patreon, sous_categorie_kawaii, visuels, prix, description, tags, livres_ids, recueils_ids')
        .eq('statut', 'published').order('nom');
      const { data: coll } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto').eq('user_id', user.id);
      const { data: colos } = await supabase.from('coloriages').select('illustration_id').eq('user_id', user.id);
      setIllustrations(illus || []);
      const collMap = {};
      (coll || []).forEach(c => { collMap[c.illustration_id] = { j_ai: c.j_ai, je_veux: c.je_veux, j_ai_auto: c.j_ai_auto || false }; });
      setCollection(collMap);
      const coloMap = {};
      (colos || []).forEach(c => { coloMap[c.illustration_id] = true; });
      setColoriages(coloMap);
      setLoading(false);
    };
    charger();
  }, [navigate]);

  const handleToggleJAi = (illuId, e) => {
    e && e.stopPropagation();
    const estCoche = collection[illuId]?.j_ai || false;
    const estAuto = collection[illuId]?.j_ai_auto || false;
    if (estCoche && estAuto) { setConfirmation({ illuId }); return; }
    toggleJAi(illuId);
  };

  const toggleJAi = async (illuId) => {
    const nouveau = !(collection[illuId]?.j_ai || false);
    setCollection(prev => ({ ...prev, [illuId]: { ...prev[illuId], j_ai: nouveau } }));
    await supabase.from('collection').upsert(
      { user_id: userId, illustration_id: illuId, j_ai: nouveau, j_ai_auto: false, je_veux: collection[illuId]?.je_veux || false },
      { onConflict: 'user_id,illustration_id' }
    );
    const illu = illustrations.find(i => i.id === illuId);
    if (illu) {
      const tousItems = [
        ...(illu.livres_ids || []).map(id => ({ id, type: 'livre' })),
        ...(illu.recueils_ids || []).map(id => ({ id, type: 'recueil' })),
      ];
      for (const { id: itemId, type } of tousItems) {
        const champ = type === 'livre' ? 'livres_ids' : 'recueils_ids';
        const { data: illusItem } = await supabase.from('illustrations').select('id').eq('statut', 'published').contains(champ, [itemId]);
        const illuIds = (illusItem || []).map(i => i.id);
        if (illuIds.length === 0) continue;
        const { data: cochees } = await supabase.from('collection').select('illustration_id').eq('user_id', userId).eq('j_ai', true).in('illustration_id', illuIds);
        const nbCoches = (cochees || []).length;
        const { data: existant } = await supabase.from('collection_livres').select('j_ai, je_veux').eq('user_id', userId).eq('item_id', itemId).eq('item_type', type).maybeSingle();
        if (nouveau && nbCoches === illuIds.length && !existant?.j_ai) {
          await supabase.from('collection_livres').upsert({ user_id: userId, item_id: itemId, item_type: type, j_ai: true, je_veux: existant?.je_veux || false }, { onConflict: 'user_id,item_id,item_type' });
        } else if (!nouveau && existant?.j_ai) {
          await supabase.from('collection_livres').upsert({ user_id: userId, item_id: itemId, item_type: type, j_ai: false, je_veux: existant?.je_veux || false }, { onConflict: 'user_id,item_id,item_type' });
        }
      }
    }
  };

  const toggleJeVeux = async (illuId, e) => {
    e && e.stopPropagation();
    const nouveau = !(collection[illuId]?.je_veux || false);
    setCollection(prev => ({ ...prev, [illuId]: { ...prev[illuId], je_veux: nouveau } }));
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, je_veux: nouveau, j_ai: collection[illuId]?.j_ai || false, j_ai_auto: collection[illuId]?.j_ai_auto || false });
  };

  const handleColoUploaded = (illuId) => { setColoriages(prev => ({ ...prev, [illuId]: true })); };
  const toggleAnnee = (a) => { setAnnees(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]); setPage(1); };

  // Sélection catégorie normale
  const selectionnerCategorie = (cat) => {
    setCategorie(cat); setSousCategorie(''); setShowCategories(false); setShowPatreonMenu(false); setPage(1);
  };

  // Sélection mois Patreon (POINT 11)
  const selectionnerPatreon = (mois) => {
    setSousCategorie(mois); setCategorie('Tout'); setShowCategories(false); setShowPatreonMenu(false); setPage(1);
  };

  const selectionnerSousCategorie = (sc) => {
    setCategorie('Kawaii/Chibi'); setSousCategorie(sc); setShowCategories(false); setShowKawaiiMenu(false); setPage(1);
  };

  let illustrationsFiltrees = illustrations.filter(i => {
    const SOUS_CAT_KAWAII = ['Astro', 'Creepy', 'Monsters', 'Princess', 'Divers'];
    if (sousCategorie) {
      if (SOUS_CAT_KAWAII.includes(sousCategorie)) {
        // Filtre sous-catégorie Kawaii/Chibi (sans contrainte sur categorie principale)
        if (i.sous_categorie_kawaii !== sousCategorie) return false;
      } else {
        // Filtre Patreon : chercher dans sous_categorie_patreon
        if (i.sous_categorie_patreon !== sousCategorie) return false;
      }
    } else {
      if (categorie !== 'Tout' && i.categorie !== categorie) return false;
    }
    if (annees.length > 0 && !annees.includes(i.annee)) return false;
    if (recherche && !i.nom.toLowerCase().includes(recherche.toLowerCase())) return false;
    if (filtreCollection === 'jai' && !collection[i.id]?.j_ai) return false;
    if (filtreCollection === 'jeveux' && !collection[i.id]?.je_veux) return false;
    if (filtreCollection === 'japas' && collection[i.id]?.j_ai) return false;
    if (filtreCollection === 'colorie' && !coloriages[i.id]) return false;
    return true;
  });

  illustrationsFiltrees = [...illustrationsFiltrees].sort((a, b) => {
    if (tri === 'za') return b.nom.localeCompare(a.nom, 'fr');
    if (tri === 'recent') return (b.annee || 0) - (a.annee || 0);
    return a.nom.localeCompare(b.nom, 'fr');
  });

  const total = illustrationsFiltrees.length;
  const TAILLE_VIGNETTE = vueCompacte ? 100 : 150;
  const illustrationsPage = illustrationsFiltrees.slice(0, page * PAR_PAGE);

  const ouvrirPopup = (illu, index) => { setPopup(illu); setPopupIndex(index); };
  const popupSuivant = () => { const next = (popupIndex + 1) % illustrationsFiltrees.length; setPopup(illustrationsFiltrees[next]); setPopupIndex(next); };
  const popupPrecedent = () => { const prev = (popupIndex - 1 + illustrationsFiltrees.length) % illustrationsFiltrees.length; setPopup(illustrationsFiltrees[prev]); setPopupIndex(prev); };

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;

  const btnFiltreStyle = (actif) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', transition: 'all .2s',
    background: actif ? 'rgba(0,212,212,0.2)' : 'transparent',
    border: actif ? '1px solid #00d4d4' : '1px solid rgba(255,255,255,0.2)',
    color: actif ? '#00d4d4' : 'rgba(255,255,255,0.5)',
  });

  const btnTriStyle = (actif) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', transition: 'all .2s',
    background: actif ? 'rgba(255,210,80,0.15)' : 'transparent',
    border: actif ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)',
    color: actif ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.5)',
  });

  const encartStyle = {
    background: 'rgba(0,0,0,0.82)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '16px',
    padding: '12px 16px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
    gap: '8px', alignSelf: 'stretch', justifyContent: 'center',
  };

  // Label affiché dans le compteur
  const labelFiltre = sousCategorie ? ` · ${sousCategorie}` : (categorie !== 'Tout' ? ` · ${categorie}` : '');

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "var(--font-texte)", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes scrollPromo { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes glowPromo0 { 0%, 100% { text-shadow: 0 0 4px rgba(0,212,212,0.3); } 50% { text-shadow: 0 0 12px rgba(0,212,212,0.9), 0 0 20px rgba(0,212,212,0.5); } }
        @keyframes glowPromo1 { 0%, 100% { text-shadow: 0 0 4px rgba(255,210,80,0.3); } 50% { text-shadow: 0 0 12px rgba(255,210,80,0.9), 0 0 20px rgba(255,210,80,0.5); } }
        @keyframes glowPromo2 { 0%, 100% { text-shadow: 0 0 4px rgba(255,62,181,0.3); } 50% { text-shadow: 0 0 12px rgba(255,62,181,0.9), 0 0 20px rgba(255,62,181,0.5); } }
        @keyframes glowPromo3 { 0%, 100% { text-shadow: 0 0 4px rgba(180,127,255,0.3); } 50% { text-shadow: 0 0 12px rgba(180,127,255,0.9), 0 0 20px rgba(180,127,255,0.5); } }
        @keyframes glowPromo4 { 0%, 100% { text-shadow: 0 0 4px rgba(0,255,204,0.3); } 50% { text-shadow: 0 0 12px rgba(0,255,204,0.9), 0 0 20px rgba(0,255,204,0.5); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .barre-left:hover, .barre-right:hover { animation-play-state: paused; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        .teoart-card::before {
          content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.02) 10%, rgba(255,225,110,0.07) 25%, rgba(255,235,150,0.12) 40%, rgba(255,245,170,0.08) 50%, rgba(255,235,140,0.11) 62%, rgba(255,220,100,0.06) 75%, rgba(255,210,80,0.02) 88%, transparent 100%);
          transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen;
        }
        .teoart-card.shining::before { animation: shine 1.0s ease-in-out forwards; }
        @keyframes shine { 0% { left: -150%; } 100% { left: 220%; } }
        .teoart-card:hover { border-color: rgba(255,210,80,0.5) !important; box-shadow: 0 4px 8px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255,210,80,0.15) !important; }
        .dropdown-cat { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 100; min-width: 220px; }
        .dropdown-patreon { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid rgba(255,210,80,0.4); border-radius: 12px; padding: 8px; z-index: 100; min-width: 200px; }
        .dropdown-item { padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; text-align: left; display: block; width: 100%; background: none; border: none; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .dropdown-item.actif { color: #00d4d4; font-weight: bold; }
        .dropdown-item-patreon { padding: 8px 14px; color: rgba(255,210,80,0.8); font-size: 13px; cursor: pointer; border-radius: 6px; text-align: left; display: block; width: 100%; background: none; border: none; }
        .dropdown-item-patreon:hover { background: rgba(255,210,80,0.1); color: rgba(255,210,80,1); }
        .dropdown-item-patreon.actif { color: rgba(255,210,80,1); font-weight: bold; }
        .dropdown-titre-patreon { padding: 6px 14px 4px; color: rgba(255,210,80,0.5); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .btn-annee { padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer; transition: all .2s; }
        .btn-annee.actif { background: rgba(0,212,212,0.2); border-color: #00d4d4; color: #00d4d4; }
        .search-input::placeholder { color: rgba(255,255,255,0.4); }
        .search-input:focus { outline: none; border-color: rgba(0,212,212,0.6) !important; }
        @keyframes fadeImg { from { opacity: 0; } to { opacity: 1; } }
        .card-img-fade { animation: fadeImg 0.6s ease; }
        .badge-jai-actif { position: absolute; top: 5px; left: 5px; border-radius: 4px; padding: 2px 5px; font-size: 9px; font-weight: bold; z-index: 20; cursor: pointer; background: #00d4d4; color: #000; }
        .badge-jai-inactif { position: absolute; top: 5px; left: 5px; border-radius: 4px; padding: 2px 5px; font-size: 9px; font-weight: bold; z-index: 20; cursor: pointer; background: rgba(0,0,0,0.55); color: rgba(255,255,255,0.45); border: 1px solid rgba(255,80,80,0.4); }
        .badge-panier { position: absolute; bottom: 8px; right: 8px; z-index: 20; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; background: #ff3eb5; display: flex; align-items: center; justify-content: center; transition: transform .2s; box-shadow: 0 3px 10px rgba(255,62,181,0.65); }
        .badge-panier:hover { transform: scale(1.12); }
        .badge-palette { position: absolute; bottom: 36px; left: 6px; z-index: 20; cursor: pointer; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all .2s; }
        .badge-palette.inactif { background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.2); }
        .badge-palette.actif { background: rgba(255,210,80,0.2); border: 1px solid rgba(255,210,80,0.6); }
        .badge-palette:hover { transform: scale(1.2); }
        .nav-arrow { position: fixed; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 20px; transition: background .2s; z-index: 300; }
        .nav-arrow:hover { background: rgba(0,212,212,0.3); }
        @keyframes scrollSim { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .similaires-scroll { animation: scrollSim 45s linear infinite; display: flex; gap: 8px; width: max-content; }
        .similaires-scroll:hover { animation-play-state: paused; }
        .visuel-zoom { cursor: zoom-in; transition: opacity .2s; }
        .visuel-zoom:hover { opacity: 0.9; }
        .btn-vue { width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; font-size: 14px; }
        .miniature-colo { position: relative; }
        .miniature-colo-badge { position: absolute; top: -4px; right: -4px; background: rgba(255,210,80,0.9); border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 8px; z-index: 5; }
        .zoom-social { display: flex; flex-direction: column; gap: 8px; padding: 10px 14px; background: rgba(0,0,0,0.7); border-top: 1px solid rgba(255,255,255,0.08); }
        .zoom-like-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.5); font-size: 12px; transition: color .2s; padding: 0; }
        .zoom-like-btn.actif { color: #ff4d7d; }
        .zoom-like-btn:hover { color: #ff4d7d; }
        .zoom-commentaire-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 6px 10px; color: #fff; font-size: 11px; width: 100%; resize: none; font-family: inherit; }
        .zoom-commentaire-input:focus { outline: none; border-color: rgba(0,212,212,0.4); }
        .zoom-commentaire-input::placeholder { color: rgba(255,255,255,0.3); }
        .zoom-commentaire { display: flex; gap: 6px; align-items: flex-start; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .zoom-commentaire:last-child { border-bottom: none; }
        .shining-logo { position: relative; overflow: hidden; }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
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

      {/* NAVIGATION */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
        <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, overflow: 'visible', flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/accueil' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/accueil')} />
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px', ...(location.pathname === '/livres' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/livres')} />
            {/* POINT 11 : dropdown catégories avec sous-menu Patreon 2026 */}
            <div style={{ position: 'relative', width: `${P}px`, height: `${P}px`, flexShrink: 0, marginTop: isMobile ? '-8px' : '0' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, display: 'block', ...(location.pathname === '/catalogue' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }}
                onClick={e => { e.stopPropagation(); setShowCategories(v => !v); }} />
              {showCategories && (
                <div className="dropdown-cat" onClick={e => e.stopPropagation()}>
                  {CATEGORIES.map(cat => (
                    cat === 'Kawaii/Chibi' ? (
                      <div key={cat}>
                        <button className={`dropdown-item${categorie === cat && !sousCategorie ? ' actif' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', color: '#ff3eb5' }}
                          onClick={() => setShowKawaiiMenu(v => !v)}>
                          <span>{cat}</span>
                          <span style={{ fontSize: '11px', transition: 'transform .2s', transform: showKawaiiMenu ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                        </button>
                        {showKawaiiMenu && (
                          <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,62,181,0.3)', marginLeft: '14px', marginTop: '4px' }}>
                            <button className={`dropdown-item${categorie === 'Kawaii/Chibi' && !sousCategorie ? ' actif' : ''}`} style={{ color: '#ff3eb5' }} onClick={() => { selectionnerCategorie('Kawaii/Chibi'); setShowKawaiiMenu(false); }}>
                              Tout Kawaii/Chibi
                            </button>
                            {['Astro', 'Creepy', 'Monsters', 'Princess', 'Divers'].map(sc => (
                              <button key={sc} className={`dropdown-item${sousCategorie === sc ? ' actif' : ''}`} style={{ color: '#ff3eb5' }}
                                onClick={() => { selectionnerSousCategorie(sc); setShowKawaiiMenu(false); }}>
                                {sc}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                    <button key={cat} className={`dropdown-item${categorie === cat && !sousCategorie ? ' actif' : ''}`}
                      style={cat === 'Tout' ? { fontWeight: 'bold', fontSize: '15px' } : {}}
                      onClick={() => selectionnerCategorie(cat)}>{cat}</button>
                    )
                  ))}
                  <div style={{ height: '1px', background: 'rgba(255,210,80,0.2)', margin: '6px 8px' }} />
                  <button
                    className={`dropdown-item${sousCategorie ? ' actif' : ''}`}
                    style={{ color: sousCategorie ? 'rgba(255,210,80,1)' : 'rgba(255,210,80,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                    onClick={() => setShowPatreonMenu(v => !v)}>
                    <span>⭐ Patreon 2026</span>
                    <span style={{ fontSize: '11px', transition: 'transform .2s', transform: showPatreonMenu ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                  </button>
                  {showPatreonMenu && (
                    <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,210,80,0.2)', marginLeft: '14px', marginTop: '4px' }}>
                      {moisPatreon.map(mois => (
                        <button key={mois} className={`dropdown-item-patreon${sousCategorie === mois ? ' actif' : ''}`}
                          onClick={() => selectionnerPatreon(mois)}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, overflow: 'visible', flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/pensees' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/pensees')} />
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => navigate('/panier')} />
                {nbArticles > 0 && <div style={{ position: 'absolute', top: isMobile ? '12px' : '16px', right: '-4px', background: '#ff3eb5', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000', border: '2px solid #000', zIndex: 5 }}>{nbArticles}</div>}
              </div>
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/mon-compte' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/mon-compte')} />
          </div>
        </div>
      </div>

      {/* RECHERCHE */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 20px 0', position: 'relative', zIndex: 40 }}>
        <input className="search-input" type="text" placeholder="🔍 Rechercher une illustration..."
          value={recherche} onChange={e => { setRecherche(e.target.value); setPage(1); }}
          style={{ width: '300px', maxWidth: '90%', background: 'rgba(30,30,30,0.9)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '24px', padding: '9px 16px', color: '#fff', fontSize: '12px' }} />
      </div>

      {/* POINT 9 : BANDEAU PROMO */}
      <BandeauPromo />

      {/* BARRES + CONTENU */}
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

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '14px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 200}px` }}>

          {/* ENCARTS */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'stretch', justifyContent: 'center', gap: '10px', marginBottom: '12px', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
            {!isMobile && (
              <div style={{ ...encartStyle, padding: '12px 16px', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button style={btnTriStyle(tri === 'az')} onClick={() => { setTri('az'); setPage(1); }}>A→Z</button>
                  <button style={btnTriStyle(tri === 'za')} onClick={() => { setTri('za'); setPage(1); }}>Z→A</button>
                  <button style={btnTriStyle(tri === 'recent')} onClick={() => { setTri('recent'); setPage(1); }}>Récent</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button className="btn-vue" onClick={() => setVueCompacte(false)} style={{ background: !vueCompacte ? 'rgba(255,210,80,0.15)' : 'transparent', border: !vueCompacte ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: !vueCompacte ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.4)' }}>⊞</button>
                  <button className="btn-vue" onClick={() => setVueCompacte(true)} style={{ background: vueCompacte ? 'rgba(255,210,80,0.15)' : 'transparent', border: vueCompacte ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: vueCompacte ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.4)' }}>⊟</button>
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(0,0,0,0.82)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '14px', padding: isMobile ? '10px 12px' : '16px 24px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '10px', justifyContent: 'center', width: isMobile ? '100%' : 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '6px' : '8px', flexWrap: 'wrap' }}>
                {ANNEES.map(a => <button key={a} className={`btn-annee${annees.includes(a) ? ' actif' : ''}`} onClick={() => toggleAnnee(a)} style={{ fontSize: isMobile ? '11px' : '12px', padding: isMobile ? '3px 8px' : '4px 12px' }}>{a}</button>)}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textAlign: 'center' }}>
                {total} illustration{total > 1 ? 's' : ''}
                {labelFiltre}
                {annees.length > 0 ? ` · ${annees.join(', ')}` : ''}
                {recherche ? ` · "${recherche}"` : ''}
              </p>
              {/* Indicateur filtre Patreon actif */}
              {sousCategorie && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'rgba(255,210,80,0.9)', fontSize: '11px', fontWeight: 'bold' }}>⭐ {sousCategorie}</span>
                  <button onClick={() => { setSousCategorie(''); setPage(1); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>✕</button>
                </div>
              )}
            </div>

            {!isMobile && (
              <div style={{ ...encartStyle, padding: '12px 16px', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button style={btnFiltreStyle(filtreCollection === 'tout')} onClick={() => { setFiltreCollection('tout'); setPage(1); }}>Tout</button>
                  <button style={btnFiltreStyle(filtreCollection === 'jai')} onClick={() => { setFiltreCollection('jai'); setPage(1); }}>✓ J'ai</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button style={btnFiltreStyle(filtreCollection === 'jeveux')} onClick={() => { setFiltreCollection('jeveux'); setPage(1); }}>♡ Je veux</button>
                  <button style={btnFiltreStyle(filtreCollection === 'japas')} onClick={() => { setFiltreCollection('japas'); setPage(1); }}>✕ J'ai pas</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button style={btnFiltreStyle(filtreCollection === 'colorie')} onClick={() => { setFiltreCollection('colorie'); setPage(1); }}>🎨 Colorié</button>
                </div>
              </div>
            )}

            {isMobile && (
              <>
                <div style={{ ...encartStyle, padding: '8px 10px', gap: '6px', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => { setTri('az'); setPage(1); }} style={{ ...btnTriStyle(tri === 'az'), padding: '3px 7px', fontSize: '10px' }}>A→Z</button>
                    <button onClick={() => { setTri('za'); setPage(1); }} style={{ ...btnTriStyle(tri === 'za'), padding: '3px 7px', fontSize: '10px' }}>Z→A</button>
                    <button onClick={() => { setTri('recent'); setPage(1); }} style={{ ...btnTriStyle(tri === 'recent'), padding: '3px 7px', fontSize: '10px' }}>🕐</button>
                    <button onClick={() => setVueCompacte(false)} style={{ padding: '3px 6px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', background: !vueCompacte ? 'rgba(255,210,80,0.15)' : 'transparent', border: !vueCompacte ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: !vueCompacte ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.4)' }}>⊞</button>
                    <button onClick={() => setVueCompacte(true)} style={{ padding: '3px 6px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', background: vueCompacte ? 'rgba(255,210,80,0.15)' : 'transparent', border: vueCompacte ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: vueCompacte ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.4)' }}>⊟</button>
                  </div>
                </div>
                <div style={{ ...encartStyle, padding: '8px 10px', gap: '6px', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => { setFiltreCollection('tout'); setPage(1); }} style={{ padding: '3px 7px', borderRadius: '20px', fontSize: '10px', cursor: 'pointer', background: filtreCollection === 'tout' ? 'rgba(0,212,212,0.2)' : 'transparent', border: filtreCollection === 'tout' ? '1px solid #00d4d4' : '1px solid rgba(255,255,255,0.2)', color: filtreCollection === 'tout' ? '#00d4d4' : 'rgba(255,255,255,0.5)' }}>✦</button>
                    <button onClick={() => { setFiltreCollection('jai'); setPage(1); }} style={{ padding: '3px 7px', borderRadius: '20px', fontSize: '10px', cursor: 'pointer', background: filtreCollection === 'jai' ? 'rgba(0,212,212,0.2)' : 'transparent', border: filtreCollection === 'jai' ? '1px solid #00d4d4' : '1px solid rgba(255,255,255,0.2)', color: filtreCollection === 'jai' ? '#00d4d4' : 'rgba(255,255,255,0.5)' }}>✓</button>
                    <button onClick={() => { setFiltreCollection('japas'); setPage(1); }} style={{ padding: '3px 7px', borderRadius: '20px', fontSize: '10px', cursor: 'pointer', background: filtreCollection === 'japas' ? 'rgba(0,212,212,0.2)' : 'transparent', border: filtreCollection === 'japas' ? '1px solid #00d4d4' : '1px solid rgba(255,255,255,0.2)', color: filtreCollection === 'japas' ? '#00d4d4' : 'rgba(255,255,255,0.5)' }}>✕</button>
                    <button onClick={() => { setFiltreCollection('jeveux'); setPage(1); }} style={{ padding: '3px 7px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: filtreCollection === 'jeveux' ? 'rgba(255,77,125,0.2)' : 'transparent', border: filtreCollection === 'jeveux' ? '1px solid rgba(255,77,125,0.5)' : '1px solid rgba(255,255,255,0.2)', color: filtreCollection === 'jeveux' ? '#ff4d7d' : 'rgba(255,255,255,0.5)' }}>♡</button>
                    <button onClick={() => { setFiltreCollection('colorie'); setPage(1); }} style={{ padding: '3px 7px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: filtreCollection === 'colorie' ? 'rgba(255,210,80,0.2)' : 'transparent', border: filtreCollection === 'colorie' ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: filtreCollection === 'colorie' ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.5)' }}>🎨</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* GRILLE */}
          {loading ? <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p> : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: vueCompacte ? '8px' : '14px', justifyContent: 'center', maxWidth: '1100px', margin: '0 auto' }}>
                {illustrationsPage.map((illu, idx) => (
                  <IlluCard key={illu.id} illu={illu}
                    urlPresentation={getVisuelPresentation(illu.visuels)}
                    visuelsOrdonnes={getVisuelsOrdonnes(illu.visuels)}
                    jAi={collection[illu.id]?.j_ai || false}
                    jeVeux={collection[illu.id]?.je_veux || false}
                    aColorié={coloriages[illu.id] || false}
                    taille={TAILLE_VIGNETTE}
                    onToggleJAi={(e) => handleToggleJAi(illu.id, e)}
                    onToggleJeVeux={(e) => toggleJeVeux(illu.id, e)}
                    onClickPopup={() => ouvrirPopup(illu, idx)}
                    onClickPalette={(e) => { e.stopPropagation(); setPopupColo(illu); }}
                    dansPanier={illu.prix ? estDansPanier('illustration', illu.id) : false}
                    onAjouterPanier={illu.prix ? () => {
                      const imageUrl = getVisuelPresentation(illu.visuels);
                      ajouterIllustration({ ...illu, image: imageUrl });
                    } : null}
                  />
                ))}
              </div>
              {illustrationsPage.length < total && (
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                  <button onClick={() => setPage(p => p + 1)}
                    style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.4)', borderRadius: '8px', padding: '12px 40px', color: '#00d4d4', fontSize: '14px', cursor: 'pointer' }}>
                    Charger plus ({total - illustrationsPage.length} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* BANNIÈRE BAS */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

      <BandeLegale />

      {popup && (
        <PopupFicheIllu
          illu={popup} illustrations={illustrations}
          jAi={collection[popup.id]?.j_ai || false}
          jeVeux={collection[popup.id]?.je_veux || false}
          aColorié={coloriages[popup.id] || false}
          onToggleJAi={(e) => handleToggleJAi(popup.id, e)}
          onToggleJeVeux={(e) => toggleJeVeux(popup.id, e)}
          onClose={() => setPopup(null)}
          onOpenSimilaire={(illu) => setPopup(illu)}
          onSuivant={popupSuivant}
          onPrecedent={popupPrecedent}
          userPseudo={userPseudo}
          userId={userId}
          onColoUploaded={() => handleColoUploaded(popup.id)}
          onOuvrirLivre={(item) => { navigate('/livres', { state: { ouvrirItem: item } }); }}
          onFiltrerPatreon={(mois) => { setPopup(null); selectionnerPatreon(mois); }}
        />
      )}

      {popupColo && (
        <PopupColoVignette illu={popupColo} userId={userId} userPseudo={userPseudo}
          onClose={() => setPopupColo(null)}
          onUploaded={() => { handleColoUploaded(popupColo.id); setPopupColo(null); }} />
      )}

      {confirmation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,210,80,0.4)', borderRadius: '16px', padding: '28px 32px', maxWidth: '420px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>🤔</p>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Attends, t'es sûr·e ?</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.8', marginBottom: '24px' }}>
              Cette illustration fait partie d'un livre ou recueil que tu as sélectionné lors de ta première visite.<br /><br />
              Tu veux vraiment la retirer de ta collection ? Elle ne disparaîtra pas dans un trou noir, mais quand même... c'est du travail de Kevin ! 😅
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmation(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>Non, je la garde !</button>
              <button onClick={() => { toggleJAi(confirmation.illuId); setConfirmation(null); }} style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 20px', color: '#ff8080', cursor: 'pointer', fontSize: '13px' }}>Oui, je décoche</button>
            </div>
          </div>
        </div>
      )}
      <OngletsLateraux userId={userId} onOuvrirFiche={(illu) => { setPopup(illu); setPopupIndex(0); }} />
    </div>
  );
}

function IlluCard({ illu, urlPresentation, visuelsOrdonnes, jAi, jeVeux, aColorié, taille, onToggleJAi, onToggleJeVeux, onClickPopup, onClickPalette, onAjouterPanier, dansPanier = false }) {
  const wrapRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const [visuelIndex, setVisuelIndex] = React.useState(0);
  const [fadeKey, setFadeKey] = React.useState(0);
  const intervalRef = React.useRef(null);

  const urlsVisuels = visuelsOrdonnes.map(v => cheminVersUrl(v)).filter(Boolean);
  const urlActuelle = urlsVisuels.length > 0 ? urlsVisuels[visuelIndex] : urlPresentation;

  const handleMouseEnter = () => {
    const el = cardRef.current;
    el.classList.remove('shining'); void el.offsetWidth; el.classList.add('shining');
    if (urlsVisuels.length > 1) {
      intervalRef.current = setInterval(() => {
        setVisuelIndex(prev => { const next = (prev + 1) % urlsVisuels.length; setFadeKey(k => k + 1); return next; });
      }, 2500);
    }
  };
  const handleMouseLeave = () => {
    const el = cardRef.current; const wrap = wrapRef.current;
    el.style.transform = ''; if (wrap) wrap.style.transform = '';
    el.classList.remove('shining');
    clearInterval(intervalRef.current);
    setVisuelIndex(0); setFadeKey(k => k + 1);
  };
  const handleMouseMove = (e) => {
    const el = cardRef.current; const wrap = wrapRef.current;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    el.style.transform = `rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.04)`;
    if (wrap) wrap.style.transform = 'perspective(800px)';
  };
  React.useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div ref={wrapRef} style={{ perspective: '800px', flexShrink: 0 }}>
      <div ref={cardRef} className="teoart-card"
        onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClickPopup}
        style={{ width: `${taille}px`, cursor: 'pointer', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#111', overflow: 'hidden', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.6)', willChange: 'transform' }}>
        {urlActuelle
          ? <img key={fadeKey} src={urlActuelle} alt={illu.nom} className="card-img-fade" style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />}
        <div className={jAi ? 'badge-jai-actif' : 'badge-jai-inactif'} onClick={onToggleJAi}>{jAi ? "✓ J'ai" : "✕ J'ai"}</div>
        <div onClick={onToggleJeVeux} style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 20, cursor: 'pointer', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            {jeVeux ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
              : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />}
          </svg>
        </div>
        <div className={`badge-palette ${aColorié ? 'actif' : 'inactif'}`} onClick={onClickPalette} title="Partager mon coloriage">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            {aColorié ? (<g><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.52-.2-1-.52-1.36-.32-.34-.52-.82-.52-1.32 0-1.1.9-2 2-2h2.36c3.12 0 5.68-2.56 5.68-5.68C22 6.12 17.52 2 12 2z" fill="rgba(255,210,80,0.8)" stroke="rgba(255,210,80,1)" strokeWidth="0.5"/><circle cx="6.5" cy="11.5" r="1.5" fill="#ff4d7d"/><circle cx="9.5" cy="7.5" r="1.5" fill="#00d4d4"/><circle cx="14.5" cy="7.5" r="1.5" fill="#ff7043"/><circle cx="17.5" cy="11.5" r="1.5" fill="#66bb6a"/></g>)
              : (<g><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.52-.2-1-.52-1.36-.32-.34-.52-.82-.52-1.32 0-1.1.9-2 2-2h2.36c3.12 0 5.68-2.56 5.68-5.68C22 6.12 17.52 2 12 2z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/><circle cx="6.5" cy="11.5" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="9.5" cy="7.5" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="14.5" cy="7.5" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="17.5" cy="11.5" r="1.5" fill="rgba(255,255,255,0.2)"/></g>)}
          </svg>
        </div>
        <div className="badge-panier" onClick={(e) => { e.stopPropagation(); onAjouterPanier && onAjouterPanier(); }} title={dansPanier ? 'Déjà dans le panier' : 'Ajouter au panier'}
          style={dansPanier ? { background: 'rgba(0,212,212,0.25)', border: '2px solid #00d4d4', boxShadow: '0 0 8px rgba(0,212,212,0.4)' } : {}}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={dansPanier ? '#00d4d4' : '#000'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1.4" fill={dansPanier ? '#00d4d4' : '#000'} /><circle cx="19" cy="21" r="1.4" fill={dansPanier ? '#00d4d4' : '#000'} />
            <path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" />
          </svg>
        </div>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.85)' }}>
          <p style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
          <p style={{ color: '#00d4d4', fontSize: '11px' }}>{illu.prix ? `${illu.prix} €` : ''}</p>
        </div>
      </div>
    </div>
  );
}

function PopupColoVignette({ illu, userId, userPseudo, onClose, onUploaded }) {
  const [coloImage, setColoImage] = React.useState(null);
  const [coloDate, setColoDate] = React.useState('');
  const [envoi, setEnvoi] = React.useState(false);
  const [ok, setOk] = React.useState(false);

  const handleUpload = async (avecImage = false) => {
    setEnvoi(true);
    try {
      let imageUrl = null;
      if (avecImage && coloImage) {
        const ext = coloImage.name.split('.').pop();
        const nomFichier = `${userId}_${illu.id}_${Date.now()}.${ext}`;
        const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(coloImage); });
        const response = await fetch('/api/upload-colo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: nomFichier, fileType: coloImage.type, fileBase64: base64 }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        imageUrl = data.url;
      }
      await supabase.from('coloriages').upsert({ user_id: userId, illustration_id: illu.id, image_url: imageUrl, date_coloriage: coloDate || null });
      setOk(true);
      setTimeout(() => { onUploaded(); }, 1200);
    } catch (e) { console.error(e); }
    setEnvoi(false);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(255,210,80,0.3)', borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</p>
        <p style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{illu.nom}</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '16px' }}>Partage ton coloriage !</p>
        {ok ? <p style={{ color: 'rgba(255,210,80,0.9)', fontSize: '13px' }}>🎉 Coloriage partagé ! Merci {userPseudo} !</p> : (
          <>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '12px' }}>Pseudo : <strong style={{ color: '#00d4d4' }}>{userPseudo}</strong></p>
            <input type="file" accept="image/*" onChange={e => setColoImage(e.target.files[0])} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px', display: 'block', width: '100%' }} />
            <input type="date" value={coloDate} onChange={e => setColoDate(e.target.value)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '11px', marginBottom: '14px', width: '100%' }} />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => handleUpload(false)} disabled={envoi} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '11px', cursor: 'pointer', opacity: envoi ? 0.6 : 1 }}>✓ Sans image</button>
              <button onClick={() => handleUpload(true)} disabled={!coloImage || envoi} style={{ flex: 1, background: coloImage ? 'linear-gradient(135deg, rgba(255,210,80,0.8), rgba(255,160,40,0.8))' : 'rgba(255,255,255,0.04)', border: `1px solid ${coloImage ? 'transparent' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '8px 10px', color: coloImage ? '#000' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '11px', cursor: coloImage ? 'pointer' : 'not-allowed', opacity: envoi ? 0.6 : 1 }}>🎨 Avec image</button>
              <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '8px 12px', color: 'rgba(255,100,100,0.7)', fontSize: '11px', cursor: 'pointer' }}>Annuler</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Catalogue;