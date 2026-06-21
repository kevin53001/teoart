import React from 'react';
import ReactDOM from 'react-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';
const MASCOTTE_URL = `${R2}/site/mascotte_kitsu.png`;

// ─── MODE TEST ──────────────────────────────────────────────────────────────
// Tant que c'est à true, le guide s'affiche à CHAQUE chargement de page,
// sans vérifier ni écrire dans Supabase (pratique pour tester les textes).
// Repasser à false pour activer le comportement définitif ("vu une fois,
// disparaît pour toujours").
const MODE_TEST = true;

// ─── Contenu des guides par page ───────────────────────────────────────────
const GUIDES = {
  accueil: [
    "Salut toi ! Bienvenue chez Kevin Teo'Art. Ici tu trouveras une boutique d'illustrations à colorier, mais aussi tout un espace pour bâtir et suivre ta propre collection, un peu comme un musée perso qui grandit avec toi.",
    "Une fois ton coloriage terminé, n'oublie surtout pas de le partager ! C'est ce qui fait vivre la communauté : chaque mise en couleur vient rejoindre la galerie de l'illustration. J'adore voir un même dessin prendre vie sous des dizaines de styles différents, alors viens enrichir la collection.",
    "Je t'ai préparé un petit guide juste en dessous : jette un œil à l'encart \"Comment fonctionne le site ?\", il t'explique tout en détail pour bien démarrer.",
  ],
  catalogue: [
    "Bienvenue dans le capharnaüm organisé. Toutes mes illustrations à colorier sont ici, classées par catégorie et par année.",
    "Filtre par catégorie ou utilise la recherche pour trouver ton bonheur parmi Animaux, Manga, Kawaii/Chibi, Halloween, et bien d'autres.",
    "Sur chaque fiche, coche \"J'ai\" pour l'ajouter à ta collection, \"Je veux\" pour ta liste de souhaits.",
    "Et surtout, une fois ton coloriage terminé, partage-le ! Ouvre la fiche de l'illustration ou clique directement sur la vignette en bas à gauche de l'image. Il rejoint alors la galerie de cette illustration, où tous les coloriages de la communauté s'affichent ensemble, juste pour le plaisir des yeux.",
  ],
  livres: [
    "Ici les recueils et livres PDF prennent vie. Chaque livre regroupe un thème précis, chaque recueil regroupe plusieurs livres pour un tarif plus avantageux.",
    "Coche \"J'ai\" sur un livre ou un recueil entier pour cocher d'un coup toutes ses illustrations dans ta collection.",
    "Certains titres existent aussi en version reliée : un vrai livre papier, à tarif avantageux. Je m'occupe moi-même de passer la commande auprès d'Amazon, qui te livre directement chez toi. Prix et délais varient selon ton pays.",
  ],
  presentation: [
    "L'envers du décor. Qui je suis, pourquoi je dessine, et comment tout ça a commencé. Spoiler : beaucoup de café et de patience.",
    "Si après ça t'as encore des questions, le tchat est juste là pour me les poser directement.",
  ],
  pensees: [
    "Le coin des pensées qui flottent. Une roue interactive remplie de textes que j'écris, à parcourir tranquillement.",
    "Tu peux liker et commenter chaque pensée. Et oui, je traîne souvent par ici aussi, donc tu pourrais bien tomber sur moi.",
    "Toi aussi t'as des choses à dire, des écrits à partager ? Soumets-les, je les valide avant publication.",
  ],
  'mon-compte': [
    "Ton repaire perso. Toutes tes infos et tes affaires sont centralisées ici, réparties en plusieurs onglets.",
    "Ma Collection : tout ce que t'as coché \"J'ai\" s'affiche ici, classé par année, avec un système d'accordéon pour ouvrir et fermer chaque recueil ou livre. Tu peux aussi marquer une illustration comme coloriée et exporter un tracker de ta collection en PDF.",
    "Mes Favoris et Mes Coloriages pour retrouver ce que t'as aimé et partagé. Mes Infos pour gérer ton profil.",
    "Mes Commandes pour retélécharger tes PDF achetés ici à tout moment, pas besoin de les garder précieusement quelque part.",
  ],
};

// La mascotte est désormais fixe (bas-gauche, entière, sans rotation) sur
// toutes les pages — voir le composant Mascotte ci-dessous.

