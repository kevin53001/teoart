import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";

const BARRES = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`) },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`) },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`) },
];

const BANNER_MAX = '1200px';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const SPEED = '80s';

const CATEGORIES = ['Tout', 'Portrait', 'Kawaii/Chibi', 'Manga', 'Noël', 'Halloween', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Animaux'];
const ANNEES = [2021, 2022, 2023, 2024, 2025, 2026];

const PASTILLES = [
  { id: 'accueil',     src: `${R2}/site/pastille_accueil.png`,     label: 'Accueil',     side: 'left',  row: 'top' },
  { id: 'livres',      src: `${R2}/site/pastille_livres.png`,      label: 'Livres',      side: 'left',  row: 'bottom' },
  { id: 'categories',  src: `${R2}/site/pastille_categories.png`,  label: 'Catégories',  side: 'left',  row: 'top' },
  { id: 'pensees',     src: `${R2}/site/pastille_pensees.png`,     label: 'Pensées',     side: 'right', row: 'top' },
  { id: 'panier',      src: `${R2}/site/pastille_panier.png`,      label: 'Panier',      side: 'right', row: 'bottom' },
  { id: 'mon_compte',  src: `${R2}/site/pastille_mon_compte.png`,  label: 'Mon Compte',  side: 'right', row: 'top' },
];

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${encodeURIComponent(relatif).replaceAll('%2F', '/')}`;
}

