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

function decouperTexte(texte, longueur = 650) {
  if (!texte) return [''];
  const paragraphes = texte.split(/\n\s*\n/).filter(p => p.trim());
  const pages = [];
  let page = '';

  paragraphes.forEach(paragraphe => {
    const bloc = paragraphe.trim();
    if ((page + '\n\n' + bloc).trim().length > longueur && page.trim()) {
      pages.push(page.trim());
      page = bloc;
    } else {
      page = (page + '\n\n' + bloc).trim();
    }
  });

  if (page.trim()) pages.push(page.trim());
  return pages.length ? pages : [texte];
}

function Pensees() {
  const navigate = useNavigate();
  const [pensees, setPensees] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [penseeOuverte, setPenseeOuverte] = React.useState(null);
  const [pageLecture, setPageLecture] = React.useState(0);
  const [formOuvert, setFormOuvert] = React.useState(false);
  const [titre, setTitre] = React.useState('');
  const [texte, setTexte] = React.useState('');
  const [pseudo, setPseudo] = React.useState('');
  const [message, setMessage] = React.useState('');
  const touchStartX = React.useRef(null);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chargerPensees = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pensees')
      .select('*')
      .eq('statut', 'published')
      .order('ordre', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setPensees([]);
    } else {
      setPensees(data || []);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { chargerPensees(); }, [chargerPensees]);

  const ouvrirPensee = (pensee) => {
    setPenseeOuverte(pensee);
    setPageLecture(0);
  };

  const fermerPopup = () => {
    setPenseeOuverte(null);
    setPageLecture(0);
  };

  const pages = React.useMemo(() => decouperTexte(penseeOuverte?.texte || ''), [penseeOuverte]);

  const pageSuivante = () => setPageLecture(p => Math.min(p + 1, pages.length - 1));
  const pagePrecedente = () => setPageLecture(p => Math.max(p - 1, 0));

  const envoyerPensee = async (e) => {
    e.preventDefault();
    setMessage('');

    const titreNet = titre.trim();
    const texteNet = texte.trim();
    const pseudoNet = pseudo.trim();

    if (!titreNet || !texteNet || !pseudoNet) {
      setMessage('Il faut un titre, un pseudo et un texte.');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const { error } = await supabase
      .from('pensees')
      .insert({
        titre: titreNet,
        texte: texteNet,
        auteur: pseudoNet,
        user_id: userId,
        source: 'visiteur',
        statut: 'en_attente',
        ordre: 9999,
      });

    if (error) {
      console.error(error);
      setMessage("Impossible d'envoyer la pensée pour le moment.");
      return;
    }

    setTitre('');
    setTexte('');
    setPseudo('');
    setMessage('Pensée envoyée. Elle apparaîtra après validation.');
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
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatBinder { 0%,100% { transform: translateY(0) rotateX(0deg); } 50% { transform: translateY(-8px) rotateX(2deg); } }
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
        .pensees-card { animation: fadeIn 0.6s ease forwards; }
        .binder:hover .sheet { transform: translateX(var(--hover-x)) translateY(var(--hover-y)) rotate(var(--hover-r)) !important; }
        .sheet { transition: transform .45s ease, box-shadow .3s ease, filter .3s ease; }
        .sheet:hover { filter: brightness(1.05); box-shadow: 0 20px 45px rgba(0,0,0,.7), 0 0 25px rgba(255,215,80,.25) !important; }
        .popup-page { white-space: pre-wrap; }
        @media (max-width: 600px) {
          .binder:hover .sheet { transform: translateX(var(--mobile-x)) translateY(var(--hover-y)) rotate(var(--hover-r)) !important; }
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

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '40px 20px 70px', minHeight: `${BARRES.length * (IMG_H + GAP) + 360}px` }}>
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <div className="pensees-card" style={{ background: 'linear-gradient(135deg, rgba(0,212,212,.18), rgba(255,105,180,.12), rgba(255,215,80,.10))', backdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,.10)', borderRadius: '24px', padding: isMobile ? '24px 18px' : '34px 42px', marginBottom: '28px', boxShadow: '0 16px 50px rgba(0,0,0,.45)', textAlign: 'center' }}>
              <h1 style={{ color: '#fff', fontSize: isMobile ? '27px' : '44px', letterSpacing: '1px', marginBottom: '14px', textShadow: '0 0 18px rgba(0,212,212,.35)' }}>Le Classeur des Pensées</h1>
              <p style={{ color: 'rgba(255,255,255,.86)', fontSize: isMobile ? '14px' : '17px', lineHeight: 1.75, maxWidth: '760px', margin: '0 auto' }}>
                Ici se rangent les petites phrases qui passent, les bouts d'émotion, les idées gribouillées trop vite et les pensées qu'on garde parfois dans un coin de page. Certaines viennent de Kevin Teo'Art, d'autres peuvent venir des visiteurs.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '34px' }}>
              <button onClick={() => setFormOuvert(true)} style={{ border: '1px solid rgba(255,215,80,.55)', background: 'linear-gradient(135deg, #ffd75c, #ff7ac8)', color: '#111', fontWeight: 800, fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '12px 18px' : '14px 28px', borderRadius: '999px', cursor: 'pointer', boxShadow: '0 10px 28px rgba(255,105,180,.25)' }}>
                Ajouter ma pensée
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement des pensées...</p>
            ) : pensees.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,.75)', textAlign: 'center', background: 'rgba(0,0,0,.55)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,.08)' }}>
                Aucune pensée publiée pour le moment.
              </div>
            ) : (
              <ClasseurPensees pensees={pensees} isMobile={isMobile} ouvrirPensee={ouvrirPensee} />
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

      {penseeOuverte && (
        <div onClick={fermerPopup} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '18px' }}>
          <div onClick={(e) => e.stopPropagation()} onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touchStartX.current === null) return; const dx = e.changedTouches[0].clientX - touchStartX.current; if (dx < -45) pageSuivante(); if (dx > 45) pagePrecedente(); touchStartX.current = null; }} style={{ width: 'min(760px, 96vw)', maxHeight: '88vh', overflow: 'hidden', background: 'linear-gradient(145deg, #fffaf0, #f4e6c8)', color: '#21160d', borderRadius: '20px', boxShadow: '0 30px 90px rgba(0,0,0,.75), 0 0 0 2px rgba(255,215,80,.45)', position: 'relative' }}>
            <button onClick={fermerPopup} style={{ position: 'absolute', top: '12px', right: '14px', background: 'rgba(0,0,0,.08)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', fontSize: '20px' }}>×</button>
            <div style={{ padding: isMobile ? '28px 20px 20px' : '42px 52px 34px' }}>
              <h2 style={{ fontSize: isMobile ? '25px' : '38px', textAlign: 'center', marginBottom: '8px', color: '#2d1b0d' }}>{penseeOuverte.titre}</h2>
              <p style={{ textAlign: 'center', color: 'rgba(45,27,13,.62)', fontSize: '14px', marginBottom: '24px' }}>par {penseeOuverte.auteur}</p>
              <div className="popup-page" style={{ minHeight: isMobile ? '260px' : '310px', maxHeight: '48vh', overflowY: 'auto', fontSize: isMobile ? '16px' : '18px', lineHeight: 1.9, color: '#2b1d12', padding: isMobile ? '0 4px' : '0 8px' }}>
                {pages[pageLecture]}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', gap: '12px' }}>
                <button onClick={pagePrecedente} disabled={pageLecture === 0} style={{ opacity: pageLecture === 0 ? .35 : 1, cursor: pageLecture === 0 ? 'default' : 'pointer', border: 'none', background: '#2d1b0d', color: '#fff', borderRadius: '999px', padding: '10px 18px' }}>←</button>
                <span style={{ color: 'rgba(45,27,13,.65)', fontWeight: 700 }}>{pageLecture + 1} / {pages.length}</span>
                <button onClick={pageSuivante} disabled={pageLecture === pages.length - 1} style={{ opacity: pageLecture === pages.length - 1 ? .35 : 1, cursor: pageLecture === pages.length - 1 ? 'default' : 'pointer', border: 'none', background: '#2d1b0d', color: '#fff', borderRadius: '999px', padding: '10px 18px' }}>→</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {formOuvert && (
        <div onClick={() => setFormOuvert(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 210, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '18px' }}>
          <form onSubmit={envoyerPensee} onClick={(e) => e.stopPropagation()} style={{ width: 'min(680px, 96vw)', background: 'rgba(8,8,14,.98)', border: '1px solid rgba(0,212,212,.28)', borderRadius: '22px', padding: isMobile ? '22px' : '32px', boxShadow: '0 24px 80px rgba(0,0,0,.75)' }}>
            <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '18px' }}>Partager une pensée</h2>
            <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Ton pseudo" style={champStyle} />
            <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre de ta pensée" style={champStyle} />
            <textarea value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Ta pensée..." rows={8} style={{ ...champStyle, resize: 'vertical', lineHeight: 1.6 }} />
            {message && <p style={{ color: message.includes('envoyée') ? '#00d4d4' : '#ff7ac8', textAlign: 'center', marginBottom: '14px' }}>{message}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setFormOuvert(false)} style={{ border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.06)', color: '#fff', borderRadius: '999px', padding: '11px 20px', cursor: 'pointer' }}>Annuler</button>
              <button type="submit" style={{ border: 'none', background: 'linear-gradient(135deg, #00d4d4, #ff7ac8)', color: '#000', fontWeight: 800, borderRadius: '999px', padding: '11px 22px', cursor: 'pointer' }}>Envoyer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const champStyle = {
  width: '100%',
  marginBottom: '14px',
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.14)',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#fff',
  outline: 'none',
  fontSize: '15px',
};

