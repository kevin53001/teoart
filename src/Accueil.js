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

const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${relatif.split('/').map(s => encodeURIComponent(s)).join('/')}`;
}

function getVisuelB(visuels) {
  if (!visuels) return null;
  if (visuels['B']) return cheminVersUrl(visuels['B']);
  if (visuels['b']) return cheminVersUrl(visuels['b']);
  const cle = Object.keys(visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
  if (cle) return cheminVersUrl(visuels[cle]);
  return null;
}

// ── Composants jauges (copiés depuis MonCompte) ──
function UneBarre({ pct, couleur, label, delai = 0, hauteur = 8 }) {
  const [anim, setAnim] = React.useState(0);
  const [affiche, setAffiche] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setAnim(pct), 200 + delai);
    let start = null;
    const duree = 2200;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duree, 1);
      setAffiche(Math.round(prog * pct));
      if (prog < 1) requestAnimationFrame(step);
    };
    const t2 = setTimeout(() => requestAnimationFrame(step), 200 + delai);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pct, delai]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', minWidth: '120px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: `${Math.max(hauteur, 26)}px`, background: 'rgba(255,255,255,0.06)', borderRadius: `${Math.max(hauteur, 26)}px`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${anim}%`, backgroundImage: couleur, borderRadius: `${Math.max(hauteur, 26)}px`, transition: `width 2.2s cubic-bezier(0.4,0,0.2,1) ${delai}ms`, minWidth: anim > 0 ? '40px' : '0' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.9)', zIndex: 2 }}>{affiche}%</span>
        </div>
      </div>
    </div>
  );
}

function TripleJauge({ pctJai, pctColo, pctJeVeux }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <UneBarre pct={pctJai}   couleur="linear-gradient(90deg,#00d4d4,#00aaaa)"  label="✓ J'ai"     delai={0}   hauteur={14} />
      <UneBarre pct={pctColo}  couleur="linear-gradient(90deg,#ffd250,#ffb428)"  label="🎨 Colorié"  delai={200} hauteur={14} />
      <UneBarre pct={pctJeVeux} couleur="linear-gradient(90deg,#ff3eb5,#cc2090)" label="♡ Je veux"  delai={400} hauteur={14} />
    </div>
  );
}

// ── Encart défilant ──
function EncartDefilant({ titre, couleur, images, onZoom }) {
  const [idx, setIdx] = React.useState(0);
  const [fade, setFade] = React.useState(true);
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % images.length);
        setFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  if (images.length === 0) return (
    <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center' }}>{titre}<br/>Aucune image</p>
    </div>
  );

  const img = images[idx];
  return (
    <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: `1px solid ${couleur}30`, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
      <div style={{ background: couleur, padding: '8px 14px' }}>
        <p style={{ color: '#000', fontSize: '12px', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>{titre}</p>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', position: 'relative', cursor: 'zoom-in' }}
        onClick={() => onZoom && onZoom(images, idx)}>
        <img src={img.url} alt={img.nom}
          style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '8px', opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease', display: 'block' }} />
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '8px' }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === idx ? couleur : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
      <div style={{ padding: '4px 12px 10px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.nom}</p>
      </div>
    </div>
  );
}

// ── Popup zoom ──
function PopupZoom({ images, indexDepart, onClose }) {
  const [idx, setIdx] = React.useState(indexDepart);
  const touchStartX = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [images.length, onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (!touchStartX.current) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) setIdx(i => diff > 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length);
        touchStartX.current = null;
      }}>
      <button onClick={onClose} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 10000 }}>✕</button>
      <img src={images[idx].url} alt={images[idx].nom} onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '10px', display: 'block' }} />
      {images.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
          style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>‹</button>
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
          style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>›</button>
        <p style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', zIndex: 10000 }}>{idx + 1} / {images.length}</p>
      </>}
    </div>
  );
}

// ── Logo premium ──
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
        style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', cursor: 'pointer', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease', willChange: 'transform' }} />
    </div>
  );
}

