import React from 'react';

const R2 = 'https://images.kevinteoart.fr';
const STORAGE_KEY_REFUSE = 'pwa_refuse';
const STORAGE_KEY_LAST_VU = 'pwa_last_vu';
const DELAI_REAFFICHAGE = 7 * 24 * 60 * 60 * 1000; // 7 jours en ms

// Détection iOS
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Détection déjà installé
function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function BannerePWA() {
  const [visible, setVisible] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const ios = isIOS();

  React.useEffect(() => {
    // Ne pas afficher si déjà installé
    if (isInstalled()) return;
    // Ne pas afficher si refus définitif
    if (localStorage.getItem(STORAGE_KEY_REFUSE) === 'oui') return;
    // Ne pas afficher si vu il y a moins de 7 jours
    const lastVu = localStorage.getItem(STORAGE_KEY_LAST_VU);
    if (lastVu && Date.now() - parseInt(lastVu) < DELAI_REAFFICHAGE) return;

    // Android : écouter l'event beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
      localStorage.setItem(STORAGE_KEY_LAST_VU, Date.now().toString());
    };

    if (!ios) {
      window.addEventListener('beforeinstallprompt', handler);
    } else {
      // iOS : afficher directement la bannière explicative
      setVisible(true);
      localStorage.setItem(STORAGE_KEY_LAST_VU, Date.now().toString());
    }

    // Détecter installation réussie sur Android
    window.addEventListener('appinstalled', () => {
      setVisible(false);
      localStorage.removeItem(STORAGE_KEY_LAST_VU);
      localStorage.removeItem(STORAGE_KEY_REFUSE);
    });

    return () => {
      if (!ios) window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [ios]);

  const handleInstaller = async () => {
    if (ios) return; // iOS : pas d'install automatique
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleFermer = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY_LAST_VU, Date.now().toString());
  };

  const handleRefuser = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY_REFUSE, 'oui');
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'rgba(10,10,10,0.97)',
      borderTop: '1px solid rgba(0,212,212,0.35)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '16px 20px 20px',
      boxShadow: '0 -4px 24px rgba(0,212,212,0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={`${R2}/site/Logo.png`}
          alt="Kevin Teo'Art"
          style={{ width: '48px', height: '48px', borderRadius: '12px', border: '2px solid rgba(0,212,212,0.4)', objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Kevin Teo'Art</p>
          <p style={{ color: 'rgba(0,212,212,0.9)', fontSize: '12px', margin: '2px 0 0' }}>
            📱 Installe mon univers sur ton téléphone !
          </p>
        </div>
        {/* Bouton fermer (sans refus définitif) */}
        <button
          onClick={handleFermer}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '22px', cursor: 'pointer', padding: '4px', lineHeight: 1, flexShrink: 0 }}
        >×</button>
      </div>

      {/* Instructions iOS */}
      {ios && (
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', margin: 0, lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          Sur iPhone : appuie sur <span style={{ color: '#fff' }}>⎙ Partager</span> en bas de Safari, puis <span style={{ color: '#fff' }}>"Sur l'écran d'accueil"</span>.
        </p>
      )}

      {/* Boutons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {!ios && (
          <button
            onClick={handleInstaller}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, rgba(0,212,212,0.25), rgba(0,212,212,0.12))',
              border: '1px solid rgba(0,212,212,0.55)',
              borderRadius: '10px',
              padding: '11px',
              color: '#00d4d4',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(0,212,212,0.2)',
            }}
          >
            Installer l'application
          </button>
        )}
        <button
          onClick={handleRefuser}
          style={{
            flex: ios ? 1 : 'none',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            padding: '11px 16px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Non merci
        </button>
      </div>
    </div>
  );
}

// Fonction utilitaire pour réactiver depuis Mes Infos
export function reactiverBannerePWA() {
  localStorage.removeItem(STORAGE_KEY_REFUSE);
  localStorage.removeItem(STORAGE_KEY_LAST_VU);
}

// Hook pour savoir si l'appli est installable (pour bouton Mes Infos)
export function usePWAInstallable() {
  const [prompt, setPrompt] = React.useState(null);
  const installed = isInstalled();

  React.useEffect(() => {
    if (installed) return;
    const handler = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [installed]);

  const installer = async () => {
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    return outcome === 'accepted';
  };

  return { installable: !!prompt || isIOS(), installer, installed, ios: isIOS() };
}

export default BannerePWA;
