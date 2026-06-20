import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';

const barres = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`) },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`) },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`) },
];

const BANNER_MAX = '1200px';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const SPEED = '80s';

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [showReset, setShowReset] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetMsg, setResetMsg] = React.useState('');

  const handleConnexion = async () => {
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError('Email ou mot de passe incorrect.');
      return;
    }
    const { data: profil } = await supabase
      .from('profils')
      .select('selection_faite')
      .eq('id', data.user.id)
      .single();

    setLoading(false);
    if (profil?.selection_faite) {
      navigate('/accueil');
    } else {
      navigate('/selection');
    }
  };

  const handleReset = async () => {
    if (!resetEmail.trim()) { setResetMsg('Saisis ton adresse email.'); return; }
    setResetLoading(true);
    setResetMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      setResetMsg('Une erreur est survenue. Vérifie ton adresse email.');
    } else {
      setResetMsg('Email envoyé ! Vérifie ta boîte mail.');
    }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "var(--font-texte)", overflowX: 'hidden' }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .barre-left:hover, .barre-right:hover { animation-play-state: paused; }
        input::placeholder { color: rgba(255,255,255,0.35); }
        input:focus { outline: none; border-color: rgba(0,212,212,0.6) !important; }
        button:hover { opacity: 0.88; }
        .texte-mobile { display: none; }
        .texte-desktop { display: block; }
        @media (max-width: 700px) {
          .texte-desktop { display: none !important; }
          .texte-mobile { display: block !important; }
          .encart-msg, .encart-login {
            max-width: 75vw !important;
            width: 75vw !important;
            background: rgba(0,0,0,0.52) !important;
            padding: 18px 20px !important;
          }
        }
      `}</style>

      {/* BANNIÈRE HAUT */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* LOGO */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', justifyContent: 'center', marginTop: '-60px', marginBottom: '0px' }}>
        <img src={`${R2}/site/Logo.png`} alt="logo Kevin Teo'Art" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #000', boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover' }} />
      </div>

      {/* ZONE BARRES + ENCARTS */}
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {barres.map((barre, i) => (
            <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content' }}>
                {[...barre.images, ...barre.images].map((img, j) => (
                  <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', opacity: 0.5, display: 'block' }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ENCARTS */}
        <div className="encarts" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: '16px', zIndex: 10, padding: '16px 20px 30px' }}>

          {/* Message d'accueil */}
          <div className="encart-msg" style={{ background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '16px', padding: '24px 32px', maxWidth: '480px', width: '92%', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <p className="texte-desktop" style={{ color: '#00d4d4', fontStyle: 'italic', marginBottom: '14px', fontSize: '15px', lineHeight: '1.7' }}>
              Des idées plein la tête et la tête dans les nuages, bienvenue dans mon univers.
            </p>
            <p className="texte-desktop" style={{ color: 'rgba(255,255,255,0.72)', fontSize: '13.5px', lineHeight: '1.9', whiteSpace: 'pre-line' }}>
              {`Ici vous trouverez toutes mes illustrations à colorier\ndes personnages, des univers, des émotions,\npensés pour vous emmener ailleurs le temps d'une page.\n\nConstituez votre collection, découvrez les nouveautés,\npartagez vos coloriages et plongez dans mes histoires.\nCe site c'est un peu ma maison,\net j'espère qu'elle vous ressourcera.`}
            </p>
            <p className="texte-mobile" style={{ color: '#00d4d4', fontStyle: 'italic', marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
              Des idées plein la tête et la tête dans les nuages, bienvenue dans mon univers.
            </p>
            <p className="texte-mobile" style={{ color: 'rgba(255,255,255,0.72)', fontSize: '12px', lineHeight: '1.8' }}>
              Ici vous trouverez toutes mes illustrations à colorier, des personnages, des univers, des émotions, pensés pour vous emmener ailleurs le temps d'une page.
              <br /><br />
              Constituez votre collection, découvrez les nouveautés, partagez vos coloriages et plongez dans mes histoires. Ce site c'est un peu ma maison, et j'espère qu'elle vous ressourcera.
            </p>
          </div>

          {/* Formulaire connexion */}
          <div className="encart-login" style={{ background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '16px', padding: '28px 32px', maxWidth: '480px', width: '92%', backdropFilter: 'blur(10px)' }}>
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px' }}>Connexion</p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>Inscription obligatoire pour accéder au contenu du site.</p>

            {error && <p style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}

            <input type="email" placeholder="Adresse email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px', padding: '12px 14px', color: '#fff', marginBottom: '12px', fontSize: '14px' }} />

            {/* Champ mot de passe avec œil */}
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleConnexion(); }}
                style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px', padding: '12px 40px 12px 14px', color: '#fff', fontSize: '14px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showPassword ? '#00d4d4' : 'rgba(255,255,255,0.35)', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>

            {/* Lien mot de passe oublié */}
            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
              <span
                onClick={() => { setShowReset(v => !v); setResetMsg(''); setResetEmail(''); }}
                style={{ color: 'rgba(0,212,212,0.6)', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>
                Mot de passe oublié ?
              </span>
            </div>

            {/* Formulaire reset inline */}
            {showReset && (
              <div style={{ background: 'rgba(0,212,212,0.05)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Saisis ton email pour recevoir un lien de réinitialisation.</p>
                <input
                  type="email"
                  placeholder="Ton adresse email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleReset(); }}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}
                />
                {resetMsg && (
                  <p style={{ color: resetMsg.includes('envoyé') ? '#00d4d4' : '#ff6b6b', fontSize: '12px' }}>{resetMsg}</p>
                )}
                <button
                  onClick={handleReset}
                  disabled={resetLoading}
                  style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.4)', borderRadius: '8px', padding: '9px', color: '#00d4d4', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: resetLoading ? 0.6 : 1 }}>
                  {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </div>
            )}

            <button onClick={handleConnexion} disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '8px', padding: '13px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginBottom: '8px', transition: 'opacity .2s', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <button onClick={() => navigate('/inscription')}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '13px', color: 'rgba(255,255,255,0.7)', fontSize: '15px', cursor: 'pointer', transition: 'opacity .2s' }}>
              Créer un compte
            </button>
          </div>
        </div>
      </div>

      {/* BANNIÈRE BAS */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 24px', position: 'relative', zIndex: 2 }}>
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

export default Connexion;