// ── Page principale ──
function Accueil() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  // const [userId, setUserId] = React.useState(null);
  const [stats, setStats] = React.useState({ totalIllus: 0, jAi: 0, colorie: 0, jeVeux: 0 });
  const [nouveautes, setNouveautes] = React.useState([]);
  const [coloriages, setColoriages] = React.useState([]);
  const [bestSellers, setBestSellers] = React.useState([]);
  const [favoris, setFavoris] = React.useState([]);
  const [popup, setPopup] = React.useState(null); // { images, index }
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
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
      if (!user) { navigate('/'); return; }
      // setUserId(user.id);

      // Stats collection
      const { count: total } = await supabase.from('illustrations').select('id', { count: 'exact', head: true }).eq('statut', 'published');
      const { count: jAiCount } = await supabase.from('collection').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('j_ai', true);
      const { count: colorieCount } = await supabase.from('coloriages').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: jeVeuxCount } = await supabase.from('collection').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('je_veux', true);
      setStats({ totalIllus: total || 0, jAi: jAiCount || 0, colorie: colorieCount || 0, jeVeux: jeVeuxCount || 0 });

      // Nouveautés coming soon
      const { data: nvx } = await supabase.from('illustrations').select('id, nom, visuels').eq('statut', 'coming_soon');
      setNouveautes((nvx || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom })).filter(i => i.url));

      // Derniers coloriages partagés
      const semaines = [1, 2, 3, 4, 6, 8];
      let colosData = [];
      for (const s of semaines) {
        const depuis = new Date(Date.now() - s * 7 * 24 * 3600 * 1000).toISOString();
        const { data } = await supabase.from('coloriages').select('id, image_url, illustration_id').not('image_url', 'is', null).gte('created_at', depuis).order('created_at', { ascending: false }).limit(12);
        if (data && data.length > 0) { colosData = data; break; }
      }
      setColoriages(colosData.map(c => ({ url: c.image_url, nom: 'Coloriage partagé' })));

      // Best sellers
      const { data: bs } = await supabase.from('illustrations').select('id, nom, visuels').eq('statut', 'published').eq('best_seller', true).limit(12);
      setBestSellers((bs || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom })).filter(i => i.url));

      // Favoris TeoArt
      const { data: fav } = await supabase.from('illustrations').select('id, nom, visuels').eq('statut', 'published').eq('favori', true).limit(12);
      setFavoris((fav || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom })).filter(i => i.url));

      setLoading(false);
    };
    charger();
  }, [navigate]);

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;

  const pctJai = stats.totalIllus > 0 ? (stats.jAi / stats.totalIllus) * 100 : 0;
  const pctColo = stats.totalIllus > 0 ? (stats.colorie / stats.totalIllus) * 100 : 0;
  const pctJeVeux = stats.totalIllus > 0 ? (stats.jeVeux / stats.totalIllus) * 100 : 0;

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
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.35); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,212,0.6); }
      `}</style>

      {/* Popup zoom global */}
      {popup && <PopupZoom images={popup.images} indexDepart={popup.index} onClose={() => setPopup(null)} />}

      {/* Bouton déco */}
      {!popup && <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
        style={{ position: 'fixed', top: '12px', left: '16px', zIndex: 100, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>⏻ Déco</button>}

      {/* Cloche */}
      {!popup && <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, cursor: 'pointer', fontSize: '22px' }}>🔔</div>}

      {/* Bannière haut */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* Navigation */}
      {!popup && (
        <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
          <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
              <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/accueil')} />
              <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => navigate('/livres')} />
              <img src={`${R2}/site/pastille_categories.png`} alt="Catalogue" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/catalogue')} />
            </div>
            <LogoPremium onClick={() => navigate('/presentation')} isMobile={isMobile} L={L} />
            <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, flexShrink: 0 }}>
              <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/pensees')} />
              <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => {}} />
              <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/mon-compte')} />
            </div>
          </div>
        </div>
      )}

      {/* Barres + Contenu */}
      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
        {/* Barres fond */}
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

        {/* Contenu */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 400}px` }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* ── Encart message d'accueil ── */}
            <div style={{ background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', padding: isMobile ? '24px 20px' : '36px 40px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
              <p style={{ color: '#00d4d4', fontSize: isMobile ? '20px' : '26px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.5px' }}>
                Bienvenue dans l'univers Kevin Teo'Art ✨
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.9', marginBottom: '20px' }}>
                Quelque part entre un carnet de croquis et un portail vers d'autres dimensions,<br />
                ce site c'est <em style={{ color: '#00d4d4' }}>ta collection personnelle</em> d'illustrations à colorier signées Kevin Teo'Art.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
                {[
                  { emoji: '📚', texte: 'Constitue ta collection' },
                  { emoji: '🎨', texte: 'Partage tes coloriages' },
                  { emoji: '⭐', texte: 'Accède aux exclus Patreon' },
                  { emoji: '💭', texte: 'Plonge dans mes pensées' },
                  { emoji: '🛒', texte: 'Télécharge tes illustrations' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,212,212,0.08)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{item.texte}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontStyle: 'italic' }}>
                Ce site c'est un peu ma maison numérique. Installe-toi, tu es chez toi. 🏠
              </p>
            </div>

            {/* ── Triple jauge ── */}
            {!loading && (
              <div style={{ padding: '0 4px' }}>
                <TripleJauge pctJai={pctJai} pctColo={pctColo} pctJeVeux={pctJeVeux} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '10px', textAlign: 'center' }}>
                  {stats.jAi} / {stats.totalIllus} illustrations · {stats.colorie} coloriages · {stats.jeVeux} en liste de souhaits
                </p>
              </div>
            )}

            {/* ── 4 encarts défilants ── */}
            {!loading && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <EncartDefilant titre="🌟 Nouveautés Patreon" couleur="#ffd250"
                  images={nouveautes}
                  onZoom={(imgs, i) => setPopup({ images: imgs, index: i })} />
                <EncartDefilant titre="🎨 Derniers coloriages" couleur="#00d4d4"
                  images={coloriages}
                  onZoom={(imgs, i) => setPopup({ images: imgs, index: i })} />
                <EncartDefilant titre="💎 Best sellers" couleur="#ff3eb5"
                  images={bestSellers}
                  onZoom={(imgs, i) => setPopup({ images: imgs, index: i })} />
                <EncartDefilant titre="❤️ Favoris TeoArt" couleur="#a78bfa"
                  images={favoris}
                  onZoom={(imgs, i) => setPopup({ images: imgs, index: i })} />
              </div>
            )}

            {/* ── Guide du site ── */}
            <div style={{ background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: isMobile ? '24px 20px' : '36px 40px', backdropFilter: 'blur(10px)' }}>
              <p style={{ color: '#fff', fontSize: isMobile ? '17px' : '20px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', letterSpacing: '0.5px' }}>
                🗺️ Comment fonctionne le site ?
              </p>

              {[
                {
                  emoji: '🖼️', titre: 'Le Catalogue',
                  texte: "C'est le cœur du site : toutes mes illustrations à colorier sont là, classées par catégorie et par année. Tu peux filtrer, rechercher, trier. Chaque vignette est cliquable pour ouvrir la fiche complète.",
                  couleur: '#00d4d4',
                },
                {
                  emoji: '✓ J\'ai', titre: 'La Collection — J\'ai',
                  texte: "Coche \"J'ai\" sur une illustration pour l'ajouter à ta collection personnelle. Tu peux suivre ta progression avec la jauge en haut de cette page. Les illustrations cochées automatiquement lors de ta première visite viennent de ta sélection initiale.",
                  couleur: '#00d4d4',
                },
                {
                  emoji: '♡', titre: 'La Collection — Je veux',
                  texte: "Tu craques pour une illustration mais tu ne l'as pas encore ? Coche \"Je veux\" pour la mettre en liste de souhaits. Pratique pour savoir quoi acheter en priorité !",
                  couleur: '#ff4d7d',
                },
                {
                  emoji: '🎨', titre: 'J\'ai colorié',
                  texte: "Tu as colorié une de mes illustrations ? Partage-la depuis la fiche illustration ! Tu peux uploader une photo de ton coloriage avec ou sans image. Les coloriages partagés apparaissent dans la fiche de l'illustration et dans les \"Derniers coloriages\" sur cette page d'accueil.",
                  couleur: '#ffd250',
                },
                {
                  emoji: '📚', titre: 'Les Livres & Recueils',
                  texte: "Mes illustrations sont regroupées en livres thématiques et en recueils annuels. Tu peux cocher \"J'ai\" directement sur un livre ou un recueil pour cocher toutes ses illustrations d'un coup.",
                  couleur: '#a78bfa',
                },
                {
                  emoji: '💭', titre: 'Les Pensées',
                  texte: "Une section un peu à part : des textes que j'écris, présentés dans une roue interactive. Tu peux liker, commenter, et même soumettre tes propres pensées (elles seront validées avant publication).",
                  couleur: '#ff3eb5',
                },
                {
                  emoji: '⭐', titre: 'Patreon 2026',
                  texte: "Les illustrations exclusives Patreon sont accessibles depuis le menu Catégories. Elles sont organisées par mois. Les nouveautés à venir apparaissent en aperçu (avec filigrane) dans l'encart \"Nouveautés Patreon\" ci-dessus.",
                  couleur: '#ffd250',
                },
                {
                  emoji: '🛒', titre: 'Le Panier & les Achats',
                  texte: "Tu peux ajouter des illustrations à ton panier et les télécharger en PDF haute résolution. Des réductions s'appliquent automatiquement : -15% dès 3 illustrations, -25% dès 6, -35% dès 10 !",
                  couleur: '#ff3eb5',
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: i < 7 ? '20px' : '0', paddingBottom: i < 7 ? '20px' : '0', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px', background: `${item.couleur}20`, border: `1px solid ${item.couleur}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: item.couleur, fontWeight: 'bold' }}>
                    {item.emoji}
                  </div>
                  <div>
                    <p style={{ color: item.couleur, fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{item.titre}</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.7' }}>{item.texte}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Bannière bas */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
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

export default Accueil;