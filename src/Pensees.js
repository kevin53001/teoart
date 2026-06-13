import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

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

const CATEGORIES = ['Portrait', 'Kawaii/Chibi', 'Manga', 'Noël', 'Halloween', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Animaux'];

function LogoPremium({ navigate, isMobile, L }) {
  const ref = React.useRef(null);
  const wrapRef = React.useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
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
    const el = ref.current;
    if (!el) return;
    el.classList.remove('shining-logo'); void el.offsetWidth; el.classList.add('shining-logo');
  };

  return (
    <div ref={wrapRef} style={{ perspective: '600px', flexShrink: 0, zIndex: 10 }}>
      <img
        ref={ref}
        src={`${R2}/site/Logo.png`}
        alt="logo"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate('/presentation')}
        style={{
          width: `${L}px`, height: `${L}px`, borderRadius: '50%',
          border: `${isMobile ? 3 : 4}px solid #000`,
          boxShadow: '0 0 0 3px #00d4d4',
          objectFit: 'cover', cursor: 'pointer',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease, box-shadow 0.3s',
          willChange: 'transform',
          position: 'relative',
        }}
      />
    </div>
  );
}

function decouperTexte(texte, taille = 820) {
  if (!texte) return [''];
  const blocs = [];
  let restant = texte.trim();

  while (restant.length > taille) {
    let coupe = restant.lastIndexOf('\n', taille);
    if (coupe < taille * 0.55) coupe = restant.lastIndexOf('. ', taille);
    if (coupe < taille * 0.55) coupe = restant.lastIndexOf(' ', taille);
    if (coupe < taille * 0.55) coupe = taille;
    blocs.push(restant.slice(0, coupe + 1).trim());
    restant = restant.slice(coupe + 1).trim();
  }

  if (restant) blocs.push(restant);
  return blocs.length ? blocs : [''];
}

