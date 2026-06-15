import React from 'react';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';

function BoutonsFlottants() {
  const [decoActif, setDecoActif] = React.useState(false);
  const [showScroll, setShowScroll] = React.useState(false);

  // Afficher le bouton scroll-to-top après 300px de scroll
  React.useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDeco = async () => {
    if (decoActif) return;
    setDecoActif(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = '/';
    }, 1200);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* Bouton déconnexion — pastille power */}
      <div
        onClick={handleDeco}
        title={decoActif ? 'Déconnexion…' : 'Se déconnecter'}
        style={{
          position: 'fixed',
          top: '12px',
          left: '16px',
          zIndex: 1000,
          width: '38px',
          height: '38px',
          cursor: decoActif ? 'default' : 'pointer',
          transition: 'transform 0.15s, opacity 0.3s',
          opacity: decoActif ? 0.8 : 1,
        }}
      >
        <img
          src={decoActif
            ? `${R2}/site/pastille_powerred.png`
            : `${R2}/site/pastille_powergreen.png`}
          alt="Déconnexion"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onContextMenu={e => e.preventDefault()}
          draggable={false}
        />
      </div>

      {/* Bouton scroll-to-top — bas droite */}
      <div
        onClick={scrollTop}
        title="Remonter en haut"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          width: '42px',
          height: '42px',
          background: 'rgba(0,212,212,0.18)',
          border: '1.5px solid rgba(0,212,212,0.5)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 0 14px rgba(0,212,212,0.25)',
          opacity: showScroll ? 1 : 0,
          pointerEvents: showScroll ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 14V4M9 4L4 9M9 4L14 9" stroke="rgba(0,212,212,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </>
  );
}

export default BoutonsFlottants;
