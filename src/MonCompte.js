import React from 'react';
import ReactDOM from 'react-dom';
import OngletsLateraux from './OngletsLateraux';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import BoutonsFlottants from './BoutonsFlottants';
import BandeLegale from './BandeLegale';
import PopupFicheIllu from './PopupFicheIllu';
import { usePWAInstallable, reactiverBannerePWA } from './BannerePWA';

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

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${relatif.split('/').map(s => encodeURIComponent(s)).join('/')}`;
}

function getVisuelPresentation(visuels) {
  if (!visuels) return null;
  const cle = Object.keys(visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
  if (cle) return cheminVersUrl(visuels[cle]);
  if (visuels['B']) return cheminVersUrl(visuels['B']);
  if (visuels['b']) return cheminVersUrl(visuels['b']);
  return null;
}

// ─── POINT 1 : labels blancs, police plus grande ───────────────────────────
function UneBarre({ pct, couleur, label, delai = 0, hauteur = 8, showLabel = true }) {
  const [anim, setAnim] = React.useState(0);
  const [affiche, setAffiche] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setAnim(pct), 200 + delai);
    let start = null;
    const duree = 2200;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duree, 1);
      setAffiche(parseFloat((prog * pct).toFixed(2)));
      if (prog < 1) requestAnimationFrame(step);
    };
    const t2 = setTimeout(() => requestAnimationFrame(step), 200 + delai);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pct, delai]);
  const barreHauteur = showLabel ? Math.max(hauteur, 26) : hauteur;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      {showLabel && (
        // POINT 1 : couleur blanc (#fff), fontSize 14px (au lieu de 11px et couleur variable)
        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', minWidth: '120px', flexShrink: 0 }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: `${barreHauteur}px`, background: 'rgba(255,255,255,0.06)', borderRadius: `${barreHauteur}px`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${anim}%`, backgroundImage: couleur, borderRadius: `${barreHauteur}px`, transition: `width 2.2s cubic-bezier(0.4,0,0.2,1) ${delai}ms`, minWidth: anim > 0 ? '40px' : '0' }} />
        {showLabel && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px' }}>
            {/* Pourcentage toujours à droite de la barre, jamais débordant */}
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.9)', zIndex: 2 }}>{affiche}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function JaugeDouble({ pctJai, pctColorie, pctJeVeux, hauteur = 8, showLabels = true, couleurBarre = null }) {
  const cJai = couleurBarre || "linear-gradient(90deg,#00d4d4,#00aaaa)";
  if (showLabels) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <UneBarre pct={pctJai}    couleur="linear-gradient(90deg,#003333,#004444 20%,#00aaaa 60%,#00d4d4)"   label="✓ J'ai"    delai={0}   hauteur={hauteur} showLabel={true} />
        <UneBarre pct={pctColorie} couleur="linear-gradient(90deg,#332800,#554200 20%,#cc9000 60%,#ffd250)"  label="🎨 Colorié" delai={200} hauteur={hauteur} showLabel={true} />
        <UneBarre pct={pctJeVeux} couleur="linear-gradient(90deg,#330020,#550035 20%,#cc1880 60%,#ff3eb5)"   label="♡ Je veux" delai={400} hauteur={hauteur} showLabel={true} />
      </div>
    );
  }
  // Sans labels : barres compactes sans jauge (utilisées dans Ma Collection)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
      <UneBarre pct={pctJai}    couleur={cJai} label="" delai={0} hauteur={Math.max(4, hauteur-2)} showLabel={false} />
      {pctColorie > 0 && <UneBarre pct={pctColorie} couleur="linear-gradient(90deg,#ffd250,#ffb428)" label="" delai={0} hauteur={Math.max(3, hauteur-3)} showLabel={false} />}
    </div>
  );
}

