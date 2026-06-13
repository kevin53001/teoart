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

        .donut-zone {
          position: relative;
          width: min(94vw, 980px);
          height: 650px;
          margin: 0 auto;
          perspective: 1250px;
          overflow: visible;
          user-select: none;
        }
        .donut-shadow {
          position: absolute;
          left: 50%;
          top: 60%;
          width: min(84vw, 760px);
          height: 190px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0,212,212,0.16), rgba(255,62,181,0.10) 42%, rgba(0,0,0,0) 72%);
          filter: blur(4px);
          pointer-events: none;
        }
        .donut-stage {
          position: absolute;
          left: 50%;
          top: 55%;
          width: 760px;
          height: 500px;
          transform-style: preserve-3d;
          transform: translate(-50%, -50%) rotateX(10deg);
          border-radius: 50%;
        }
        .donut-hole {
          position: absolute;
          left: 50%;
          top: 58%;
          width: 260px;
          height: 118px;
          transform: translate(-50%, -50%) translateZ(20px);
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.98), rgba(0,0,0,0.82) 58%, rgba(0,212,212,0.16) 78%, rgba(255,210,80,0.13) 100%);
          border: 1px solid rgba(0,212,212,0.25);
          box-shadow: inset 0 0 44px rgba(0,0,0,0.95), 0 0 34px rgba(0,212,212,0.13);
          z-index: 600;
          pointer-events: none;
        }
        .donut-info {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 190px;
          transform: translate(-50%, -50%);
          text-align: center;
          color: rgba(255,255,255,0.58);
          font-size: 11px;
          line-height: 1.35;
          z-index: 620;
          pointer-events: none;
        }

        .fiche-donut {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 74px;
          height: 250px;
          margin-left: -37px;
          margin-top: -125px;
          transform-origin: 37px 125px;
          border-radius: 10px;
          background: radial-gradient(circle at 26% 10%, rgba(255,255,255,0.98), rgba(255,248,231,0.98) 48%, rgba(230,211,178,0.98) 100%);
          border: 1px solid rgba(255,255,255,0.55);
          border-top: 7px solid var(--accent);
          box-shadow: 0 18px 28px rgba(0,0,0,0.42);
          cursor: pointer;
          transition: transform .22s ease, filter .2s ease, box-shadow .2s ease, z-index .2s ease;
          overflow: hidden;
          transform-style: preserve-3d;
        }
        .fiche-donut:hover {
          filter: brightness(1.12);
          box-shadow: 0 25px 46px rgba(0,0,0,0.58), 0 0 30px rgba(0,212,212,0.22);
          z-index: 900 !important;
        }
        .fiche-donut::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.10), transparent 24%, transparent 76%, rgba(0,0,0,0.13));
          pointer-events: none;
        }
        .fiche-contenu {
          position: absolute;
          left: 0;
          right: 0;
          top: 26px;
          padding: 10px 8px;
          text-align: center;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity .2s ease, transform .2s ease;
          pointer-events: none;
        }
        .fiche-donut:hover .fiche-contenu {
          opacity: 1;
          transform: translateY(0);
        }
        .fiche-titre {
          color: #1c100b;
          font-weight: 900;
          font-size: 13px;
          line-height: 1.08;
          margin-bottom: 6px;
          max-height: 76px;
          overflow: hidden;
        }
        .fiche-auteur {
          color: rgba(28,16,11,0.62);
          font-size: 9px;
          font-weight: 800;
        }

        .donut-controls {
          position: absolute;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          text-align: center;
          width: 100%;
          pointer-events: none;
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

        @media (max-width: 600px) {
          .donut-zone { height: 490px; }
          .donut-stage { width: 480px; height: 340px; transform: translate(-50%, -50%) rotateX(10deg); }
          .donut-hole { width: 160px; height: 76px; }
          .donut-info { width: 128px; font-size: 9px; }
          .fiche-donut {
            width: 48px;
            height: 164px;
            margin-left: -24px;
            margin-top: -82px;
            transform-origin: 24px 82px;
            border-radius: 8px;
          }
          .fiche-contenu { top: 14px; padding: 8px 5px; }
          .fiche-titre { font-size: 9px; max-height: 54px; }
          .fiche-auteur { font-size: 7px; }
          .donut-controls { bottom: 0; font-size: 10px; }
        }
      `}</style>

      <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, cursor: 'pointer', fontSize: '22px' }}>🔔</div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

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
                Une roue de petites fiches. Fais glisser ton curseur à gauche ou à droite : plus tu t'éloignes du centre, plus elle tourne vite.
                Arrête-toi sur une fiche pour la lire, puis clique pour l'ouvrir.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: isMobile ? '18px' : '20px' }}>
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
              <RoueDonut pensees={pensees} ouvrirPopup={ouvrirPopup} isMobile={isMobile} />
            )}
          </div>
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

function RoueDonut({ pensees, ouvrirPopup, isMobile }) {
  const zoneRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const angleRef = React.useRef(0);
  const speedRef = React.useRef(0);
  const [angle, setAngle] = React.useState(0);

  React.useEffect(() => {
    const animate = () => {
      angleRef.current += speedRef.current;
      setAngle(angleRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const dist = (e.clientX - center) / (rect.width / 2);
    speedRef.current = Math.max(-1, Math.min(1, dist)) * 0.85;
  };

  const handleMouseLeave = () => {
    speedRef.current = 0;
  };

  const visibles = pensees.slice(0, Math.min(pensees.length, 32));
  const count = visibles.length || 1;
  const radiusX = isMobile ? 178 : 292;
  const radiusY = isMobile ? 72 : 118;
  const lift = isMobile ? 34 : 52;

  return (
    <div ref={zoneRef} className="donut-zone" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="donut-shadow" />
      <div className="donut-stage">
        {visibles.map((pensee, i) => {
          const base = (360 / count) * i + angle;
          const normalized = ((base % 360) + 360) % 360;
          const front = normalized > 330 || normalized < 30;
          const back = normalized > 150 && normalized < 210;
          const z = front ? 820 : back ? 30 : 260 + Math.round(Math.cos((normalized * Math.PI) / 180) * 120);
          const accent = i % 3 === 0 ? '#00d4d4' : i % 3 === 1 ? '#ff3eb5' : '#ffd250';

          return (
            <div
              key={pensee.id}
              className="fiche-donut"
              onClick={() => ouvrirPopup(pensee)}
              style={{
                '--accent': accent,
                transform: `translate(${Math.sin((base * Math.PI) / 180) * radiusX}px, ${-Math.cos((base * Math.PI) / 180) * radiusY}px) translateZ(${front ? lift : 0}px) rotateY(${Math.sin((base * Math.PI) / 180) * 34}deg) rotateZ(${Math.sin((base * Math.PI) / 180) * 6}deg)`,
                zIndex: z,
                opacity: back ? 0.48 : 1,
              }}
            >
              <div className="fiche-contenu">
                <div className="fiche-titre">{pensee.titre}</div>
                <div className="fiche-auteur">par {pensee.auteur || 'Anonyme'}</div>
              </div>
            </div>
          );
        })}
        <div className="donut-hole">
          <div className="donut-info">
            Déplace le curseur<br />à gauche ou à droite
          </div>
        </div>
      </div>
      <div className="donut-controls">Les fiches sont debout · Survole une tranche pour l’ouvrir</div>
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

export default Pensees;
