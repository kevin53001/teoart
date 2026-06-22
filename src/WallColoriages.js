import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from './supabase';
import PopupColoriages from './PopupColoriages';

const COLS = 4;
const ROWS = 6;
const PER_PAGE = COLS * ROWS; // 24
const TOTAL = PER_PAGE * 2;   // 48
const RATIO = 29.7 / 21;      // ratio A4 ≈ 1.414
const ANIM_DURATION = 5000;

function melanger(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function WallColoriages({ userId, userPseudo, onClose }) {
  const [coloriages, setColoriages] = useState([]);
  const [page, setPage] = useState(0);
  const [visibles, setVisibles] = useState(new Set());
  const [popupIds, setPopupIds] = useState(null);
  const [popupIdx, setPopupIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const animRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Charger les 48 derniers coloriages (image_url est une URL complète)
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('coloriages')
        .select('id, image_url, created_at')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(TOTAL);
      setColoriages(data || []);
    })();
  }, []);

  // Animation d'apparition
  const lancerAnimation = useCallback(() => {
    if (animRef.current) {
      animRef.current.forEach(t => clearTimeout(t));
    }
    setVisibles(new Set());
    const indices = melanger(Array.from({ length: PER_PAGE }, (_, i) => i));
    const delai = ANIM_DURATION / PER_PAGE;
    const timers = indices.map((idx, i) =>
      setTimeout(() => {
        setVisibles(prev => new Set([...prev, idx]));
      }, i * delai)
    );
    // Garantie : toutes les images visibles après ANIM_DURATION + marge
    const timerFinal = setTimeout(() => {
      setVisibles(new Set(Array.from({ length: PER_PAGE }, (_, i) => i)));
    }, ANIM_DURATION + 300);
    animRef.current = [...timers, timerFinal];
  }, []);

  useEffect(() => {
    if (coloriages.length > 0) lancerAnimation();
    return () => { if (animRef.current) animRef.current.forEach(t => clearTimeout(t)); };
  }, [page, coloriages.length, lancerAnimation]);

  const allerPage = (n) => {
    if (n < 0 || n > 1) return;
    setPage(n);
  };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) allerPage(dx < 0 ? 1 : 0);
    touchStartX.current = null;
  };

  const pageColoriages = coloriages.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const pageIds = pageColoriages.map(c => c.id);

  // Calcul taille cellule : on prend le min entre contrainte largeur et contrainte hauteur
  // Header ~50px, dots ~32px, gaps verticaux
  const gapPx = isMobile ? 3 : 5;
  const paddingH = isMobile ? 28 : 48; // espace pour les flèches
  const headerH = isMobile ? 46 : 56;
  const dotsH = isMobile ? 28 : 36;

  // Largeur max d'une cellule
  const cellWpx = `(100vw - ${paddingH * 2 + gapPx * (COLS - 1)}px) / ${COLS}`;
  // Hauteur max d'une cellule (contrainte écran)
  const cellHpx = `(100vh - ${headerH + dotsH + gapPx * (ROWS - 1)}px) / ${ROWS}`;
  // On prend le min des deux : si cellH / RATIO < cellW, c'est la hauteur qui contraint
  const cellSize = `min(${cellWpx}, calc((${cellHpx}) / ${RATIO.toFixed(4)}))`;
  const cellH = `calc(${cellSize} * ${RATIO.toFixed(4)})`;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '8px 12px' : '10px 24px',
        flexShrink: 0, height: `${headerH}px`, boxSizing: 'border-box',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: isMobile ? '10px' : '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Wall · {coloriages.length} coloriages
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px',
            color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      </div>

      {/* Zone grille + flèches */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 0 }}>

        {/* Flèche gauche */}
        <button
          onClick={() => allerPage(page - 1)}
          style={{
            position: 'absolute', left: isMobile ? '2px' : '8px', zIndex: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', width: isMobile ? '22px' : '28px', height: isMobile ? '22px' : '28px',
            color: page === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.45)',
            cursor: page === 0 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isMobile ? '12px' : '15px',
            pointerEvents: page === 0 ? 'none' : 'auto',
          }}
        >‹</button>

        {/* Grille */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${cellSize})`,
          gridTemplateRows: `repeat(${ROWS}, ${cellH})`,
          gap: `${gapPx}px`,
        }}>
          {Array.from({ length: PER_PAGE }, (_, i) => {
            const colo = pageColoriages[i];
            const visible = visibles.has(i);
            return (
              <div
                key={i}
                onClick={() => {
                  if (!colo || !visible) return;
                  setPopupIds(pageIds);
                  setPopupIdx(i);
                }}
                style={{
                  width: cellSize,
                  height: cellH,
                  background: '#0a0a0a',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  cursor: colo && visible ? 'pointer' : 'default',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0.88)',
                  transition: 'opacity 0.22s ease, transform 0.22s ease',
                }}
              >
                {colo && (
                  <img
                    src={colo.image_url}
                    alt=""
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Flèche droite */}
        <button
          onClick={() => allerPage(page + 1)}
          style={{
            position: 'absolute', right: isMobile ? '2px' : '8px', zIndex: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', width: isMobile ? '22px' : '28px', height: isMobile ? '22px' : '28px',
            color: page === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.45)',
            cursor: page === 1 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isMobile ? '12px' : '15px',
            pointerEvents: page === 1 ? 'none' : 'auto',
          }}
        >›</button>
      </div>

      {/* Dots pagination */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
        height: `${dotsH}px`, flexShrink: 0,
      }}>
        {[0, 1].map(p => (
          <div
            key={p}
            onClick={() => allerPage(p)}
            style={{
              width: page === p ? '18px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: page === p ? '#00d4d4' : 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* PopupColoriages */}
      {popupIds && (
        <PopupColoriages
          userId={userId}
          userPseudo={userPseudo}
          filtreIds={popupIds}
          idxDepart={popupIdx}
          onClose={() => setPopupIds(null)}
        />
      )}
    </div>,
    document.body
  );
}

export default WallColoriages;