function VignetteIlluLecture({ illu, taille = 100, aColorie = false }) {
  const url = getVisuelPresentation(illu.visuels);
  return (
    <div style={{ flexShrink: 0, width: `${taille}px`, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,212,212,0.15)', background: '#0a0a0a', position: 'relative' }}>
      {url ? <img src={url} alt={illu.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />}
      <div style={{ position: 'absolute', top: '3px', left: '3px', borderRadius: '3px', padding: '1px 4px', fontSize: '8px', fontWeight: 'bold', background: '#00d4d4', color: '#000' }}>✓</div>
      {aColorie && (
        <div style={{ position: 'absolute', bottom: `${taille > 80 ? 22 : 18}px`, left: '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,210,80,0.2)', border: '1px solid rgba(255,210,80,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>🎨</div>
      )}
      <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.85)' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
      </div>
    </div>
  );
}

// ─── Badges hexagonaux ────────────────────────────────────────────────────────

const BADGES_FAN = [
  { id: 'fan_bronze', lignes: ['Fan', 'Bronze'], seuil: 20, couleur: '#cd7f32', rgb: '205,127,50',  textColor: '#fff3e0', serie: 'fan',
    message: "Tu possèdes au moins 1 dessin sur 5 de ma collection... t'as commencé fort ! Merci du fond du cœur. Mais chut, j'ai au moins 10 nouvelles créations qui arrivent chaque mois, garde un œil sur ta jauge!" },
  { id: 'fan_argent', lignes: ['Fan', 'Argent'], seuil: 40, couleur: '#c0c0c0', rgb: '192,192,192', textColor: '#1a1a2e', serie: 'fan',
    message: "Une bonne partie de mon univers est déjà entre tes mains, c'est dingue ! Un grand MERCI à toi. Mais attention... chaque mois une flopée de nouveaux dessins débarque et ta collection va devoir suivre le rythme si tu veux maintenir ce niveau!" },
  { id: 'fan_or',     lignes: ['Fan', 'Or'],     seuil: 60, couleur: '#ffd700', rgb: '255,215,0',   textColor: '#3d2b00', serie: 'fan',
    message: "Au moins 3 dessins sur 5 chez toi ? Tu es officiellement passionné(e) et j'adore ça. Je ne sais même pas quoi dire tellement je suis touché. Mais voilà, je suis productif, au moins 10 dessins par mois, et ce badge va falloir le mériter encore et encore..." },
  { id: 'fan_ultime', lignes: ['Fan', 'Ultime'], seuil: 80, couleur: '#00d4d4', rgb: '0,212,212',   textColor: '#003333', serie: 'fan',
    message: "Tu possèdes au moins 80% de ma collection. C'est une sacré performance. Je suis sincèrement touché et un peu intimidé j'avoue. Mais je sors au moins 10 dessins par mois, il va falloir rester dans la course si tu veux maintenir ce niveau." },
];
const BADGES_COLO = [
  { id: 'colo_herbe',       lignes: ['Coloriste', 'en herbe'],    seuil: 10, couleur: '#a8e063', rgb: '168,224,99',  textColor: '#1a2e00', serie: 'colo',
    message: "Tes crayons commencent à chauffer ! Au moins 10% de mes dessins coloriés, c'est un début prometteur. Mais ce badge est capricieux... j'ajoute au minimum 10 dessins par mois, alors ne range pas ton matos !" },
  { id: 'colo_raisonnable', lignes: ['Coloriste', 'raisonnable'], seuil: 20, couleur: '#4a9eff', rgb: '74,158,255',  textColor: '#001433', serie: 'colo',
    message: "Raisonnable ? Toi ? On va dire ça... au minimum 20% de colorié c'est déjà très bien ! Mais 'raisonnable' ça veut dire qu'il reste 80% qui attendent tes couleurs. Et vu que j'arrive chaque mois avec de nouveaux dessins, tes crayons ont du boulot !" },
  { id: 'colo_productif',   lignes: ['Coloriste', 'productif'],   seuil: 30, couleur: '#a78bfa', rgb: '167,139,250', textColor: '#1a0033', serie: 'colo',
    message: "Productif c'est le mot ! Au moins un tiers de mes dessins ont eu droit à ta touche magique. Mais attention, je sors au moins 10 nouveaux dessins chaque mois comme un lapin sort des chapeaux... va falloir accélérer la cadence !" },
  { id: 'colo_intense',     lignes: ['Coloriste', 'intense'],     seuil: 40, couleur: '#ff6b35', rgb: '255,107,53',  textColor: '#3d1000', serie: 'colo',
    message: "INTENSE. C'est vraiment le mot qui va bien. Au moins 40% de mes dessins coloriés, tes feutres doivent être à bout de souffle ! Un immense merci pour autant d'amour mis dans mes dessins. Mais le seuil bouge avec ma prod, minimum 10 dessins par mois, alors ne repose pas tes mains trop longtemps !" },
  { id: 'colo_fou',         lignes: ['Coloriste', 'fou'],         seuil: 50, couleur: '#ff3eb5', rgb: '255,62,181',  textColor: '#3d0025', serie: 'colo',
    message: "AU MOINS UN DESSIN SUR DEUX sont passés sous tes couleurs. T'es complètement fou et je t'adore pour ça. Tes crayons méritent une retraite bien méritée... mais pas tout de suite, parce que ma collection se renouvelle tous les mois. COURAGE." },
];

// Hexagone à coins arrondis via path SVG
function hexPath(cx, cy, r, rCoin) {
  const angles = [90, 150, 210, 270, 330, 30]; // angles des sommets (orienté pointe en haut)
  const pts = angles.map(a => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });
  let d = '';
  for (let i = 0; i < 6; i++) {
    const prev = pts[(i + 5) % 6];
    const curr = pts[i];
    const next = pts[(i + 1) % 6];
    // Vecteurs vers prev et next
    const dx1 = prev.x - curr.x; const dy1 = prev.y - curr.y;
    const dx2 = next.x - curr.x; const dy2 = next.y - curr.y;
    const len1 = Math.sqrt(dx1*dx1+dy1*dy1); const len2 = Math.sqrt(dx2*dx2+dy2*dy2);
    const c = Math.min(rCoin, len1/2, len2/2);
    const p1 = { x: curr.x + dx1/len1*c, y: curr.y + dy1/len1*c };
    const p2 = { x: curr.x + dx2/len2*c, y: curr.y + dy2/len2*c };
    if (i === 0) d += `M ${p1.x} ${p1.y}`;
    else d += ` L ${p1.x} ${p1.y}`;
    d += ` Q ${curr.x} ${curr.y} ${p2.x} ${p2.y}`;
  }
  return d + ' Z';
}

function HexBadge({ badge, obtenu, delaiAnim, small, ouvert, onToggle }) {
  const ref = React.useRef(null);
  const [anime, setAnime] = React.useState(false);
  const [msgPos, setMsgPos] = React.useState(null);

  React.useEffect(() => {
    if (!obtenu) return;
    setAnime(false);
    if (delaiAnim !== null && delaiAnim !== undefined) {
      const t = setTimeout(() => setAnime(true), delaiAnim);
      return () => clearTimeout(t);
    }
  }, [delaiAnim, obtenu]);

  // Quand on ouvre, on calcule la position réelle du badge
  React.useEffect(() => {
    if (ouvert && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setMsgPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    } else {
      setMsgPos(null);
    }
  }, [ouvert]);

  const W = small ? 58 : 80;
  const H = small ? 67 : 92;
  const cx = W/2; const cy = H/2;
  const r = small ? 27 : 38;
  const rCoin = small ? 7 : 10;
  const path = hexPath(cx, cy, r, rCoin);
  const pathInner = hexPath(cx, cy, r - (small ? 5 : 7), rCoin - 2);
  // Relief 3D : ombre portée sous le badge
  const pathShadow = hexPath(cx, cy + (small ? 3 : 4), r, rCoin);

  const lignes = badge.lignes;
  const totalLines = lignes.length;
  const lineH = small ? 9 : 13;
  const startY = cy - ((totalLines - 1) * lineH) / 2;
  const fs0 = small ? 7 : 9;
  const fs1 = small ? 8 : 11;

  return (
    <div ref={ref}
      className={`hex-badge${obtenu ? ' obtenu' : ''}${anime ? ' badge-nouveau' : ''}`}
      onClick={() => obtenu && onToggle()}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
        cursor: obtenu ? 'pointer' : 'default',
        animationDelay: anime ? `${delaiAnim}ms` : undefined,
      }}>
      <svg viewBox={`0 0 ${W} ${H + (small ? 4 : 6)}`} width={W} height={H + (small ? 4 : 6)}
        style={{ display: 'block', filter: obtenu ? `drop-shadow(0 ${small ? 2 : 3}px ${small ? 6 : 10}px rgba(${badge.rgb},0.65))` : 'none' }}>
        <defs>
          <linearGradient id={`grad_${badge.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={obtenu ? '#fff' : '#2a2a2a'} stopOpacity={obtenu ? 0.35 : 1} />
            <stop offset="45%"  stopColor={obtenu ? badge.couleur : '#1a1a1a'} stopOpacity={1} />
            <stop offset="100%" stopColor={obtenu ? badge.couleur : '#0d0d0d'} stopOpacity={obtenu ? 0.7 : 1} />
          </linearGradient>
          {/* Gradient pour le relief latéral 3D */}
          <linearGradient id={`relief_${badge.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={obtenu ? badge.couleur : '#111'} stopOpacity={obtenu ? 0.9 : 0.5} />
            <stop offset="100%" stopColor={obtenu ? badge.couleur : '#0a0a0a'} stopOpacity={obtenu ? 0.4 : 0.2} />
          </linearGradient>
          <linearGradient id={`shine_${badge.id}`} x1="0%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%"  stopColor="#fff" stopOpacity={obtenu ? 0.5 : 0} />
            <stop offset="60%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Ombre portée 3D (relief bas) */}
        {obtenu && <path d={pathShadow} fill={`rgba(${badge.rgb},0.25)`} />}
        {/* Face latérale 3D (épaisseur) */}
        {obtenu && <path d={hexPath(cx, cy + (small ? 2 : 3), r - 1, rCoin)} fill={`url(#relief_${badge.id})`} />}
        {/* Face principale */}
        <path d={path} fill={`url(#grad_${badge.id})`}
          stroke={obtenu ? badge.couleur : 'rgba(255,255,255,0.07)'}
          strokeWidth={obtenu ? 1.5 : 1} />
        {/* Reflet brillant */}
        <path d={path} fill={`url(#shine_${badge.id})`} />
        {/* Bord intérieur */}
        {obtenu && <path d={pathInner} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />}
        {/* Texte */}
        {lignes.map((ligne, i) => (
          <text key={i}
            x={cx} y={startY + i * lineH}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={i === 0 ? fs0 : fs1}
            fontWeight={i === 0 ? "normal" : "bold"}
            fill={obtenu ? badge.textColor : 'rgba(255,255,255,0.15)'}
            style={{ fontFamily: 'sans-serif' }}
          >{ligne}</text>
        ))}
      </svg>

      {/* Message déroulant au clic — uniquement si badge obtenu */}
      {obtenu && ouvert && msgPos && ReactDOM.createPortal(
        <div style={{
          position: 'absolute',
          top: msgPos.top,
          left: msgPos.left,
          transform: 'translateX(-50%)',
          width: small ? '220px' : '260px',
          background: badge.id === 'fan_argent' ? '#141420' : `rgb(${badge.rgb.split(',').map(v => Math.max(8, Math.round(parseInt(v)*0.22))).join(',')})`,
          border: `1px solid rgba(${badge.rgb},0.7)`,
          borderRadius: '12px',
          padding: '12px 14px',
          color: '#fff',
          fontSize: '11px',
          lineHeight: 1.7,
          fontStyle: 'italic',
          zIndex: 99999,
          boxShadow: `0 0 18px rgba(${badge.rgb},0.4), inset 0 1px 0 rgba(${badge.rgb},0.3), 0 8px 32px #000`,
          textAlign: 'center',
          animation: 'fadeInDown 0.25s ease',
          pointerEvents: 'auto',
        }}
          onClick={() => onToggle()}
        >
          <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '10px', height: '10px', background: badge.id === 'fan_argent' ? '#141420' : `rgb(${badge.rgb.split(',').map(v => Math.max(8, Math.round(parseInt(v)*0.22))).join(',')})`, border: `1px solid rgba(${badge.rgb},0.7)`, borderBottom: 'none', borderRight: 'none' }} />
          {badge.message}
        </div>,
        document.body
      )}
    </div>
  );
}

