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
const KEVIN_CYAN = '#00d4d4';

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

const COULEURS_VISITEURS = [
  '#cc0000', '#ff4d4d', '#ff7a3d', '#ffd250', '#a8e063', '#2ecc71', '#00c4aa', '#1a6bbd',
  '#7b61ff', '#9b59b6', '#d96cff', '#ff3eb5', '#ff8fb3', '#c0c0c0', '#f5f5f5', '#fff8e7'
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  return h;
}

function couleurPensee(pensee) {
  if (pensee.couleur) return pensee.couleur;
  if (pensee.source === 'kevin') return KEVIN_CYAN;
  return COULEURS_VISITEURS[Math.abs(hashString(pensee.id || pensee.titre || '')) % COULEURS_VISITEURS.length];
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

function calculArc(nb) {
  if (nb <= 1) return 0;
  if (nb <= 6) return 60;
  if (nb <= 12) return 100;
  if (nb <= 20) return 150;
  if (nb <= 35) return 220;
  if (nb <= 55) return 300;
  return 360;
}

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
          willChange: 'transform', position: 'relative',
        }}
      />
    </div>
  );
}

// ─── ROUE DES PENSÉES ────────────────────────────────────────────────────────

function RouePensees({ pensees, vues, isMobile, ouvrirPopup }) {
  const [rotation, setRotation] = React.useState(0);
  const rotationRef = React.useRef(0);
  const speedRef = React.useRef(0);
  const rafRef = React.useRef(null);
  const zoneRef = React.useRef(null);
  const touchLastXRef = React.useRef(null);
  const touchMovedRef = React.useRef(false);

  const visibles = pensees;
  const count = visibles.length || 1;
  const arc = calculArc(count);
  const canLoop = arc >= 360;

  // Limites pour mode non-loop
  const ficheMarge = count < 8 ? 110 : count < 20 ? 90 : count < 40 ? 70 : 50;
  const limit = canLoop ? 999999 : Math.max(0, arc / 2 + ficheMarge);

  const clampRotation = React.useCallback((value) => {
    if (canLoop) return value;
    return Math.max(-limit, Math.min(limit, value));
  }, [canLoop, limit]);

  React.useEffect(() => {
    const animate = () => {
      let next = rotationRef.current + speedRef.current;
      if (!canLoop) {
        const clamped = clampRotation(next);
        if (clamped !== next) {
          next = clamped;
          speedRef.current *= 0.10;
        }
      }
      rotationRef.current = next;
      setRotation(rotationRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canLoop, clampRotation]);

  const handleMouseMove = (e) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const dist = (e.clientX - center) / (rect.width / 2);
    const deadZone = Math.abs(dist) < 0.06 ? 0 : dist;
    speedRef.current = Math.max(-1.2, Math.min(1.2, deadZone)) * -0.6;
  };

  const handleMouseLeave = () => { speedRef.current = 0; };

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    touchLastXRef.current = e.touches[0].clientX;
    touchMovedRef.current = false;
    speedRef.current = 0;
  };
  const handleTouchMove = (e) => {
    if (!isMobile || touchLastXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchLastXRef.current;
    if (Math.abs(deltaX) > 1) {
      touchMovedRef.current = true;
      e.preventDefault();
      const next = clampRotation(rotationRef.current + deltaX * 0.30);
      rotationRef.current = next;
      setRotation(next);
    }
    touchLastXRef.current = currentX;
  };
  const handleTouchEnd = () => {
    if (!isMobile) return;
    touchLastXRef.current = null;
    speedRef.current = 0;
    setTimeout(() => { touchMovedRef.current = false; }, 80);
  };

  // Dimensions améliorées
  const radiusX = isMobile ? 230 : 480;
  const radiusY = isMobile ? 70 : 130;
  const smallCountSpread = count < 14 ? (isMobile ? 24 : 38) : 0;

  return (
    <div
      ref={zoneRef}
      className="donut-zone"
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="donut-stage">
        {visibles.map((pensee, i) => {
          const localAngle = count === 1 ? 0 : -arc / 2 + (arc / Math.max(count - 1, 1)) * i;
          const angle = localAngle + rotation;
          const rad = (angle * Math.PI) / 180;
          const sin = Math.sin(rad);
          const cos = Math.cos(rad);

          const x = sin * radiusX + (count < 14 ? (i - (count - 1) / 2) * smallCountSpread : 0);
          const y = -cos * radiusY;
          const frontFactor = (cos + 1) / 2;
          // Échelle plus généreuse : entre 0.60 et 1.00
          const scale = 0.60 + frontFactor * 0.40;
          const rotateY = sin * -30;
          // Légère élévation des fiches au premier plan
          const lift = frontFactor > 0.90 ? -22 : 0;

          const zIndex = Math.round(1000 + frontFactor * 7000 - Math.abs(sin) * 900 + (i / 100));
          // Opacité plus généreuse : entre 0.35 et 1.0
          const opacity = 0.35 + frontFactor * 0.65;
          const couleur = couleurPensee(pensee);
          const lue = !!vues[pensee.id];

          return (
            <React.Fragment key={pensee.id}>
              {/* Reflet sol */}
              <div
                className="fiche-reflet"
                style={{
                  '--accent': couleur,
                  transform: `translate(${x}px, ${y + 96}px) scale(${scale}, ${scale * 0.55})`,
                  opacity: frontFactor > 0.72 ? 0.12 : 0.03,
                  zIndex: Math.max(1, zIndex - 1200),
                }}
              />
              {/* Fiche */}
              <div
                className="fiche-wrap"
                onClick={() => {
                  if (isMobile && touchMovedRef.current) return;
                  ouvrirPopup(pensee);
                }}
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
                  <div className="fiche-led left" style={{ background: lue ? '#ff3eb5' : '#4dff72', boxShadow: lue ? '0 0 12px #ff3eb5' : '0 0 12px #4dff72' }} />
                  <div className="fiche-led right" style={{ background: lue ? '#ff3eb5' : '#4dff72', boxShadow: lue ? '0 0 12px #ff3eb5' : '0 0 12px #4dff72' }} />
                  <FicheTexte pensee={pensee} />
                </div>
                <div className="fiche-face back">
                  <div className="fiche-led left" style={{ background: lue ? '#ff3eb5' : '#4dff72', boxShadow: lue ? '0 0 12px #ff3eb5' : '0 0 12px #4dff72' }} />
                  <div className="fiche-led right" style={{ background: lue ? '#ff3eb5' : '#4dff72', boxShadow: lue ? '0 0 12px #ff3eb5' : '0 0 12px #4dff72' }} />
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

function compterPages(pensee) {
  if (Array.isArray(pensee.pages) && pensee.pages.length > 0) return pensee.pages.length;
  if (Array.isArray(pensee.texte_pages) && pensee.texte_pages.length > 0) return pensee.texte_pages.length;
  return decouperTexte(pensee.texte || '').length;
}

function FicheTexte({ pensee }) {
  const nbPages = compterPages(pensee);
  return (
    <>
      <div className="fiche-encadre">
        <div className="fiche-title">{pensee.titre}</div>
      </div>
      <div className="fiche-author">{pensee.auteur || 'Anonyme'}</div>
      <div className="fiche-pages">{nbPages} {nbPages > 1 ? "pages" : "page"}</div>
    </>
  );
}

// ─── SOCIAL PENSÉE ───────────────────────────────────────────────────────────

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
      const { data: likesData } = await supabase.from('likes_pensees').select('user_id').eq('pensee_id', penseeId);
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
          const { data: profils } = await supabase.from('profils').select('id, pseudo, prenom').in('id', uids);
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
      await supabase.from('likes_pensees').delete().eq('pensee_id', penseeId).eq('user_id', userId);
      setLikes(prev => prev.filter(l => l.user_id !== userId));
    } else {
      await supabase.from('likes_pensees').insert({ pensee_id: penseeId, user_id: userId });
      setLikes(prev => [...prev, { user_id: userId }]);
    }
  };

  const envoyerCommentaire = async () => {
    if (!texte.trim() || !penseeId || !userId) return;
    setEnvoi(true);
    const { data } = await supabase
      .from('commentaires_pensees')
      .insert({ pensee_id: penseeId, user_id: userId, parent_id: parentId, texte: texte.trim() })
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
    <div style={{ marginTop: '4px', borderTop: '1px solid rgba(36,19,12,0.12)', paddingTop: '4px', color: '#24130c', fontSize: '11px' }}>
      <button
        onClick={toggleLike}
        style={{ border: 'none', background: jaime ? 'rgba(255,62,181,0.18)' : 'rgba(36,19,12,0.08)', color: jaime ? '#c01870' : '#24130c', padding: '4px 10px', borderRadius: '999px', cursor: 'pointer', fontWeight: 800, marginBottom: '4px' }}
      >
        ♥ {likes.length} {jaime ? "J'aime" : "Aimer"}
      </button>
      <div style={{ maxHeight: '46px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '8px' }}>
        {racines.map(c => (
          <div key={c.id} style={{ background: 'rgba(36,19,12,0.06)', borderRadius: '10px', padding: '7px 9px' }}>
            <strong>{c.pseudo}</strong> : {c.texte}
            <button onClick={() => setParentId(c.id)} style={{ border: 'none', background: 'none', color: 'rgba(36,19,12,0.45)', fontSize: '10px', cursor: 'pointer', marginLeft: '6px' }}>↩ Répondre</button>
            <div style={{ paddingLeft: '10px', marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {reponsesDe(c.id).map(r => (
                <div key={r.id} style={{ background: 'rgba(36,19,12,0.04)', borderRadius: '8px', padding: '4px 8px', fontSize: '10px' }}>
                  <strong>{r.pseudo}</strong> : {r.texte}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {parentId && (
        <p style={{ fontSize: '10px', color: 'rgba(36,19,12,0.5)', marginBottom: '4px' }}>
          Réponse à un commentaire — <button onClick={() => setParentId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c01870', fontSize: '10px' }}>Annuler</button>
        </p>
      )}
      <div style={{ display: 'flex', gap: '6px' }}>
        <textarea
          value={texte}
          onChange={e => setTexte(e.target.value)}
          placeholder="Un commentaire..."
          rows={2}
          style={{ flex: 1, background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(36,19,12,0.12)', borderRadius: '8px', padding: '7px 9px', resize: 'none', fontFamily: 'inherit', color: '#24130c', fontSize: '11px' }}
        />
        <button
          onClick={envoyerCommentaire}
          disabled={!texte.trim() || envoi}
          style={{ border: 'none', background: texte.trim() ? '#00d4d4' : 'rgba(36,19,12,0.12)', color: texte.trim() ? '#000' : 'rgba(36,19,12,0.35)', borderRadius: '8px', padding: '0 12px', fontWeight: 800, cursor: texte.trim() ? 'pointer' : 'default' }}
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
    width: '30px', height: '30px', borderRadius: '50%',
    border: actif ? '1px solid rgba(36,19,12,0.25)' : '1px solid rgba(36,19,12,0.08)',
    background: actif ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.14)',
    color: actif ? '#24130c' : 'rgba(36,19,12,0.25)',
    fontSize: '18px', cursor: actif ? 'pointer' : 'default',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };
}

// ─── TEXTE ADAPTATIF POPUP ─────────────────────────────────────────────────────

function TexteAdaptatif({ texte, isMobile }) {
  // Mobile : taille fixe, pas de scroll, pas de changement
  if (isMobile) {
    const estCourtMobile = texte && texte.length < 200 && (texte.match(/\n/g) || []).length < 4;
    return (
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: estCourtMobile ? 'center' : 'flex-start' }}>
        <p style={{ width: '100%', fontSize: '13px', lineHeight: 1.42, whiteSpace: 'pre-wrap', textAlign: 'left', color: '#2c160e', margin: 0 }}>
          {texte}
        </p>
      </div>
    );
  }

  // Desktop : taille normale, scroll si nécessaire, bloc centré horizontalement, texte aligné à gauche
  // Centrage vertical si texte court (moins de 300 caractères et moins de 6 sauts de ligne)
  const estCourt = texte && texte.length < 300 && (texte.match(/\n/g) || []).length < 5;
  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: estCourt ? 'center' : 'flex-start', alignItems: 'center', paddingRight: '2px' }}>
      <p style={{ width: '100%', maxWidth: '380px', fontSize: '13.6px', lineHeight: 1.52, whiteSpace: 'pre-wrap', textAlign: 'left', color: '#2c160e', margin: '0 auto' }}>
        {texte}
      </p>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

function Pensees() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pensees, setPensees] = React.useState([]);
  const [vues, setVues] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const [popup, setPopup] = React.useState(null);
  const [pagePopup, setPagePopup] = React.useState(0);
  const [showForm, setShowForm] = React.useState(false);
  const [titreForm, setTitreForm] = React.useState('');
  const [texteForm, setTexteForm] = React.useState('');
  const [couleurForm, setCouleurForm] = React.useState(COULEURS_VISITEURS[0]);
  const [sending, setSending] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [userId, setUserId] = React.useState(null);
  const [popupOnglet, setPopupOnglet] = React.useState(null);
  const [pseudo, setPseudo] = React.useState('Visiteur');
  const startX = React.useRef(null);
  const moisPatreon = getMoisPatreonDisponibles();

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;

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

  // Fermer dropdowns au clic dehors
  React.useEffect(() => {
    const handler = () => { setShowCategories(false); setShowPatreonMenu(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
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
      // Réorganisation : nouvelles pensées au milieu, alternance gauche/droite
      const raw = data || [];
      // Les premières dans la BDD sont les plus anciennes (ordre asc),
      // on intercale les nouvelles (fin de liste) autour du centre
      const reorg = [];
      let gauche = [];
      let droite = [];
      raw.forEach((p, i) => {
        if (i % 2 === 0) droite.push(p);
        else gauche.push(p);
      });
      // gauche en ordre inverse (plus récent vers le centre)
      gauche.reverse();
      // Construire : ...gauche (index croissant = vers centre), ...droite (index croissant = vers bords)
      // Résultat : centre = pensées récentes, bords = anciennes
      const maxLen = Math.max(gauche.length, droite.length);
      for (let i = maxLen - 1; i >= 0; i--) {
        if (gauche[i] !== undefined) reorg.push(gauche[i]);
        if (droite[i] !== undefined) reorg.push(droite[i]);
      }
      setPensees(reorg.length ? reorg : raw);
      if (user) {
        const { data: vuesData } = await supabase.from('pensees_vues').select('pensee_id').eq('user_id', user.id);
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
      setTitreForm('');
      setTexteForm('');
      setCouleurForm(COULEURS_VISITEURS[0]);
      setMessage("Pensée envoyée. Elle apparaîtra après validation.");
    }
    setSending(false);
  };

  const ouvrirPopup = async (pensee) => {
    setPopup(pensee);
    setPagePopup(0);
    if (userId && pensee?.id && !vues[pensee.id]) {
      setVues(prev => ({ ...prev, [pensee.id]: true }));
      await supabase.from('pensees_vues').upsert({ user_id: userId, pensee_id: pensee.id }, { onConflict: 'user_id,pensee_id' });
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

        /* ── Dropdown catégories identique à Catalogue ── */
        .dropdown-cat {
          position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%);
          background: rgba(0,0,0,0.96); border: 1px solid rgba(0,212,212,0.3);
          border-radius: 12px; padding: 8px; z-index: 200; min-width: 220px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.7);
        }
        .dropdown-item {
          display: block; width: 100%; padding: 8px 14px; color: rgba(255,255,255,0.7);
          font-size: 13px; cursor: pointer; border-radius: 6px;
          background: none; border: none; text-align: left; font-family: inherit;
        }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .dropdown-item.actif { color: #00d4d4; background: rgba(0,212,212,0.08); }
        .dropdown-item-patreon {
          display: block; width: 100%; padding: 6px 10px; color: rgba(255,210,80,0.75);
          font-size: 12px; cursor: pointer; border-radius: 6px;
          background: none; border: none; text-align: left; font-family: inherit;
        }
        .dropdown-item-patreon:hover { background: rgba(255,210,80,0.12); color: rgba(255,210,80,1); }
        .dropdown-item-patreon.actif { color: rgba(255,210,80,1); background: rgba(255,210,80,0.08); }

        /* ── Logo shine ── */
        .shining-logo { position: relative; overflow: hidden; }
        .shining-logo::before {
          content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.04) 10%, rgba(255,225,110,0.12) 25%, rgba(255,235,150,0.18) 40%, rgba(255,245,170,0.12) 50%, rgba(255,235,140,0.14) 62%, rgba(255,220,100,0.08) 75%, rgba(255,210,80,0.03) 88%, transparent 100%);
          transform: skewX(-28deg); z-index: 20; pointer-events: none; mix-blend-mode: screen; border-radius: 50%;
        }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        @keyframes reliure-glow {
          0%   { border-top-color: var(--accent); box-shadow: 2px 6px 18px rgba(0,0,0,0.70), 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent); }
          50%  { border-top-color: color-mix(in srgb, var(--accent) 60%, #fff); box-shadow: 2px 6px 18px rgba(0,0,0,0.70), 0 0 12px color-mix(in srgb, var(--accent) 55%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent); }
          100% { border-top-color: var(--accent); box-shadow: 2px 6px 18px rgba(0,0,0,0.70), 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent); }
        }

        /* ── Cards premium ── */
        .premium-card {
          background: rgba(0,0,0,0.82); border: 1px solid rgba(0,212,212,0.28);
          border-radius: 18px; backdrop-filter: blur(10px); box-shadow: 0 18px 50px rgba(0,0,0,0.45);
        }
        .premium-card:hover {
          border-color: rgba(255,62,181,0.30);
          box-shadow: 0 20px 55px rgba(0,0,0,0.55), 0 0 22px rgba(0,212,212,0.10);
        }

        /* ── Bouton ajouter pensée ── */
        .btn-nuage {
          border: 1px solid rgba(255,62,181,0.42); background: rgba(255,62,181,0.18);
          color: #fff; font-weight: 800; font-size: 13px; padding: 10px 28px;
          border-radius: 8px; cursor: pointer;
          box-shadow: 0 0 18px rgba(255,62,181,0.14), inset 0 0 18px rgba(255,62,181,0.10);
          backdrop-filter: blur(8px); transition: transform .2s ease, background .2s ease, border-color .2s ease;
        }
        .btn-nuage:hover { transform: translateY(-2px); background: rgba(255,62,181,0.28); border-color: rgba(255,62,181,0.70); }

        /* ─── ROUE ──────────────────────────────────────────── */
        .donut-zone {
          position: relative;
          width: min(96vw, 1120px);
          height: 540px;
          margin: 0 auto;
          perspective: 1200px;
          overflow: visible;
          user-select: none;
          touch-action: pan-y;
        }
        .donut-stage {
          position: absolute;
          left: 50%;
          top: 58%;
          width: 1040px;
          height: 460px;
          transform: translate(-50%, -50%);
          transform-style: preserve-3d;
        }

        /* ─── FICHE VIEUX CUIR ─── */
        .fiche-wrap {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 158px;
          height: 248px;
          margin-left: -79px;
          margin-top: -124px;
          transform-style: preserve-3d;
          cursor: pointer;
          transition: filter .18s ease;
        }
        .fiche-wrap:hover { filter: brightness(1.10) drop-shadow(0 0 16px color-mix(in srgb, var(--accent) 70%, transparent)) drop-shadow(0 6px 14px rgba(0,0,0,0.5)); }
        .fiche-wrap:hover .fiche-face { transform: scale(1.08); }
        .fiche-wrap:hover .fiche-face.back { transform: scale(1.08) rotateY(180deg); }
        .fiche-face { transition: transform 0.22s ease; }

        /* Face principale : image de fond custom */
        .fiche-face {
          position: absolute;
          pointer-events: none;
          inset: 0;
          border-radius: 12px;
          background-image: url('https://images.kevinteoart.fr/site/fiche_fond_desktop.jpg');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          border: 1px solid rgba(80,45,15,0.6);
          border-top: 7px solid var(--accent);
          animation: reliure-glow 2.4s ease-in-out infinite;
          box-shadow:
            2px 6px 18px rgba(0,0,0,0.70),
            0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent);
          overflow: hidden;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px 14px 14px;
        }
        .fiche-face.back { transform: rotateY(180deg); }

        /* Dégradés noirs sur bords gauche, droit et bas */
        .fiche-face::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.45) 0%, transparent 22%),
            linear-gradient(270deg, rgba(0,0,0,0.45) 0%, transparent 22%),
            linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 28%);
          pointer-events: none;
          border-radius: inherit;
        }
        /* Reflet léger en haut */
        .fiche-face::after {
          content: '';
          position: absolute;
          top: 7px; left: 8px; right: 8px;
          height: 30%;
          background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%);
          border-radius: 3px;
          pointer-events: none;
        }

        /* Encadré titre façon vieux livre — cadre couleur accent */
        .fiche-encadre {
          position: relative;
          z-index: 2;
          width: calc(100% - 10px);
          padding: 8px 10px;
          border: 2px solid color-mix(in srgb, var(--accent) 70%, #8b5e1a);
          border-radius: 6px;
          background: rgba(210,210,210,0.82);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.5),
            0 0 8px color-mix(in srgb, var(--accent) 20%, transparent);
        }
        /* Coins décoratifs couleur accent */
        .fiche-encadre::before,
        .fiche-encadre::after {
          content: '✦';
          position: absolute;
          font-size: 9px;
          color: color-mix(in srgb, var(--accent) 85%, #c8902a);
          line-height: 1;
        }
        .fiche-encadre::before { top: -6px; left: 50%; transform: translateX(-50%); }
        .fiche-encadre::after  { bottom: -6px; left: 50%; transform: translateX(-50%); }

        .fiche-title {
          position: relative;
          z-index: 2;
          color: #1a1008;
          font-size: 13.5px;
          line-height: 1.25;
          font-weight: 700;
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: 0.2px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          text-shadow: none;
        }
        .fiche-author {
          position: relative;
          z-index: 2;
          margin-top: 10px;
          color: color-mix(in srgb, var(--accent) 90%, #f0d080);
          font-size: 10.5px;
          line-height: 1.2;
          font-weight: 700;
          font-style: italic;
          font-family: Georgia, serif;
          letter-spacing: 0.3px;
          text-shadow: 0 0 8px color-mix(in srgb, var(--accent) 40%, transparent);
        }
        .fiche-author::before { content: ''; }
        .fiche-pages {
          position: absolute;
          bottom: 8px;
          right: 10px;
          z-index: 3;
          color: var(--author-color, #00d4d4);
          font-size: 9.5px;
          font-weight: 700;
          font-style: italic;
          font-family: Georgia, serif;
          opacity: 0.85;
          text-shadow: 0 0 6px color-mix(in srgb, var(--accent) 35%, transparent);
        }

        /* Tranche 3D haut (reliure) */
        .fiche-edge {
          position: absolute;
          pointer-events: none;
          left: 4px;
          top: -100%;
          width: calc(100% - 8px);
          height: 100%;
          transform-origin: bottom center;
          transform: rotateX(90deg);
          background: linear-gradient(180deg,
            color-mix(in srgb, var(--accent) 50%, #1a0800) 0%,
            color-mix(in srgb, var(--accent) 30%, #2a1005) 40%,
            #3a1a08 70%,
            #1e0d04 100%
          );
          border-radius: 4px 4px 0 0;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.7);
        }

        /* Reflet sol */
        .fiche-reflet {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 140px;
          height: 180px;
          margin-left: -70px;
          margin-top: 118px;
          transform-origin: top center;
          border-radius: 4px;
          background: linear-gradient(to bottom,
            color-mix(in srgb, var(--accent) 15%, rgba(80,45,15,0.35)),
            transparent 65%
          );
          filter: blur(5px);
          pointer-events: none;
        }

        /* LEDs */
        .fiche-led {
          position: absolute;
          top: 10px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          z-index: 8;
        }
        .fiche-led.left { left: 10px; }
        .fiche-led.right { right: 10px; }

        /* Popup pensée (format page) */
        .popup-page {
          width: 500px;
          height: 812px;
          max-width: calc(100vw - 34px);
          max-height: calc(100vh - 80px);
          aspect-ratio: 500 / 812;
          background: radial-gradient(circle at 25% 15%, rgba(255,255,255,0.98), rgba(255,247,228,0.97) 46%, rgba(232,211,178,0.98) 100%);
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow: 0 30px 90px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,210,80,0.22);
          color: #24130c;
          position: relative;
          overflow: hidden;
        }
        .popup-page::before {
          content:''; position:absolute; top:0; bottom:0; left:0; width:28px;
          background: linear-gradient(90deg, rgba(0,0,0,0.16), rgba(0,0,0,0.04), transparent);
          pointer-events:none;
        }

        /* Scrollbars cyan */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.35); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,212,0.6); }

        @media (max-width: 600px) {
          .donut-zone { height: 400px; }
          .donut-stage { width: 560px; height: 330px; }
          .fiche-wrap { width: 92px; height: 152px; margin-left: -46px; margin-top: -76px; }
          .fiche-face { border-radius: 8px; padding: 16px 8px 10px; border-top-width: 5px; background-image: url('https://images.kevinteoart.fr/site/fiche_fond_mobile.jpg'); }
          .fiche-encadre { padding: 6px 7px; }
          .fiche-edge { height: 70%; top: -70%; }
          .fiche-title { font-size: clamp(7px, 2.2vw, 10px); -webkit-line-clamp: unset; max-height: none; overflow: visible; }
          .fiche-author { font-size: 8.5px; margin-top: 7px; }
          .fiche-reflet { width: 78px; height: 110px; margin-left: -39px; margin-top: 72px; }
          .fiche-led { width: 7px; height: 7px; top: 8px; }
          .fiche-led.left { left: 8px; }
          .fiche-led.right { right: 8px; }
        }
      `}</style>

      {/* ─── BOUTON DÉCO + SCROLL-TO-TOP ─── */}
      <BoutonsFlottants />
      <Cloche />

      {/* ─── BANNIÈRE HAUT ─── */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* ─── NAVIGATION STICKY ─── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
        <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>

          {/* GAUCHE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, overflow: 'visible', flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/accueil' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }}
              onClick={() => navigate('/accueil')} />
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px', ...(location.pathname === '/livres' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }}
              onClick={() => navigate('/livres')} />
            {/* Dropdown catégories complet */}
            <div style={{ position: 'relative', width: `${P}px`, height: `${P}px`, flexShrink: 0, marginTop: isMobile ? '-8px' : '0', overflow: 'visible' }}>
              <img
                src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille"
                style={{ width: `${P}px`, height: `${P}px`, display: 'block', ...(location.pathname === '/catalogue' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }}
                onClick={e => { e.stopPropagation(); setShowCategories(v => !v); setShowPatreonMenu(false); }}
              />
              {showCategories && (
                <div className="dropdown-cat" onClick={e => e.stopPropagation()}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} className="dropdown-item"
                      onClick={() => { navigate('/catalogue', { state: { categorie: cat } }); setShowCategories(false); }}>
                      {cat}
                    </button>
                  ))}
                  <div style={{ height: '1px', background: 'rgba(255,210,80,0.2)', margin: '6px 8px' }} />
                  <button
                    className="dropdown-item"
                    style={{ color: 'rgba(255,210,80,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                    onClick={() => setShowPatreonMenu(v => !v)}
                  >
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

          <LogoPremium navigate={navigate} isMobile={isMobile} L={L} />

          {/* DROITE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, overflow: 'visible', flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/pensees' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }}
              onClick={() => navigate('/pensees')} />
            <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }}
              onClick={() => {}} />
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille"
              style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/mon-compte' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }}
              onClick={() => navigate('/mon-compte')} />
          </div>
        </div>
      </div>

      {/* ─── BARRES + CONTENU ─── */}
      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
        {/* Barres de fond défilantes */}
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

        {/* Contenu principal par-dessus */}
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
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '60px 0' }}>Chargement des pensées…</div>
            ) : (
              <>
                {/* ─── LÉGENDE + BOUTON ─── */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '16px' : '28px', flexWrap: 'wrap', margin: '14px 0 6px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#4dff72', boxShadow: '0 0 10px #4dff72', display: 'inline-block' }} />
                    Non lue
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff3eb5', boxShadow: '0 0 10px #ff3eb5', display: 'inline-block' }} />
                    Pensée lue
                  </span>
                  <button className="btn-nuage" onClick={() => setShowForm(true)}>
                    Ajouter ma pensée
                  </button>
                </div>

                {/* ─── ROUE ─── */}
                <RouePensees
                  pensees={pensees}
                  vues={vues}
                  isMobile={isMobile}
                  ouvrirPopup={ouvrirPopup}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── BANNIÈRE BAS ─── */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

      <BandeLegale />

      {/* ─── POPUP LECTURE ─── */}
      {popup && (
        <div
          onClick={() => setPopup(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '22px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setPopup(null)} style={{ position: 'absolute', top: '-18px', right: '-18px', width: '38px', height: '38px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.82)', color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 5 }}>×</button>
            <div className="popup-page" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div style={{ padding: isMobile ? '16px 20px 12px' : '18px 28px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '6px', minHeight: '14px' }}>
                  <h2 style={{ fontSize: isMobile ? '8px' : '9px', lineHeight: 1.2, fontWeight: 800, color: 'rgba(36,19,12,0.58)', maxWidth: '55%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {popup.titre}
                  </h2>
                  <p style={{ fontSize: isMobile ? '8px' : '9px', lineHeight: 1.2, fontWeight: 700, color: 'rgba(36,19,12,0.46)', maxWidth: '42%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
                    {popup.auteur || 'Anonyme'}
                  </p>
                </div>
                <TexteAdaptatif texte={pagesPopup[pagePopup]} isMobile={isMobile} />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '4px' }}>
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

      {/* ─── POPUP FORMULAIRE ─── */}
      {showForm && (
        <div
          onClick={() => { if (!message) setShowForm(false); }}
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
          <div onClick={e => e.stopPropagation()} className="premium-card" style={{ width: '540px', maxWidth: '96vw', padding: '22px', position: 'relative' }}>

            {/* ── Écran de confirmation après envoi ── */}
            {message ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px 10px', gap: '22px', minHeight: '180px' }}>
                <p style={{ fontSize: '42px', lineHeight: 1 }}>✨</p>
                <p style={{ color: message.includes('Impossible') ? '#ff6b6b' : '#00d4d4', fontSize: '18px', fontWeight: 800, lineHeight: 1.5 }}>
                  {message}
                </p>
                <button
                  onClick={() => { setShowForm(false); setMessage(''); }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.22)',
                    background: 'linear-gradient(90deg, rgba(0,212,212,0.92), rgba(255,62,181,0.92))',
                    color: '#000', fontWeight: 'bold', padding: '11px 36px',
                    borderRadius: '12px', cursor: 'pointer', fontSize: '14px',
                  }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              /* ── Formulaire ── */
              <>
                <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>×</button>
                <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: '20px' }}>Ajouter ma pensée</h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.5, marginBottom: '14px' }}>
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
                  rows={6}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '130px', lineHeight: 1.6 }}
                />


                <div style={{ marginBottom: '14px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>Couleur de la fiche</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                    {COULEURS_VISITEURS.map(c => (
                      <button
                        key={c}
                        onClick={() => setCouleurForm(c)}
                        aria-label={`Couleur ${c}`}
                        style={{
                          width: '100%',
                          height: '18px',
                          borderRadius: '999px',
                          border: couleurForm === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.20)',
                          background: c,
                          cursor: 'pointer',
                          boxShadow: couleurForm === c ? `0 0 12px ${c}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={envoyerPensee}
                  disabled={sending || !titreForm.trim() || !texteForm.trim()}
                  style={{
                    width: '100%',
                    border: '1px solid rgba(255,255,255,0.22)',
                    background: (!titreForm.trim() || !texteForm.trim()) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(90deg, rgba(0,212,212,0.92), rgba(255,62,181,0.92))',
                    color: (!titreForm.trim() || !texteForm.trim()) ? 'rgba(255,255,255,0.35)' : '#000',
                    fontWeight: 'bold',
                    padding: '11px',
                    borderRadius: '12px',
                    cursor: (!titreForm.trim() || !texteForm.trim()) ? 'default' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {sending ? 'Envoi...' : 'Envoyer ma pensée'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <OngletsLateraux userId={userId} onOuvrirFiche={(illu) => setPopupOnglet(illu)} />

      {popupOnglet && (
        <PopupFicheIllu
          illu={popupOnglet}
          onClose={() => setPopupOnglet(null)}
          userId={userId}
          userPseudo={userPseudo}
        />
      )}
    </div>
  );
}

export default Pensees;
