import React from 'react';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";
const PATREON_URL = 'https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink';

const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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
  const premiere = Object.keys(visuels).find(k => !k.toUpperCase().startsWith('A'));
  return premiere ? cheminVersUrl(visuels[premiere]) : null;
}

function extraireColoriste(url) {
  if (!url) return null;
  const nomFichier = decodeURIComponent(url.split('\\').pop().split('/').pop());
  const match = nomFichier.match(/\s*-\s*C\d*\s*-\s*(.+)\.\w+$/i);
  return match ? match[1].trim() : null;
}

function moisSuivant() {
  const d = new Date();
  return MOIS_FR[(d.getMonth() + 1) % 12];
}

// ─── Config des 4 onglets ─────────────────────────────────────────────────────
const ONGLETS = [
  { id: 'patreon',   emoji: '🌟', couleur: '#ffd250', label: 'Nouveautés Patreon'  },
  { id: 'coloriages',emoji: '🎨', couleur: '#00d4d4', label: 'Derniers coloriages' },
  { id: 'bestsellers',emoji:'💎', couleur: '#ff3eb5', label: 'Best sellers'         },
  { id: 'favoris',   emoji: '❤️', couleur: '#a78bfa', label: 'Favoris TeoArt'      },
];

// ─── Panneau d'un onglet ──────────────────────────────────────────────────────
function PanneauOnglet({ id, couleur, emoji, label, userId, onClose }) {
  const [images, setImages] = React.useState([]);
  const [idx, setIdx] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const charger = async () => {
      setLoading(true);
      setIdx(0);

      if (id === 'patreon') {
        const { data } = await supabase
          .from('illustrations')
          .select('id, nom, visuels')
          .eq('statut', 'coming_soon')
          .limit(10);
        setImages((data || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom })).filter(i => i.url));

      } else if (id === 'coloriages') {
        const semaines = [1, 2, 3, 4, 6, 8];
        let colos = [];
        for (const s of semaines) {
          const depuis = new Date(Date.now() - s * 7 * 24 * 3600 * 1000).toISOString();
          const { data } = await supabase
            .from('coloriages')
            .select('id, image_url, user_id')
            .not('image_url', 'is', null)
            .gte('created_at', depuis)
            .order('created_at', { ascending: false })
            .limit(10);
          if (data && data.length > 0) {
            const uids = [...new Set(data.map(c => c.user_id))];
            const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', uids);
            const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
            colos = data.map(c => ({ url: c.image_url, nom: `🎨 ${pm[c.user_id] || 'Coloriste'}`, coloId: c.id }));
            break;
          }
        }
        setImages(colos);

      } else if (id === 'bestsellers') {
        const { data } = await supabase
          .from('illustrations')
          .select('id, nom, visuels')
          .eq('statut', 'published')
          .eq('best_seller', true)
          .limit(10);
        setImages((data || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom })).filter(i => i.url));

      } else if (id === 'favoris') {
        const { data } = await supabase
          .from('illustrations')
          .select('id, nom, visuels')
          .eq('statut', 'published')
          .eq('favori', true)
          .limit(10);
        setImages((data || []).map(i => ({ url: getVisuelB(i.visuels), nom: i.nom })).filter(i => i.url));
      }

      setLoading(false);
    };
    charger();
  }, [id]);

  // Auto-défilement
  React.useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);

  const img = images[idx];
  const coloriste = img ? extraireColoriste(img.url) : null;
  const nomColoriste = img?.nom?.startsWith('🎨') ? img.nom.replace('🎨 ', '') : coloriste;

  return (
    <div style={{
      width: '220px',
      height: '100%',
      background: 'rgba(10,10,10,0.96)',
      borderLeft: `2px solid ${couleur}60`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* En-tête */}
      <div style={{ background: couleur, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#000', fontSize: '12px', fontWeight: 800 }}>{emoji} {label}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#000', fontSize: '16px', cursor: 'pointer', lineHeight: 1, opacity: 0.6 }}>×</button>
      </div>

      {/* Contenu */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Chargement…</span>
        </div>
      ) : images.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center' }}>Aucune image disponible</span>
        </div>
      ) : (
        <>
          {/* Image */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative', minHeight: '180px' }}>
            {id === 'patreon' && (
              <p style={{ position: 'absolute', top: '8px', left: 0, right: 0, textAlign: 'center', color: `${couleur}cc`, fontSize: '10px', fontWeight: 700 }}>
                Ça arrive en {moisSuivant()} sur{' '}
                <span onClick={() => window.open(PATREON_URL, '_blank')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Patreon</span>
              </p>
            )}
            <img
              key={img.url}
              src={img.url}
              alt={img.nom}
              style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
            />
            {nomColoriste && (
              <div style={{ position: 'absolute', bottom: '18px', right: '18px', background: 'rgba(0,0,0,0.75)', borderRadius: '4px', padding: '2px 6px', fontSize: '9px', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)' }}>
                {nomColoriste}
              </div>
            )}
          </div>

          {/* Nom */}
          <div style={{ padding: '4px 14px 8px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.nom}</p>
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '0 14px 12px' }}>
              {images.map((_, i) => (
                <div key={i} onClick={() => setIdx(i)}
                  style={{ width: i === idx ? '14px' : '5px', height: '5px', borderRadius: '3px', background: i === idx ? couleur : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
function OngletsLateraux({ userId }) {
  const [ouvert, setOuvert] = React.useState(null); // id de l'onglet ouvert
  const panneauRef = React.useRef(null);

  // Fermer au clic en dehors
  React.useEffect(() => {
    if (!ouvert) return;
    const handler = (e) => {
      if (panneauRef.current && !panneauRef.current.contains(e.target)) {
        setOuvert(null);
      }
    };
    // Délai pour éviter que le clic d'ouverture déclenche aussi la fermeture
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [ouvert]);

  const toggle = (id) => setOuvert(prev => prev === id ? null : id);

  const ongletActif = ONGLETS.find(o => o.id === ouvert);

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(100%); opacity: 0; }
        }
        .onglet-tab {
          transition: transform 0.2s, opacity 0.2s;
        }
        .onglet-tab:hover {
          transform: translateX(-4px);
        }
      `}</style>

      {/* Languettes fixes sur le bord droit */}
      <div style={{
        position: 'fixed',
        right: ouvert ? '220px' : '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'right 0.3s ease',
      }}>
        {ONGLETS.map(o => (
          <div
            key={o.id}
            className="onglet-tab"
            onClick={() => toggle(o.id)}
            title={o.label}
            style={{
              width: '36px',
              height: '44px',
              background: ouvert === o.id
                ? o.couleur
                : `rgba(10,10,10,0.85)`,
              borderLeft: `3px solid ${o.couleur}`,
              borderTop: `1px solid ${o.couleur}40`,
              borderBottom: `1px solid ${o.couleur}40`,
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              backdropFilter: 'blur(8px)',
              boxShadow: ouvert === o.id
                ? `0 0 14px ${o.couleur}60`
                : '-2px 0 8px rgba(0,0,0,0.4)',
            }}
          >
            {o.emoji}
          </div>
        ))}
      </div>

      {/* Panneau déployé */}
      {ouvert && ongletActif && (
        <div
          ref={panneauRef}
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            height: '100vh',
            zIndex: 199,
            animation: 'slideInRight 0.3s ease',
            display: 'flex',
          }}
        >
          <PanneauOnglet
            id={ongletActif.id}
            couleur={ongletActif.couleur}
            emoji={ongletActif.emoji}
            label={ongletActif.label}
            userId={userId}
            onClose={() => setOuvert(null)}
          />
        </div>
      )}
    </>
  );
}

export default OngletsLateraux;
