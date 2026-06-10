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

// Vignette dossier sans visuel — premium aux couleurs du site

// Vignette avec visuel
function VignetteVisuel({ item, taille = 150, onClick, badge = null, jAi = false, jeVeux = false, onToggleJAi, onToggleJeVeux }) {
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
      <div ref={cardRef} className="teoart-card"
        onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}
        style={{ width: `${taille}px`, cursor: 'pointer', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#111', overflow: 'hidden', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.6)', willChange: 'transform' }}>
        {url
          ? <img src={url} alt={item.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />
        }
        {badge && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', background: badge.bg, border: badge.border, borderRadius: '4px', padding: '1px 5px', fontSize: '8px', color: badge.color }}>
            {badge.label}
          </div>
        )}
        {/* BADGE J'AI */}
        {onToggleJAi && (
          <div onClick={e => { e.stopPropagation(); onToggleJAi(); }}
            style={{ position: 'absolute', top: '5px', left: '5px', borderRadius: '4px', padding: '2px 5px', fontSize: '9px', fontWeight: 'bold', zIndex: 20, cursor: 'pointer', background: jAi ? '#00d4d4' : 'rgba(0,0,0,0.55)', color: jAi ? '#000' : 'rgba(255,255,255,0.45)', border: jAi ? 'none' : '1px solid rgba(255,80,80,0.4)' }}>
            {jAi ? "✓ J'ai" : "✕ J'ai"}
          </div>
        )}
        {/* COEUR JE VEUX */}
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
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.85)' }}>
          <p style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nom}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{item.annee}{item.prix ? ` · ${item.prix} €` : ''}</p>
        </div>
      </div>
    </div>
  );
}

