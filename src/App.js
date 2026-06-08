import React from 'react';

const R2 = 'https://images.kevinteoart.fr';

const barres = [
  { direction: 'left',  images: Array.from({length: 20}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 20}, (_, i) => `bg_${String(i+21).padStart(3,'0')}.jpg`) },
  { direction: 'left',  images: Array.from({length: 20}, (_, i) => `bg_${String(i+41).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 20}, (_, i) => `bg_${String(i+61).padStart(3,'0')}.jpg`) },
  { direction: 'left',  images: Array.from({length: 20}, (_, i) => `bg_${String(i+81).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 20}, (_, i) => `bg_${String(i+101).padStart(3,'0')}.jpg`) },
];

const BANNER_MAX = '1200px';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const SPEED = '80s'; // lent

function App() {
  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', sans-serif",
      overflowX: 'hidden',
    }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes scrollLeft  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0);    } }

        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }

        .barre-left:hover,
        .barre-right:hover { animation-play-state: paused; }

        input::placeholder { color: rgba(255,255,255,0.35); }
        input:focus { outline: none; border-color: rgba(0,212,212,0.6) !important; }
        button:hover { opacity: 0.88; }

        @media (max-width: 700px) {
          .encarts { flex-direction: column !important; align-items: center !important; }
          .encart-msg, .encart-login { max-width: 90vw !important; width: 90vw !important; }
        }
      `}</style>

      {/* ── BANNIÈRE ── */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 0 0',
        position: 'relative',
        zIndex: 2,
      }}>
        <img
          src={`${R2}/site/banniere.jpg`}
          alt="bannière"
          style={{
            maxWidth: BANNER_MAX,
            width: '92%',
            borderRadius: '14px',
            display: 'block',
          }}
        />
      </div>

      {/* ── LOGO ── */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        marginTop: '-60px',
        marginBottom: '18px',
      }}>
        <img
          src={`${R2}/site/Logo.png`}
          alt="logo Kevin Teo'Art"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '4px solid #000',
            boxShadow: '0 0 0 3px #00d4d4',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* ── ZONE BARRES + ENCARTS ── */}
      <div style={{ position: 'relative', width: '100%' }}>

        {/* Barres animées — centrées, largeur = bannière */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          {barres.map((barre, i) => (
            <div
              key={i}
              style={{
                width: '92%',
                maxWidth: BANNER_MAX,
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '6px',
              }}
            >
              {/* Dégradés latéraux */}
              <div style={{
                position: 'absolute', left: 0, top: 0,
                width: '120px', height: '100%',
                background: 'linear-gradient(to right, #000 40%, transparent)',
                zIndex: 2, pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', right: 0, top: 0,
                width: '120px', height: '100%',
                background: 'linear-gradient(to left, #000 40%, transparent)',
                zIndex: 2, pointerEvents: 'none',
              }} />

              {/* Images défilantes */}
              <div
                className={barre.direction === 'left' ? 'barre-left' : 'barre-right'}
                style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content' }}
              >
                {[...barre.images, ...barre.images].map((img, j) => (
                  <img
                    key={j}
                    src={`${R2}/bg/${img}`}
                    alt=""
                    style={{
                      width: `${IMG_W}px`,
                      height: `${IMG_H}px`,
                      objectFit: 'cover',
                      borderRadius: '5px',
                      opacity: 0.25,
                      display: 'block',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── ENCARTS superposés sur les barres ── */}
        <div
          className="encarts"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            zIndex: 10,
            padding: '30px 20px',
          }}
        >
          {/* Message d'accueil */}
          <div
            className="encart-msg"
            style={{
              background: 'rgba(0,0,0,0.78)',
              border: '1px solid rgba(0,212,212,0.3)',
              borderRadius: '16px',
              padding: '28px 32px',
              maxWidth: '480px',
              width: '100%',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p style={{
              color: '#00d4d4',
              fontStyle: 'italic',
              marginBottom: '14px',
              fontSize: '15px',
              lineHeight: '1.6',
            }}>
              Des idées plein la tête et la tête dans les nuages, bienvenue dans mon univers.
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: '13.5px',
              lineHeight: '1.75',
            }}>
              Ici vous trouverez toutes mes illustrations à colorier — des personnages, des univers, des émotions — pensés pour vous emmener ailleurs le temps d'une page.<br /><br />
              Constituez votre collection, découvrez les nouveautés, partagez vos coloriages et plongez dans mes histoires. Ce site c'est un peu ma maison, et j'espère qu'elle vous ressourcera.
            </p>
          </div>

          {/* Formulaire connexion */}
          <div
            className="encart-login"
            style={{
              background: 'rgba(0,0,0,0.78)',
              border: '1px solid rgba(0,212,212,0.3)',
              borderRadius: '16px',
              padding: '28px 32px',
              width: '340px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '6px',
            }}>
              Connexion
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.38)',
              fontSize: '12px',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              Inscription obligatoire pour accéder au contenu du site.
            </p>

            <input
              type="email"
              placeholder="Adresse email"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#fff',
                marginBottom: '12px',
                fontSize: '14px',
              }}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#fff',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            />
            <button style={{
              width: '100%',
              background: 'linear-gradient(135deg, #00d4d4, #0099aa)',
              border: 'none',
              borderRadius: '8px',
              padding: '13px',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'opacity .2s',
            }}>
              Se connecter
            </button>

            <div style={{
              color: 'rgba(255,255,255,0.28)',
              textAlign: 'center',
              marginBottom: '12px',
              fontSize: '13px',
            }}>
              — ou —
            </div>

            <button style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '13px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'opacity .2s',
            }}>
              Créer un compte
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