function Pensees() {
  const navigate = useNavigate();
  const [pensees, setPensees] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [popup, setPopup] = React.useState(null);
  const [pagePopup, setPagePopup] = React.useState(0);
  const [showForm, setShowForm] = React.useState(false);
  const [titreForm, setTitreForm] = React.useState('');
  const [texteForm, setTexteForm] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [userId, setUserId] = React.useState(null);
  const [pseudo, setPseudo] = React.useState('Visiteur');
  const startX = React.useRef(null);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profil } = await supabase.from('profils').select('pseudo, prenom').eq('id', user.id).maybeSingle();
        setPseudo(profil?.pseudo || profil?.prenom || 'Visiteur');
      }

      const { data, error } = await supabase
        .from('pensees')
        .select('*')
        .eq('statut', 'published')
        .order('ordre', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      setPensees(data || []);
      setLoading(false);
    };
    charger();
  }, []);

  React.useEffect(() => {
    if (!pensees.length) return;
    const t = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % pensees.length);
    }, 4200);
    return () => clearInterval(t);
  }, [pensees.length]);

  const envoyerPensee = async () => {
    if (!titreForm.trim() || !texteForm.trim() || !userId) return;
    setSending(true);
    setMessage('');

    const { error } = await supabase.from('pensees').insert({
      titre: titreForm.trim(),
      texte: texteForm.trim(),
      auteur: pseudo || 'Visiteur',
      user_id: userId,
      source: 'visiteur',
      statut: 'en_attente',
      ordre: 9999,
    });

    if (error) {
      setMessage("Impossible d'envoyer la pensée pour le moment.");
    } else {
      setMessage("Pensée envoyée. Elle apparaîtra après validation.");
      setTitreForm('');
      setTexteForm('');
      setTimeout(() => setShowForm(false), 1400);
    }

    setSending(false);
  };

  const ouvrirPopup = (pensee) => {
    setPopup(pensee);
    setPagePopup(0);
  };

  const pagesPopup = React.useMemo(() => {
    if (!popup) return [];
    if (Array.isArray(popup.pages) && popup.pages.length > 0) return popup.pages;
    if (Array.isArray(popup.texte_pages) && popup.texte_pages.length > 0) return popup.texte_pages;
    return decouperTexte(popup.texte || '');
  }, [popup]);

  const pageSuivante = () => setPagePopup(p => Math.min(p + 1, pagesPopup.length - 1));
  const pagePrecedente = () => setPagePopup(p => Math.max(p - 1, 0));

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (startX.current === null) return;
    const diff = e.changedTouches[0].clientX - startX.current;
    if (diff < -45) pageSuivante();
    if (diff > 45) pagePrecedente();
    startX.current = null;
  };

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        .dropdown-cat { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 100; min-width: 200px; }
        .dropdown-item { padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .logo-premium { position: relative; overflow: hidden; }
        .logo-premium::before {
          content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.04) 10%, rgba(255,225,110,0.12) 25%, rgba(255,235,150,0.18) 40%, rgba(255,245,170,0.12) 50%, rgba(255,235,140,0.14) 62%, rgba(255,220,100,0.08) 75%, rgba(255,210,80,0.03) 88%, transparent 100%);
          transform: skewX(-28deg); z-index: 20; pointer-events: none; mix-blend-mode: screen; border-radius: 50%;
        }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }

        @keyframes cardFloatA { 0%,100% { margin-top: 0px; } 50% { margin-top: -10px; } }
        @keyframes cardFloatB { 0%,100% { margin-top: -6px; } 50% { margin-top: 8px; } }
        @keyframes cardFloatC { 0%,100% { margin-top: 8px; } 50% { margin-top: -6px; } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 18px rgba(0,212,212,0.14), inset 0 0 28px rgba(255,210,80,0.05); } 50% { box-shadow: 0 0 34px rgba(255,62,181,0.18), inset 0 0 40px rgba(0,212,212,0.05); } }

        .pensee-page {
          position: absolute;
          width: 170px;
          height: 276px;
          border-radius: 14px;
          background:
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.95), rgba(255,246,223,0.95) 45%, rgba(232,214,184,0.95) 100%);
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 18px 34px rgba(0,0,0,0.56);
          transform-origin: bottom center;
          transition: transform .38s ease, box-shadow .3s ease, filter .3s ease, opacity .3s ease;
          cursor: pointer;
          overflow: hidden;
        }
        .pensee-page::before {
          content:'';
          position:absolute;
          inset:0;
          background: linear-gradient(90deg, rgba(0,0,0,0.10), transparent 20%, transparent 78%, rgba(0,0,0,0.12));
          pointer-events:none;
        }
        .pensee-page:hover {
          filter: brightness(1.12);
          box-shadow: 0 22px 44px rgba(0,0,0,0.65), 0 0 28px rgba(0,212,212,0.28);
          z-index: 80 !important;
        }
        .livre-ouvert:hover .pensee-page {
          animation-play-state: running;
        }
        .livre-ouvert:not(:hover) .pensee-page {
          animation-play-state: paused;
        }
        .popup-page {
          width: 500px;
          height: 812px;
          max-width: calc(100vw - 34px);
          max-height: calc(100vh - 70px);
          aspect-ratio: 500 / 812;
          background:
            radial-gradient(circle at 25% 15%, rgba(255,255,255,0.98), rgba(255,247,228,0.97) 46%, rgba(232,211,178,0.98) 100%);
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow: 0 30px 90px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,210,80,0.22);
          color: #24130c;
          position: relative;
          overflow: hidden;
        }
        .popup-page::before {
          content:'';
          position:absolute;
          top:0; bottom:0; left:0;
          width:28px;
          background: linear-gradient(90deg, rgba(0,0,0,0.16), rgba(0,0,0,0.04), transparent);
          pointer-events:none;
        }
        .premium-card {
          background: rgba(0,0,0,0.82);
          border: 1px solid rgba(0,212,212,0.28);
          border-radius: 18px;
          backdrop-filter: blur(10px);
          box-shadow: 0 18px 50px rgba(0,0,0,0.45);
        }
        .premium-card:hover {
          border-color: rgba(255,62,181,0.30);
          box-shadow: 0 20px 55px rgba(0,0,0,0.55), 0 0 22px rgba(0,212,212,0.10);
        }
        @media (max-width: 600px) {
          .pensee-page { width: 112px; height: 182px; border-radius: 10px; }
          .book-table { height: 430px !important; }
        }
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
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => navigate('/livres')} />
            <div style={{ position: 'relative' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => setShowCategories(v => !v)} />
              {showCategories && (
                <div className="dropdown-cat">
                  <div className="dropdown-item" onClick={() => { navigate('/catalogue'); setShowCategories(false); }}>Toutes les catégories</div>
                  {CATEGORIES.map(cat => (
                    <div key={cat} className="dropdown-item" onClick={() => { navigate('/catalogue'); setShowCategories(false); }}>{cat}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <LogoPremium navigate={() => navigate('/presentation')} isMobile={isMobile} L={L} />

          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/pensees')} />
            <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => {}} />
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/mon-compte')} />
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

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: isMobile ? '28px 14px 60px' : '40px 20px 70px', minHeight: `${BARRES.length * (IMG_H + GAP) + 360}px` }}>
          <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
            <div className="premium-card" style={{ padding: isMobile ? '18px' : '24px 30px', margin: '0 auto 18px', textAlign: 'center' }}>
              <h1 style={{ color: '#fff', fontSize: isMobile ? '24px' : '34px', letterSpacing: '1px', marginBottom: '10px', textShadow: '0 0 16px rgba(0,212,212,0.22)' }}>
                MES PENSÉES
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: isMobile ? '13px' : '15px', lineHeight: 1.75, maxWidth: '760px', margin: '0 auto' }}>
                Ici se rangent les petites phrases, les textes courts, les morceaux d'idées et les pensées qu'on garde parfois dans un coin de page.
                Certaines viennent de Kevin Teo'Art, d'autres peuvent venir des visiteurs.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'linear-gradient(90deg, rgba(255,210,80,0.95), rgba(255,62,181,0.95))',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  padding: '12px 24px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(255,62,181,0.18)',
                }}
              >
                Ajouter ma pensée
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>
            ) : pensees.length === 0 ? (
              <div className="premium-card" style={{ padding: '34px', textAlign: 'center', color: 'rgba(255,255,255,0.65)' }}>
                Aucune pensée publiée pour le moment.
              </div>
            ) : (
              <LivreOuvert
                pensees={pensees}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                ouvrirPopup={ouvrirPopup}
                isMobile={isMobile}
              />
            )}
          </div>
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

      {popup && (
        <div
          onClick={() => setPopup(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '22px',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setPopup(null)} style={{ position: 'absolute', top: '-18px', right: '-18px', width: '38px', height: '38px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.82)', color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 5 }}>×</button>

            <div className="popup-page" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div style={{ padding: isMobile ? '34px 30px' : '48px 54px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: isMobile ? '23px' : '30px', lineHeight: 1.1, marginBottom: '8px' }}>{popup.titre}</h2>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(36,19,12,0.62)' }}>par {popup.auteur || 'Anonyme'}</p>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontSize: isMobile ? '15px' : '17px', lineHeight: 1.78, whiteSpace: 'pre-wrap', textAlign: 'left', color: '#2c160e' }}>
                    {pagesPopup[pagePopup]}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '18px' }}>
                  <button onClick={pagePrecedente} disabled={pagePopup === 0} style={navPageBtn(pagePopup !== 0)}>‹</button>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(36,19,12,0.52)' }}>{pagePopup + 1} / {pagesPopup.length}</span>
                  <button onClick={pageSuivante} disabled={pagePopup >= pagesPopup.length - 1} style={navPageBtn(pagePopup < pagesPopup.length - 1)}>›</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 520,
            background: 'rgba(0,0,0,0.86)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div onClick={e => e.stopPropagation()} className="premium-card" style={{ width: '520px', maxWidth: '96vw', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>×</button>
            <h2 style={{ color: '#fff', marginBottom: '14px', fontSize: '24px' }}>Ajouter ma pensée</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
              Elle sera envoyée avec ton pseudo et apparaîtra après validation.
            </p>

            <input
              value={titreForm}
              onChange={e => setTitreForm(e.target.value)}
              placeholder="Titre"
              maxLength={90}
              style={inputStyle}
            />
            <textarea
              value={texteForm}
              onChange={e => setTexteForm(e.target.value)}
              placeholder="Ta pensée..."
              rows={8}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '170px', lineHeight: 1.6 }}
            />

            {message && <p style={{ color: message.includes('Impossible') ? '#ff6b6b' : '#00d4d4', fontSize: '13px', marginBottom: '12px' }}>{message}</p>}

            <button
              onClick={envoyerPensee}
              disabled={sending || !titreForm.trim() || !texteForm.trim()}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.22)',
                background: (!titreForm.trim() || !texteForm.trim()) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(90deg, rgba(0,212,212,0.92), rgba(255,62,181,0.92))',
                color: (!titreForm.trim() || !texteForm.trim()) ? 'rgba(255,255,255,0.35)' : '#000',
                fontWeight: 'bold',
                padding: '12px',
                borderRadius: '12px',
                cursor: (!titreForm.trim() || !texteForm.trim()) ? 'default' : 'pointer',
              }}
            >
              {sending ? 'Envoi...' : 'Envoyer ma pensée'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(0,212,212,0.22)',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: 'inherit',
  marginBottom: '12px',
  outline: 'none',
};

