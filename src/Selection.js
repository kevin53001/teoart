import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";

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

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${encodeURIComponent(relatif).replaceAll('%2F', '/')}`;
}

function Selection() {
  const navigate = useNavigate();
  const [etape, setEtape] = React.useState(1);
  const [recueils, setRecueils] = React.useState([]);
  const [livres, setLivres] = React.useState([]);
  const [recueilsCoches, setRecueilsCoches] = React.useState([]);
  const [livresCoches, setLivresCoches] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const charger = async () => {
      const { data: r } = await supabase
        .from('recueils')
        .select('id, nom, annee, visuel_presentation')
        .eq('statut', 'published')
        .order('annee');
      const { data: l } = await supabase
        .from('livres')
        .select('id, nom, annee, recueils_ids, visuel_presentation')
        .eq('statut', 'published')
        .order('annee');
      setRecueils(r || []);
      setLivres(l || []);
      setLoading(false);
    };
    charger();
  }, []);

  const toggleRecueil = (id) => {
    setRecueilsCoches(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleLivre = (id) => {
    setLivresCoches(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const validerRecueils = () => {
    window.scrollTo(0, 0);
    setEtape(2);
  };

  const validerLivres = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: illustrationsLivres } = livresCoches.length > 0
      ? await supabase.from('illustrations').select('id').overlaps('livres_ids', livresCoches)
      : { data: [] };

    const { data: illustrationsRecueils } = recueilsCoches.length > 0
      ? await supabase.from('illustrations').select('id').overlaps('recueils_ids', recueilsCoches)
      : { data: [] };

    const toutesIllustrations = [
      ...new Set([
        ...(illustrationsLivres || []).map(i => i.id),
        ...(illustrationsRecueils || []).map(i => i.id),
      ])
    ];

    await supabase.from('profils').update({ selection_faite: true }).eq('id', user.id);

    if (toutesIllustrations.length > 0) {
      const rows = toutesIllustrations.map(illId => ({
        user_id: user.id,
        illustration_id: illId,
        j_ai: true,
      }));
      await supabase.from('collection').upsert(rows);
    }

    setSaving(false);
    navigate('/catalogue');
  };

  const CarteItem = ({ item, coche, onToggle }) => {
    const url = cheminVersUrl(item.visuel_presentation);
    return (
      <div onClick={onToggle}
        style={{
          width: '180px', cursor: 'pointer', borderRadius: '12px',
          border: `2px solid ${coche ? '#00d4d4' : 'rgba(255,255,255,0.1)'}`,
          background: 'rgba(0,0,0,0.6)', overflow: 'hidden', position: 'relative',
          transition: 'transform .2s, box-shadow .2s, border-color .2s',
          transform: coche ? 'translateY(-4px)' : 'none',
          boxShadow: coche ? '0 8px 24px rgba(0,212,212,0.25)' : 'none',
        }}>
        {url
          ? <img src={url} alt={item.nom} style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '220px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>Pas d'image</span>
            </div>
        }
        {coche && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#00d4d4', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
          </div>
        )}
        <div style={{ padding: '10px 12px' }}>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>{item.nom}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{item.annee}</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .barre-left:hover, .barre-right:hover { animation-play-state: paused; }
        @media (max-width: 700px) {
          .encart-selection { max-width: 75vw !important; width: 75vw !important; background: rgba(0,0,0,0.52) !important; padding: 18px 20px !important; }
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

      {/* ZONE BARRES + ENCART */}
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

        {/* ENCART EXPLICATION */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: '20px' }}>
          <div className="encart-selection" style={{ background: 'rgba(0,0,0,0.82)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '16px', padding: '28px 36px', maxWidth: '520px', width: '92%', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <p style={{ color: '#00d4d4', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              Minute papillon ! 🦋
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.9' }}>
              Avant de te laisser explorer toutes les illustrations, il faut résoudre une énigme de la plus haute importance :
            </p>
            <p style={{ color: '#00d4d4', fontStyle: 'italic', fontSize: '15px', margin: '14px 0', fontWeight: 'bold' }}>
              Quels livres possèdes-tu déjà ?
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13.5px', lineHeight: '1.9' }}>
              Sélectionne simplement tes recueils et livres (sur la page suivante), et je m'occuperai du reste en ajoutant automatiquement les illustrations correspondantes à ta collection.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.8', marginTop: '12px', fontStyle: 'italic' }}>
              Promis, c'est rapide. Probablement plus rapide que de retrouver un feutre tombé sous le canapé.<br />
              Et surtout, tu n'auras jamais à refaire cette étape.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION SÉLECTION */}
      <div style={{ padding: '48px 20px 60px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Barre de progression */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {[1, 2].map(n => (
            <div key={n} style={{ width: '60px', height: '5px', borderRadius: '3px', background: n <= etape ? '#00d4d4' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>

        <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px' }}>
          {etape === 1 ? '📚 Quels recueils possèdes-tu ?' : '📖 Quels livres possèdes-tu ?'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', marginBottom: '32px' }}>
          {etape === 1 ? 'Coche les recueils que tu as déjà, puis clique sur Valider.' : 'Coche les livres que tu possèdes, puis clique sur Valider.'}
        </p>

        {loading ? (
          <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>
        ) : (
          <>
            {/* GRILLE 3 par ligne */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 180px)', gap: '24px', justifyContent: 'center', marginBottom: '40px' }}>
              {(etape === 1 ? recueils : livres).map(item => (
                <CarteItem
                  key={item.id}
                  item={item}
                  coche={etape === 1 ? recueilsCoches.includes(item.id) : livresCoches.includes(item.id)}
                  onToggle={() => etape === 1 ? toggleRecueil(item.id) : toggleLivre(item.id)}
                />
              ))}
            </div>

            {/* BOUTONS */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {etape === 2 && (
                <button onClick={() => setEtape(1)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '13px 32px', color: 'rgba(255,255,255,0.6)', fontSize: '15px', cursor: 'pointer' }}>
                  ← Retour
                </button>
              )}
              <button onClick={etape === 1 ? validerRecueils : validerLivres} disabled={saving}
                style={{ background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '8px', padding: '13px 48px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Enregistrement...' : etape === 1 ? 'Valider →' : 'Accéder au catalogue →'}
              </button>
            </div>
          </>
        )}
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

export default Selection;