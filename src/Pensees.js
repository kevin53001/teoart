import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';
const BANNER_MAX = '1200px';
const SPEED = '80s';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const KEVIN_CYAN = '#00d4d4';

const BARRES = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.40 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`), opacite: 0.30 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`), opacite: 0.20 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`), opacite: 0.15 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`), opacite: 0.10 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.05 },
];

const CATEGORIES = ['Portrait', 'Kawaii/Chibi', 'Manga', 'Noël', 'Halloween', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Animaux'];

const COULEURS_VISITEURS = [
  '#ff4d6d', '#ff7a3d', '#ffd250', '#a8e063', '#4cd964',
  '#2ecc71', '#5dade2', '#7b61ff', '#9b59b6', '#d96cff',
  '#ff3eb5', '#ff8fb3', '#ff6f61', '#c0c0c0', '#f5f5f5'
];

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

function couleurPensee(pensee) {
  if (pensee.couleur) return pensee.couleur;
  if (pensee.source === 'kevin') return KEVIN_CYAN;
  return COULEURS_VISITEURS[Math.abs(hashString(pensee.id || pensee.titre || '')) % COULEURS_VISITEURS.length];
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  return h;
}

function calculArc(nb) {
  if (nb <= 1) return 0;
  if (nb <= 10) return 78;
  if (nb <= 20) return 128;
  if (nb <= 30) return 188;
  if (nb <= 50) return 278;
  return 360;
}

function Pensees() {
  const navigate = useNavigate();
  const [pensees, setPensees] = React.useState([]);
  const [vues, setVues] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [popup, setPopup] = React.useState(null);
  const [pagePopup, setPagePopup] = React.useState(0);
  const [showForm, setShowForm] = React.useState(false);
  const [titreForm, setTitreForm] = React.useState('');
  const [texteForm, setTexteForm] = React.useState('');
  const [couleurForm, setCouleurForm] = React.useState(COULEURS_VISITEURS[0]);
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

      if (user) {
        const { data: vuesData, error: vuesError } = await supabase
          .from('pensees_vues')
          .select('pensee_id')
          .eq('user_id', user.id);

        if (vuesError) console.error('Erreur lecture vues pensées:', vuesError);

        const vuesMap = {};
        (vuesData || []).forEach(v => { vuesMap[v.pensee_id] = true; });
        setVues(vuesMap);
      }

      setLoading(false);
    };
    charger();
  }, []);

  const envoyerPensee = async () => {
    if (!titreForm.trim() || !texteForm.trim() || !userId) return;
    setSending(true);
    setMessage('');

    const couleurChoisie = couleurForm === KEVIN_CYAN ? COULEURS_VISITEURS[0] : couleurForm;

    const { error } = await supabase.from('pensees').insert({
      titre: titreForm.trim(),
      texte: texteForm.trim(),
      auteur: pseudo || 'Visiteur',
      user_id: userId,
      source: 'visiteur',
      statut: 'en_attente',
      ordre: 9999,
      couleur: couleurChoisie,
    });

    if (error) {
      setMessage("Impossible d'envoyer la pensée pour le moment.");
    } else {
      setMessage("Pensée envoyée. Elle apparaîtra après validation.");
      setTitreForm('');
      setTexteForm('');
      setCouleurForm(COULEURS_VISITEURS[0]);
      setTimeout(() => setShowForm(false), 1400);
    }

    setSending(false);
  };

  const ouvrirPopup = async (pensee) => {
    setPopup(pensee);
    setPagePopup(0);

    if (userId && pensee?.id && !vues[pensee.id]) {
      setVues(prev => ({ ...prev, [pensee.id]: true }));
      const { error } = await supabase
        .from('pensees_vues')
        .upsert({ user_id: userId, pensee_id: pensee.id }, { onConflict: 'user_id,pensee_id' });

      if (error) {
        console.error('Erreur enregistrement lecture pensée:', error);
      }
    }
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
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: var(--author-color, #00d4d4); }
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

        .btn-nuage {
          border: 1px solid rgba(255,62,181,0.42);
          background: rgba(255,62,181,0.18);
          color: #fff;
          font-weight: 800;
          font-size: 13px;
          padding: 10px 28px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 0 18px rgba(255,62,181,0.14), inset 0 0 18px rgba(255,62,181,0.10);
          backdrop-filter: blur(8px);
          transition: transform .2s ease, background .2s ease, border-color .2s ease;
        }
        .btn-nuage:hover {
          transform: translateY(-2px);
          background: rgba(255,62,181,0.28);
          border-color: rgba(255,62,181,0.70);
        }

        .donut-zone {
          position: relative;
          width: min(96vw, 1120px);
          height: 500px;
          margin-top: 42px;
          margin: 0 auto;
          perspective: 1000px;
          overflow: visible;
          user-select: none;
        }
        .donut-stage {
          position: absolute;
          left: 50%;
          top: 59%;
          width: 980px;
          height: 430px;
          transform: translate(-50%, -50%);
          transform-style: preserve-3d;
        }

        .fiche-wrap {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 142px;
          height: 230px;
          margin-left: -71px;
          margin-top: -115px;
          transform-style: preserve-3d;
          cursor: pointer;
          transition: filter .18s ease;
        }
        .fiche-wrap:hover { filter: brightness(1.12); }
        .fiche-face {
          position: absolute;
          pointer-events: none;
          inset: 0;
          border-radius: 15px;
          background:
            radial-gradient(circle at 28% 18%, rgba(255,255,255,0.035), transparent 38%),
            linear-gradient(145deg, rgba(24,24,24,0.98), rgba(4,4,4,0.99));
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 7px solid var(--accent);
          box-shadow:
            0 22px 46px rgba(0,0,0,0.66),
            0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent),
            0 0 24px color-mix(in srgb, var(--accent) 18%, transparent);
          overflow: hidden;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px 14px;
        }
        .fiche-face.back { transform: rotateY(180deg); }
        .fiche-face::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.035), transparent 28%, transparent 72%, rgba(0,0,0,0.34));
          pointer-events: none;
        }
        .fiche-title {
          position: relative;
          z-index: 2;
          color: #fff;
          font-size: 17px;
          line-height: 1.18;
          font-weight: 800;
          max-height: 86px;
          overflow: hidden;
          text-shadow: 0 2px 10px rgba(0,0,0,0.75);
        }
        .fiche-author {
          position: relative;
          z-index: 2;
          margin-top: 14px;
          color: var(--author-color, #00d4d4);
          font-size: 12px;
          line-height: 1.2;
          font-weight: 700;
          text-shadow: 0 0 10px color-mix(in srgb, var(--author-color, #00d4d4) 30%, transparent);
        }
        .fiche-edge {
          position: absolute;
          pointer-events: none;
          left: 100%;
          top: 4px;
          width: 16px;
          height: calc(100% - 8px);
          transform-origin: left center;
          transform: rotateY(90deg);
          background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 45%, #000), rgba(8,8,8,0.98));
          border-radius: 0 8px 8px 0;
          box-shadow: inset 0 0 16px rgba(0,0,0,0.8);
        }
        .fiche-reflet {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 128px;
          height: 190px;
          margin-left: -64px;
          margin-top: 108px;
          transform-origin: top center;
          border-radius: 15px;
          background: linear-gradient(to bottom, color-mix(in srgb, var(--accent) 20%, transparent), transparent 70%);
          opacity: 0.18;
          filter: blur(3px);
          pointer-events: none;
        }
        .donut-help { display: none; }

        .fiche-led {
          position: absolute;
          top: 10px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          z-index: 8;
        }
        .fiche-led.left { left: 10px; }
        .fiche-led.right { right: 10px; }

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
          .donut-zone { height: 380px; margin-top: 30px; }
          .donut-stage { width: 530px; height: 310px; }
          .fiche-wrap {
            width: 84px;
            height: 145px;
            margin-left: -42px;
            margin-top: -72px;
          }
          .fiche-face { border-radius: 10px; padding: 12px 8px; border-top-width: 5px; }
          .fiche-edge { width: 10px; }
          .fiche-title { font-size: 10px; max-height: 52px; }
          .fiche-author { font-size: 8px; margin-top: 8px; }
          .fiche-reflet { width: 72px; height: 108px; margin-left: -36px; margin-top: 70px; }

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

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: isMobile ? '28px 14px 60px' : '40px 20px 70px', minHeight: `${BARRES.length * (IMG_H + GAP) + 20}px` }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ color: '#00d4d4', fontSize: isMobile ? '18px' : '23px', letterSpacing: '1px', marginBottom: '12px', textAlign: 'center', textShadow: '0 0 16px rgba(0,212,212,0.35)' }}>
              MES PENSÉES
            </h1>

            <div className="premium-card" style={{ padding: isMobile ? '14px 16px' : '18px 26px', margin: '0 auto 18px', textAlign: 'center', maxWidth: '900px' }}>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: isMobile ? '12px' : '13px', lineHeight: 1.6, maxWidth: '820px', margin: '0 auto', whiteSpace: 'pre-line' }}>
                J'aime dessiner, mais il m'arrive aussi de jouer avec les mots. Alors, de temps en temps, je dépose ici quelques pensées, quelques souvenirs, des histoires ou simplement des émotions que j'avais envie de partager. Je ne suis pas écrivain, juste quelqu'un qui aime explorer cet univers à sa façon.