function ClasseurPensees({ pensees, isMobile, ouvrirPensee }) {
  const visibles = pensees.slice(0, isMobile ? 7 : 10);
  const largeur = isMobile ? 300 : 520;
  const hauteur = isMobile ? 360 : 430;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', perspective: '1100px', padding: isMobile ? '20px 0 10px' : '36px 0 20px' }}>
      <div className="binder" style={{ width: largeur, height: hauteur, position: 'relative', animation: 'floatBinder 6s ease-in-out infinite', transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', inset: isMobile ? '36px 4px 20px' : '42px 10px 22px', background: 'linear-gradient(135deg, #21140f, #5d2b36 45%, #18131e)', borderRadius: '24px 24px 18px 18px', boxShadow: '0 34px 80px rgba(0,0,0,.75), inset 0 0 0 2px rgba(255,215,80,.20)', transform: 'rotateX(6deg)' }} />
        <div style={{ position: 'absolute', left: isMobile ? '18px' : '35px', top: isMobile ? '54px' : '66px', width: '16px', height: isMobile ? '250px' : '300px', borderRadius: '999px', background: 'linear-gradient(#00d4d4,#ff7ac8)', boxShadow: '0 0 22px rgba(0,212,212,.5)' }} />
        {visibles.map((pensee, i) => {
          const decal = i * (isMobile ? 13 : 16);
          const rotate = -7 + i * 1.45;
          const z = visibles.length - i;
          const hoverX = `${(i - visibles.length / 2) * (isMobile ? 15 : 24)}px`;
          const mobileX = `${(i - visibles.length / 2) * 10}px`;
          const hoverY = `${-16 - i * 3}px`;
          const hoverR = `${rotate + (i % 2 === 0 ? -3 : 3)}deg`;

          return (
            <div
              key={pensee.id}
              className="sheet"
              onClick={() => ouvrirPensee(pensee)}
              style={{
                '--hover-x': hoverX,
                '--mobile-x': mobileX,
                '--hover-y': hoverY,
                '--hover-r': hoverR,
                position: 'absolute',
                left: isMobile ? 42 + decal * 0.35 : 74 + decal * 0.45,
                top: isMobile ? 34 + decal : 32 + decal,
                width: isMobile ? 230 : 350,
                height: isMobile ? 280 : 330,
                padding: isMobile ? '28px 18px' : '38px 28px',
                background: i % 3 === 0 ? 'linear-gradient(160deg, #fff8e7, #f0d7b2)' : i % 3 === 1 ? 'linear-gradient(160deg, #fff0f8, #e6c9dd)' : 'linear-gradient(160deg, #edfaff, #c9e8ed)',
                color: '#20140c',
                borderRadius: '12px 18px 18px 12px',
                boxShadow: '0 14px 40px rgba(0,0,0,.55)',
                transform: `translateZ(${z * 10}px) rotate(${rotate}deg)`,
                zIndex: 20 + z,
                cursor: 'pointer',
                overflow: 'hidden',
                borderLeft: '8px solid rgba(0,0,0,.16)',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: i % 3 === 0 ? '#ffd75c' : i % 3 === 1 ? '#ff7ac8' : '#00d4d4' }} />
              <h3 style={{ fontSize: isMobile ? '21px' : '28px', lineHeight: 1.15, marginBottom: '12px', textAlign: 'center' }}>{pensee.titre}</h3>
              <p style={{ fontSize: isMobile ? '13px' : '14px', textAlign: 'center', color: 'rgba(32,20,12,.62)', fontWeight: 700 }}>par {pensee.auteur}</p>
              <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center', color: 'rgba(32,20,12,.42)', fontSize: '12px', fontWeight: 700 }}>Cliquer pour ouvrir</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Pensees;
