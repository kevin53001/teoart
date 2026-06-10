import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

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

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${relatif.split('/').map(s => encodeURIComponent(s)).join('/')}`;
}


// Vignette livre/recueil avec visuel
function VignetteAvecVisuel({ item, taille = 150, onClick, isRecueil = false }) {
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
    <div ref={wrapRef} style={{ perspective: '800px', flexShrink: 0 }}>
      <div ref={cardRef}
        className="teoart-card"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          width: `${taille}px`,
          cursor: 'pointer',
          borderRadius: '12px',
          border: isRecueil ? '1px solid rgba(0,212,212,0.3)' : '1px solid rgba(255,255,255,0.1)',
          background: '#111',
          overflow: 'hidden',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease, box-shadow 0.3s',
          boxShadow: isRecueil
            ? '0 2px 4px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.6), 0 0 12px rgba(0,212,212,0.08)'
            : '0 2px 4px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.6)',
          willChange: 'transform',
        }}>

        {url
          ? <img src={url} alt={item.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />
        }

        {isRecueil && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,212,212,0.2)', border: '1px solid rgba(0,212,212,0.4)', borderRadius: '4px', padding: '1px 5px', fontSize: '8px', color: '#00d4d4' }}>
            Recueil
          </div>
        )}

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.85)' }}>
          <p style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nom}</p>
          <p style={{ color: isRecueil ? '#00d4d4' : 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{item.annee}</p>
        </div>
      </div>
    </div>
  );
}

// Vignette illustration (dans popup livre)
function VignetteIllustration({ illu, taille = 110 }) {
  const url = React.useMemo(() => {
    if (!illu.visuels) return null;
    const cle = Object.keys(illu.visuels).find(k =>
      k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation')
    );
    if (cle) return cheminVersUrl(illu.visuels[cle]);
    if (illu.visuels['B']) return cheminVersUrl(illu.visuels['B']);
    if (illu.visuels['b']) return cheminVersUrl(illu.visuels['b']);
    return null;
  }, [illu]);

  return (
    <div style={{ flexShrink: 0, width: `${taille}px`, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a' }}>
      {url
        ? <img src={url} alt={illu.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: `${taille}px`, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '9px' }}>–</span>
          </div>
      }
      <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.8)' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
      </div>
    </div>
  );
}

function Livres() {
  const navigate = useNavigate();
  const [recueils, setRecueils] = React.useState([]);
  const [livresAvecVisuel, setLivresAvecVisuel] = React.useState([]);
  const [tousLesLivres, setTousLesLivres] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);

  // Popup recueil
  const [popupRecueil, setPopupRecueil] = React.useState(null);
  const [livresPopup, setLivresPopup] = React.useState([]);
  // Livre ouvert dans popup (déplie les illustrations)
  const [livreOuvert, setLivreOuvert] = React.useState(null);
  const [illustrationsLivre, setIllustrationsLivre] = React.useState([]);
  const [loadingIllus, setLoadingIllus] = React.useState(false);

  // Nav
  const [showCategories, setShowCategories] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const charger = async () => {
      const { data: r } = await supabase
        .from('recueils')
        .select('id, nom, slug, annee, visuel_presentation')
        .eq('statut', 'published')
        .order('annee');
      const { data: l } = await supabase
        .from('livres')
        .select('id, nom, slug, annee, recueils_ids, visuel_presentation')
        .eq('statut', 'published')
        .order('nom');
      setRecueils(r || []);
      setTousLesLivres(l || []);
      setLivresAvecVisuel((l || []).filter(li => li.visuel_presentation));
      setLoading(false);
    };
    charger();
  }, []);

  // Ouvrir popup recueil
  const ouvrirRecueil = (recueil) => {
    const livresDuRecueil = tousLesLivres.filter(l =>
      l.recueils_ids && l.recueils_ids.includes(recueil.id)
    );
    setLivresPopup(livresDuRecueil);
    setPopupRecueil(recueil);
    setLivreOuvert(null);
    setIllustrationsLivre([]);
  };

  // Clic sur un livre dans le popup → charger ses illustrations
  const ouvrirLivre = async (livre) => {
    if (livreOuvert?.id === livre.id) {
      setLivreOuvert(null);
      setIllustrationsLivre([]);
      return;
    }
    setLivreOuvert(livre);
    setLoadingIllus(true);
    setIllustrationsLivre([]);
    const { data } = await supabase
      .from('illustrations')
      .select('id, nom, visuels, annee, prix')
      .eq('statut', 'published')
      .contains('livres_ids', [livre.id])
      .order('nom');
    setIllustrationsLivre(data || []);
    setLoadingIllus(false);
  };

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;
  const TAILLE_RECUEIL = isMobile ? 130 : 170;
  const TAILLE_LIVRE = isMobile ? 110 : 140;
  const TAILLE_ILLUS = isMobile ? 90 : 110;

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .teoart-card::before {
          content: ''; position: absolute; top: -20%; left: -150%;
          width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.02) 10%, rgba(255,225,110,0.07) 25%, rgba(255,235,150,0.12) 40%, rgba(255,245,170,0.08) 50%, rgba(255,235,140,0.11) 62%, rgba(255,220,100,0.06) 75%, rgba(255,210,80,0.02) 88%, transparent 100%);
          transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen;
        }
        .teoart-card.shining::before { animation: shine 1.0s ease-in-out forwards; }
        @keyframes shine { 0% { left: -150%; } 100% { left: 220%; } }
        .teoart-card:hover { border-color: rgba(255,210,80,0.5) !important; box-shadow: 0 4px 8px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255,210,80,0.15) !important; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        .dropdown-cat { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 100; min-width: 200px; }
        .dropdown-item { padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .popup-livre { animation: slideDown 0.25s ease; }
      `}</style>

      <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, cursor: 'pointer', fontSize: '22px' }}>🔔</div>

      {/* BANNIÈRE */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* NAVIGATION */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
        <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/catalogue')} />
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px', filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }} onClick={() => navigate('/livres')} />
            <div style={{ position: 'relative' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => setShowCategories(v => !v)} />
              {showCategories && (
                <div className="dropdown-cat">
                  <div className="dropdown-item" onClick={() => { navigate('/catalogue'); }}>Toutes les catégories</div>
                </div>
              )}
            </div>
          </div>
          <img src={`${R2}/site/Logo.png`} alt="logo" style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', zIndex: 10, flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => {}} />
            <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => {}} />
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => {}} />
          </div>
        </div>
      </div>

      {/* BARRES + CONTENU */}
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

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 200}px` }}>

          {loading ? <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p> : (
            <>
              {/* SECTION RECUEILS */}
              <div style={{ maxWidth: '1100px', margin: '0 auto 40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,212,0.4))' }} />
                  <p style={{ color: '#00d4d4', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Recueils</p>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,212,212,0.4))' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                  {recueils.map(r => (
                    <VignetteAvecVisuel key={r.id} item={r} taille={TAILLE_RECUEIL} isRecueil={true} onClick={() => ouvrirRecueil(r)} />
                  ))}
                </div>
              </div>

              {/* SÉPARATEUR */}
              <div style={{ maxWidth: '1100px', margin: '0 auto 32px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,210,80,0.2), transparent)' }} />

              {/* SECTION LIVRES HORS SÉRIE */}
              {livresAvecVisuel.filter(l => !l.recueils_ids || l.recueils_ids.length === 0).length > 0 && (
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,210,80,0.4))' }} />
                    <p style={{ color: 'rgba(255,210,80,0.8)', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Livres Hors Série</p>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(255,210,80,0.4))' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                    {livresAvecVisuel
                      .filter(l => !l.recueils_ids || l.recueils_ids.length === 0)
                      .map(l => (
                        <VignetteAvecVisuel key={l.id} item={l} taille={TAILLE_LIVRE} isRecueil={false} onClick={() => navigate(`/livres/${l.slug || l.id}`)} />
                      ))
                    }
                  </div>
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

      {/* POPUP RECUEIL */}
      {popupRecueil && (
        <div onClick={() => setPopupRecueil(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} className="popup-livre"
            style={{ background: '#111', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', maxWidth: '860px', width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative', padding: '24px' }}>

            <button onClick={() => setPopupRecueil(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer' }}>✕</button>

            {/* En-tête recueil */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap' }}>
              {popupRecueil.visuel_presentation && (
                <img src={cheminVersUrl(popupRecueil.visuel_presentation)} alt={popupRecueil.nom}
                  style={{ width: '100px', borderRadius: '8px', flexShrink: 0 }} />
              )}
              <div>
                <p style={{ color: '#00d4d4', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Recueil</p>
                <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{popupRecueil.nom}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{popupRecueil.annee} · {livresPopup.length} livre{livresPopup.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Livres du recueil */}
            {livresPopup.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '13px' }}>Aucun livre dans ce recueil.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {livresPopup.map(livre => (
                  <div key={livre.id}>
                    {/* Vignette livre */}
                    <div onClick={() => ouvrirLivre(livre)}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${livreOuvert?.id === livre.id ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.08)'}`, background: livreOuvert?.id === livre.id ? 'rgba(0,212,212,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all .2s' }}>
                      {livre.visuel_presentation
                        ? <img src={cheminVersUrl(livre.visuel_presentation)} alt={livre.nom} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                        : <div style={{ width: '56px', height: '56px', borderRadius: '6px', background: 'linear-gradient(135deg, #0a0a0a, #111)', border: '1px solid rgba(255,210,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '18px', opacity: 0.5 }}>📁</span>
                          </div>
                      }
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{livre.nom}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{livre.annee}</p>
                      </div>
                      <span style={{ color: livreOuvert?.id === livre.id ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '18px', transition: 'transform .2s', display: 'block', transform: livreOuvert?.id === livre.id ? 'rotate(90deg)' : 'none' }}>›</span>
                    </div>

                    {/* Illustrations dépliées */}
                    {livreOuvert?.id === livre.id && (
                      <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', border: '1px solid rgba(0,212,212,0.1)' }}>
                        {loadingIllus ? (
                          <p style={{ color: '#00d4d4', textAlign: 'center', fontSize: '12px' }}>Chargement...</p>
                        ) : illustrationsLivre.length === 0 ? (
                          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: '12px' }}>Aucune illustration trouvée.</p>
                        ) : (
                          <>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {illustrationsLivre.length} illustration{illustrationsLivre.length > 1 ? 's' : ''}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
                              {illustrationsLivre.map(illu => (
                                <VignetteIllustration key={illu.id} illu={illu} taille={TAILLE_ILLUS} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Livres;