function Mascotte() {
  const TAILLE = 92; // taille de base de la mascotte (px)

  return (
    <div style={{
      position: 'absolute', bottom: '0', left: '0',
      width: `${TAILLE}px`, height: `${TAILLE}px`,
      pointerEvents: 'none', zIndex: 5,
      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))',
    }}>
      <img
        src={MASCOTTE_URL}
        alt=""
        style={{ width: `${TAILLE}px`, height: `${TAILLE}px`, objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

/**
 * GuideFlottant — fenêtre qui apparaît automatiquement à la première visite
 * d'une page (par utilisateur connecté), puis ne réapparaît plus jamais une
 * fois fermée. Mémorisation via la table Supabase `guides_vus`.
 * (Mode test actif : voir MODE_TEST en haut du fichier.)
 *
 * Props :
 *  - pageKey : clé de la page, doit correspondre à une entrée de GUIDES
 *  - userId  : id de l'utilisateur connecté (si absent, le guide ne s'affiche pas)
 *  - isMobile
 */
function GuideFlottant({ pageKey, userId, isMobile }) {
  const slides = GUIDES[pageKey];
  const [visible, setVisible] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [pret, setPret] = React.useState(false); // évite un flash avant la vérif Supabase
  const cardRef = React.useRef(null);

  React.useEffect(() => {
    let annule = false;
    if (!userId || !slides || slides.length === 0) { setPret(true); return; }

    if (MODE_TEST) {
      setVisible(true);
      setPret(true);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('guides_vus')
        .select('page_key')
        .eq('user_id', userId)
        .eq('page_key', pageKey)
        .maybeSingle();

      if (annule) return;
      if (!data) setVisible(true);
      setPret(true);
    })();

    return () => { annule = true; };
  }, [userId, pageKey, slides]);

  // Effet "reflet" carte premium au montage / changement de slide
  React.useEffect(() => {
    if (!visible) return;
    const el = cardRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.classList.remove('guide-shining'); void el.offsetWidth; el.classList.add('guide-shining');
    }, 350);
    return () => clearTimeout(t);
  }, [visible, index]);

  const fermer = async () => {
    setVisible(false);
    if (!userId || MODE_TEST) return;
    await supabase.from('guides_vus').upsert(
      { user_id: userId, page_key: pageKey },
      { onConflict: 'user_id,page_key' }
    );
  };

  if (!pret || !visible || !slides || slides.length === 0) return null;

  const dernier = index === slides.length - 1;
  // La mascotte est toujours en bas-gauche : on réserve la place côté gauche
  const paddingMascotte = { paddingLeft: isMobile ? '54px' : '64px' };

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'guideFlottantFade 0.3s ease',
      }}
      onClick={fermer}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="guide-flottant-card"
        style={{
          width: isMobile ? '100%' : '420px',
          maxWidth: '92vw',
          background: '#5bf9ff',
          border: '1px solid #000',
          borderRadius: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.6)',
          padding: isMobile ? '22px 18px' : '28px 26px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'guideFlottantPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <button
          onClick={fermer}
          aria-label="Fermer"
          style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 20,
            background: '#000', border: '1px solid #000',
            borderRadius: '50%', width: '30px', height: '30px',
            color: '#fff', fontSize: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>

        <div style={{ position: 'relative', zIndex: 6, ...paddingMascotte }}>
          <p style={{
            color: '#000', fontSize: isMobile ? '15px' : '16px', lineHeight: '1.75',
            fontWeight: 500, marginTop: '4px', marginBottom: '22px', paddingRight: '20px',
          }}>
            {slides[index]}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {slides.map((_, i) => (
                <div key={i} style={{
                  width: i === index ? '20px' : '7px', height: '7px', borderRadius: '4px',
                  background: i === index ? '#000' : 'rgba(0,0,0,0.25)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>

            <button
              onClick={() => dernier ? fermer() : setIndex(i => i + 1)}
              style={{
                background: '#000', border: 'none', borderRadius: '999px',
                padding: '9px 20px', color: '#fff', fontWeight: 'bold', fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {dernier ? "C'est compris !" : 'Suivant'}
            </button>
          </div>
        </div>

        <Mascotte />
      </div>

      <style>{`
        @keyframes guideFlottantFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes guideFlottantPop { from { opacity: 0; transform: scale(0.92) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .guide-flottant-card::before {
          content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.02) 10%, rgba(255,225,110,0.07) 25%, rgba(255,235,150,0.12) 40%, rgba(255,245,170,0.08) 50%, rgba(255,235,140,0.11) 62%, rgba(255,220,100,0.06) 75%, rgba(255,210,80,0.02) 88%, transparent 100%);
          transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen;
        }
        .guide-flottant-card.guide-shining::before { animation: guideShine 1.0s ease-in-out forwards; }
        @keyframes guideShine { 0% { left: -150%; } 100% { left: 220%; } }
      `}</style>
    </div>,
    document.body
  );
}

export default GuideFlottant;