import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${encodeURIComponent(relatif).replaceAll('%2F', '/')}`;
}

function Selection() {
  const navigate = useNavigate();
  const [etape, setEtape] = React.useState(1); // 1 = recueils, 2 = livres
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

  const validerRecueils = () => setEtape(2);

  const validerLivres = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Récupérer toutes les illustrations des livres et recueils cochés
    const { data: illustrationsLivres } = await supabase
      .from('illustrations')
      .select('id')
      .overlaps('livres_ids', livresCoches.length > 0 ? livresCoches : ['__vide__']);

    const { data: illustrationsRecueils } = await supabase
      .from('illustrations')
      .select('id')
      .overlaps('recueils_ids', recueilsCoches.length > 0 ? recueilsCoches : ['__vide__']);

    const toutesIllustrations = [
      ...new Set([
        ...(illustrationsLivres || []).map(i => i.id),
        ...(illustrationsRecueils || []).map(i => i.id),
      ])
    ];

    // Sauvegarder dans profils
    await supabase.from('profils').update({
      selection_faite: true,
    }).eq('id', user.id);

    // Créer les entrées "j'ai" dans la table collection
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

  if (loading) return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#00d4d4', fontSize: '16px' }}>Chargement...</p>
    </div>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", padding: '40px 20px' }}>

      <style>{`
        .carte:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,212,212,0.2); }
        .carte { transition: transform .2s, box-shadow .2s; }
        .carte.coche { border-color: #00d4d4 !important; }
      `}</style>

      {/* TITRE */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ color: '#00d4d4', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
          {etape === 1 ? '📚 Quels recueils possédez-vous ?' : '📖 Quels livres possédez-vous ?'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
          {etape === 1
            ? 'Cochez les recueils que vous avez déjà, puis cliquez sur Valider.'
            : 'Cochez les livres que vous possédez parmi ceux-ci, puis cliquez sur Valider.'}
        </p>

        {/* Barre de progression */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {[1, 2].map(n => (
            <div key={n} style={{
              width: '40px', height: '5px', borderRadius: '3px',
              background: n <= etape ? '#00d4d4' : 'rgba(255,255,255,0.15)'
            }} />
          ))}
        </div>
      </div>

      {/* GRILLE RECUEILS */}
      {etape === 1 && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
            {recueils.map(r => {
              const coche = recueilsCoches.includes(r.id);
              const url = cheminVersUrl(r.visuel_presentation);
              return (
                <div key={r.id} className={`carte${coche ? ' coche' : ''}`}
                  onClick={() => toggleRecueil(r.id)}
                  style={{
                    width: '180px', cursor: 'pointer', borderRadius: '12px',
                    border: `2px solid ${coche ? '#00d4d4' : 'rgba(255,255,255,0.1)'}`,
                    background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative'
                  }}>
                  {url
                    ? <img src={url} alt={r.nom} style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
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
                    <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>{r.nom}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{r.annee}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={validerRecueils}
              style={{ background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '8px', padding: '14px 48px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
              Valider →
            </button>
          </div>
        </div>
      )}

      {/* GRILLE LIVRES */}
      {etape === 2 && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
            {livres.map(l => {
              const coche = livresCoches.includes(l.id);
              const url = cheminVersUrl(l.visuel_presentation);
              return (
                <div key={l.id} className={`carte${coche ? ' coche' : ''}`}
                  onClick={() => toggleLivre(l.id)}
                  style={{
                    width: '180px', cursor: 'pointer', borderRadius: '12px',
                    border: `2px solid ${coche ? '#00d4d4' : 'rgba(255,255,255,0.1)'}`,
                    background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative'
                  }}>
                  {url
                    ? <img src={url} alt={l.nom} style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
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
                    <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>{l.nom}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{l.annee}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={() => setEtape(1)}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '14px 32px', color: 'rgba(255,255,255,0.6)', fontSize: '15px', cursor: 'pointer' }}>
              ← Retour
            </button>
            <button onClick={validerLivres} disabled={saving}
              style={{ background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '8px', padding: '14px 48px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Enregistrement...' : 'Accéder au catalogue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Selection;