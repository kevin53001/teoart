import React from 'react';
import OngletsLateraux from './OngletsLateraux';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import BoutonsFlottants from './BoutonsFlottants';
import BandeLegale from './BandeLegale';
import PopupFicheIllu from './PopupFicheIllu';
import Cloche from './Cloche';

const R2 = 'https://images.kevinteoart.fr';
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

const CATEGORIES = ['Tout', 'Portrait', 'Kawaii/Chibi', 'Manga', 'Noël', 'Halloween', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Animaux'];

const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
function getMoisPatreonDisponibles() {
  const maintenant = new Date();
  const moisCourant = maintenant.getMonth();
  const anneeCourante = maintenant.getFullYear();
  if (anneeCourante < 2026) return [];
  if (anneeCourante > 2026) return MOIS_FR.map(m => `Patreon - ${m} 2026`);
  return MOIS_FR.slice(0, moisCourant + 1).map(m => `Patreon - ${m} 2026`);
}
const COULEURS_TITRE = ['#00d4d4', '#ff3eb5', '#ffd250'];

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
        style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', cursor: 'pointer', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', willChange: 'transform', position: 'relative' }} />
    </div>
  );
}

function PopupImage({ images, indexDepart, onClose }) {
  const [index, setIndex] = React.useState(indexDepart);
  const touchStartX = React.useRef(null);
  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) setIndex(i => diff > 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length);
    touchStartX.current = null;
  };
  return (
    <div onClick={onClose} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <button onClick={onClose} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 10000, lineHeight: 1 }}>✕</button>
      <img src={images[index]} alt="" onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '10px', display: 'block', boxShadow: '0 8px 40px rgba(0,0,0,0.8)' }} />
      {images.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); setIndex(i => (i - 1 + images.length) % images.length); }}
          style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>‹</button>
        <button onClick={e => { e.stopPropagation(); setIndex(i => (i + 1) % images.length); }}
          style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>›</button>
        <p style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', zIndex: 10000 }}>{index + 1} / {images.length}</p>
      </>}
    </div>
  );
}