function BadgesHexagonaux({ pctJai, pctColo }) {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [badgeOuvert, setBadgeOuvert] = React.useState(null); // id du badge dont le message est affiché

  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const tousLesBadges = [...BADGES_FAN, ...BADGES_COLO];
  const obtenus = tousLesBadges.filter(b => (b.serie === 'fan' ? pctJai : pctColo) >= b.seuil);

  const getDelai = (id) => {
    const idx = obtenus.findIndex(b => b.id === id);
    return idx >= 0 ? idx * 700 : null;
  };

  const handleBadgeClick = (id) => {
    setBadgeOuvert(prev => prev === id ? null : id);
  };

  return (
    <>
      <style>{`
        @keyframes badge-apparition {
        .zoom-social { display: flex; flex-direction: column; gap: 8px; padding: 10px 14px; background: rgba(0,0,0,0.7); border-top: 1px solid rgba(255,255,255,0.08); }
        .zoom-like-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.5); font-size: 12px; transition: color .2s; padding: 0; }
        .zoom-like-btn.actif { color: #ff4d7d; }
        .zoom-like-btn:hover { color: #ff4d7d; }
        .zoom-commentaire-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 6px 10px; color: #fff; font-size: 11px; width: 100%; resize: none; font-family: inherit; }
        .zoom-commentaire-input:focus { outline: none; border-color: rgba(0,212,212,0.4); }
        .zoom-commentaire-input::placeholder { color: rgba(255,255,255,0.3); }
        .zoom-commentaire { display: flex; gap: 6px; align-items: flex-start; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .zoom-commentaire:last-child { border-bottom: none; }

          0%   { transform: scale(0.15) rotate(-25deg); opacity: 0; filter: brightness(5) blur(3px); }
          30%  { transform: scale(1.35) rotate(8deg);   opacity: 1; filter: brightness(3); }
          50%  { transform: scale(0.88) rotate(-5deg);  filter: brightness(1.8); }
          70%  { transform: scale(1.12) rotate(3deg);   filter: brightness(1.3); }
          85%  { transform: scale(0.96) rotate(-1deg);  filter: brightness(1.1); }
          100% { transform: scale(1)    rotate(0deg);   opacity: 1; filter: brightness(1); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .badge-nouveau { animation: badge-apparition 1.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .hex-badge { transition: transform 0.2s; }
        .hex-badge.obtenu:hover { transform: scale(1.1) translateY(-2px); }
      `}</style>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>

        {/* ── Fan ── */}
        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,212,212,0.15)', borderRadius: '12px', padding: isMobile ? '8px 10px' : '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', flex: '1 1 auto' }}>
          <p style={{ color: 'rgba(0,212,212,0.8)', fontSize: '10px', fontWeight: 'bold', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Badge Fan (✓ J'ai)</p>
          <div style={{ display: 'flex', gap: isMobile ? '4px' : '6px', flexWrap: 'nowrap', justifyContent: 'center' }}>
            {BADGES_FAN.map(b => (
              <HexBadge key={b.id} badge={b} obtenu={pctJai >= b.seuil} delaiAnim={getDelai(b.id)} small={isMobile}
                ouvert={badgeOuvert === b.id} onToggle={() => handleBadgeClick(b.id)} />
            ))}
          </div>
        </div>

        {/* ── Coloriste ── */}
        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,210,80,0.15)', borderRadius: '12px', padding: isMobile ? '8px 10px' : '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', flex: '1 1 auto' }}>
          <p style={{ color: 'rgba(255,210,80,0.8)', fontSize: '10px', fontWeight: 'bold', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Badge Coloriste</p>
          <div style={{ display: 'flex', gap: isMobile ? '3px' : '6px', flexWrap: 'nowrap', justifyContent: 'center' }}>
            {BADGES_COLO.map(b => (
              <HexBadge key={b.id} badge={b} obtenu={pctColo >= b.seuil} delaiAnim={getDelai(b.id)} small={isMobile}
                ouvert={badgeOuvert === b.id} onToggle={() => handleBadgeClick(b.id)} />
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

// Jauge qui s'anime de 0 à sa valeur cible au montage
function JaugeAnimee({ pct, couleurClair, couleurPlein, hauteur = 4 }) {
  const [largeur, setLargeur] = React.useState(0);
  React.useEffect(() => {
    let raf1, raf2;
    setLargeur(0);
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setLargeur(pct);
      });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ height: `${hauteur}px`, background: 'rgba(255,255,255,0.06)', borderRadius: `${hauteur}px`, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${largeur}%`, background: `linear-gradient(90deg,${couleurClair},${couleurPlein})`, borderRadius: `${hauteur}px`, transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

function SectionMaCollection({ userId, totalIllus }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [anneesOuvertes, setAnneesOuvertes] = React.useState({});
  const [recueilsOuverts, setRecueilsOuverts] = React.useState({});
  const [livresOuverts, setLivresOuverts] = React.useState({});

  const COULEURS_ARC = ['#ff3eb5','#ff6b35','#ffd250','#a8e063','#00d4d4','#4a9eff','#9b59b6'];
  const getCouleurAnnee = (idx) => COULEURS_ARC[idx % COULEURS_ARC.length];
  const hexToRgb = (hex) => {
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `${r},${g},${b}`;
  };

  // Teinte de la même couleur que l'année, de très clair (idx=0) à plein (idx=total-1)
  const getCouleurEntree = (couleurBase, idx, total) => {
    const t = total <= 1 ? 1 : idx / (total - 1);
    const opPlein = 0.28 + t * 0.72;
    const opClair = opPlein * 0.35;
    try {
      const rgb = hexToRgb(couleurBase);
      return {
        plein: `rgba(${rgb},${opPlein.toFixed(2)})`,
        clair: `rgba(${rgb},${opClair.toFixed(2)})`
      };
    } catch(e) {
      return { plein: couleurBase, clair: couleurBase };
    }
  };
  const EXCLUS = new Set(['recueil_recueil de noel_2026', 'livre_colormefree']);

  React.useEffect(() => {
    const charger = async () => {
      try {
        const { data: collIllus } = await supabase.from('collection').select('illustration_id').eq('user_id', userId).eq('j_ai', true);
        const { data: colos } = await supabase.from('coloriages').select('illustration_id').eq('user_id', userId);
        const colosSet = new Set((colos || []).map(c => c.illustration_id));
        const illuIds = new Set((collIllus || []).map(c => c.illustration_id));

        const { data: tousLivres } = await supabase.from('livres').select('id, nom, annee, visuel_presentation, recueils_ids').in('statut', ['published', 'dossier']);
        const { data: tousRecueils } = await supabase.from('recueils').select('id, nom, annee, visuel_presentation').eq('statut', 'published');
        const { data: toutesIllus } = await supabase.from('illustrations').select('id, nom, annee, visuels, livres_ids, recueils_ids').eq('statut', 'published').order('nom');

        const livresMap = {};
        (tousLivres || []).forEach(l => { livresMap[l.id] = l; });
        const recueilsMap = {};
        (tousRecueils || []).forEach(r => { recueilsMap[r.id] = r; });

        const totauxAnnee = {};
        const totauxLivre = {};
        const totauxRecueil = {};
        const parAnnee = {};
        const horsAnnees = {};
        const illusParAnnee = {};

        EXCLUS.forEach(eid => {
          if (recueilsMap[eid]) horsAnnees[eid] = { type: 'recueil', info: recueilsMap[eid], illuIds: new Set(), livres: {} };
          if (livresMap[eid]) horsAnnees[eid] = { type: 'livre', info: livresMap[eid], illuIds: new Set() };
        });

        (toutesIllus || []).forEach(illu => {
          const illuPossedee = illuIds.has(illu.id) ? { ...illu, aColorie: colosSet.has(illu.id) } : null;
          const ridsExclus = (illu.recueils_ids || []).filter(rid => EXCLUS.has(rid));
          const ridsNormaux = (illu.recueils_ids || []).filter(rid => !EXCLUS.has(rid));
          const lidsExclus = (illu.livres_ids || []).filter(lid => EXCLUS.has(lid));
          const lidsNormaux = (illu.livres_ids || []).filter(lid => !EXCLUS.has(lid));

          ridsExclus.forEach(rid => {
            if (!horsAnnees[rid]) return;
            horsAnnees[rid].illuIds.add(illu.id);
            (illu.livres_ids || []).forEach(lid => {
              if (!livresMap[lid]) return;
              if (livresMap[lid].recueils_ids && livresMap[lid].recueils_ids.includes(rid)) {
                if (!horsAnnees[rid].livres[lid]) horsAnnees[rid].livres[lid] = { info: livresMap[lid], illuIds: new Set() };
                horsAnnees[rid].livres[lid].illuIds.add(illu.id);
                if (illuPossedee) {
                  if (!horsAnnees[rid].livres[lid].illus) horsAnnees[rid].livres[lid].illus = [];
                  if (!horsAnnees[rid].livres[lid].illus.find(i => i.id === illu.id)) horsAnnees[rid].livres[lid].illus.push(illuPossedee);
                }
              }
            });
            if (illuPossedee) {
              if (!horsAnnees[rid].illus) horsAnnees[rid].illus = [];
              if (!horsAnnees[rid].illus.find(i => i.id === illu.id)) horsAnnees[rid].illus.push(illuPossedee);
            }
          });
          lidsExclus.forEach(lid => {
            if (!horsAnnees[lid]) return;
            horsAnnees[lid].illuIds.add(illu.id);
            if (illuPossedee) {
              if (!horsAnnees[lid].illus) horsAnnees[lid].illus = [];
              if (!horsAnnees[lid].illus.find(i => i.id === illu.id)) horsAnnees[lid].illus.push(illuPossedee);
            }
          });

          const toutExclu = ridsNormaux.length === 0 && lidsNormaux.length === 0 && (ridsExclus.length > 0 || lidsExclus.length > 0);
          if (toutExclu) {
            ridsExclus.forEach(rid => { totauxRecueil[rid] = (totauxRecueil[rid] || 0) + 1; });
            lidsExclus.forEach(lid => { totauxLivre[lid] = (totauxLivre[lid] || 0) + 1; });
            return;
          }

          ridsNormaux.forEach(rid => {
            if (!recueilsMap[rid]) return;
            const anneeRecueil = String(recueilsMap[rid].annee || illu.annee || 'Sans année');
            if (!parAnnee[anneeRecueil]) parAnnee[anneeRecueil] = { recueils: {}, horsSerieParent: {} };
            if (!illusParAnnee[anneeRecueil]) illusParAnnee[anneeRecueil] = new Set();
            if (!illusParAnnee[anneeRecueil].has(illu.id)) { illusParAnnee[anneeRecueil].add(illu.id); totauxAnnee[anneeRecueil] = (totauxAnnee[anneeRecueil] || 0) + 1; }
            totauxRecueil[rid] = (totauxRecueil[rid] || 0) + 1;
            if (!parAnnee[anneeRecueil].recueils[rid]) parAnnee[anneeRecueil].recueils[rid] = { info: recueilsMap[rid], livres: {}, illuIds: new Set() };
            parAnnee[anneeRecueil].recueils[rid].illuIds.add(illu.id);
            lidsNormaux.forEach(lid => {
              if (!livresMap[lid]) return;
              if (livresMap[lid].recueils_ids && livresMap[lid].recueils_ids.includes(rid)) {
                totauxLivre[lid] = (totauxLivre[lid] || 0) + 1;
                if (!parAnnee[anneeRecueil].recueils[rid].livres[lid]) parAnnee[anneeRecueil].recueils[rid].livres[lid] = { info: livresMap[lid], illus: [], illuIds: new Set() };
                if (!parAnnee[anneeRecueil].recueils[rid].livres[lid].illuIds.has(illu.id)) {
                  parAnnee[anneeRecueil].recueils[rid].livres[lid].illuIds.add(illu.id);
                  if (illuPossedee) parAnnee[anneeRecueil].recueils[rid].livres[lid].illus.push(illuPossedee);
                }
              }
            });
          });

          lidsNormaux.forEach(lid => {
            if (!livresMap[lid]) return;
            const ridsduLivre = (livresMap[lid].recueils_ids || []).filter(rid => ridsNormaux.includes(rid));
            if (ridsduLivre.length > 0) return;
            const anneeLivre = String(livresMap[lid].annee || illu.annee || 'Sans année');
            if (!parAnnee[anneeLivre]) parAnnee[anneeLivre] = { recueils: {}, horsSerieParent: {} };
            if (!illusParAnnee[anneeLivre]) illusParAnnee[anneeLivre] = new Set();
            if (!illusParAnnee[anneeLivre].has(illu.id)) { illusParAnnee[anneeLivre].add(illu.id); totauxAnnee[anneeLivre] = (totauxAnnee[anneeLivre] || 0) + 1; }
            totauxLivre[lid] = (totauxLivre[lid] || 0) + 1;
            if (!parAnnee[anneeLivre].horsSerieParent[lid]) parAnnee[anneeLivre].horsSerieParent[lid] = { info: livresMap[lid], illus: [], illuIds: new Set() };
            if (!parAnnee[anneeLivre].horsSerieParent[lid].illuIds.has(illu.id)) {
              parAnnee[anneeLivre].horsSerieParent[lid].illuIds.add(illu.id);
              if (illuPossedee) parAnnee[anneeLivre].horsSerieParent[lid].illus.push(illuPossedee);
            }
          });

          if (ridsNormaux.length === 0 && lidsNormaux.length === 0) {
            const annee = String(illu.annee || 'Sans année');
            if (!parAnnee[annee]) parAnnee[annee] = { recueils: {}, horsSerieParent: {} };
            if (!illusParAnnee[annee]) illusParAnnee[annee] = new Set();
            if (!illusParAnnee[annee].has(illu.id)) { illusParAnnee[annee].add(illu.id); totauxAnnee[annee] = (totauxAnnee[annee] || 0) + 1; }
          }
        });

        setData({ parAnnee, totauxAnnee, totauxLivre, totauxRecueil, horsAnnees });
      } catch(e) { console.error('SectionMaCollection error:', e); }
      setLoading(false);
    };
    charger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (!data) return null;

  const { parAnnee, totauxAnnee, totauxLivre, totauxRecueil, horsAnnees } = data;
  const anneesSorted = Object.keys(parAnnee).filter(a => totauxAnnee[a] > 0).sort((a, b) => b - a);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {anneesSorted.map((annee, anneeIdx) => {
        const anneeData = parAnnee[annee];
        const totalAnnee = totauxAnnee[annee] || 1;
        const jaiAnnee = Object.values(anneeData.recueils).reduce((acc, r) => acc + Object.values(r.livres).reduce((a, l) => a + l.illus.length, 0), 0)
          + Object.values(anneeData.horsSerieParent || {}).reduce((a, l) => a + l.illus.length, 0);
        const ouvert = anneesOuvertes[annee];
        const couleurAnnee = getCouleurAnnee(anneeIdx);

        return (
          <div key={annee} style={{ border: `1px solid rgba(0,212,212,0.2)`, borderRadius: '12px', overflow: 'hidden' }}>
            <div onClick={() => setAnneesOuvertes(p => ({ ...p, [annee]: !p[annee] }))}
              style={{ padding: '12px 16px', cursor: 'pointer', background: ouvert ? 'rgba(0,212,212,0.06)' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'rgba(255,210,80,0.9)', fontSize: '15px', fontWeight: 'bold', minWidth: '50px' }}>{annee}</span>
              {/* POINT 2 : plus de JaugeDouble ici — juste la barre de progression couleur année */}
              <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(jaiAnnee / totalAnnee) * 100}%`, background: `linear-gradient(90deg,${couleurAnnee},${couleurAnnee}aa)`, borderRadius: '6px', transition: 'width 1.2s ease' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', whiteSpace: 'nowrap' }}>{jaiAnnee}/{totalAnnee}</span>
              <span style={{ color: ouvert ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.3)', fontSize: '16px', transition: 'transform .2s', transform: ouvert ? 'rotate(90deg)' : 'none' }}>›</span>
            </div>

            {ouvert && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(() => {
                  // Toutes les entrées de l'année (recueils + hors-série) pour calculer le total
                  const toutesEntrees = [
                    ...Object.values(anneeData.recueils),
                    ...Object.values(anneeData.horsSerieParent || {}).filter(l => totauxLivre[l.info.id] > 0)
                  ];
                  const totalEntrees = toutesEntrees.length;
                  return Object.values(anneeData.recueils).map((recueilData, rIdx) => {
                  const rid = recueilData.info.id;
                  const totalR = totauxRecueil[rid] || 1;
                  const jaiR = Object.values(recueilData.livres).reduce((a, l) => a + l.illus.length, 0);
                  const ouvertR = recueilsOuverts[rid];
                  const couleurR = getCouleurEntree(couleurAnnee, rIdx, totalEntrees);
                  return (
                    <div key={rid} style={{ border: '1px solid rgba(0,212,212,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div onClick={() => setRecueilsOuverts(p => ({ ...p, [rid]: !p[rid] }))}
                        style={{ padding: '10px 14px', cursor: 'pointer', background: ouvertR ? 'rgba(0,212,212,0.04)' : 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {recueilData.info.visuel_presentation
                          ? <img src={cheminVersUrl(recueilData.info.visuel_presentation)} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                          : <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#111', flexShrink: 0 }} />}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <p style={{ color: 'rgba(255,210,80,0.8)', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>{recueilData.info.nom}</p>
                          <JaugeAnimee pct={(jaiR/totalR)*100} couleurClair={couleurR.clair} couleurPlein={couleurR.plein} hauteur={4} />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiR}/{totalR}</span>
                        <span style={{ color: ouvertR ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.3)', fontSize: '16px', transition: 'transform .2s', transform: ouvertR ? 'rotate(90deg)' : 'none' }}>›</span>
                      </div>
                      {ouvertR && (
                        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.values(recueilData.livres).map((livreData, lIdx) => {
                            const lid = livreData.info.id;
                            const totalL = totauxLivre[lid] || 1;
                            const jaiL = livreData.illus.length;
                            const ouvertL = livresOuverts[lid];
                            const estDossier = !livreData.info.visuel_presentation;
                            const totalLivres = Object.values(recueilData.livres).length;
                            const couleurL = getCouleurEntree(couleurAnnee, lIdx, totalLivres);
                            return (
                              <div key={lid} style={{ border: `1px solid ${estDossier ? 'rgba(255,210,80,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', overflow: 'hidden' }}>
                                <div onClick={() => setLivresOuverts(p => ({ ...p, [lid]: !p[lid] }))}
                                  style={{ padding: '8px 12px', cursor: 'pointer', background: ouvertL ? 'rgba(255,255,255,0.03)' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {estDossier ? <span style={{ fontSize: '16px' }}>📁</span>
                                    : <img src={cheminVersUrl(livreData.info.visuel_presentation)} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />}
                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <p style={{ color: estDossier ? 'rgba(255,210,80,0.8)' : 'rgba(255,255,255,0.85)', fontSize: '11px', margin: 0 }}>{livreData.info.nom}</p>
                                    <JaugeAnimee pct={(jaiL/totalL)*100} couleurClair={couleurL.clair} couleurPlein={couleurL.plein} hauteur={3} />
                                  </div>
                                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiL}/{totalL}</span>
                                  <span style={{ color: ouvertL ? couleurL.plein : 'rgba(255,255,255,0.3)', fontSize: '14px', transition: 'transform .2s', transform: ouvertL ? 'rotate(90deg)' : 'none' }}>›</span>
                                </div>
                                {ouvertL && jaiL > 0 && (
                                  <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {livreData.illus.map(illu => <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />)}
                                  </div>
                                )}
                                {ouvertL && jaiL === 0 && (
                                  <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)' }}>
                                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center' }}>Aucune illustration possédée</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
                })()}

                {Object.values(anneeData.horsSerieParent || {}).filter(l => totauxLivre[l.info.id] > 0).map((livreData, lIdx) => {
                  const lid = livreData.info.id;
                  const totalL = totauxLivre[lid] || 1;
                  const jaiL = livreData.illus.length;
                  const ouvertL = livresOuverts[`hs_${lid}`];
                  const estDossier = !livreData.info.visuel_presentation;
                  const totalEntreesHS = Object.values(anneeData.horsSerieParent || {}).filter(l => totauxLivre[l.info.id] > 0).length;
                  const idxGlobal = Object.values(anneeData.recueils).length + lIdx;
                  const totalEntreesAnnee = Object.values(anneeData.recueils).length + totalEntreesHS;
                  const couleurHS = getCouleurEntree(couleurAnnee, idxGlobal, totalEntreesAnnee);
                  return (
                    <div key={`hs_${lid}`} style={{ border: `1px solid ${estDossier ? 'rgba(255,210,80,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', overflow: 'hidden' }}>
                      <div onClick={() => setLivresOuverts(p => ({ ...p, [`hs_${lid}`]: !p[`hs_${lid}`] }))}
                        style={{ padding: '8px 12px', cursor: 'pointer', background: ouvertL ? 'rgba(255,255,255,0.03)' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {estDossier ? <span style={{ fontSize: '16px' }}>📁</span>
                          : <img src={cheminVersUrl(livreData.info.visuel_presentation)} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <p style={{ color: estDossier ? 'rgba(255,210,80,0.8)' : 'rgba(255,255,255,0.8)', fontSize: '11px', margin: 0 }}>{livreData.info.nom}</p>
                          <JaugeAnimee pct={(jaiL/totalL)*100} couleurClair={couleurHS.clair} couleurPlein={couleurHS.plein} hauteur={3} />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiL}/{totalL}</span>
                        <span style={{ color: ouvertL ? couleurHS.plein : 'rgba(255,255,255,0.3)', fontSize: '14px', transition: 'transform .2s', transform: ouvertL ? 'rotate(90deg)' : 'none' }}>›</span>
                      </div>
                      {ouvertL && jaiL > 0 && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {livreData.illus.map(illu => <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />)}
                        </div>
                      )}
                      {ouvertL && jaiL === 0 && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)' }}>
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center' }}>Aucune illustration possédée</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {horsAnnees && Object.values(horsAnnees).map((entree) => {
        const eid = entree.info.id;
        const totalE = totauxRecueil[eid] || totauxLivre[eid] || 1;
        const jaiE = entree.illus ? entree.illus.length : 0;
        const ouvert = anneesOuvertes[`ha_${eid}`];
        return (
          <div key={`ha_${eid}`} style={{ border: `1px solid rgba(255,210,80,0.25)`, borderRadius: '12px', overflow: 'hidden' }}>
            <div onClick={() => setAnneesOuvertes(p => ({ ...p, [`ha_${eid}`]: !p[`ha_${eid}`] }))}
              style={{ padding: '12px 16px', cursor: 'pointer', background: ouvert ? 'rgba(255,210,80,0.06)' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {entree.info.visuel_presentation
                ? <img src={cheminVersUrl(entree.info.visuel_presentation)} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                : <span style={{ fontSize: '20px' }}>📁</span>}
              {/* Jauge hors-années */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ color: 'rgba(255,210,80,0.9)', fontSize: '14px', fontWeight: 'bold' }}>{entree.info.nom}</span>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(jaiE/totalE)*100}%`, background: 'linear-gradient(90deg,#ffd25044,#ffd250)', borderRadius: '4px', transition: 'width 1.2s ease' }} />
                </div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', whiteSpace: 'nowrap' }}>{jaiE}/{totalE}</span>
              <span style={{ color: ouvert ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.3)', fontSize: '16px', transition: 'transform .2s', transform: ouvert ? 'rotate(90deg)' : 'none' }}>›</span>
            </div>
            {ouvert && entree.type === 'recueil' && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.values(entree.livres || {}).map((livreData) => {
                  const lid = livreData.info.id;
                  const totalL = totauxLivre[lid] || 1;
                  const jaiL = livreData.illus ? livreData.illus.length : 0;
                  const ouvertL = livresOuverts[`ha_${lid}`];
                  const estDossier = !livreData.info.visuel_presentation;
                  return (
                    <div key={lid} style={{ border: `1px solid ${estDossier ? 'rgba(255,210,80,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', overflow: 'hidden' }}>
                      <div onClick={() => setLivresOuverts(p => ({ ...p, [`ha_${lid}`]: !p[`ha_${lid}`] }))}
                        style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {estDossier ? <span style={{ fontSize: '16px' }}>📁</span>
                          : <img src={cheminVersUrl(livreData.info.visuel_presentation)} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <p style={{ color: estDossier ? 'rgba(255,210,80,0.8)' : 'rgba(255,255,255,0.8)', fontSize: '11px', margin: 0 }}>{livreData.info.nom}</p>
                          <JaugeAnimee pct={(jaiL/totalL)*100} couleurClair="rgba(255,210,80,0.2)" couleurPlein="#ffd250" hauteur={3} />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiL}/{totalL}</span>
                        <span style={{ color: ouvertL ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '14px', transition: 'transform .2s', transform: ouvertL ? 'rotate(90deg)' : 'none' }}>›</span>
                      </div>
                      {ouvertL && jaiL > 0 && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {livreData.illus.map(illu => <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />)}
                        </div>
                      )}
                      {ouvertL && jaiL === 0 && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)' }}>
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center' }}>Aucune illustration possédée</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {ouvert && entree.type === 'livre' && entree.illus && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {entree.illus.map(illu => <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers copiés depuis Catalogue.js (nécessaires pour PopupFiche) ────────

// ─── ZoomSocial (likes + commentaires sur un coloriage zoomé) ────────────────
function SectionMesFavoris({ userId, userPseudo, onOuvrirPopup }) {
  const [illus, setIllus] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const charger = async () => {
      const { data: coll } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto').eq('user_id', userId).eq('je_veux', true);
      if (!coll || coll.length === 0) { setLoading(false); return; }
      const ids = coll.map(c => c.illustration_id);
      const { data: illusData } = await supabase.from('illustrations').select('id, nom, annee, categorie, visuels, prix, description, tags, livres_ids, recueils_ids').in('id', ids).order('nom');
      setIllus(illusData || []);
      setLoading(false);
    };
    charger();
  }, [userId]);



  const ouvrirPopup = (illu, index) => { if (onOuvrirPopup) onOuvrirPopup(illu, index, illus); };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (illus.length === 0) return <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Aucun favori pour l'instant.</p>;

  return (
    <>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '14px' }}>{illus.length} illustration{illus.length > 1 ? 's' : ''} dans tes favoris</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {illus.map((illu, idx) => {
          const url = getVisuelPresentation(illu.visuels);
          return (
            <div key={illu.id} onClick={() => ouvrirPopup(illu, idx)}
              style={{ flexShrink: 0, width: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,62,181,0.25)', background: '#0a0a0a', position: 'relative', cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,62,181,0.6)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,62,181,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}>
              {url ? <img src={url} alt={illu.nom} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100px', background: '#111' }} />}
              <div style={{ position: 'absolute', top: '3px', right: '3px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff3eb5" /></svg>
              </div>
              <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.85)' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
                {illu.prix && <p style={{ color: '#ff3eb5', fontSize: '8px' }}>{illu.prix} €</p>}
              </div>
            </div>
          );
        })}
      </div>

    </>
  );
}

// ─── Composant cadrage avatar (crop circulaire par drag) ────────────────────
function AvatarCrop({ src, onConfirm, onCancel }) {
  const canvasRef = React.useRef(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [scale, setScale] = React.useState(1);
  const [dragging, setDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState(null);
  const imgRef = React.useRef(null);
  const SIZE = 280; // taille du canvas carré

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // centrer l'image au départ
      const sc = Math.max(SIZE / img.width, SIZE / img.height);
      setScale(sc);
      setOffset({ x: (SIZE - img.width * sc) / 2, y: (SIZE - img.height * sc) / 2 });
    };
    img.src = src;
  }, [src]);

  React.useEffect(() => { dessiner(); }, [offset, scale]); // eslint-disable-line

  const dessiner = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    // fond sombre
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // image
    ctx.drawImage(img, offset.x, offset.y, img.width * scale, img.height * scale);
    // masque : tout assombrir sauf le cercle
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // cercle guide
    ctx.strokeStyle = '#00d4d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
  };

  const onMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMouseMove = (e) => { if (!dragging || !dragStart) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp = () => setDragging(false);
  const onWheel = (e) => { e.preventDefault(); setScale(s => Math.max(0.2, Math.min(5, s - e.deltaY * 0.001))); };

  // touch support
  const lastTouch = React.useRef(null);
  const onTouchStart = (e) => { const t = e.touches[0]; setDragging(true); setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y }); lastTouch.current = t; };
  const onTouchMove = (e) => { if (!dragging || !dragStart) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }); };
  const onTouchEnd = () => setDragging(false);

  const confirmer = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    if (!img) return;
    // recalculer le ratio canvas affichage → export 400px
    const ratio = 400 / SIZE;
    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, offset.x * ratio, offset.y * ratio, img.width * scale * ratio, img.height * scale * ratio);
    canvas.toBlob(blob => { onConfirm(blob); }, 'image/jpeg', 0.92);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Cadre ta photo de profil</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Glisse pour repositionner · Molette pour zoomer</p>
      <canvas
        ref={canvasRef}
        width={SIZE} height={SIZE}
        style={{ borderRadius: '50%', cursor: dragging ? 'grabbing' : 'grab', border: '3px solid rgba(0,212,212,0.5)', touchAction: 'none' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      />
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '10px 24px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Annuler</button>
        <button onClick={confirmer} style={{ background: 'rgba(0,212,212,0.2)', border: '1px solid rgba(0,212,212,0.5)', borderRadius: '10px', padding: '10px 24px', color: '#00d4d4', fontSize: '13px', cursor: 'pointer' }}>✓ Valider ce cadrage</button>
      </div>
    </div>
  );
}

// ─── POINT 4 : Mes Infos — refonte 2 colonnes ──────────────────────────────
function SectionMesInfos({ userId }) {
  const [profil, setProfil] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(null);
  const [showCrop, setShowCrop] = React.useState(false);
  const [cropSrc, setCropSrc] = React.useState(null);
  const pwa = usePWAInstallable();

  // POINT 5 : états pour la réinitialisation du mot de passe
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetEnvoye, setResetEnvoye] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetErreur, setResetErreur] = React.useState('');

  React.useEffect(() => {
    supabase.from('profils').select('*').eq('id', userId).single().then(({ data }) => {
      setProfil(data || {});
      setResetEmail(data?.email || '');
      setLoading(false);
    });
  }, [userId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setShowCrop(true);
  };

  const handleCropConfirm = (blob) => {
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(blob));
    setShowCrop(false);
    setCropSrc(null);
  };

  const handleSave = async () => {
    setSaving(true);
    let avatarUrl = profil.avatar_url;
    if (avatarFile) {
      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
        const response = await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, userId }),
        });
        const data = await response.json();
        if (data.url) { avatarUrl = data.url; }
        else { console.error('upload-avatar erreur:', data.error); }
      } catch (e) { console.error('upload-avatar exception:', e); }
    }
    await supabase.from('profils').update({
      pseudo: profil.pseudo, prenom: profil.prenom, nom: profil.nom,
      telephone: profil.telephone, adresse: profil.adresse, complement: profil.complement,
      code_postal: profil.code_postal, ville: profil.ville, etat: profil.etat, pays: profil.pays, avatar_url: avatarUrl,
    }).eq('id', userId);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  // États formulaire de contact
  const [contactSujet, setContactSujet] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');
  const [contactEnvoi, setContactEnvoi] = React.useState(false);
  const [contactEnvoye, setContactEnvoye] = React.useState(false);
  const [contactErreur, setContactErreur] = React.useState('');
  const [showContact, setShowContact] = React.useState(false);

  // POINT 5 : envoi du mail de réinitialisation
  const handleReset = async () => {
    if (!resetEmail.trim()) { setResetErreur('Adresse email requise.'); return; }
    setResetLoading(true); setResetErreur('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: 'https://www.kevinteoart.fr/reset-password',
    });
    setResetLoading(false);
    if (error) { setResetErreur(error.message); }
    else { setResetEnvoye(true); }
  };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;

  const handleContact = async () => {
    if (!contactSujet.trim() || !contactMessage.trim()) { setContactErreur('Merci de remplir le sujet et le message.'); return; }
    setContactEnvoi(true); setContactErreur('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sujet: contactSujet.trim(),
          message: contactMessage.trim(),
          userEmail: profil.email || '',
          userPseudo: profil.pseudo || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContactEnvoye(true);
        setContactSujet('');
        setContactMessage('');
        setTimeout(() => { setContactEnvoye(false); setShowContact(false); }, 3000);
      } else {
        setContactErreur("Erreur lors de l'envoi. Réessaie.");
      }
    } catch (e) {
      setContactErreur("Erreur réseau. Réessaie.");
    }
    setContactEnvoi(false);
  };

  const styleInput = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', width: '100%' };
  const styleLabel = { color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'block' };

  const champ = (label, key, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={styleLabel}>{label}</label>
      <input type={type} value={profil[key] || ''} onChange={e => setProfil(p => ({ ...p, [key]: e.target.value }))}
        style={styleInput}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,212,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
    </div>
  );

  const styleEncart = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' };
  const styleTitreEncart = { color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' };

  return (
    <>
      {showCrop && cropSrc && (
        <AvatarCrop src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => { setShowCrop(false); setCropSrc(null); }} />
      )}

      {/* Layout global : colonnes + bouton en dessous */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Ligne des deux colonnes ── */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Colonne gauche : 3 encarts ── */}
          <div style={{ flex: '2 1 340px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Encart 1 : Identité */}
            <div style={styleEncart}>
              <p style={styleTitreEncart}>👤 Identité</p>
              {champ('Pseudo', 'pseudo')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {champ('Prénom', 'prenom')}
                {champ('Nom', 'nom')}
              </div>
              {champ('Téléphone', 'telephone', 'tel')}
            </div>

            {/* Encart 2 : Mot de passe + reset */}
            <div style={styleEncart}>
              <p style={styleTitreEncart}>🔒 Mot de passe</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                Pour changer ton mot de passe, un lien de réinitialisation sera envoyé à ton adresse email.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={styleLabel}>Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => { setResetEmail(e.target.value); setResetEnvoye(false); setResetErreur(''); }}
                  style={styleInput}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,212,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  placeholder="ton@email.com"
                />
              </div>
              {resetErreur && <p style={{ color: '#ff8080', fontSize: '11px' }}>{resetErreur}</p>}
              {resetEnvoye
                ? <p style={{ color: '#00d4d4', fontSize: '12px' }}>✓ Email envoyé ! Vérifie ta boîte mail.</p>
                : (
                  <button onClick={handleReset} disabled={resetLoading}
                    style={{ background: 'rgba(0,212,212,0.12)', border: '1px solid rgba(0,212,212,0.35)', borderRadius: '8px', padding: '9px 16px', color: '#00d4d4', fontSize: '12px', cursor: resetLoading ? 'wait' : 'pointer', alignSelf: 'flex-start', transition: 'all .2s' }}>
                    {resetLoading ? 'Envoi...' : '📧 Envoyer le lien de réinitialisation'}
                  </button>
                )
              }
            </div>

            {/* Encart 3 : Adresse */}
            <div style={styleEncart}>
              <p style={styleTitreEncart}>📍 Adresse</p>
              {champ('Adresse', 'adresse')}
              {champ('Complément', 'complement')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                {champ('Code postal', 'code_postal')}
                {champ('Ville', 'ville')}
              </div>
              {champ('État / Province (optionnel)', 'etat')}
              {champ('Pays', 'pays')}
            </div>
          </div>

          {/* ── Colonne droite : photo de profil — alignée en haut, hauteur = 3 encarts gauche ── */}
          <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}>
            {/* paddingBottom pour ne pas dépasser sous le 3e encart (le bouton est en dehors) */}
            <div style={{ ...styleEncart, alignItems: 'center', justifyContent: 'flex-start', gap: '20px', height: '100%' }}>
              <p style={styleTitreEncart}>🖼 Photo de profil</p>
              <div style={{ width: '140px', height: '140px', flexShrink: 0 }}>
                <img
                  src={avatarPreview || profil.avatar_url || `${R2}/site/Logo.png`}
                  alt="avatar"
                  style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(0,212,212,0.4)', display: 'block' }}
                />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center' }}>
                JPG, PNG<br/>Recommandé 400×400px
              </p>
              <label style={{ background: 'rgba(0,212,212,0.12)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '8px', padding: '10px 18px', color: '#00d4d4', fontSize: '12px', cursor: 'pointer', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                📷 Choisir une photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>

              {/* ── Bouton installation PWA ── */}
              <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              {pwa.installed ? (
                <p style={{ color: 'rgba(255,62,181,0.7)', fontSize: '11px', textAlign: 'center' }}>✓ Application installée</p>
              ) : pwa.ios ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', width: '100%' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textAlign: 'center', lineHeight: 1.5 }}>
                    📱 Sur iPhone :<br/>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Partager ⎙ → "Sur l'écran d'accueil"</span>
                  </p>
                </div>
              ) : pwa.installable ? (
                <button
                  onClick={async () => { await pwa.installer(); }}
                  style={{ background: 'linear-gradient(135deg, rgba(255,62,181,0.18), rgba(255,62,181,0.08))', border: '1px solid rgba(255,62,181,0.45)', borderRadius: '8px', padding: '10px 18px', color: '#ff3eb5', fontSize: '12px', cursor: 'pointer', textAlign: 'center', width: '100%', boxSizing: 'border-box', boxShadow: '0 0 10px rgba(255,62,181,0.15)' }}>
                  📲 Installer l'application
                </button>
              ) : (
                <button
                  onClick={() => { reactiverBannerePWA(); window.location.reload(); }}
                  style={{ background: 'linear-gradient(135deg, rgba(255,62,181,0.18), rgba(255,62,181,0.08))', border: '1px solid rgba(255,62,181,0.45)', borderRadius: '8px', padding: '10px 18px', color: '#ff3eb5', fontSize: '12px', cursor: 'pointer', textAlign: 'center', width: '100%', boxSizing: 'border-box', boxShadow: '0 0 10px rgba(255,62,181,0.15)' }}>
                  📲 Installer l'application
                </button>
              )}
              {/* ── Formulaire de contact ── */}
              <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', fontStyle: 'italic' }}>
                Si quelque chose cloche ou que tu as une question, la boîte à lettres est ouverte. Je réponds quand les crayons me laissent souffler.
              </p>
              <button
                onClick={() => { setShowContact(v => !v); setContactEnvoye(false); setContactErreur(''); }}
                style={{ background: 'linear-gradient(135deg, rgba(255,210,80,0.18), rgba(255,160,40,0.08))', border: '1px solid rgba(255,210,80,0.45)', borderRadius: '8px', padding: '10px 18px', color: '#ffd250', fontSize: '12px', cursor: 'pointer', textAlign: 'center', width: '100%', boxSizing: 'border-box', boxShadow: '0 0 10px rgba(255,210,80,0.12)' }}>
                ✉️ Contacter Kevin
              </button>
              {showContact && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {contactEnvoye ? (
                    <p style={{ color: '#00cc66', fontSize: '12px', textAlign: 'center' }}>✓ Message envoyé !</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Sujet"
                        value={contactSujet}
                        onChange={e => setContactSujet(e.target.value)}
                        style={{ ...styleInput, fontSize: '12px', padding: '8px 10px' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,210,80,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                      <textarea
                        placeholder="Ton message…"
                        value={contactMessage}
                        onChange={e => setContactMessage(e.target.value)}
                        rows={4}
                        style={{ ...styleInput, fontSize: '12px', padding: '8px 10px', resize: 'vertical', fontFamily: 'inherit', minHeight: '80px' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,210,80,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                      {contactErreur && <p style={{ color: '#ff6b6b', fontSize: '11px' }}>{contactErreur}</p>}
                      <button
                        onClick={handleContact}
                        disabled={contactEnvoi || !contactSujet.trim() || !contactMessage.trim()}
                        style={{ background: (contactSujet.trim() && contactMessage.trim()) ? 'linear-gradient(135deg, rgba(255,210,80,0.25), rgba(255,160,40,0.15))' : 'rgba(255,255,255,0.04)', border: `1px solid ${(contactSujet.trim() && contactMessage.trim()) ? 'rgba(255,210,80,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '8px', color: (contactSujet.trim() && contactMessage.trim()) ? '#ffd250' : 'rgba(255,255,255,0.2)', fontSize: '12px', cursor: (contactSujet.trim() && contactMessage.trim()) ? 'pointer' : 'default', fontWeight: 'bold' }}>
                        {contactEnvoi ? 'Envoi...' : 'Envoyer'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {avatarPreview && (
                <>
                  <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  <p style={{ color: 'rgba(0,212,212,0.7)', fontSize: '10px', textAlign: 'center' }}>
                    ✓ Photo cadrée.<br/>Clique sur "Sauvegarder" pour confirmer.
                  </p>
                  <button onClick={() => { setCropSrc(avatarPreview); setShowCrop(true); }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', cursor: 'pointer' }}>
                    ✏️ Recadrer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Bouton sauvegarder — centré sous les deux colonnes ── */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ background: saved ? 'rgba(0,212,212,0.3)' : 'linear-gradient(135deg, rgba(0,212,212,0.2), rgba(0,150,150,0.2))', border: `1px solid ${saved ? '#00d4d4' : 'rgba(0,212,212,0.4)'}`, borderRadius: '10px', padding: '11px 48px', color: saved ? '#00d4d4' : '#fff', fontSize: '13px', cursor: saving ? 'wait' : 'pointer', transition: 'all .3s' }}>
            {saved ? '✓ Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>
    </>
  );
}

function SectionMesCommandes({ userId }) {
  const [commandes, setCommandes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [telechargement, setTelechargement] = React.useState({});

  React.useEffect(() => {
    supabase.from('commandes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(({ data }) => { setCommandes(data || []); setLoading(false); });
  }, [userId]);

  const telechargerFichier = async (commande, type) => {
    const key = `${commande.id}_${type}`;
    setTelechargement(p => ({ ...p, [key]: true }));
    try {
      const cheminR2 = type === 'produit' ? commande.fichier_pdf : commande.facture_pdf;
      const response = await fetch('/api/download-secure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chemin: cheminR2, userId }) });
      const data = await response.json();
      if (data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = type === 'produit' ? `${commande.nom_produit}.pdf` : `Facture_${commande.id.slice(0, 8)}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
    } catch (e) { console.error(e); }
    setTelechargement(p => ({ ...p, [key]: false }));
  };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (commandes.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <p style={{ fontSize: '32px', marginBottom: '12px' }}>🛒</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Aucune commande pour l'instant.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {commandes.map(cmd => (
        <div key={cmd.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{cmd.nom_produit}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{new Date(cmd.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}{cmd.prix ? ` · ${cmd.prix} €` : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {cmd.fichier_pdf && <button onClick={() => telechargerFichier(cmd, 'produit')} disabled={telechargement[`${cmd.id}_produit`]} style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.35)', borderRadius: '8px', padding: '7px 12px', color: '#00d4d4', fontSize: '11px', cursor: 'pointer' }}>{telechargement[`${cmd.id}_produit`] ? '...' : '⬇ Télécharger'}</button>}
            {cmd.facture_pdf && <button onClick={() => telechargerFichier(cmd, 'facture')} disabled={telechargement[`${cmd.id}_facture`]} style={{ background: 'rgba(255,210,80,0.1)', border: '1px solid rgba(255,210,80,0.3)', borderRadius: '8px', padding: '7px 12px', color: 'rgba(255,210,80,0.8)', fontSize: '11px', cursor: 'pointer' }}>{telechargement[`${cmd.id}_facture`] ? '...' : '🧾 Facture'}</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionMesColoriages({ userId, userPseudo }) {
  const [colos, setColos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [coloZoom, setColoZoom] = React.useState(null);
  const [commentaires, setCommentaires] = React.useState([]);
  const [likes, setLikes] = React.useState([]);
  const [texte, setTexte] = React.useState('');
  const [envoi, setEnvoi] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState(null);
  const [suppression, setSuppression] = React.useState(false);

  React.useEffect(() => { chargerColos(); }, [userId]); // eslint-disable-line

  const chargerColos = async () => {
    const { data } = await supabase.from('coloriages').select('id, illustration_id, image_url, date_coloriage, created_at').eq('user_id', userId).not('image_url', 'is', null).order('created_at', { ascending: false });
    if (!data || data.length === 0) { setColos([]); setLoading(false); return; }
    const illuIds = [...new Set(data.map(c => c.illustration_id))];
    const { data: illus } = await supabase.from('illustrations').select('id, nom, annee').in('id', illuIds);
    const illusMap = {};
    (illus || []).forEach(i => { illusMap[i.id] = i; });
    const coloIds = data.map(c => c.id);
    const { data: newComments } = await supabase.from('commentaires_coloriages').select('coloriage_id').in('coloriage_id', coloIds).eq('vu', false).neq('user_id', userId);
    const notifSet = new Set((newComments || []).map(c => c.coloriage_id));
    setColos(data.map(c => ({ ...c, illu: illusMap[c.illustration_id], hasNotif: notifSet.has(c.id) })));
    setLoading(false);
  };

  const ouvrirZoom = async (colo) => {
    setColoZoom(colo);
    await supabase.from('commentaires_coloriages').update({ vu: true }).eq('coloriage_id', colo.id).neq('user_id', userId);
    setColos(prev => prev.map(c => c.id === colo.id ? { ...c, hasNotif: false } : c));
    const { data: comRaw } = await supabase.from('commentaires_coloriages').select('id, texte, created_at, user_id').eq('coloriage_id', colo.id).order('created_at', { ascending: true });
    const { data: lks } = await supabase.from('likes_coloriages').select('user_id').eq('coloriage_id', colo.id);
    if (comRaw && comRaw.length > 0) {
      const uids = [...new Set(comRaw.map(c => c.user_id))];
      const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', uids);
      const pm = {};
      (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
      setCommentaires(comRaw.map(c => ({ ...c, pseudo: pm[c.user_id] || 'Anonyme' })));
    } else setCommentaires([]);
    setLikes(lks || []);
  };

  const envoyerCommentaire = async () => {
    if (!texte.trim() || !coloZoom) return;
    setEnvoi(true);
    const { data } = await supabase.from('commentaires_coloriages').insert({ coloriage_id: coloZoom.id, user_id: userId, texte: texte.trim(), vu: true }).select('id, texte, created_at, user_id').single();
    if (data) setCommentaires(prev => [...prev, { ...data, pseudo: userPseudo }]);
    setTexte(''); setEnvoi(false);
  };

  const supprimerColoriage = async (colo) => {
    setSuppression(true);
    try {
      const urlPath = colo.image_url.replace('https://images.kevinteoart.fr/', '');
      await fetch('/api/delete-colo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chemin: urlPath, userId }) });
      await supabase.from('coloriages').delete().eq('id', colo.id);
      setColos(prev => prev.filter(c => c.id !== colo.id));
      if (coloZoom?.id === colo.id) setColoZoom(null);
    } catch (e) { console.error(e); }
    setSuppression(false); setConfirmation(null);
  };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (colos.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Tu n'as pas encore partagé de coloriage.</p>
    </div>
  );

  return (
    <>
      {coloZoom && (
        <div onClick={() => setColoZoom(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column' }}>
            <img src={coloZoom.image_url} alt="" style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '10px 10px 0 0' }} />
            <div style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{coloZoom.illu?.nom}</p>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>❤️ {likes.length} · 💬 {commentaires.length}</span>
              </div>
              {commentaires.length > 0 && (
                <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {commentaires.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                      <span style={{ color: 'rgba(255,210,80,0.7)', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.pseudo}</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>{c.texte}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '6px' }}>
                <textarea value={texte} onChange={e => setTexte(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerCommentaire(); } }} placeholder="Répondre…" rows={1} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '11px', resize: 'none', fontFamily: 'inherit' }} />
                <button onClick={envoyerCommentaire} disabled={!texte.trim() || envoi} style={{ background: texte.trim() ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${texte.trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '6px 12px', color: texte.trim() ? '#00d4d4' : 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: texte.trim() ? 'pointer' : 'default' }}>Envoyer</button>
              </div>
              <button onClick={() => setConfirmation(coloZoom)} style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,100,100,0.7)', fontSize: '11px', cursor: 'pointer', alignSelf: 'flex-start' }}>🗑 Supprimer ce coloriage</button>
            </div>
          </div>
          <button onClick={() => setColoZoom(null)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {confirmation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '16px', padding: '28px 32px', maxWidth: '380px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>🗑</p>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>Supprimer ce coloriage ?</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '24px' }}>Cette action est irréversible. L'image sera supprimée définitivement.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmation(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>Annuler</button>
              <button onClick={() => supprimerColoriage(confirmation)} disabled={suppression} style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 20px', color: '#ff8080', cursor: 'pointer', fontSize: '13px', opacity: suppression ? 0.6 : 1 }}>{suppression ? 'Suppression...' : 'Oui, supprimer'}</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {colos.map(colo => (
          <div key={colo.id} onClick={() => ouvrirZoom(colo)} style={{ position: 'relative', width: '120px', cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,210,80,0.2)', background: '#0a0a0a' }}>
            <img src={colo.image_url} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
            {colo.hasNotif && <div style={{ position: 'absolute', top: '4px', right: '4px', background: '#ff3eb5', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>🔔</div>}
            <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.85)' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{colo.illu?.nom}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px' }}>{colo.illu?.annee}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function BoutonOnglet({ label, couleur, couleurRgb, actif, onClick }) {
  const ref = React.useRef(null);
  const handleMouseEnter = () => { const el = ref.current; el.classList.remove('shining'); void el.offsetWidth; el.classList.add('shining'); };
  return (
    <button ref={ref} className={`btn-onglet${actif ? ' actif' : ''}`} onMouseEnter={handleMouseEnter} onClick={onClick}
      style={{ background: actif ? `linear-gradient(135deg, rgba(${couleurRgb},0.35), rgba(${couleurRgb},0.15))` : `linear-gradient(135deg, rgba(${couleurRgb},0.18), rgba(${couleurRgb},0.08))`, border: `1px solid rgba(${couleurRgb},${actif ? '0.8' : '0.45'})`, color: couleur, boxShadow: actif ? `0 0 18px rgba(${couleurRgb},0.3), 0 4px 12px rgba(0,0,0,0.5)` : `0 2px 8px rgba(0,0,0,0.4)`, transform: actif ? 'scale(1.07)' : 'scale(1)' }}>
      {label}
    </button>
  );
}

function LogoPremium({ onClick, isMobile, L }) {
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
        onClick={onClick}
        style={{
          width: `${L}px`, height: `${L}px`, borderRadius: '50%',
          border: `${isMobile ? 3 : 4}px solid #000`,
          boxShadow: '0 0 0 3px #00d4d4',
          objectFit: 'cover', cursor: 'pointer',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease, box-shadow 0.3s',
          willChange: 'transform',
        }}
      />
    </div>
  );
}

function MonCompte() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const moisPatreon = getMoisPatreonDisponibles();
  const [onglet, setOnglet] = React.useState(null);
  const [showFavoris, setShowFavoris] = React.useState(false);
  const [stats, setStats] = React.useState({ totalIllus: 0, jAi: 0, colorie: 0, jeVeux: 0 });
  const [popupIllu, setPopupIllu] = React.useState(null);
  const [popupIlluIndex, setPopupIlluIndex] = React.useState(null);
  const [popupIlluList, setPopupIlluList] = React.useState([]);
  const [popupCollection] = React.useState({});
  const [popupColoriages] = React.useState({});

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
      if (!user) { navigate('/'); return; }
      setUserId(user.id);
      const { data: profil } = await supabase.from('profils').select('pseudo, avatar_url').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || 'Anonyme');
      setAvatarUrl(profil?.avatar_url);
      const { count: total } = await supabase.from('illustrations').select('id', { count: 'exact', head: true }).eq('statut', 'published');
      const { count: jAiCount } = await supabase.from('collection').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('j_ai', true);
      const { count: colorieCount } = await supabase.from('coloriages').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: jeVeuxCount } = await supabase.from('collection').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('je_veux', true);
      setStats({ totalIllus: total || 0, jAi: jAiCount || 0, colorie: colorieCount || 0, jeVeux: jeVeuxCount || 0 });
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

  const BTNS_CONFIG = [
    { id: 'collection', label: '📚 Ma Collection', couleur: '#ff3eb5', couleurRgb: '255,62,181' },
    { id: 'favoris',    label: '♡ Mes Favoris',    couleur: 'rgba(255,210,80,0.9)', couleurRgb: '255,210,80' },
    { id: 'coloriages', label: '🎨 Mes Coloriages', couleur: '#00d4d4', couleurRgb: '0,212,212' },
    { id: 'infos',      label: '👤 Mes Infos',      couleur: 'rgba(255,210,80,0.9)', couleurRgb: '255,210,80' },
    { id: 'commandes',  label: '🛒 Mes Commandes',  couleur: '#ff3eb5', couleurRgb: '255,62,181' },
  ];

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
        .zoom-social { display: flex; flex-direction: column; gap: 8px; padding: 10px 14px; background: rgba(0,0,0,0.7); border-top: 1px solid rgba(255,255,255,0.08); }
        .zoom-like-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.5); font-size: 12px; transition: color .2s; padding: 0; }
        .zoom-like-btn.actif { color: #ff4d7d; }
        .zoom-like-btn:hover { color: #ff4d7d; }
        .zoom-commentaire-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 6px 10px; color: #fff; font-size: 11px; width: 100%; resize: none; font-family: inherit; }
        .zoom-commentaire-input:focus { outline: none; border-color: rgba(0,212,212,0.4); }
        .zoom-commentaire-input::placeholder { color: rgba(255,255,255,0.3); }
        .zoom-commentaire { display: flex; gap: 6px; align-items: flex-start; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .zoom-commentaire:last-child { border-bottom: none; }


        .dropdown-cat { position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.96); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 200; min-width: 220px; box-shadow: 0 8px 32px rgba(0,0,0,0.7); }
        .dropdown-item { display: block; width: 100%; padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; background: none; border: none; text-align: left; font-family: inherit; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .dropdown-item-patreon { display: block; width: 100%; padding: 6px 10px; color: rgba(255,210,80,0.75); font-size: 12px; cursor: pointer; border-radius: 6px; background: none; border: none; text-align: left; font-family: inherit; }
        .dropdown-item-patreon:hover { background: rgba(255,210,80,0.12); color: rgba(255,210,80,1); }
        .btn-onglet { position: relative; overflow: hidden; border-radius: 14px; padding: 12px 20px; cursor: pointer; font-size: 13px; font-weight: bold; transition: transform .2s, box-shadow .2s; flex: 1; min-width: 120px; }
        .btn-onglet::before { content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%; background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%, transparent 100%); transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen; }
        .btn-onglet.shining::before { animation: btn-shine 0.8s ease-in-out forwards; }
        @keyframes btn-shine { 0% { left: -150%; } 100% { left: 220%; } }
        .btn-onglet:hover { transform: scale(1.04); }
        .btn-onglet.actif { transform: scale(1.07); }
        .shining-logo { position: relative; overflow: hidden; }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        @keyframes scrollSim { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.35); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,212,0.6); }
      `}</style>

      <BoutonsFlottants />
      <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, cursor: 'pointer', fontSize: '22px' }}>🔔</div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

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

      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {BARRES.map((barre, i) => (
              <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content', opacity: barre.opacite }}>
                  {[...barre.images, ...barre.images].map((img, j) => <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', display: 'block' }} />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 200}px` }}>
          {loading ? <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p> : (
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* ── POINT 6 : Titre centré, une seule ligne blanche ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                {avatarUrl && (
                  <img src={avatarUrl} alt="avatar" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,212,212,0.4)', flexShrink: 0 }} />
                )}
                <p style={{ color: '#fff', fontSize: isMobile ? '16px' : '22px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  MON COMPTE — Ma Collection Kevin Teo'Art
                </p>
              </div>

              {/* ── Triple jauge globale (point 1 déjà appliqué dans UneBarre) ── */}
              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '16px', padding: '18px 24px' }}>
                <JaugeDouble pctJai={pctJai} pctColorie={pctColo} pctJeVeux={pctJeVeux} hauteur={14} showLabels={true} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '10px', textAlign: 'center' }}>
                  {stats.jAi} / {stats.totalIllus} illustrations · {stats.colorie} coloriages · {stats.jeVeux} favoris
                </p>
              </div>

              {/* ── Boutons onglets ── */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                {BTNS_CONFIG.map(btn => {
                  const actif = btn.id === 'favoris' ? showFavoris : onglet === btn.id;
                  return <BoutonOnglet key={btn.id} label={btn.label} couleur={btn.couleur} couleurRgb={btn.couleurRgb} actif={actif}
                    onClick={() => { if (btn.id === 'favoris') { setShowFavoris(true); setOnglet(null); } else { setOnglet(btn.id); setShowFavoris(false); } }} />;
                })}
              </div>

              {/* ── Badges hexagonaux ── */}
              <BadgesHexagonaux pctJai={pctJai} pctColo={pctColo} userId={userId} />

              {onglet === 'collection' && <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,62,181,0.15)', borderRadius: '16px', padding: '20px' }}><SectionMaCollection userId={userId} totalIllus={stats.totalIllus} /></div>}
              {showFavoris && (
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,80,0.15)', borderRadius: '16px', padding: '20px' }}>
                  <SectionMesFavoris
                    userId={userId}
                    userPseudo={userPseudo}
                    onOuvrirPopup={(illu, index, list) => {
                      setPopupIllu(illu);
                      setPopupIlluIndex(index);
                      setPopupIlluList(list);
                    }}
                  />
                </div>
              )}
              {onglet === 'coloriages' && <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,212,0.15)', borderRadius: '16px', padding: '20px' }}><SectionMesColoriages userId={userId} userPseudo={userPseudo} /></div>}
              {onglet === 'infos'   && <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,80,0.15)', borderRadius: '16px', padding: '20px' }}><SectionMesInfos userId={userId} /></div>}
              {onglet === 'commandes' && <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,62,181,0.15)', borderRadius: '16px', padding: '20px' }}><SectionMesCommandes userId={userId} /></div>}
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
      {popupIllu && (
        <PopupFicheIllu
          illu={popupIllu}
          illustrations={popupIlluList}
          jAi={popupCollection[popupIllu.id]?.j_ai || false}
          jeVeux={popupCollection[popupIllu.id]?.je_veux || false}
          aColorié={popupColoriages[popupIllu.id] || false}
          onToggleJAi={() => {}}
          onToggleJeVeux={() => {}}
          onClose={() => setPopupIllu(null)}
          onOpenSimilaire={(illu) => setPopupIllu(illu)}
          onSuivant={() => {
            const next = (popupIlluIndex + 1) % popupIlluList.length;
            setPopupIllu(popupIlluList[next]);
            setPopupIlluIndex(next);
          }}
          onPrecedent={() => {
            const prev = (popupIlluIndex - 1 + popupIlluList.length) % popupIlluList.length;
            setPopupIllu(popupIlluList[prev]);
            setPopupIlluIndex(prev);
          }}
          userPseudo={userPseudo}
          userId={userId}
          onColoUploaded={() => {}}
        />
      )}
      <OngletsLateraux userId={userId} onOuvrirFiche={(illu) => setPopupIllu(illu)} />
    </div>
  );
}

export default MonCompte;