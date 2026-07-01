import React from 'react';
import OngletsLateraux from './OngletsLateraux';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import GuideFlottant from './GuideFlottant';
import BoutonsFlottants from './BoutonsFlottants';
import BandeLegale from './BandeLegale';
import { usePanier } from './PanierContext';
import PopupFicheIllu from './PopupFicheIllu';
import Cloche from './Cloche';
import Tchat from './Tchat';
import PopupColoVignette from './PopupColoVignette';

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
const SOUS_CAT_KAWAII = ['Astro', 'Creepy', 'Monsters', 'Princess', 'Divers'];
const PATREON_TOUT = '__patreon_tout__';

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
  { texte: '✦ Dès 2 recueils : -10% sur tes recueils ✦', mention: null, couleur: '#00ffcc', glow: 'glowPromo4' },
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
  const [anneeFiltre, setAnneeFiltre] = React.useState(null);
  const [openCapsule, setOpenCapsule] = React.useState(null); // 'annee' | 'kawaii' | 'patreon' | 'categorie' | 'collection' | null
  const [igniteKey, setIgniteKey] = React.useState(null);
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const [showKawaiiMenu, setShowKawaiiMenu] = React.useState(false);

  const [recherche, setRecherche] = React.useState('');
  const [filtreCollection, setFiltreCollection] = React.useState('tout');
  const [filtreNouveautes, setFiltreNouveautes] = React.useState(false);
  const [refDateNouveautes, setRefDateNouveautes] = React.useState(null);
  const [tri, setTri] = React.useState('az');
  const [vueCompacte, setVueCompacte] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [popup, setPopup] = React.useState(null);
  const [popupIndex, setPopupIndex] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [confirmation, setConfirmation] = React.useState(null);
  const [popupColo, setPopupColo] = React.useState(null);
  const [confirmJaiCat, setConfirmJaiCat] = React.useState(null);
  const [dlGratuits, setDlGratuits] = React.useState({}); // { [illu.id]: 'idle'|'loading'|'done' } // illu à ajouter après confirmation
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const PAR_PAGE = 40;

  const moisPatreon = getMoisPatreonDisponibles();
  const { nbArticles, ajouterIllustration, estDansPanier, supprimerArticle } = usePanier();

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
    const handler = () => { setShowCategories(false); setShowPatreonMenu(false); setOpenCapsule(null); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Pré-filtrer depuis la nav des autres pages
  React.useEffect(() => {
    if (location.state?.filtreNouveautes) {
      setFiltreNouveautes(true);
      setPage(1);
    } else if (location.state?.categorie) {
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
      const { data: profil } = await supabase.from('profils').select('pseudo, created_at, dernier_vu_illustrations').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || 'Anonyme');
      const refD = profil?.dernier_vu_illustrations || profil?.created_at;
      if (refD) setRefDateNouveautes(new Date(refD));
      const { data: illus } = await supabase
        .from('illustrations')
        .select('id, nom, annee, categorie, sous_categorie, sous_categorie_patreon, sous_categorie_kawaii, visuels, prix, fichier_pdf, description, tags, livres_ids, recueils_ids, date_publication')
        .eq('statut', 'published').order('nom');
      const { data: coll } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto, j_ai_achete').eq('user_id', user.id);
      const { data: colos } = await supabase.from('coloriages').select('illustration_id').eq('user_id', user.id);
      setIllustrations(illus || []);
      const collMap = {};
      (coll || []).forEach(c => { collMap[c.illustration_id] = { j_ai: c.j_ai, je_veux: c.je_veux, j_ai_auto: c.j_ai_auto || false, j_ai_achete: c.j_ai_achete || false }; });
      setCollection(collMap);
      const coloMap = {};
      (colos || []).forEach(c => { coloMap[c.illustration_id] = true; });
      setColoriages(coloMap);
      setLoading(false);

      // ── Notif nouvelles illustrations ─────────────────────────────────
      const ref = profil?.dernier_vu_illustrations || profil?.created_at;
      if (ref) {
        const refDate = new Date(ref);
        const nouvelles = (illus || []).filter(i => i.date_publication && new Date(i.date_publication) > refDate);
        if (nouvelles.length > 0) {
          await supabase.from('notifications')
            .delete()
            .eq('user_id', user.id)
            .eq('type', 'nouvelle_illustration')
            .eq('lu', false);
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'nouvelle_illustration',
            contenu: { count: nouvelles.length },
            lu: false,
          });
        }
      }
      // ─────────────────────────────────────────────────────────────────
    };
    charger();
  }, [navigate]);

  const handleDlGratuitCat = async (illu) => {
    if (dlGratuits[illu.id] && dlGratuits[illu.id] !== 'idle') return;
    if (!illu.fichier_pdf) return;
    setDlGratuits(prev => ({ ...prev, [illu.id]: 'loading' }));
    try {
      const resp = await fetch('/api/download-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId: illu.id, itemType: 'illustration', fichierPdf: illu.fichier_pdf }),
      });
      const { url, error } = await resp.json();
      if (error) throw new Error(error);
      const a = document.createElement('a');
      a.href = url; a.download = `${illu.nom}.pdf`; a.click();
      setDlGratuits(prev => ({ ...prev, [illu.id]: 'done' }));
      setTimeout(() => setDlGratuits(prev => ({ ...prev, [illu.id]: 'idle' })), 3000);
    } catch { setDlGratuits(prev => ({ ...prev, [illu.id]: 'idle' })); }
  };

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
    if (!userId) return;
    const nouveau = !(collection[illuId]?.je_veux || false);
    setCollection(prev => ({ ...prev, [illuId]: { ...prev[illuId], je_veux: nouveau } }));
    const { error } = await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, je_veux: nouveau, j_ai: collection[illuId]?.j_ai || false, j_ai_auto: collection[illuId]?.j_ai_auto || false }, { onConflict: 'user_id,illustration_id' });
    if (error) console.error('toggleJeVeux error:', error);
  };

  const handleColoUploaded = (illuId) => { setColoriages(prev => ({ ...prev, [illuId]: true })); };
  // Un seul des 5 filtres (Années / Kawaii / Patreon / Catégorie / Collection) actif à la fois :
  // sélectionner l'un éteint et réinitialise automatiquement les autres.
  const resetAutresFiltres = (sauf) => {
    if (sauf !== 'annee') setAnneeFiltre(null);
    if (sauf !== 'collection') setFiltreCollection('tout');
    if (sauf !== 'categorie') { setCategorie('Tout'); setSousCategorie(''); }
  };
  const ignite = (key) => { setIgniteKey(key); setTimeout(() => setIgniteKey(null), 400); };

  // Sélection catégorie normale (utilisée par la nav du haut ET par la capsule "Catégorie")
  const selectionnerCategorie = (cat) => {
    resetAutresFiltres('categorie');
    setCategorie(cat); setSousCategorie(''); setShowCategories(false); setShowPatreonMenu(false); setOpenCapsule(null); setPage(1);
    if (cat !== 'Tout') ignite(cat === 'Kawaii/Chibi' ? 'kawaii' : 'categorie');
  };

  // Sélection mois Patreon (utilisée par la nav du haut ET par la capsule "Patreon 2026")
  const selectionnerPatreon = (mois) => {
    resetAutresFiltres('categorie');
    setSousCategorie(mois); setCategorie('Tout'); setShowCategories(false); setShowPatreonMenu(false); setOpenCapsule(null); setPage(1);
    ignite('patreon');
  };

  // "Tout" Patreon (uniquement depuis la capsule, montre toutes les illus Patreon peu importe le mois)
  const selectionnerPatreonTout = () => {
    resetAutresFiltres('categorie');
    setSousCategorie(PATREON_TOUT); setCategorie('Tout'); setShowCategories(false); setShowPatreonMenu(false); setOpenCapsule(null); setPage(1);
    ignite('patreon');
  };

  const selectionnerSousCategorie = (sc) => {
    resetAutresFiltres('categorie');
    setCategorie('Kawaii/Chibi'); setSousCategorie(sc); setShowCategories(false); setShowKawaiiMenu(false); setOpenCapsule(null); setPage(1);
    ignite('kawaii');
  };

  const choisirAnnee = (a) => {
    resetAutresFiltres('annee');
    setAnneeFiltre(a); setOpenCapsule(null); setPage(1);
    ignite('annee');
  };

  const choisirCollection = (val) => {
    resetAutresFiltres('collection');
    setFiltreCollection(val); setOpenCapsule(null); setPage(1);
    if (val !== 'tout') ignite('collection');
  };

  // Clic sur une capsule allumée → l'éteint. Clic sur une capsule éteinte → ouvre/ferme son menu.
  const toggleCapsule = (key, estAllumee) => {
    if (estAllumee) {
      if (key === 'annee') setAnneeFiltre(null);
      else if (key === 'collection') setFiltreCollection('tout');
      else { setCategorie('Tout'); setSousCategorie(''); }
      setOpenCapsule(null);
    } else {
      setOpenCapsule(prev => prev === key ? null : key);
    }
  };

  let illustrationsFiltrees = illustrations.filter(i => {
    if (sousCategorie === PATREON_TOUT) {
      // Filtre "Tout Patreon" : n'importe quel mois, du moment qu'il y en a un
      if (!i.sous_categorie_patreon) return false;
    } else if (sousCategorie) {
      if (SOUS_CAT_KAWAII.includes(sousCategorie)) {
        // Filtre sous-catégorie Kawaii/Chibi (sans contrainte sur categorie principale)
        if (i.sous_categorie_kawaii !== sousCategorie) return false;
      } else {
        // Filtre Patreon : chercher dans sous_categorie_patreon
        if (i.sous_categorie_patreon !== sousCategorie) return false;
      }
    } else {
      if (categorie === 'Calendrier') {
        if (!i.nom || !i.nom.includes('202') || i.nom.includes('Rose')) return false;
      } else if (categorie === 'FREE') {
        if (parseFloat(i.prix) !== 0) return false;
      } else if (categorie !== 'Tout' && i.categorie !== categorie) return false;
    }
    if (anneeFiltre !== null && i.annee !== anneeFiltre) return false;
    if (recherche) {
      const normaliser = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['']/g, ' ');
      const q = normaliser(recherche);
      const dansNom = normaliser(i.nom).includes(q);
      const dansTags = Array.isArray(i.tags) && i.tags.some(t => normaliser(t).includes(q));
      if (!dansNom && !dansTags) return false;
    }
    if (filtreCollection === 'jai' && !collection[i.id]?.j_ai && !collection[i.id]?.j_ai_auto && !collection[i.id]?.j_ai_achete) return false;
    if (filtreCollection === 'jeveux' && !collection[i.id]?.je_veux) return false;
    if (filtreCollection === 'japas' && collection[i.id]?.j_ai) return false;
    if (filtreCollection === 'colorie' && !coloriages[i.id]) return false;
    if (filtreNouveautes && refDateNouveautes) {
      if (!i.date_publication || new Date(i.date_publication) <= refDateNouveautes) return false;
    }
    return true;
  });

  illustrationsFiltrees = [...illustrationsFiltrees].sort((a, b) => {
    if (tri === 'za') return b.nom.localeCompare(a.nom, 'fr');
    if (tri === 'recent') return (b.annee || 0) - (a.annee || 0);
    if (tri === 'prix_asc') return (parseFloat(a.prix) || 0) - (parseFloat(b.prix) || 0);
    if (tri === 'prix_desc') return (parseFloat(b.prix) || 0) - (parseFloat(a.prix) || 0);
    return a.nom.localeCompare(b.nom, 'fr');
  });

  const total = illustrationsFiltrees.length;
  const nbJai = illustrationsFiltrees.filter(i => collection[i.id]?.j_ai || collection[i.id]?.j_ai_auto || collection[i.id]?.j_ai_achete).length;
  const nbJeVeux = illustrationsFiltrees.filter(i => collection[i.id]?.je_veux).length;
  const nbColorie = illustrationsFiltrees.filter(i => coloriages[i.id]).length;
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

  const triVueBtnStyle = (actif) => ({
    padding: '5px 11px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', transition: 'all .2s',
    background: actif ? 'rgba(255,255,255,0.14)' : 'transparent',
    border: '1px solid rgba(255,255,255,0.18)',
    color: actif ? '#fff' : 'rgba(255,255,255,0.5)',
    fontWeight: actif ? 'bold' : 'normal', whiteSpace: 'nowrap',
  });

  const labelCapsuleStyle = { fontSize: '10px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' };

  // États allumé/éteint des 5 capsules (dérivés directement des filtres réels :
  // ça reste synchro que la sélection vienne de la capsule ou de la nav du haut)
  const anneeOn = anneeFiltre !== null;
  const kawaiiOn = categorie === 'Kawaii/Chibi';
  const patreonOn = categorie === 'Tout' && sousCategorie !== '' && !SOUS_CAT_KAWAII.includes(sousCategorie);
  const categorieOn = categorie !== 'Tout' && categorie !== 'Kawaii/Chibi';
  const collectionOn = filtreCollection !== 'tout';

  const LABELS_COLLECTION = { tout: 'Tout', jai: "J'ai", jeveux: 'Je veux', japas: "J'ai pas", colorie: 'Colorié' };

  const categoriesTrieesAvecSpeciales = [...CATEGORIES.filter(c => c !== 'Tout'), 'Calendrier', 'FREE']
    .sort((a, b) => a.localeCompare(b, 'fr'));

  const capsules = [
    {
      key: 'annee', label: 'Années', color: 'pink', on: anneeOn,
      options: ANNEES.map(a => ({ value: a, label: String(a), active: anneeFiltre === a, onClick: () => choisirAnnee(a) })),
    },
    {
      key: 'kawaii', label: 'Kawaii / Chibi', color: 'gold', on: kawaiiOn,
      options: [
        { value: '__tout__', label: 'Tous Kawaii/Chibi', active: kawaiiOn && !sousCategorie, onClick: () => selectionnerCategorie('Kawaii/Chibi'), separateur: true },
        ...SOUS_CAT_KAWAII.map(sc => ({ value: sc, label: sc, active: sousCategorie === sc, onClick: () => selectionnerSousCategorie(sc) })),
      ],
    },
    {
      key: 'patreon', label: 'Patreon 2026', color: 'cyan', on: patreonOn,
      options: [
        { value: PATREON_TOUT, label: 'Tout', active: sousCategorie === PATREON_TOUT, onClick: () => selectionnerPatreonTout(), separateur: true },
        ...moisPatreon.map(m => ({ value: m, label: m.replace('Patreon - ', ''), active: sousCategorie === m, onClick: () => selectionnerPatreon(m) })),
      ],
    },
    {
      key: 'categorie', label: 'Catégorie', color: 'gold', on: categorieOn,
      options: [
        { value: 'Tout', label: 'Tout', active: categorie === 'Tout', onClick: () => selectionnerCategorie('Tout'), separateur: true },
        ...categoriesTrieesAvecSpeciales.filter(c => c !== 'Kawaii/Chibi').map(c => ({
          value: c, label: c, active: categorie === c, onClick: () => selectionnerCategorie(c),
          style: c === 'FREE' ? { color: '#ffd250', fontWeight: 'bold' } : undefined,
        })),
      ],
    },
    {
      key: 'collection', label: 'Collection', color: 'pink', on: collectionOn,
      options: ['tout', 'jai', 'jeveux', 'japas', 'colorie'].map((v, i) => ({ value: v, label: LABELS_COLLECTION[v], active: filtreCollection === v, onClick: () => choisirCollection(v), separateur: i === 0 })),
    },
  ];

  // Filtre actif affiché sous la rangée de capsules, avec croix pour le retirer
  const filtreActifInfo = anneeOn ? { label: `Année · ${anneeFiltre}`, clear: () => setAnneeFiltre(null) }
    : kawaiiOn ? { label: `Kawaii/Chibi${sousCategorie ? ' · ' + sousCategorie : ''}`, clear: () => { setCategorie('Tout'); setSousCategorie(''); } }
    : patreonOn ? { label: `Patreon 2026 · ${sousCategorie === PATREON_TOUT ? 'Tout' : sousCategorie.replace('Patreon - ', '')}`, clear: () => { setCategorie('Tout'); setSousCategorie(''); } }
    : categorieOn ? { label: categorie, clear: () => setCategorie('Tout') }
    : collectionOn ? { label: LABELS_COLLECTION[filtreCollection], clear: () => setFiltreCollection('tout') }
    : null;

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
        .capsule-pill { width: 84px; height: 24px; border-radius: 999px; cursor: pointer; padding: 0; transition: transform .15s ease, box-shadow .2s ease, background .2s ease; box-shadow: 0 3px 0 rgba(255,255,255,0.22), 0 5px 8px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -3px 3px rgba(0,0,0,0.35); }
        .capsule-pill:active { transform: scale(0.95) translateY(3px) !important; box-shadow: 0 0 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.7), inset 0 2px 4px rgba(0,0,0,0.5) !important; }
        .capsule-pill.capsule-pill-mobile { width: 26px; height: 26px; border-radius: 50%; box-shadow: 0 3px 0 rgba(255,255,255,0.22), 0 5px 8px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -3px 3px rgba(0,0,0,0.35); }
        .capsule-pill.capsule-pill-mobile:active { transform: scale(0.88) translateY(3px) !important; box-shadow: 0 0 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.7), inset 0 2px 4px rgba(0,0,0,0.5) !important; }
        .encart-filtres-premium { background: linear-gradient(180deg, rgba(0,0,0,0.62), rgba(0,0,0,0.8)); border: 1px solid rgba(255,210,80,0.35); border-radius: 18px; padding: 14px 24px; backdrop-filter: blur(14px); box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06); }
        .encart-filtres-premium, .encart-filtres-premium * { font-family: var(--font-texte); }
        .capsule-pill.dim-cyan { background: rgba(0,40,42,0.92); border: 1px solid rgba(0,212,212,0.35); }
        .capsule-pill.dim-pink { background: rgba(48,10,28,0.92); border: 1px solid rgba(255,62,181,0.35); }
        .capsule-pill.dim-gold { background: rgba(45,32,0,0.92); border: 1px solid rgba(255,210,80,0.35); }
        .capsule-pill.on-cyan { background: #00d4d4; border: none; box-shadow: 0 0 10px rgba(0,212,212,0.9), 0 0 22px rgba(0,212,212,0.5); transform: scale(1.12); }
        .capsule-pill.on-pink { background: #ff3eb5; border: none; box-shadow: 0 0 10px rgba(255,62,181,0.9), 0 0 22px rgba(255,62,181,0.5); transform: scale(1.12); }
        .capsule-pill.on-gold { background: rgba(255,210,80,0.95); border: none; box-shadow: 0 0 10px rgba(255,210,80,0.9), 0 0 22px rgba(255,210,80,0.5); transform: scale(1.12); }
        .capsule-pill.ignite { animation: capsuleIgnite .4s ease; }
        @keyframes capsuleIgnite { 0% { filter: brightness(1); } 45% { filter: brightness(1.9); } 100% { filter: brightness(1); } }
        .dropdown-capsule { position: absolute; top: 100%; margin-top: 8px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.96); border-radius: 12px; padding: 6px 0; z-index: 45; min-width: 175px; backdrop-filter: blur(8px); }
        .dropdown-capsule.dropdown-capsule-left { left: 0; transform: none; }
        .dropdown-capsule.dropdown-capsule-right { left: auto; right: 0; transform: none; }
        .dropdown-capsule.c-cyan { border: 1px solid rgba(0,212,212,0.35); }
        .dropdown-capsule.c-pink { border: 1px solid rgba(255,62,181,0.35); }
        .dropdown-capsule.c-gold { border: 1px solid rgba(255,210,80,0.35); }
        .dropdown-capsule-item { display: flex; align-items: center; width: 100%; text-align: left; background: none; border: none; padding: 7px 14px; font-size: 13px; color: rgba(255,255,255,0.65); cursor: pointer; white-space: nowrap; }
        .dropdown-capsule-item:hover { background: rgba(255,255,255,0.07); }
        .dropdown-capsule-item.actif { color: #fff; font-weight: bold; }
        .dropdown-capsule-sep { height: 1px; background: rgba(255,255,255,0.12); margin: 4px 10px; }
        .search-input::placeholder { color: rgba(255,255,255,0.4); }
        .search-input:focus { outline: none; border-color: rgba(0,212,212,0.6) !important; }
        @keyframes fadeImg { from { opacity: 0; } to { opacity: 1; } }
        .card-img-fade { animation: fadeImg 0.6s ease; }
        .badge-jai-actif { position: absolute; top: 5px; left: 5px; border-radius: 4px; padding: 2px 5px; font-size: 9px; font-weight: bold; z-index: 20; cursor: pointer; background: #00d4d4; color: #000; }
        .badge-jai-achete { position: absolute; top: 5px; left: 5px; border-radius: 4px; padding: 2px 5px; font-size: 9px; font-weight: bold; z-index: 20; cursor: pointer; background: #ff3eb5; color: #fff; }
        .badge-jai-inactif { position: absolute; top: 5px; left: 5px; border-radius: 4px; padding: 2px 5px; font-size: 9px; font-weight: bold; z-index: 20; cursor: pointer; background: rgba(0,0,0,0.55); color: rgba(255,255,255,0.45); border: 1px solid rgba(255,80,80,0.4); }
        .badge-panier { position: absolute; bottom: 8px; right: 0; z-index: 20; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; background: #ff3eb5; display: flex; align-items: center; justify-content: center; transition: transform .15s ease, box-shadow .15s ease; box-shadow: 0 3px 0 rgba(255,255,255,0.22), 0 5px 8px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -3px 3px rgba(0,0,0,0.2); }
        .badge-panier:hover { transform: scale(1.12); }
        .badge-panier:active { transform: scale(0.92) translateY(3px) !important; box-shadow: 0 0 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.7), inset 0 2px 4px rgba(0,0,0,0.5) !important; }
        .badge-free { position: absolute; bottom: 8px; right: 0; z-index: 20; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform .15s ease, box-shadow .15s ease; box-shadow: 0 3px 0 rgba(255,255,255,0.22), 0 5px 8px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -3px 3px rgba(0,0,0,0.2); }
        .badge-free:hover { transform: scale(1.12); }
        .badge-free:active { transform: scale(0.92) translateY(3px) !important; box-shadow: 0 0 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.7), inset 0 2px 4px rgba(0,0,0,0.5) !important; }
        .badge-free.idle { cursor: pointer; }
        .badge-free.done { box-shadow: none; cursor: default; }
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
      <Tchat />

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
                  <button className={`dropdown-item${categorie === 'Tout' && !sousCategorie ? ' actif' : ''}`}
                    style={{ fontWeight: 'bold', fontSize: '15px' }}
                    onClick={() => selectionnerCategorie('Tout')}>Tout</button>
                  {categoriesTrieesAvecSpeciales.map(cat => (
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
                            {SOUS_CAT_KAWAII.map(sc => (
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
                        style={cat === 'FREE' ? { color: '#ffd250', fontWeight: 'bold' } : {}}
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

          {/* RANGÉE DE FILTRES dans un encart "carte premium", calé sur la largeur de la grille */}
          {isMobile ? (
            <div className="encart-filtres-premium" style={{ maxWidth: '920px', margin: '0 auto 16px', padding: '12px 36px 10px 14px', position: 'relative', zIndex: 45 }}>

              {/* Ligne 1 : les 5 capsules en pastilles rondes condensées */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                {capsules.map(cap => (
                  <div key={cap.key} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: '0 0 auto' }}>
                    <button
                      aria-label={cap.label}
                      onClick={(e) => { e.stopPropagation(); toggleCapsule(cap.key, cap.on); }}
                      className={`capsule-pill capsule-pill-mobile ${cap.on ? 'on-' : 'dim-'}${cap.color}${igniteKey === cap.key ? ' ignite' : ''}`} />
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', maxWidth: '46px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{cap.label}</span>
                    {openCapsule === cap.key && (
                      <div className={`dropdown-capsule c-${cap.color}${cap.key === 'annee' ? ' dropdown-capsule-left' : ''}${cap.key === 'collection' ? ' dropdown-capsule-right' : ''}`} onClick={e => e.stopPropagation()}>
                        {cap.options.map(opt => (
                          <React.Fragment key={String(opt.value)}>
                            <button className={`dropdown-capsule-item${opt.active ? ' actif' : ''}`} onClick={opt.onClick} style={opt.style}>{opt.label}</button>
                            {opt.separateur && <div className="dropdown-capsule-sep" />}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Ligne 2 : Tri + Prix + Vue, condensés sur une ligne */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginRight: '2px' }}>Tri</span>
                  <button style={{ ...triVueBtnStyle(tri === 'az'), padding: '3px 6px', fontSize: '10px' }} onClick={() => { setTri('az'); setPage(1); }}>A→Z</button>
                  <button style={{ ...triVueBtnStyle(tri === 'za'), padding: '3px 6px', fontSize: '10px' }} onClick={() => { setTri('za'); setPage(1); }}>Z→A</button>
                  <button style={{ ...triVueBtnStyle(tri === 'recent'), padding: '3px 6px', fontSize: '10px' }} onClick={() => { setTri('recent'); setPage(1); }}>Réc.</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginRight: '2px' }}>€</span>
                  <button style={{ ...triVueBtnStyle(tri === 'prix_asc'), padding: '3px 6px', fontSize: '10px' }} onClick={() => { setTri('prix_asc'); setPage(1); }}>↑</button>
                  <button style={{ ...triVueBtnStyle(tri === 'prix_desc'), padding: '3px 6px', fontSize: '10px' }} onClick={() => { setTri('prix_desc'); setPage(1); }}>↓</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button className="btn-vue" onClick={() => setVueCompacte(false)} style={{ padding: '3px 6px', fontSize: '11px', background: !vueCompacte ? 'rgba(255,210,80,0.15)' : 'transparent', border: !vueCompacte ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: !vueCompacte ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.4)' }}>⊞</button>
                  <button className="btn-vue" onClick={() => setVueCompacte(true)} style={{ padding: '3px 6px', fontSize: '11px', background: vueCompacte ? 'rgba(255,210,80,0.15)' : 'transparent', border: vueCompacte ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: vueCompacte ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.4)' }}>⊟</button>
                </div>
              </div>

              {/* Ligne 3 : compteurs + filtre actif + total, condensés */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '8px', flexWrap: 'wrap', lineHeight: 1.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} title="J'ai">
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '13px', height: '13px', borderRadius: '4px', background: '#00d4d4', color: '#000', fontSize: '8px', fontWeight: 'bold' }}>✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px' }}>{nbJai}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} title="Je veux">
                    <svg viewBox="0 0 24 24" width="11" height="11"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" /></svg>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px' }}>{nbJeVeux}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} title="Colorié">
                    <svg viewBox="0 0 24 24" width="12" height="12">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.52-.2-1-.52-1.36-.32-.34-.52-.82-.52-1.32 0-1.1.9-2 2-2h2.36c3.12 0 5.68-2.56 5.68-5.68C22 6.12 17.52 2 12 2z" fill="rgba(255,210,80,0.8)" stroke="rgba(255,210,80,1)" strokeWidth="0.5" />
                      <circle cx="6.5" cy="11.5" r="1.5" fill="#ff4d7d" /><circle cx="9.5" cy="7.5" r="1.5" fill="#00d4d4" /><circle cx="14.5" cy="7.5" r="1.5" fill="#ff7043" /><circle cx="17.5" cy="11.5" r="1.5" fill="#66bb6a" />
                    </svg>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px' }}>{nbColorie}</span>
                  </div>
                </div>
                {(filtreActifInfo || filtreNouveautes) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {filtreActifInfo && (
                      <>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '10px', fontWeight: 'bold' }}>{filtreActifInfo.label}</span>
                        <button onClick={() => { filtreActifInfo.clear(); setPage(1); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px', lineHeight: 1 }}>✕</button>
                      </>
                    )}
                    {filtreNouveautes && (
                      <>
                        <span style={{ color: '#00d4d4', fontSize: '10px', fontWeight: 'bold' }}>Nouveautés</span>
                        <button onClick={() => { setFiltreNouveautes(false); setPage(1); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px', lineHeight: 1 }}>✕</button>
                      </>
                    )}
                  </div>
                )}
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>
                  {total} illu{total > 1 ? 's' : ''}{recherche ? ` · "${recherche}"` : ''}
                </div>
              </div>

            </div>
          ) : (
          <div className="encart-filtres-premium" style={{ maxWidth: '920px', margin: '0 auto 16px', overflowX: 'visible', position: 'relative', zIndex: 45, padding: '8px 24px 8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                <span style={labelCapsuleStyle}>Tri</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button style={triVueBtnStyle(tri === 'az')} onClick={() => { setTri('az'); setPage(1); }}>A→Z</button>
                  <button style={triVueBtnStyle(tri === 'za')} onClick={() => { setTri('za'); setPage(1); }}>Z→A</button>
                  <button style={triVueBtnStyle(tri === 'recent')} onClick={() => { setTri('recent'); setPage(1); }}>Récent</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                {capsules.map(cap => (
                  <div key={cap.key} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <span style={{ ...labelCapsuleStyle, maxWidth: '84px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{cap.label}</span>
                    <button
                      aria-label={cap.label}
                      onClick={(e) => { e.stopPropagation(); toggleCapsule(cap.key, cap.on); }}
                      className={`capsule-pill ${cap.on ? 'on-' : 'dim-'}${cap.color}${igniteKey === cap.key ? ' ignite' : ''}`} />
                    {openCapsule === cap.key && (
                      <div className={`dropdown-capsule c-${cap.color}`} onClick={e => e.stopPropagation()}>
                        {cap.options.map(opt => (
                          <React.Fragment key={String(opt.value)}>
                            <button className={`dropdown-capsule-item${opt.active ? ' actif' : ''}`} onClick={opt.onClick} style={opt.style}>{opt.label}</button>
                            {opt.separateur && <div className="dropdown-capsule-sep" />}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                  <span style={labelCapsuleStyle}>Prix</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button style={triVueBtnStyle(tri === 'prix_asc')} onClick={() => { setTri('prix_asc'); setPage(1); }}>€ ↑</button>
                    <button style={triVueBtnStyle(tri === 'prix_desc')} onClick={() => { setTri('prix_desc'); setPage(1); }}>€ ↓</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                  <span style={labelCapsuleStyle}>Vue</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn-vue" onClick={() => setVueCompacte(false)} style={{ background: !vueCompacte ? 'rgba(255,210,80,0.15)' : 'transparent', border: !vueCompacte ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: !vueCompacte ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.4)' }}>⊞</button>
                    <button className="btn-vue" onClick={() => setVueCompacte(true)} style={{ background: vueCompacte ? 'rgba(255,210,80,0.15)' : 'transparent', border: vueCompacte ? '1px solid rgba(255,210,80,0.5)' : '1px solid rgba(255,255,255,0.2)', color: vueCompacte ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.4)' }}>⊟</button>
                  </div>
                </div>
              </div>

            </div>

            {/* Ligne 2 : compteurs collection à gauche + filtre actif centré + nombre d'illustrations à droite */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px', lineHeight: 1.1 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="J'ai">
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '15px', height: '15px', borderRadius: '4px', background: '#00d4d4', color: '#000', fontSize: '9px', fontWeight: 'bold' }}>✓</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>{nbJai}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Je veux">
                  <svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" /></svg>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>{nbJeVeux}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Colorié">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.52-.2-1-.52-1.36-.32-.34-.52-.82-.52-1.32 0-1.1.9-2 2-2h2.36c3.12 0 5.68-2.56 5.68-5.68C22 6.12 17.52 2 12 2z" fill="rgba(255,210,80,0.8)" stroke="rgba(255,210,80,1)" strokeWidth="0.5" />
                    <circle cx="6.5" cy="11.5" r="1.5" fill="#ff4d7d" /><circle cx="9.5" cy="7.5" r="1.5" fill="#00d4d4" /><circle cx="14.5" cy="7.5" r="1.5" fill="#ff7043" /><circle cx="17.5" cy="11.5" r="1.5" fill="#66bb6a" />
                  </svg>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>{nbColorie}</span>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
                {filtreActifInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 'bold' }}>{filtreActifInfo.label}</span>
                    <button onClick={() => { filtreActifInfo.clear(); setPage(1); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', lineHeight: 1 }}>✕</button>
                  </div>
                )}
                {filtreNouveautes && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#00d4d4', fontSize: '11px', fontWeight: 'bold' }}>Nouveautés</span>
                    <button onClick={() => { setFiltreNouveautes(false); setPage(1); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', lineHeight: 1 }}>✕</button>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                {total} illustration{total > 1 ? 's' : ''}{recherche ? ` · "${recherche}"` : ''}
              </div>
            </div>

          </div>
          )}
          {/* GRILLE */}
          {loading ? <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p> : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: vueCompacte ? '8px' : '14px', justifyContent: 'center', maxWidth: '1100px', margin: '0 auto' }}>
                {illustrationsPage.map((illu, idx) => (
                  <IlluCard key={illu.id} illu={illu}
                    urlPresentation={getVisuelPresentation(illu.visuels)}
                    visuelsOrdonnes={getVisuelsOrdonnes(illu.visuels)}
                    jAi={collection[illu.id]?.j_ai || false}
                    jAiAchete={collection[illu.id]?.j_ai_achete || false}
                    jeVeux={collection[illu.id]?.je_veux || false}
                    aColorié={coloriages[illu.id] || false}
                    taille={TAILLE_VIGNETTE}
                    onToggleJAi={(e) => handleToggleJAi(illu.id, e)}
                    onToggleJeVeux={(e) => toggleJeVeux(illu.id, e)}
                    onClickPopup={() => ouvrirPopup(illu, idx)}
                    onClickPalette={(e) => { e.stopPropagation(); setPopupColo(illu); }}
                    dansPanier={illu.prix && parseFloat(illu.prix) > 0 ? estDansPanier('illustration', illu.id) : false}
                    onAjouterPanier={illu.prix && parseFloat(illu.prix) > 0 ? () => {
                      if (estDansPanier('illustration', illu.id)) { supprimerArticle('illustration', illu.id); return; }
                      if (collection[illu.id]?.j_ai) { setConfirmJaiCat(illu); return; }
                      const imageUrl = getVisuelPresentation(illu.visuels);
                      ajouterIllustration({ ...illu, image: imageUrl });
                    } : null}
                    onTelechargerGratuit={illu.prix !== null && illu.prix !== undefined && parseFloat(illu.prix) === 0 ? () => handleDlGratuitCat(illu) : null}
                    dlGratuitState={dlGratuits[illu.id] || 'idle'}
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

      <GuideFlottant pageKey="catalogue" userId={userId} isMobile={isMobile} />
      <BandeLegale />

      {popup && (
        <PopupFicheIllu
          illu={popup} illustrations={illustrations}
          jAi={collection[popup.id]?.j_ai || false}
          jAiAchete={collection[popup.id]?.j_ai_achete || false}
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

      {confirmJaiCat && (
        <div onClick={() => setConfirmJaiCat(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(255,210,80,0.4)', borderRadius: '16px', padding: '28px 24px', maxWidth: '340px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '32px' }}>👀</p>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>Eh, tu l'as déjà celle-là !</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6 }}>Tu as coché "J'ai" sur cette illustration... Tu collectionnes les doublons maintenant ? C'est pour offrir ?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmJaiCat(null)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}>Oups, annuler</button>
              <button onClick={() => { const imageUrl = getVisuelPresentation(confirmJaiCat.visuels); ajouterIllustration({ ...confirmJaiCat, image: imageUrl }); setConfirmJaiCat(null); }} style={{ flex: 1, background: 'linear-gradient(135deg, #ffd24d, #c48a00)', border: 'none', borderRadius: '10px', padding: '10px', color: '#000', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,210,80,0.35)' }}>Oui, j'assume !</button>
            </div>
          </div>
        </div>
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

function IlluCard({ illu, urlPresentation, visuelsOrdonnes, jAi, jAiAchete = false, jeVeux, aColorié, taille, onToggleJAi, onToggleJeVeux, onClickPopup, onClickPalette, onAjouterPanier, dansPanier = false, onTelechargerGratuit = null, dlGratuitState = 'idle' }) {
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
        <div className={jAiAchete ? 'badge-jai-achete' : jAi ? 'badge-jai-actif' : 'badge-jai-inactif'} onClick={onToggleJAi}>{(jAi || jAiAchete) ? "✓ J'ai" : "✕ J'ai"}</div>
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
        {onTelechargerGratuit ? (
          <div onClick={(e) => { e.stopPropagation(); onTelechargerGratuit(); }}
            title="Télécharger gratuitement"
            className={`badge-free ${dlGratuitState === 'done' ? 'done' : 'idle'}`}
            style={{ background: dlGratuitState === 'done' ? 'rgba(0,212,212,0.25)' : 'linear-gradient(135deg, #00d4d4, #009999)', border: dlGratuitState === 'done' ? '2px solid #00d4d4' : 'none' }}>
            {dlGratuitState === 'loading' ? <span style={{ fontSize: '12px' }}>⏳</span>
              : dlGratuitState === 'done' ? <span style={{ color: '#00d4d4', fontSize: '11px', fontWeight: 'bold' }}>✓</span>
              : <span style={{ color: '#000', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.3px' }}>FREE</span>}
          </div>
        ) : onAjouterPanier ? (
          <div className="badge-panier" onClick={(e) => { e.stopPropagation(); onAjouterPanier && onAjouterPanier(); }} title={dansPanier ? 'Déjà dans le panier' : 'Ajouter au panier'}
            style={dansPanier ? { background: 'rgba(0,212,212,0.25)', border: '2px solid #00d4d4', boxShadow: '0 0 8px rgba(0,212,212,0.4)' } : {}}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={dansPanier ? '#00d4d4' : '#000'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1.4" fill={dansPanier ? '#00d4d4' : '#000'} /><circle cx="19" cy="21" r="1.4" fill={dansPanier ? '#00d4d4' : '#000'} />
              <path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" />
            </svg>
          </div>
        ) : null}
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.85)' }}>
          <p style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
          <p style={{ color: parseFloat(illu.prix) === 0 ? '#00d4d4' : '#00d4d4', fontSize: '11px', fontWeight: parseFloat(illu.prix) === 0 ? 'bold' : 'normal' }}>{parseFloat(illu.prix) === 0 ? 'GRATUIT' : illu.prix ? `${illu.prix} €` : ''}</p>
        </div>
      </div>
    </div>
  );
}


export default Catalogue;