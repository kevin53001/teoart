import React from 'react';

const R2 = 'https://images.kevinteoart.fr';
const DUREE_MS = 2800;

export default function SplashScreen({ onTermine }) {
  const [visible, setVisible] = React.useState(true);
  const [fondu, setFondu] = React.useState(false);

  React.useEffect(() => {
    const timerFondu = setTimeout(() => setFondu(true), DUREE_MS);
    const timerFin = setTimeout(() => {
      setVisible(false);
      if (onTermine) onTermine();
    }, DUREE_MS + 600);

    return () => {
      clearTimeout(timerFondu);
      clearTimeout(timerFin);
    };
  }, [onTermine]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fondu ? 0 : 1,
      transition: 'opacity 0.6s ease',
      pointerEvents: fondu ? 'none' : 'all',
    }}>
      <img
        src={`${R2}/site/TeoArt_SplashScreen.png`}
        alt="TeoArt"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}