Vous pouvez parcourir ces textes au fil de vos envies, vous y reconnaître parfois, ou au contraire y découvrir des regards différents du vôtre. Et si l'inspiration vous rend visite, vous pouvez également partager vos propres écrits et ajouter votre voix à ce drôle de carnet collectif.
              </p>
            </div>

            {loading ? (
              <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>
            ) : pensees.length === 0 ? (
              <div className="premium-card" style={{ padding: '34px', textAlign: 'center', color: 'rgba(255,255,255,0.65)' }}>
                Aucune pensée publiée pour le moment.
              </div>
            ) : (
              <>
                <RoueDonut pensees={pensees} vues={vues} ouvrirPopup={ouvrirPopup} isMobile={isMobile} />
                <div style={{ textAlign: 'center', marginTop: isMobile ? '-86px' : '-132px', marginBottom: isMobile ? '18px' : '24px', position: 'relative', zIndex: 30 }}>
                  <button className="btn-nuage" onClick={() => setShowForm(true)}>
                    Ajouter ma pensée
                  </button>
                </div>
              </>
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
              <div style={{ padding: isMobile ? '22px 24px 18px' : '26px 34px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '10px', minHeight: '18px' }}>
                  <h2 style={{ fontSize: isMobile ? '10px' : '11px', lineHeight: 1.2, fontWeight: 800, color: 'rgba(36,19,12,0.58)', maxWidth: '55%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {popup.titre}
                  </h2>
                  <p style={{ fontSize: isMobile ? '9px' : '10px', lineHeight: 1.2, fontWeight: 700, color: 'rgba(36,19,12,0.46)', maxWidth: '42%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
                    {popup.auteur || 'Anonyme'}
                  </p>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
                  <p style={{ width: '100%', fontSize: isMobile ? '14px' : '15px', lineHeight: 1.55, whiteSpace: 'pre-wrap', textAlign: 'left', color: '#2c160e', margin: 0 }}>
                    {pagesPopup[pagePopup]}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                  <button onClick={pagePrecedente} disabled={pagePopup === 0} style={navPageBtn(pagePopup !== 0)}>‹</button>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(36,19,12,0.52)' }}>{pagePopup + 1} / {pagesPopup.length}</span>
                  <button onClick={pageSuivante} disabled={pagePopup >= pagesPopup.length - 1} style={navPageBtn(pagePopup < pagesPopup.length - 1)}>›</button>
                </div>

                <PenseeSocial pensee={popup} userId={userId} pseudo={pseudo} />
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
          <div onClick={e => e.stopPropagation()} className="premium-card" style={{ width: '540px', maxWidth: '96vw', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>×</button>
            <h2 style={{ color: '#fff', marginBottom: '14px', fontSize: '24px' }}>Ajouter ma pensée</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
              Elle sera envoyée avec ton pseudo et apparaîtra après validation. Le cyan est réservé aux pensées de Kevin Teo'Art.
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

            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Couleur de la fiche</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {COULEURS_VISITEURS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCouleurForm(c)}
                    aria-label={`Couleur ${c}`}
                    style={{
                      height: '34px',
                      borderRadius: '999px',
                      border: couleurForm === c ? '3px solid #fff' : '1px solid rgba(255,255,255,0.20)',
                      background: c,
                      cursor: 'pointer',
                      boxShadow: couleurForm === c ? `0 0 18px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

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

function RoueDonut({ pensees, vues, ouvrirPopup, isMobile }) {
  const zoneRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const rotationRef = React.useRef(0);
  const speedRef = React.useRef(0);
  const [rotation, setRotation] = React.useState(0);

  const visibles = pensees.slice(0, Math.min(pensees.length, 90));
  const count = visibles.length || 1;
  const arc = calculArc(count);
  const canLoop = arc >= 360;
  const ficheMarge = count < 12 ? 95 : count < 24 ? 82 : count < 40 ? 62 : 42;
  const limit = canLoop ? 999999 : Math.max(0, arc / 2 + ficheMarge);

  React.useEffect(() => {
    const animate = () => {
      let next = rotationRef.current + speedRef.current;

      if (!canLoop) {
        if (next > limit) {
          next = limit;
          speedRef.current *= 0.12;
        }
        if (next < -limit) {
          next = -limit;
          speedRef.current *= 0.12;
        }
      }

      rotationRef.current = next;
      setRotation(rotationRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canLoop, limit]);

  const handleMouseMove = (e) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const dist = (e.clientX - center) / (rect.width / 2);
    const deadZone = Math.abs(dist) < 0.08 ? 0 : dist;
    speedRef.current = Math.max(-1, Math.min(1, deadZone)) * 0.55;
  };

  const handleMouseLeave = () => {
    speedRef.current = 0;
  };

  const radiusX = isMobile ? 210 : 430;
  const radiusY = isMobile ? 82 : 156;
  const smallCountSpread = count < 18 ? (isMobile ? 28 : 42) : 0;

  return (
    <div ref={zoneRef} className="donut-zone" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="donut-stage">
        {visibles.map((pensee, i) => {
          const localAngle = count === 1 ? 0 : -arc / 2 + (arc / (count - 1)) * i;
          const angle = localAngle + rotation;
          const rad = (angle * Math.PI) / 180;
          const sin = Math.sin(rad);
          const cos = Math.cos(rad);

          const x = sin * radiusX + (count < 18 ? (i - (count - 1) / 2) * smallCountSpread : 0);
          const y = -cos * radiusY;
          const frontFactor = (cos + 1) / 2;
          const scale = 0.52 + frontFactor * 0.44;
          const rotateY = sin * -34;
          const lift = frontFactor > 0.92 ? -18 : 0;

          const zIndex = Math.round(1000 + frontFactor * 7000 - Math.abs(sin) * 900 + (i / 100));
          const opacity = 0.28 + frontFactor * 0.72;
          const couleur = couleurPensee(pensee);
          const lue = !!vues[pensee.id];

          return (
            <React.Fragment key={pensee.id}>
              <div
                className="fiche-reflet"
                style={{
                  '--accent': couleur,
                  transform: `translate(${x}px, ${y + 82}px) scale(${scale}, ${scale * 0.64})`,
                  opacity: frontFactor > 0.72 ? 0.10 : 0.025,
                  zIndex: Math.max(1, zIndex - 1200),
                }}
              />
              <div
                className="fiche-wrap"
                onClick={() => ouvrirPopup(pensee)}
                style={{
                  '--accent': couleur,
                  '--author-color': couleur,
                  transform: `translate(${x}px, ${y + lift}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  zIndex,
                  opacity,
                  pointerEvents: 'auto',
                }}
              >
                <div className="fiche-face front">
                  <div
                    className="fiche-led left"
                    style={{
                      background: lue ? '#ff3eb5' : '#4dff72',
                      boxShadow: lue ? '0 0 12px #ff3eb5' : '0 0 12px #4dff72',
                    }}
                  />
                  <div
                    className="fiche-led right"
                    style={{
                      background: lue ? '#ff3eb5' : '#4dff72',
                      boxShadow: lue ? '0 0 12px #ff3eb5' : '0 0 12px #4dff72',
                    }}
                  />
                  <FicheTexte pensee={pensee} />
                </div>
                <div className="fiche-face back">
                  <div
                    className="fiche-led left"
                    style={{
                      background: lue ? '#ff3eb5' : '#4dff72',
                      boxShadow: lue ? '0 0 12px #ff3eb5' : '0 0 12px #4dff72',
                    }}
                  />
                  <div
                    className="fiche-led right"
                    style={{
                      background: lue ? '#ff3eb5' : '#4dff72',
                      boxShadow: lue ? '0 0 12px #ff3eb5' : '0 0 12px #4dff72',
                    }}
                  />
                  <FicheTexte pensee={pensee} />
                </div>
                <div className="fiche-edge" />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function FicheTexte({ pensee }) {
  return (
    <>
      <div className="fiche-title">{pensee.titre}</div>
      <div className="fiche-author">par {pensee.auteur || 'Anonyme'}</div>
    </>
  );
}

function PenseeSocial({ pensee, userId, pseudo }) {
  const [likes, setLikes] = React.useState([]);
  const [commentaires, setCommentaires] = React.useState([]);
  const [texte, setTexte] = React.useState('');
  const [parentId, setParentId] = React.useState(null);
  const [envoi, setEnvoi] = React.useState(false);

  const penseeId = pensee?.id;
  const jaime = likes.some(l => l.user_id === userId);

  React.useEffect(() => {
    const charger = async () => {
      if (!penseeId) return;

      const { data: likesData } = await supabase
        .from('likes_pensees')
        .select('user_id')
        .eq('pensee_id', penseeId);

      setLikes(likesData || []);

      const { data: commentsRaw } = await supabase
        .from('commentaires_pensees')
        .select('id, texte, user_id, parent_id, created_at')
        .eq('pensee_id', penseeId)
        .order('created_at', { ascending: true });

      if (commentsRaw && commentsRaw.length > 0) {
        const uids = [...new Set(commentsRaw.map(c => c.user_id).filter(Boolean))];
        let profilsMap = {};
        if (uids.length > 0) {
          const { data: profils } = await supabase
            .from('profils')
            .select('id, pseudo, prenom')
            .in('id', uids);
          (profils || []).forEach(p => { profilsMap[p.id] = p.pseudo || p.prenom || 'Anonyme'; });
        }
        setCommentaires(commentsRaw.map(c => ({ ...c, pseudo: profilsMap[c.user_id] || 'Anonyme' })));
      } else {
        setCommentaires([]);
      }
    };

    charger();
  }, [penseeId]);

  const toggleLike = async () => {
    if (!penseeId || !userId) return;

    if (jaime) {
      await supabase
        .from('likes_pensees')
        .delete()
        .eq('pensee_id', penseeId)
        .eq('user_id', userId);

      setLikes(prev => prev.filter(l => l.user_id !== userId));
    } else {
      await supabase
        .from('likes_pensees')
        .insert({ pensee_id: penseeId, user_id: userId });

      setLikes(prev => [...prev, { user_id: userId }]);
    }
  };

  const envoyerCommentaire = async () => {
    if (!texte.trim() || !penseeId || !userId) return;

    setEnvoi(true);
    const { data } = await supabase
      .from('commentaires_pensees')
      .insert({
        pensee_id: penseeId,
        user_id: userId,
        parent_id: parentId,
        texte: texte.trim(),
      })
      .select('id, texte, user_id, parent_id, created_at')
      .single();

    if (data) {
      setCommentaires(prev => [...prev, { ...data, pseudo: pseudo || 'Anonyme' }]);
      setTexte('');
      setParentId(null);
    }

    setEnvoi(false);
  };

  const racines = commentaires.filter(c => !c.parent_id);
  const reponsesDe = (id) => commentaires.filter(c => c.parent_id === id);

  return (
    <div style={{
      marginTop: '8px',
      borderTop: '1px solid rgba(36,19,12,0.12)',
      paddingTop: '8px',
      color: '#24130c',
      fontSize: '12px',
    }}>
      <button
        onClick={toggleLike}
        style={{
          border: 'none',
          background: jaime ? 'rgba(255,62,181,0.18)' : 'rgba(36,19,12,0.08)',
          color: jaime ? '#c01870' : '#24130c',
          padding: '6px 12px',
          borderRadius: '999px',
          cursor: 'pointer',
          fontWeight: 800,
          marginBottom: '8px',
        }}
      >
        ♥ {likes.length} {jaime ? "J'aime" : "Aimer"}
      </button>

      <div style={{ maxHeight: '82px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '8px' }}>
        {racines.map(c => (
          <div key={c.id} style={{ background: 'rgba(36,19,12,0.06)', borderRadius: '10px', padding: '7px 9px' }}>
            <strong>{c.pseudo}</strong>
            <p style={{ whiteSpace: 'pre-wrap', marginTop: '3px' }}>{c.texte}</p>
            <button onClick={() => setParentId(c.id)} style={{ background: 'none', border: 'none', color: '#008b9a', cursor: 'pointer', fontSize: '11px', marginTop: '3px' }}>Répondre</button>

            {reponsesDe(c.id).map(r => (
              <div key={r.id} style={{ marginTop: '6px', marginLeft: '14px', borderLeft: '2px solid rgba(0,212,212,0.25)', paddingLeft: '8px' }}>
                <strong>{r.pseudo}</strong>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: '3px' }}>{r.texte}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {parentId && (
        <div style={{ color: '#008b9a', fontSize: '11px', marginBottom: '5px' }}>
          Réponse en cours
          <button onClick={() => setParentId(null)} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#c01870' }}>annuler</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px' }}>
        <textarea
          value={texte}
          onChange={e => setTexte(e.target.value)}
          placeholder="Ajouter un commentaire..."
          rows={1}
          style={{
            flex: 1,
            border: '1px solid rgba(36,19,12,0.15)',
            background: 'rgba(255,255,255,0.50)',
            borderRadius: '8px',
            padding: '7px 9px',
            resize: 'none',
            fontFamily: 'inherit',
            color: '#24130c',
          }}
        />
        <button
          onClick={envoyerCommentaire}
          disabled={!texte.trim() || envoi}
          style={{
            border: 'none',
            background: texte.trim() ? '#00d4d4' : 'rgba(36,19,12,0.12)',
            color: texte.trim() ? '#000' : 'rgba(36,19,12,0.35)',
            borderRadius: '8px',
            padding: '0 12px',
            fontWeight: 800,
            cursor: texte.trim() ? 'pointer' : 'default',
          }}
        >
          OK
        </button>
      </div>
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