function navPageBtn(actif) {
  return {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: actif ? '1px solid rgba(36,19,12,0.25)' : '1px solid rgba(36,19,12,0.08)',
    background: actif ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.14)',
    color: actif ? '#24130c' : 'rgba(36,19,12,0.25)',
    fontSize: '22px',
    cursor: actif ? 'pointer' : 'default',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

function LivreOuvert({ pensees, activeIndex, setActiveIndex, ouvrirPopup, isMobile }) {
  const visibles = pensees.slice(0, Math.min(pensees.length, isMobile ? 9 : 15));
  const active = visibles[activeIndex % visibles.length] || visibles[0];

  return (
    <div className="book-table" style={{ position: 'relative', width: '100%', height: isMobile ? '460px' : '610px', perspective: '1300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* table / socle */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '30px' : '52px',
        width: isMobile ? '92%' : '780px',
        height: isMobile ? '80px' : '120px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(255,62,181,0.18), rgba(0,212,212,0.08) 45%, transparent 72%)',
        filter: 'blur(2px)',
      }} />

      <div className="livre-ouvert" style={{
        position: 'relative',
        width: isMobile ? '340px' : '760px',
        height: isMobile ? '360px' : '520px',
        transformStyle: 'preserve-3d',
        animation: 'glowPulse 4s ease-in-out infinite',
        borderRadius: '28px',
      }}>
        {/* couverture ouverte gauche */}
        <div style={{
          position: 'absolute',
          left: isMobile ? '15px' : '70px',
          top: isMobile ? '92px' : '125px',
          width: isMobile ? '155px' : '300px',
          height: isMobile ? '240px' : '360px',
          borderRadius: '22px 8px 8px 22px',
          background: 'linear-gradient(135deg, rgba(0,212,212,0.16), rgba(20,8,18,0.94) 45%, rgba(255,62,181,0.16))',
          border: '1px solid rgba(0,212,212,0.22)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.60)',
          transform: 'rotateY(22deg) rotateZ(-3deg)',
          transformOrigin: 'right center',
        }} />

        {/* couverture ouverte droite */}
        <div style={{
          position: 'absolute',
          right: isMobile ? '15px' : '70px',
          top: isMobile ? '92px' : '125px',
          width: isMobile ? '155px' : '300px',
          height: isMobile ? '240px' : '360px',
          borderRadius: '8px 22px 22px 8px',
          background: 'linear-gradient(225deg, rgba(255,210,80,0.17), rgba(20,8,18,0.94) 45%, rgba(0,212,212,0.14))',
          border: '1px solid rgba(255,210,80,0.20)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.60)',
          transform: 'rotateY(-22deg) rotateZ(3deg)',
          transformOrigin: 'left center',
        }} />

        {/* reliure */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: isMobile ? '98px' : '128px',
          width: isMobile ? '18px' : '28px',
          height: isMobile ? '230px' : '360px',
          transform: 'translateX(-50%)',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.65), rgba(255,255,255,0.16), rgba(0,0,0,0.72))',
          boxShadow: '0 0 35px rgba(0,212,212,0.20)',
          zIndex: 60,
        }} />

        {visibles.map((pensee, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const rang = Math.floor(i / 2);
          const mobileScale = isMobile ? 0.72 : 1;
          const baseX = side * (isMobile ? 56 : 150);
          const spread = side * (rang * (isMobile ? 13 : 26));
          const x = baseX + spread;
          const y = (rang % 5) * (isMobile ? 12 : 18) + (side === -1 ? 6 : 0);
          const rotY = side === -1 ? 34 - rang * 2.2 : -34 + rang * 2.2;
          const rotZ = side === -1 ? -16 + rang * 4 : 16 - rang * 4;
          const z = 45 - rang;
          const isActive = active?.id === pensee.id;
          const anim = i % 3 === 0 ? 'cardFloatA' : i % 3 === 1 ? 'cardFloatB' : 'cardFloatC';
          const couleurBord = i % 3 === 0 ? '#00d4d4' : i % 3 === 1 ? '#ff3eb5' : '#ffd250';

          const transform = isActive
            ? `translateX(-50%) translateY(${isMobile ? -45 : -70}px) translateZ(130px) rotateY(0deg) rotateZ(0deg) scale(${isMobile ? 1.04 : 1.16})`
            : `translateX(calc(-50% + ${x}px)) translateY(${isMobile ? 28 + y : 44 + y}px) translateZ(${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${mobileScale})`;

          return (
            <div
              key={pensee.id}
              className="pensee-page"
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              onClick={() => ouvrirPopup(pensee)}
              role="button"
              tabIndex={0}
              style={{
                left: '50%',
                top: isMobile ? '58px' : '70px',
                zIndex: isActive ? 120 : 40 - rang,
                borderTop: `7px solid ${couleurBord}`,
                transform,
                animation: `${anim} ${3.8 + (i % 4) * 0.35}s ease-in-out infinite`,
                animationDelay: `${i * 0.12}s`,
              }}
            >
              <div style={{
                height: '100%',
                padding: isMobile ? '28px 13px 14px' : '42px 20px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: isActive ? 'center' : 'flex-start',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
              }}>
                <h3 style={{
                  color: '#1c100b',
                  fontSize: isMobile ? (isActive ? '15px' : '12px') : (isActive ? '23px' : '16px'),
                  lineHeight: 1.12,
                  fontWeight: 800,
                  marginBottom: isActive ? '10px' : '6px',
                  maxHeight: isActive ? '96px' : '55px',
                  overflow: 'hidden',
                }}>
                  {pensee.titre}
                </h3>
                <p style={{
                  color: 'rgba(28,16,11,0.62)',
                  fontSize: isMobile ? '9px' : '11px',
                  fontWeight: 700,
                }}>
                  par {pensee.auteur || 'Anonyme'}
                </p>
                {isActive && (
                  <p style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: isMobile ? '12px' : '18px',
                    color: 'rgba(28,16,11,0.45)',
                    fontSize: isMobile ? '9px' : '11px',
                    fontWeight: 700,
                  }}>
                    Cliquer pour ouvrir
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Pensees;