function Presentation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [encarts, setEncarts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const moisPatreon = getMoisPatreonDisponibles();
  const [popupGlobal, setPopupGlobal] = React.useState(null); // { images, index }
  const [userId, setUserId] = React.useState(null);
  const [popupOnglet, setPopupOnglet] = React.useState(null);
  const [popupOngletIndex, setPopupOngletIndex] = React.useState(0);
  const [illustrationsOnglet, setIllustrationsOnglet] = React.useState([]);

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
      if (user) setUserId(user.id);
      const { data } = await supabase.from('presentation').select('*').order('ordre', { ascending: true });
      setEncarts(data || []);
      setLoading(false);
      // Charger illustrations pour similaires dans PopupFicheIllu
      const { data: illusData } = await supabase.from('illustrations').select('id, nom, visuels, prix, description, tags, annee, categorie, livres_ids, recueils_ids').eq('statut', 'published').limit(200);
      setIllustrationsOnglet(illusData || []);
    };
    charger();
  }, []);

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;

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
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        .encart-pres { background: rgba(0,0,0,0.45); backdrop-filter: blur(2px); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; margin-bottom: 32px; transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s; }
        .encart-pres:hover { border-color: rgba(255,255,255,0.18); box-shadow: 0 8px 32px rgba(0,0,0,0.6); transform: translateY(-2px); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .encart-anim { animation: fadeIn 0.6s ease forwards; }
        .apercu-gradient { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .img-encart { cursor: zoom-in; transition: transform 0.2s, filter 0.2s; border-radius: 12px; }
        .img-encart:hover { transform: scale(1.02); filter: brightness(1.1); }
        img { -webkit-user-drag: none; user-drag: none; }
        * { -webkit-user-select: none; user-select: none; }
        input, textarea { -webkit-user-select: text; user-select: text; }
      `}</style>

      {/* Popup image globale — rendu ici, en dehors de tout contexte sticky */}
      {popupGlobal && (
        <PopupImage images={popupGlobal.images} indexDepart={popupGlobal.index} onClose={() => setPopupGlobal(null)} />
      )}

      <BoutonsFlottants />
      <Cloche hidden={!!popupGlobal} />

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {!popupGlobal && (
        <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
          <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
              <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/accueil' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/accueil')} />
              <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px', ...(location.pathname === '/livres' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/livres')} />
              <div style={{ position: 'relative', width: `${P}px`, height: `${P}px`, flexShrink: 0, marginTop: isMobile ? '-8px' : '0', overflow: 'visible' }}>
                <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, display: 'block', ...(location.pathname === '/catalogue' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={e => { e.stopPropagation(); setShowCategories(v => !v); setShowPatreonMenu(false); }} />
                {showCategories && (
                  <div className="dropdown-cat" onClick={e => e.stopPropagation()}>
                    {CATEGORIES.map(cat => (
                      <button key={cat} className="dropdown-item"
                        onClick={() => { navigate('/catalogue', { state: { categorie: cat } }); setShowCategories(false); }}>
                        {cat}
                      </button>
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
              <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => {}} />
              <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/mon-compte' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/mon-compte')} />
            </div>
          </div>
        </div>
      )}

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

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '40px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 300}px` }}>
          {loading ? (
            <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>
          ) : (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {encarts.map((enc, idx) => (
                <EncartPresentation key={enc.id} enc={enc} idx={idx} isMobile={isMobile} onOuvrirPopup={(images, index) => setPopupGlobal({ images, index })} />
              ))}
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

      <BandeLegale />
      <OngletsLateraux userId={userId} onOuvrirFiche={(illu, liste) => {
        const l = liste || [illu];
        setIllustrationsOnglet(prev => { const merged = [...prev]; l.forEach(i => { if (!merged.find(x => x.id === i.id)) merged.push(i); }); return merged; });
        setPopupOngletIndex(illustrationsOnglet.findIndex(i => i.id === illu.id) >= 0 ? illustrationsOnglet.findIndex(i => i.id === illu.id) : 0);
        setPopupOnglet(illu);
      }} />
      {popupOnglet && (
        <PopupFicheIllu
          illu={popupOnglet}
          illustrations={illustrationsOnglet}
          onClose={() => setPopupOnglet(null)}
          onOpenSimilaire={(illu) => setPopupOnglet(illu)}
          onSuivant={() => {
            const idx = illustrationsOnglet.findIndex(i => i.id === popupOnglet.id);
            const next = (idx + 1) % illustrationsOnglet.length;
            setPopupOngletIndex(next);
            setPopupOnglet(illustrationsOnglet[next]);
          }}
          onPrecedent={() => {
            const idx = illustrationsOnglet.findIndex(i => i.id === popupOnglet.id);
            const prev = (idx - 1 + illustrationsOnglet.length) % illustrationsOnglet.length;
            setPopupOngletIndex(prev);
            setPopupOnglet(illustrationsOnglet[prev]);
          }}
          userId={userId}
          userPseudo=""
        />
      )}
    </div>
  );
}