function Catalogue() {
  const navigate = useNavigate();
  const [illustrations, setIllustrations] = React.useState([]);
  const [collection, setCollection] = React.useState(new Set());
  const [loading, setLoading] = React.useState(true);
  const [categorie, setCategorie] = React.useState('Tout');
  const [annees, setAnnees] = React.useState([]);
  const [showCategories, setShowCategories] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const PAR_PAGE = 40;

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: illus } = await supabase
        .from('illustrations')
        .select('id, nom, annee, categorie, visuels, prix')
        .eq('statut', 'published')
        .order('nom');

      const { data: coll } = await supabase
        .from('collection')
        .select('illustration_id')
        .eq('user_id', user.id)
        .eq('j_ai', true);

      setIllustrations(illus || []);
      setCollection(new Set((coll || []).map(c => c.illustration_id)));
      setLoading(false);
    };
    charger();
  }, []);

  const toggleAnnee = (a) => {
    setAnnees(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
    setPage(1);
  };

  const illustrationsFiltrees = illustrations.filter(i => {
    if (categorie !== 'Tout' && i.categorie !== categorie) return false;
    if (annees.length > 0 && !annees.includes(i.annee)) return false;
    return true;
  });

  const total = illustrationsFiltrees.length;
  const illustrationsPage = illustrationsFiltrees.slice(0, page * PAR_PAGE);

  const getVisuelB = (visuels) => {
    if (!visuels) return null;
    const url = visuels.B || visuels.b || visuels.presentation || null;
    return cheminVersUrl(url);
  };

  const handlePastille = (id) => {
    if (id === 'accueil') navigate('/catalogue');
    // autres routes à ajouter
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .barre-left:hover, .barre-right:hover { animation-play-state: paused; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        .teoart-card::before {
          content: '';
          position: absolute;
          top: -20%; left: -150%;
          width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.02) 10%, rgba(255,225,110,0.07) 25%, rgba(255,235,150,0.12) 40%, rgba(255,245,170,0.08) 50%, rgba(255,235,140,0.11) 62%, rgba(255,220,100,0.06) 75%, rgba(255,210,80,0.02) 88%, transparent 100%);
          transform: skewX(-28deg);
          z-index: 10; pointer-events: none; mix-blend-mode: screen;
        }
        .teoart-card.shining::before { animation: shine 1.0s ease-in-out forwards; }
        @keyframes shine { 0% { left: -150%; opacity: 1; } 100% { left: 220%; opacity: 1; } }
        .teoart-card:hover {
          border-color: rgba(255,210,80,0.5) !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255,210,80,0.15) !important;
        }
        .dropdown-cat { position: absolute; top: '100%'; left: 0; background: rgba(0,0,0,0.95); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 100; min-width: 220px; }
        .dropdown-item { padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; text-align: left; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .dropdown-item.actif { color: #00d4d4; font-weight: bold; }
        .btn-annee { padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer; transition: all .2s; }
        .btn-annee.actif { background: rgba(0,212,212,0.2); border-color: #00d4d4; color: #00d4d4; }
      `}</style>

      {/* CLOCHE */}
      <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, cursor: 'pointer', fontSize: '22px' }}>
        🔔
      </div>

      {/* BANNIÈRE HAUT */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* BARRE NAVIGATION FIXE */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        width: '100%', display: 'flex', justifyContent: 'center',
        padding: '0',
        marginTop: '-60px',
      }}>
        <div style={{ maxWidth: BANNER_MAX, width: '92%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative', height: '120px' }}>

          {/* GAUCHE */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginRight: '12px' }}>
            {/* Accueil - haut */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille"
                style={{ width: '80px', height: '80px' }} onClick={() => navigate('/catalogue')} />
            </div>
            {/* Livres - bas (décalé) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '-20px' }}>
              <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille"
                style={{ width: '80px', height: '80px' }} onClick={() => {}} />
            </div>
            {/* Catégories - haut */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille"
                style={{ width: '80px', height: '80px' }} onClick={() => setShowCategories(v => !v)} />
              {showCategories && (
                <div className="dropdown-cat" style={{ position: 'absolute', top: '85px', left: '50%', transform: 'translateX(-50%)' }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat} className={`dropdown-item${categorie === cat ? ' actif' : ''}`}
                      onClick={() => { setCategorie(cat); setShowCategories(false); setPage(1); }}>
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* LOGO */}
          <img src={`${R2}/site/Logo.png`} alt="logo" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #000', boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', zIndex: 10 }} />

          {/* DROITE */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginLeft: '12px' }}>
            {/* Pensées - haut */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille"
                style={{ width: '80px', height: '80px' }} onClick={() => {}} />
            </div>
            {/* Panier - bas (décalé) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '-20px' }}>
              <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille"
                style={{ width: '80px', height: '80px' }} onClick={() => {}} />
            </div>
            {/* Mon Compte - haut */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille"
                style={{ width: '80px', height: '80px' }} onClick={() => {}} />
            </div>
          </div>
        </div>
      </div>

      {/* ZONE BARRES + CONTENU */}
      <div style={{ position: 'relative', width: '100%', marginTop: '20px' }}>

        {/* BARRES */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {BARRES.map((barre, i) => (
            <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content' }}>
                {[...barre.images, ...barre.images].map((img, j) => (
                  <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', opacity: 0.5, display: 'block' }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CONTENU PAR DESSUS */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', minHeight: '100%', zIndex: 10, padding: '20px' }}>

          {/* FILTRES ANNEES */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {ANNEES.map(a => (
              <button key={a} className={`btn-annee${annees.includes(a) ? ' actif' : ''}`} onClick={() => toggleAnnee(a)}>
                {a}
              </button>
            ))}
          </div>

          {/* COMPTEUR */}
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>
            {total} illustration{total > 1 ? 's' : ''}
            {categorie !== 'Tout' ? ` · ${categorie}` : ''}
            {annees.length > 0 ? ` · ${annees.join(', ')}` : ''}
          </p>

          {/* GRILLE */}
          {loading ? (
            <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', maxWidth: '1100px', margin: '0 auto' }}>
                {illustrationsPage.map(illu => {
                  const url = getVisuelB(illu.visuels);
                  const jAi = collection.has(illu.id);
                  return (
                    <IlluCard key={illu.id} illu={illu} url={url} jAi={jAi} />
                  );
                })}
              </div>

              {/* CHARGER PLUS */}
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
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2, marginTop: `${BARRES.length * (IMG_H + GAP)}px` }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

    </div>
  );
}

function IlluCard({ illu, url, jAi }) {
  const wrapRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const TAILLE = 150;

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    const wrap = wrapRef.current;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.04)`;
    if (wrap) wrap.style.transform = 'perspective(800px)';
  };

  const handleMouseEnter = () => {
    const el = cardRef.current;
    el.classList.remove('shining');
    void el.offsetWidth;
    el.classList.add('shining');
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    const wrap = wrapRef.current;
    el.style.transform = '';
    if (wrap) wrap.style.transform = '';
    el.classList.remove('shining');
  };

  return (
    <div ref={wrapRef} style={{ perspective: '800px', flexShrink: 0 }}>
      <div
        ref={cardRef}
        className="teoart-card"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: `${TAILLE}px`,
          cursor: 'pointer',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#111',
          overflow: 'hidden',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease, box-shadow 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.6)',
          willChange: 'transform',
        }}>

        {url
          ? <img src={url} alt={illu.nom} style={{ width: '100%', height: `${TAILLE}px`, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: `${TAILLE}px`, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px' }}>Pas d'image</span>
            </div>
        }

        {/* Badge J'ai */}
        {jAi && (
          <div style={{ position: 'absolute', top: '6px', left: '6px', background: '#00d4d4', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', color: '#000', zIndex: 20 }}>
            J'ai
          </div>
        )}

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.85)' }}>
          <p style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
          <p style={{ color: '#00d4d4', fontSize: '11px' }}>{illu.prix ? `${illu.prix} €` : ''}</p>
        </div>
      </div>
    </div>
  );
}

export default Catalogue;