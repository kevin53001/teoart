import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

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

const CATEGORIES = ['Tout', 'Portrait', 'Kawaii/Chibi', 'Manga', 'Noël', 'Halloween', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Animaux'];
const ANNEES = [2021, 2022, 2023, 2024, 2025, 2026];

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${relatif.split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
}

function extraireColoriste(chemin) {
  if (!chemin) return null;
  const nomFichier = chemin.split('\\').pop().split('/').pop();
  const match = nomFichier.match(/\s*-\s*C\d*\s*-\s*(.+)\.\w+$/i);
  if (match) return match[1].trim();
  return null;
}

function estVisuelCChemin(chemin) {
  if (!chemin) return false;
  const nomFichier = chemin.split('\\').pop().split('/').pop();
  return /\s*-\s*C\d*\s*[-.]/.test(nomFichier);
}

function getVisuelsOrdonnes(visuels) {
  if (!visuels) return [];
  const result = [];
  const valeursAjoutees = new Set();
  Object.entries(visuels).forEach(([k, v]) => {
    if (k.toUpperCase() === 'A') return;
    if ((k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation')) && v && !valeursAjoutees.has(v)) {
      result.push(v); valeursAjoutees.add(v);
    }
  });
  ['B', 'b'].forEach(k => {
    if (visuels[k] && !valeursAjoutees.has(visuels[k])) {
      result.push(visuels[k]); valeursAjoutees.add(visuels[k]);
    }
  });
  Object.entries(visuels).forEach(([k, v]) => {
    if (k.toUpperCase() === 'A') return;
    if (/^C\d*$/i.test(k) && v && !valeursAjoutees.has(v)) {
      result.push(v); valeursAjoutees.add(v);
    }
  });
  Object.entries(visuels).forEach(([k, v]) => {
    if (k.toUpperCase() === 'A') return;
    if (v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); }
  });
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

function Catalogue() {
  const navigate = useNavigate();
  const [illustrations, setIllustrations] = React.useState([]);
  const [collection, setCollection] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [categorie, setCategorie] = React.useState('Tout');
  const [annees, setAnnees] = React.useState([]);
  const [showCategories, setShowCategories] = React.useState(false);
  const [recherche, setRecherche] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [popup, setPopup] = React.useState(null);
  const [popupIndex, setPopupIndex] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [confirmation, setConfirmation] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const PAR_PAGE = 40;

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/connexion');
        return;
      }

      setUserId(user.id);
      const { data: profil } = await supabase.from('profils').select('pseudo').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || 'Anonyme');
      const { data: illus } = await supabase
        .from('illustrations')
        .select('id, nom, annee, categorie, visuels, prix, description, tags, livres_ids, recueils_ids')
        .eq('statut', 'published').order('nom');
      const { data: coll } = await supabase
        .from('collection')
        .select('illustration_id, j_ai, je_veux, j_ai_auto')
        .eq('user_id', user.id);
      setIllustrations(illus || []);
      const collMap = {};
      (coll || []).forEach(c => {
        collMap[c.illustration_id] = { j_ai: c.j_ai, je_veux: c.je_veux, j_ai_auto: c.j_ai_auto || false };
      });
      setCollection(collMap);
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
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, j_ai: nouveau, j_ai_auto: false, je_veux: collection[illuId]?.je_veux || false });
  };

  const toggleJeVeux = async (illuId, e) => {
    e && e.stopPropagation();
    const nouveau = !(collection[illuId]?.je_veux || false);
    setCollection(prev => ({ ...prev, [illuId]: { ...prev[illuId], je_veux: nouveau } }));
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, je_veux: nouveau, j_ai: collection[illuId]?.j_ai || false, j_ai_auto: collection[illuId]?.j_ai_auto || false });
  };

  const toggleAnnee = (a) => { setAnnees(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]); setPage(1); };

  const illustrationsFiltrees = illustrations.filter(i => {
    if (categorie !== 'Tout' && i.categorie !== categorie) return false;
    if (annees.length > 0 && !annees.includes(i.annee)) return false;
    if (recherche && !i.nom.toLowerCase().includes(recherche.toLowerCase())) return false;
    return true;
  });

  const total = illustrationsFiltrees.length;
  const illustrationsPage = illustrationsFiltrees.slice(0, page * PAR_PAGE);

  const ouvrirPopup = (illu, index) => { setPopup(illu); setPopupIndex(index); };
  const popupSuivant = () => { const next = (popupIndex + 1) % illustrationsFiltrees.length; setPopup(illustrationsFiltrees[next]); setPopupIndex(next); };
  const popupPrecedent = () => { const prev = (popupIndex - 1 + illustrationsFiltrees.length) % illustrationsFiltrees.length; setPopup(illustrationsFiltrees[prev]); setPopupIndex(prev); };

  // Tailles responsive
  const P = isMobile ? 48 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 2 : 8;
  const MARGIN_NAV = isMobile ? 3 : 12;
  const H_NAV = isMobile ? 80 : 120;

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .barre-left:hover, .barre-right:hover { animation-play-state: paused; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        .teoart-card::before {
          content: ''; position: absolute; top: -20%; left: -150%;
          width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.02) 10%, rgba(255,225,110,0.07) 25%, rgba(255,235,150,0.12) 40%, rgba(255,245,170,0.08) 50%, rgba(255,235,140,0.11) 62%, rgba(255,220,100,0.06) 75%, rgba(255,210,80,0.02) 88%, transparent 100%);
          transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen;
        }
        .teoart-card.shining::before { animation: shine 1.0s ease-in-out forwards; }
        @keyframes shine { 0% { left: -150%; } 100% { left: 220%; } }
        .teoart-card:hover { border-color: rgba(255,210,80,0.5) !important; box-shadow: 0 4px 8px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255,210,80,0.15) !important; }
        .dropdown-cat { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 100; min-width: 200px; }
        .dropdown-item { padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; text-align: left; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .dropdown-item.actif { color: #00d4d4; font-weight: bold; }
        .btn-annee { padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer; transition: all .2s; }
        .btn-annee.actif { background: rgba(0,212,212,0.2); border-color: #00d4d4; color: #00d4d4; }
        .search-input::placeholder { color: rgba(255,255,255,0.4); }
        .search-input:focus { outline: none; border-color: rgba(0,212,212,0.6) !important; }
        @keyframes fadeImg { from { opacity: 0; } to { opacity: 1; } }
        .card-img-fade { animation: fadeImg 0.6s ease; }
        .badge-jai-actif { position: absolute; top: 5px; left: 5px; border-radius: 4px; padding: 2px 5px; font-size: 9px; font-weight: bold; z-index: 20; cursor: pointer; background: #00d4d4; color: #000; }
        .badge-jai-inactif { position: absolute; top: 5px; left: 5px; border-radius: 4px; padding: 2px 5px; font-size: 9px; font-weight: bold; z-index: 20; cursor: pointer; background: rgba(0,0,0,0.55); color: rgba(255,255,255,0.45); border: 1px solid rgba(255,80,80,0.4); }
        .badge-panier { position: absolute; bottom: 26px; right: 4px; z-index: 20; cursor: pointer; width: 24px; height: 24px; border-radius: 50%; background: #ff3eb5; display: flex; align-items: center; justify-content: center; transition: transform .2s; box-shadow: 0 2px 6px rgba(255,62,181,0.5); }
        .badge-panier:hover { transform: scale(1.2); }
        .nav-arrow { position: fixed; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 20px; transition: background .2s; z-index: 300; }
        .nav-arrow:hover { background: rgba(0,212,212,0.3); }
        @keyframes scrollSim { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .similaires-scroll { animation: scrollSim 25s linear infinite; display: flex; gap: 8px; width: max-content; }
        .similaires-scroll:hover { animation-play-state: paused; }
        .visuel-zoom { cursor: zoom-in; transition: opacity .2s; }
        .visuel-zoom:hover { opacity: 0.9; }
      `}</style>

      <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, cursor: 'pointer', fontSize: '22px' }}>🔔</div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* NAVIGATION RESPONSIVE */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginTop: `-${Math.round(L * 0.5)}px`,
        overflow: 'visible'
      }}>
        <div style={{
          maxWidth: BANNER_MAX,
          width: isMobile ? '100%' : '92%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          height: `${H_NAV}px`,
          overflow: 'visible'
        }}>

          {/* GAUCHE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0px' : `${GAP_NAV}px`,
            marginRight: isMobile ? '-5px' : `${MARGIN_NAV}px`,
            transform: isMobile ? 'translateX(8px)' : 'none',
            overflow: 'visible'
          }}>
            {/* Accueil */}
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, flexShrink: 0 }} onClick={() => navigate('/catalogue')} />

            {/* Livres */}
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '14px' : '20px', flexShrink: 0 }} onClick={() => {}} />

            {/* Catégories */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille"
                style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-14px' : '0' }}
                onClick={() => setShowCategories(v => !v)} />
              {showCategories && (
                <div className="dropdown-cat">
                  {CATEGORIES.map(cat => (
                    <div key={cat} className={`dropdown-item${categorie === cat ? ' actif' : ''}`}
                      onClick={() => { setCategorie(cat); setShowCategories(false); setPage(1); }}>{cat}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* LOGO */}
          <img src={`${R2}/site/Logo.png`} alt="logo" style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', zIndex: 10, flexShrink: 0 }} />

          {/* DROITE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0px' : `${GAP_NAV}px`,
            marginLeft: isMobile ? '-5px' : `${MARGIN_NAV}px`,
            transform: isMobile ? 'translateX(-8px)' : 'none',
            overflow: 'visible'
          }}>
            {/* Pensées */}
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-14px' : '0', flexShrink: 0 }} onClick={() => {}} />

            {/* Panier */}
            <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '14px' : '20px', flexShrink: 0 }} onClick={() => {}} />

            {/* Mon Compte */}
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, flexShrink: 0 }} onClick={() => {}} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 20px 0', position: 'relative', zIndex: 40 }}>
        <input className="search-input" type="text" placeholder="🔍 Rechercher une illustration..."
          value={recherche} onChange={e => { setRecherche(e.target.value); setPage(1); }}
          style={{ width: '300px', maxWidth: '90%', background: 'rgba(30,30,30,0.9)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '24px', padding: '9px 16px', color: '#fff', fontSize: '12px' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {BARRES.map((barre, i) => (
              <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'}
                  style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content', opacity: barre.opacite }}>
                  {[...barre.images, ...barre.images].map((img, j) => (
                    <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', display: 'block' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '24px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 200}px` }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(0,0,0,0.82)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '16px', padding: '16px 24px', backdropFilter: 'blur(10px)', display: 'inline-block' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {ANNEES.map(a => <button key={a} className={`btn-annee${annees.includes(a) ? ' actif' : ''}`} onClick={() => toggleAnnee(a)}>{a}</button>)}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', textAlign: 'center' }}>
                {total} illustration{total > 1 ? 's' : ''}
                {categorie !== 'Tout' ? ` · ${categorie}` : ''}
                {annees.length > 0 ? ` · ${annees.join(', ')}` : ''}
                {recherche ? ` · "${recherche}"` : ''}
              </p>
            </div>
          </div>

          {loading ? <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p> : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', maxWidth: '1100px', margin: '0 auto' }}>
                {illustrationsPage.map((illu, idx) => (
                  <IlluCard key={illu.id} illu={illu}
                    urlPresentation={getVisuelPresentation(illu.visuels)}
                    visuelsOrdonnes={getVisuelsOrdonnes(illu.visuels)}
                    jAi={collection[illu.id]?.j_ai || false}
                    jeVeux={collection[illu.id]?.je_veux || false}
                    onToggleJAi={(e) => handleToggleJAi(illu.id, e)}
                    onToggleJeVeux={(e) => toggleJeVeux(illu.id, e)}
                    onClickPopup={() => ouvrirPopup(illu, idx)}
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

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

      {popup && (
        <PopupFiche
          illu={popup} illustrations={illustrations}
          jAi={collection[popup.id]?.j_ai || false}
          jeVeux={collection[popup.id]?.je_veux || false}
          onToggleJAi={(e) => handleToggleJAi(popup.id, e)}
          onToggleJeVeux={(e) => toggleJeVeux(popup.id, e)}
          onClose={() => setPopup(null)}
          onOpenSimilaire={(illu) => setPopup(illu)}
          onSuivant={popupSuivant}
          onPrecedent={popupPrecedent}
          userPseudo={userPseudo}
          userId={userId}
        />
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
              <button onClick={() => setConfirmation(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                Non, je la garde !
              </button>
              <button onClick={() => { toggleJAi(confirmation.illuId); setConfirmation(null); }}
                style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 20px', color: '#ff8080', cursor: 'pointer', fontSize: '13px' }}>
                Oui, je décoche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IlluCard({ illu, urlPresentation, visuelsOrdonnes, jAi, jeVeux, onToggleJAi, onToggleJeVeux, onClickPopup }) {
  const wrapRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const TAILLE = 150;
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
        style={{ width: `${TAILLE}px`, cursor: 'pointer', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#111', overflow: 'hidden', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.6)', willChange: 'transform' }}>

        {urlActuelle
          ? <img key={fadeKey} src={urlActuelle} alt={illu.nom} className="card-img-fade" style={{ width: '100%', height: `${TAILLE}px`, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: `${TAILLE}px`, background: '#111' }} />
        }

        <div className={jAi ? 'badge-jai-actif' : 'badge-jai-inactif'} onClick={onToggleJAi}>
          {jAi ? "✓ J'ai" : "✕ J'ai"}
        </div>

        <div onClick={onToggleJeVeux}
          style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 20, cursor: 'pointer', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            {jeVeux
              ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
              : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            }
          </svg>
        </div>

        <div className="badge-panier" onClick={(e) => e.stopPropagation()} title="Ajouter au panier">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
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

function PopupFiche({ illu, illustrations, jAi, jeVeux, onToggleJAi, onToggleJeVeux, onClose, onOpenSimilaire, onSuivant, onPrecedent, userPseudo, userId }) {
  const visuelsChemins = getVisuelsOrdonnes(illu.visuels);
  const visuels = visuelsChemins.map(v => cheminVersUrl(v)).filter(Boolean);
  const [visuelActif, setVisuelActif] = React.useState(0);
  const [zoomUrl, setZoomUrl] = React.useState(null);
  const [showPartagerColo, setShowPartagerColo] = React.useState(false);
  const [coloImage, setColoImage] = React.useState(null);
  const [coloDate, setColoDate] = React.useState('');
  const [coloEnvoi, setColoEnvoi] = React.useState(false);
  const [coloOk, setColoOk] = React.useState(false);

  React.useEffect(() => { setVisuelActif(0); setShowPartagerColo(false); setColoOk(false); setZoomUrl(null); }, [illu.id]);

  const cheminActif = visuelsChemins[visuelActif];
  const coloriste = estVisuelCChemin(cheminActif) ? extraireColoriste(cheminActif) : null;

  const similaires = React.useMemo(() => {
    if (!illu.tags || illu.tags.length === 0) return [];
    return illustrations
      .filter(i => i.id !== illu.id && i.tags && i.tags.some(t => illu.tags.includes(t)))
      .sort((a, b) => b.tags.filter(t => illu.tags.includes(t)).length - a.tags.filter(t => illu.tags.includes(t)).length)
      .slice(0, 20);
  }, [illu, illustrations]);

  const getVisuelPres = (visuels) => {
    if (!visuels) return null;
    const cle = Object.keys(visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
    if (cle) return cheminVersUrl(visuels[cle]);
    if (visuels['B']) return cheminVersUrl(visuels['B']);
    if (visuels['b']) return cheminVersUrl(visuels['b']);
    return null;
  };

  const formatDescription = (desc) => {
    if (!desc) return null;
    return desc.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
    ));
  };

  const handlePartagerColo = async () => {
    if (!coloImage) return;
    setColoEnvoi(true);
    try {
      const ext = coloImage.name.split('.').pop();
      const nomFichier = `coloriages/${userId}_${illu.id}_${Date.now()}.${ext}`;
      await supabase.storage.from('avatars').upload(nomFichier, coloImage, { upsert: true });
      setColoOk(true);
    } catch (e) {}
    setColoEnvoi(false);
  };

  return (
    <>
      {zoomUrl && (
        <div onClick={() => setZoomUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px' }}>
          <img src={zoomUrl} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} />
          <button onClick={() => setZoomUrl(null)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="nav-arrow" style={{ left: '8px' }} onClick={(e) => { e.stopPropagation(); onPrecedent(); }}>‹</div>
      <div className="nav-arrow" style={{ right: '8px' }} onClick={(e) => { e.stopPropagation(); onSuivant(); }}>›</div>

      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 20px' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', maxWidth: '820px', width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative' }}>

          <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer', zIndex: 10 }}>✕</button>

          <div style={{ padding: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 220px' }}>
              <div style={{ position: 'relative' }}>
                {visuels[visuelActif] && (
                  <img src={visuels[visuelActif]} alt={illu.nom} className="visuel-zoom"
                    onClick={() => setZoomUrl(visuels[visuelActif])}
                    style={{ width: '100%', borderRadius: '10px', display: 'block', marginBottom: '8px' }} />
                )}
                {coloriste && (
                  <div style={{ position: 'absolute', bottom: '12px', right: '6px', background: 'rgba(0,0,0,0.72)', borderRadius: '4px', padding: '2px 7px', fontSize: '9px', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)' }}>
                    Réalisé par {coloriste}
                  </div>
                )}
              </div>
              {visuels.length > 1 && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {visuels.map((url, i) => (
                    <img key={i} src={url} alt="" onClick={() => setVisuelActif(i)}
                      style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', border: `2px solid ${i === visuelActif ? '#00d4d4' : 'transparent'}`, opacity: i === visuelActif ? 1 : 0.4 }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold' }}>{illu.nom}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{illu.categorie} · {illu.annee}</p>
              {illu.prix && <p style={{ color: '#00d4d4', fontSize: '15px', fontWeight: 'bold' }}>{illu.prix} €</p>}

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button onClick={onToggleJAi} style={{ background: jAi ? '#00d4d4' : 'rgba(255,255,255,0.07)', border: jAi ? 'none' : '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 10px', color: jAi ? '#000' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                  {jAi ? "✓ J'ai" : "✕ J'ai"}
                </button>
                <button onClick={onToggleJeVeux} style={{ background: jeVeux ? 'rgba(255,77,125,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${jeVeux ? 'rgba(255,77,125,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" width="11" height="11">
                    {jeVeux ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" /> : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />}
                  </svg>
                  Je veux
                </button>
                <button onClick={() => setShowPartagerColo(v => !v)} style={{ background: showPartagerColo ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${showPartagerColo ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 10px', color: showPartagerColo ? '#00d4d4' : 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer' }}>
                  🎨 Mon colo
                </button>
                <button style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '6px 10px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', cursor: 'pointer' }}>
                  🛒 Panier
                </button>
              </div>

              {showPartagerColo && (
                <div style={{ background: 'rgba(0,212,212,0.05)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {coloOk ? (
                    <p style={{ color: '#00d4d4', fontSize: '12px', textAlign: 'center' }}>🎉 Ton coloriage a été partagé ! Merci {userPseudo} !</p>
                  ) : (
                    <>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Partagé sous le pseudo : <strong style={{ color: '#00d4d4' }}>{userPseudo}</strong></p>
                      <input type="file" accept="image/*" onChange={e => setColoImage(e.target.files[0])}
                        style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer' }} />
                      <input type="date" value={coloDate} onChange={e => setColoDate(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '5px 8px', color: '#fff', fontSize: '11px' }} />
                      <button onClick={handlePartagerColo} disabled={!coloImage || coloEnvoi}
                        style={{ background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '6px', padding: '7px', color: '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', opacity: coloEnvoi ? 0.6 : 1 }}>
                        {coloEnvoi ? 'Envoi...' : 'Partager 🎨'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {illu.description && (
                <div style={{ maxHeight: '160px', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', lineHeight: '1.7' }}>{formatDescription(illu.description)}</p>
                </div>
              )}

              {illu.tags && illu.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {illu.tags.map((tag, i) => (
                    <span key={i} style={{ background: 'rgba(0,212,212,0.07)', border: '1px solid rgba(0,212,212,0.12)', borderRadius: '10px', padding: '1px 6px', color: 'rgba(0,212,212,0.6)', fontSize: '9px' }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {similaires.length > 0 && (
            <div style={{ padding: '0 24px 20px' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Illustrations similaires</p>
              <div style={{ overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '30px', height: '100%', background: 'linear-gradient(to right, #111, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '30px', height: '100%', background: 'linear-gradient(to left, #111, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div className="similaires-scroll">
                  {[...similaires, ...similaires].map((sim, idx) => {
                    const url = getVisuelPres(sim.visuels);
                    return (
                      <div key={idx} onClick={() => onOpenSimilaire(sim)}
                        style={{ flexShrink: 0, width: '80px', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', transition: 'border-color .2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,212,0.35)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                        {url ? <img src={url} alt={sim.nom} style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }} />
                          : <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.02)' }} />}
                        <div style={{ padding: '3px 5px' }}>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sim.nom}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Catalogue;