function Livres() {
  const navigate = useNavigate();
  const [recueils, setRecueils] = React.useState([]);
  const [livresHorsSerie, setLivresHorsSerie] = React.useState([]);
  const [tousLivres, setTousLivres] = React.useState([]);
  const [tousLesLivres, setTousLesLivres] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [collection, setCollection] = React.useState({});
  const [showCategories, setShowCategories] = React.useState(false);

  // Popup recueil ou livre
  const [popupItem, setPopupItem] = React.useState(null);
  const [popupType, setPopupType] = React.useState(null); // 'recueil' | 'livre'
  const [contenuPopup, setContenuPopup] = React.useState([]); // livres/dossiers du recueil
  const [itemOuvert, setItemOuvert] = React.useState(null); // livre/dossier déplié
  const [illustrationsOuvertes, setIllustrationsOuvertes] = React.useState([]);
  const [loadingIllus, setLoadingIllus] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: r } = await supabase.from('recueils').select('id, nom, slug, annee, visuel_presentation, prix, description').eq('statut', 'published').order('annee', { ascending: false });
      const { data: l } = await supabase.from('livres').select('id, nom, slug, annee, recueils_ids, visuel_presentation, prix, description').eq('statut', 'published').order('nom');

      setRecueils(r || []);
      setTousLesLivres(l || []);
      setLivresHorsSerie((l || []).filter(li => li.visuel_presentation && (!li.recueils_ids || li.recueils_ids.length === 0)));
      setTousLivres((l || []).filter(li => li.visuel_presentation));

      // Collection (j_ai / je_veux) — on réutilise une table dédiée collection_items
      // Pour l'instant on stocke dans localStorage le temps de créer la table
      setLoading(false);
    };
    charger();
  }, [navigate]);

  const ouvrirRecueil = (recueil) => {
    const livresDuRecueil = tousLesLivres.filter(l => l.recueils_ids && l.recueils_ids.includes(recueil.id));
    setContenuPopup(livresDuRecueil);
    setPopupItem(recueil);
    setPopupType('recueil');
    setItemOuvert(null);
    setIllustrationsOuvertes([]);
  };

  const ouvrirLivre = async (livre) => {
    if (itemOuvert?.id === livre.id) {
      setItemOuvert(null);
      setIllustrationsOuvertes([]);
      return;
    }
    setItemOuvert(livre);
    setLoadingIllus(true);
    setIllustrationsOuvertes([]);
    const { data } = await supabase
      .from('illustrations')
      .select('id, nom, visuels, annee, prix')
      .eq('statut', 'published')
      .contains('livres_ids', [livre.id])
      .order('nom');
    setIllustrationsOuvertes(data || []);
    setLoadingIllus(false);
  };

  const toggleJAi = async (itemId, type) => {
    const key = `${type}_${itemId}`;
    const actuel = collection[key]?.j_ai || false;
    setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: !actuel } }));
  };

  const toggleJeVeux = async (itemId, type) => {
    const key = `${type}_${itemId}`;
    const actuel = collection[key]?.je_veux || false;
    setCollection(prev => ({ ...prev, [key]: { ...prev[key], je_veux: !actuel } }));
  };

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;
  const TAILLE_RECUEIL = isMobile ? 130 : 170;
  const TAILLE_LIVRE = isMobile ? 110 : 140;
  const TAILLE_ILLUS = isMobile ? 85 : 100;

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
        .dropdown-cat { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 100; min-width: 200px; }
        .dropdown-item { padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .popup-anim { animation: slideDown 0.25s ease; }
        .ligne-separateur { width: 100%; height: 1px; margin: 32px 0; }
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
                  <div className="dropdown-item" onClick={() => navigate('/catalogue')}>Toutes les catégories</div>
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

              {/* SECTION RECUEILS */}
              <SectionTitre couleur="#00d4d4" label="Recueils" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '40px' }}>
                {recueils.map(r => (
                  <VignetteVisuel key={r.id} item={r} taille={TAILLE_RECUEIL}
                    badge={{ label: 'Recueil', bg: 'rgba(0,212,212,0.2)', border: '1px solid rgba(0,212,212,0.4)', color: '#00d4d4' }}
                    jAi={collection[`recueil_${r.id}`]?.j_ai || false}
                    jeVeux={collection[`recueil_${r.id}`]?.je_veux || false}
                    onToggleJAi={() => toggleJAi(r.id, 'recueil')}
                    onToggleJeVeux={() => toggleJeVeux(r.id, 'recueil')}
                    onClick={() => ouvrirRecueil(r)} />
                ))}
              </div>

              {/* SÉPARATEUR */}
              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,210,80,0.2), transparent)', marginBottom: '40px' }} />

              {/* SECTION LIVRES HORS SÉRIE */}
              {livresHorsSerie.length > 0 && (
                <>
                  <SectionTitre couleur="rgba(255,210,80,0.85)" label="Livres Hors Série" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '40px' }}>
                    {livresHorsSerie.map(l => (
                      <VignetteVisuel key={l.id} item={l} taille={TAILLE_LIVRE}
                        jAi={collection[`livre_${l.id}`]?.j_ai || false}
                        jeVeux={collection[`livre_${l.id}`]?.je_veux || false}
                        onToggleJAi={() => toggleJAi(l.id, 'livre')}
                        onToggleJeVeux={() => toggleJeVeux(l.id, 'livre')}
                        onClick={() => { setPopupItem(l); setPopupType('livre'); setItemOuvert(null); setIllustrationsOuvertes([]); }} />
                    ))}
                  </div>
                  <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,210,80,0.2), transparent)', marginBottom: '40px' }} />
                </>
              )}

              {/* SECTION TOUS LES LIVRES */}
              <SectionTitre couleur="rgba(255,255,255,0.6)" label="Tous les livres" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                {tousLivres.map(l => (
                  <VignetteVisuel key={l.id} item={l} taille={TAILLE_LIVRE}
                    jAi={collection[`livre_${l.id}`]?.j_ai || false}
                    jeVeux={collection[`livre_${l.id}`]?.je_veux || false}
                    onToggleJAi={() => toggleJAi(l.id, 'livre')}
                    onToggleJeVeux={() => toggleJeVeux(l.id, 'livre')}
                    onClick={() => { setPopupItem(l); setPopupType('livre'); setItemOuvert(null); setIllustrationsOuvertes([]); }} />
                ))}
              </div>

            </div>
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

      {/* POPUP RECUEIL OU LIVRE */}
      {popupItem && (
        <div onClick={() => { setPopupItem(null); setItemOuvert(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} className="popup-anim"
            style={{ background: '#111', border: `1px solid ${popupType === 'recueil' ? 'rgba(0,212,212,0.3)' : 'rgba(255,210,80,0.25)'}`, borderRadius: '20px', maxWidth: '860px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '24px' }}>

            <button onClick={() => { setPopupItem(null); setItemOuvert(null); }} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer' }}>✕</button>

            {/* En-tête */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap' }}>
              {popupItem.visuel_presentation && (
                <img src={cheminVersUrl(popupItem.visuel_presentation)} alt={popupItem.nom} style={{ width: '110px', borderRadius: '10px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ color: popupType === 'recueil' ? '#00d4d4' : 'rgba(255,210,80,0.8)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  {popupType === 'recueil' ? 'Recueil' : 'Livre'}
                </p>
                <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{popupItem.nom}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px' }}>
                  {popupItem.annee}
                  {popupItem.prix ? ` · ${popupItem.prix} €` : ''}
                  {popupType === 'recueil' ? ` · ${contenuPopup.length} livre${contenuPopup.length > 1 ? 's' : ''}` : ''}
                </p>

                {/* BOUTONS J'AI / JE VEUX / PANIER */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  <button style={{ background: 'rgba(255,62,181,0.15)', border: '1px solid rgba(255,62,181,0.4)', borderRadius: '8px', padding: '6px 12px', color: '#ff3eb5', fontSize: '12px', cursor: 'pointer' }}>
                    🛒 Panier
                  </button>
                </div>

                {popupItem.description && (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.7', marginTop: '12px' }}>{popupItem.description}</p>
                )}
              </div>
            </div>

            {/* CONTENU DU RECUEIL : livres + dossiers */}
            {popupType === 'recueil' && contenuPopup.length > 0 && (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Contenu du recueil</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {contenuPopup.map(livre => {
                    const estDossier = !livre.visuel_presentation;
                    const estOuvert = itemOuvert?.id === livre.id;
                    return (
                      <div key={livre.id}>
                        <div onClick={() => ouvrirLivre(livre)}
                          style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${estOuvert ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.07)'}`, background: estOuvert ? 'rgba(0,212,212,0.04)' : 'rgba(255,255,255,0.02)', transition: 'all .2s' }}>
                          {estDossier ? (
                            <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'linear-gradient(135deg, #0a0a0a, #111)', border: '1px solid rgba(255,210,80,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '20px', opacity: 0.7 }}>📁</span>
                            </div>
                          ) : (
                            <img src={cheminVersUrl(livre.visuel_presentation)} alt={livre.nom} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{livre.nom}</p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                              {estDossier ? 'Dossier' : 'Livre'}{livre.annee ? ` · ${livre.annee}` : ''}
                            </p>
                          </div>
                          <span style={{ color: estOuvert ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '18px', transition: 'transform .2s', display: 'block', transform: estOuvert ? 'rotate(90deg)' : 'none' }}>›</span>
                        </div>

                        {/* Illustrations dépliées */}
                        {estOuvert && (
                          <div style={{ marginTop: '8px', padding: '14px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', border: '1px solid rgba(0,212,212,0.08)' }}>
                            {loadingIllus ? (
                              <p style={{ color: '#00d4d4', textAlign: 'center', fontSize: '12px' }}>Chargement...</p>
                            ) : illustrationsOuvertes.length === 0 ? (
                              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: '12px' }}>Aucune illustration trouvée.</p>
                            ) : (
                              <>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                  {illustrationsOuvertes.length} illustration{illustrationsOuvertes.length > 1 ? 's' : ''}
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {illustrationsOuvertes.map(illu => {
                                    const urlIllu = (() => {
                                      if (!illu.visuels) return null;
                                      const cle = Object.keys(illu.visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
                                      if (cle) return cheminVersUrl(illu.visuels[cle]);
                                      if (illu.visuels['B']) return cheminVersUrl(illu.visuels['B']);
                                      if (illu.visuels['b']) return cheminVersUrl(illu.visuels['b']);
                                      return null;
                                    })();
                                    return (
                                      <div key={illu.id} style={{ flexShrink: 0, width: `${TAILLE_ILLUS}px`, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a' }}>
                                        {urlIllu
                                          ? <img src={urlIllu} alt={illu.nom} style={{ width: '100%', height: `${TAILLE_ILLUS}px`, objectFit: 'cover', display: 'block' }} />
                                          : <div style={{ width: '100%', height: `${TAILLE_ILLUS}px`, background: '#111' }} />
                                        }
                                        <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.8)' }}>
                                          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
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

            {/* CONTENU D'UN LIVRE SEUL */}
            {popupType === 'livre' && (
              <PopupContenuLivre livre={popupItem} taille={TAILLE_ILLUS} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitre({ couleur, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${couleur}66)` }} />
      <p style={{ color: couleur, fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</p>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${couleur}66)` }} />
    </div>
  );
}

function PopupContenuLivre({ livre, taille }) {
  const [illustrations, setIllustrations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.from('illustrations')
      .select('id, nom, visuels, annee, prix')
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
        {illustrations.length} illustration{illustrations.length > 1 ? 's' : ''}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {illustrations.map(illu => {
          const urlIllu = (() => {
            if (!illu.visuels) return null;
            const cle = Object.keys(illu.visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
            if (cle) return cheminVersUrl(illu.visuels[cle]);
            if (illu.visuels['B']) return cheminVersUrl(illu.visuels['B']);
            if (illu.visuels['b']) return cheminVersUrl(illu.visuels['b']);
            return null;
          })();
          return (
            <div key={illu.id} style={{ flexShrink: 0, width: `${taille}px`, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a' }}>
              {urlIllu
                ? <img src={urlIllu} alt={illu.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />
              }
              <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.8)' }}>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Livres;