function EncartPresentation({ enc, idx, isMobile, onOuvrirPopup }) {
  const [ouvert, setOuvert] = React.useState(false);
  const images = enc.images_urls || [];
  const texte = enc.texte || '';
  const titre = enc.titre || '';
  const aTexte = texte.trim().length > 0;
  const aImages = images.length > 0;
  const imageAGauche = idx % 2 === 0;
  const premiereImage = images[0] || null;
  const couleurTitre = COULEURS_TITRE[idx % COULEURS_TITRE.length];

  const ouvrirImg = (e, i) => { e.stopPropagation(); onOuvrirPopup(images, i); };

  return (
    <div className="encart-anim encart-pres" style={{ animationDelay: `${idx * 0.1}s` }}>

      {titre && (
        <div onClick={() => setOuvert(v => !v)} style={{ position: 'relative', cursor: 'pointer', userSelect: 'none', overflow: 'hidden', minHeight: isMobile ? '28px' : '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Fond métallique premium */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(255,255,255,0.18) 0%, ${couleurTitre}99 18%, ${couleurTitre}66 50%, ${couleurTitre}44 82%, rgba(0,0,0,0.25) 100%)`, backdropFilter: 'blur(2px)' }} />
          {/* Reflet métallique diagonal */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Ligne de brillance supérieure */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.55)', pointerEvents: 'none' }} />
          {/* Ligne de profondeur inférieure */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
          <h2 style={{ position: 'relative', color: '#fff', fontSize: isMobile ? '12px' : '14px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0, textAlign: 'center', flex: 1, padding: isMobile ? '5px 36px 5px 16px' : '7px 40px 7px 20px', textShadow: '0 1px 3px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.3)' }}>{titre}</h2>
          <div style={{ position: 'absolute', right: '14px', top: '50%', transform: ouvert ? 'translateY(-50%) rotate(90deg)' : 'translateY(-50%) rotate(0deg)', transition: 'transform 0.3s ease', color: 'rgba(255,255,255,0.85)', fontSize: '20px', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>›</div>
        </div>
      )}

      {!ouvert && (
        <div onClick={() => setOuvert(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: isMobile ? '12px 16px' : '14px 20px', cursor: 'pointer', minHeight: isMobile ? '72px' : '84px' }}>
          {!aTexte && aImages ? (
            /* Encart sans texte : miniatures centrées */
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {images.slice(0, 5).map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: isMobile ? '48px' : '60px', height: isMobile ? '48px' : '60px', objectFit: 'cover', borderRadius: '7px', boxShadow: '0 3px 10px rgba(0,0,0,0.6)', flexShrink: 0, opacity: 0.85 }} />
              ))}
              {images.length > 5 && (
                <div style={{ width: isMobile ? '48px' : '60px', height: isMobile ? '48px' : '60px', borderRadius: '7px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600 }}>+{images.length - 5}</div>
              )}
            </div>
          ) : (
            /* Encart avec texte : aperçu classique */
            <>
              {premiereImage && (
                <img src={premiereImage} alt="" style={{ width: isMobile ? '56px' : '72px', height: isMobile ? '56px' : '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', filter: 'brightness(0.8)' }} />
              )}
              {aTexte && (
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <p className="apercu-gradient" style={{ color: 'rgba(255,255,255,0.45)', fontSize: isMobile ? '12px' : '13px', lineHeight: '1.65', margin: 0 }}>{texte}</p>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.45))', pointerEvents: 'none' }} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div style={{ overflow: 'hidden', maxHeight: ouvert ? '9000px' : '0', opacity: ouvert ? 1 : 0, transitionProperty: 'max-height, opacity', transitionDuration: ouvert ? '0.5s, 0.4s' : '0.3s, 0.2s' }}>
        <div style={{ padding: isMobile ? '16px 16px 24px' : '24px 24px 32px' }}>

          {aTexte && aImages && !isMobile && (
            <div>
              <img src={images[0]} alt="" className="img-encart" onClick={e => ouvrirImg(e, 0)}
                style={{ width: '40%', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', float: imageAGauche ? 'left' : 'right', marginRight: imageAGauche ? '24px' : '0', marginLeft: imageAGauche ? '0' : '24px', marginBottom: '16px' }} />
              {images.slice(1).map((url, i) => (
                <img key={i+1} src={url} alt="" className="img-encart" onClick={e => ouvrirImg(e, i + 1)}
                  style={{ width: '40%', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', float: imageAGauche ? 'left' : 'right', marginRight: imageAGauche ? '24px' : '0', marginLeft: imageAGauche ? '0' : '24px', marginBottom: '16px', display: 'block' }} />
              ))}
              <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '16px', lineHeight: '1.85', whiteSpace: 'pre-wrap' }}>{texte}</p>
              <div style={{ clear: 'both' }} />
            </div>
          )}

          {aTexte && aImages && isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {images.map((url, i) => (
                <img key={i} src={url} alt="" className="img-encart" onClick={e => ouvrirImg(e, i)}
                  style={{ width: '100%', display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }} />
              ))}
              <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '14px', lineHeight: '1.85', whiteSpace: 'pre-wrap' }}>{texte}</p>
            </div>
          )}

          {aTexte && !aImages && (
            <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: isMobile ? '14px' : '16px', lineHeight: '1.85', whiteSpace: 'pre-wrap', textAlign: 'center' }}>{texte}</p>
          )}

          {!aTexte && aImages && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {images.map((url, i) => (
                <img key={i} src={url} alt="" className="img-encart" onClick={e => ouvrirImg(e, i)}
                  style={{ width: '100%', display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }} />
              ))}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default Presentation;