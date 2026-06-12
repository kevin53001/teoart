import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";
const BANNER_MAX = '1200px';
const SPEED = '80s';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;

const BARRES = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.40 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`), opacite: 0.30 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`), opacite: 0.20 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`), opacite: 0.15 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`), opacite: 0.10 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.05 },
];

const CATEGORIES = ['Portrait', 'Kawaii/Chibi', 'Manga', 'Noël', 'Halloween', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Animaux'];

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${relatif.split('/').map(s => encodeURIComponent(s)).join('/')}`;
}

function getVisuelPresentation(visuels) {
  if (!visuels) return null;
  const cle = Object.keys(visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
  if (cle) return cheminVersUrl(visuels[cle]);
  if (visuels['B']) return cheminVersUrl(visuels['B']);
  if (visuels['b']) return cheminVersUrl(visuels['b']);
  return null;
}

// ─── JAUGE DOUBLE ────────────────────────────────────────────────────────────
function JaugeDouble({ pctJai, pctColorie, pctJeVeux, hauteur = 10, showLabels = true }) {
  const [animJai, setAnimJai] = React.useState(0);
  const [animColorie, setAnimColorie] = React.useState(0);
  const [animJeVeux, setAnimJeVeux] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => { setAnimJai(pctJai); setAnimColorie(pctColorie); setAnimJeVeux(pctJeVeux); }, 100);
    return () => clearTimeout(t);
  }, [pctJai, pctColorie, pctJeVeux]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', height: `${hauteur}px`, background: 'rgba(255,255,255,0.06)', borderRadius: `${hauteur}px`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${animJai}%`, background: 'linear-gradient(90deg, #00d4d4, #00aaaa)', borderRadius: `${hauteur}px`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${animColorie}%`, background: 'linear-gradient(90deg, rgba(255,210,80,0.7), rgba(255,180,40,0.7))', borderRadius: `${hauteur}px`, transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)', mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${animJeVeux}%`, background: 'linear-gradient(90deg, rgba(255,62,181,0.5), rgba(255,62,181,0.3))', borderRadius: `${hauteur}px`, transition: 'width 1.0s cubic-bezier(0.4,0,0.2,1)', mixBlendMode: 'screen' }} />
      </div>
      {showLabels && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{ color: '#00d4d4', fontSize: '10px' }}>✓ {pctJai.toFixed(0)}% J'ai</span>
          <span style={{ color: 'rgba(255,210,80,0.8)', fontSize: '10px' }}>🎨 {pctColorie.toFixed(0)}% Colorié</span>
          <span style={{ color: '#ff3eb5', fontSize: '10px' }}>♡ {pctJeVeux.toFixed(0)}% Je veux</span>
        </div>
      )}
    </div>
  );
}

// ─── VIGNETTE ILLUSTRATION (lecture seule, sans toggle) ───────────────────────
function VignetteIlluLecture({ illu, taille = 100, aColorie = false }) {
  const url = getVisuelPresentation(illu.visuels);
  return (
    <div style={{ flexShrink: 0, width: `${taille}px`, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,212,212,0.15)', background: '#0a0a0a', position: 'relative' }}>
      {url ? <img src={url} alt={illu.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />}
      <div style={{ position: 'absolute', top: '3px', left: '3px', borderRadius: '3px', padding: '1px 4px', fontSize: '8px', fontWeight: 'bold', background: '#00d4d4', color: '#000' }}>✓</div>
      {aColorie && (
        <div style={{ position: 'absolute', bottom: `${taille > 80 ? 22 : 18}px`, left: '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,210,80,0.2)', border: '1px solid rgba(255,210,80,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>🎨</div>
      )}
      <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.85)' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
      </div>
    </div>
  );
}

// ─── SECTION MA COLLECTION ────────────────────────────────────────────────────
function SectionMaCollection({ userId, totalIllus }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [anneesOuvertes, setAnneesOuvertes] = React.useState({});
  const [recueilsOuverts, setRecueilsOuverts] = React.useState({});
  const [livresOuverts, setLivresOuverts] = React.useState({});

  React.useEffect(() => {
    const charger = async () => {
      try {
      // Toutes les illustrations que j'ai
      const { data: collIllus } = await supabase.from('collection')
        .select('illustration_id, j_ai, je_veux').eq('user_id', userId).eq('j_ai', true);
      const { data: colos } = await supabase.from('coloriages').select('illustration_id').eq('user_id', userId);
      const colosSet = new Set((colos || []).map(c => c.illustration_id));
      const illuIds = (collIllus || []).map(c => c.illustration_id);

      if (illuIds.length === 0) { setData({ annees: [] }); setLoading(false); return; }

      // Charger les illustrations par batch de 200
      let illus = [];
      for (let i = 0; i < illuIds.length; i += 200) {
        const batch = illuIds.slice(i, i + 200);
        const { data } = await supabase.from('illustrations')
          .select('id, nom, annee, visuels, livres_ids, recueils_ids').in('id', batch).order('nom');
        illus = illus.concat(data || []);
      }

      // Charger tous les livres et recueils pour avoir les noms
      const { data: tousLivres } = await supabase.from('livres').select('id, nom, annee, visuel_presentation, recueils_ids').eq('statut', 'published');
      const { data: tousRecueils } = await supabase.from('recueils').select('id, nom, annee, visuel_presentation').eq('statut', 'published');

      // Charger le total d'illustrations par année/livre/recueil pour les jauges
      const { data: toutesIllus } = await supabase.from('illustrations').select('id, annee, livres_ids, recueils_ids').eq('statut', 'published');

      const livresMap = {};
      (tousLivres || []).forEach(l => { livresMap[l.id] = l; });
      const recueilsMap = {};
      (tousRecueils || []).forEach(r => { recueilsMap[r.id] = r; });

      // Organiser par année
      const parAnnee = {};
      (illus || []).forEach(illu => {
        const annee = illu.annee || 'Sans année';
        if (!parAnnee[annee]) parAnnee[annee] = { illus: [], livres: {}, recueils: {} };
        parAnnee[annee].illus.push({ ...illu, aColorie: colosSet.has(illu.id) });

        // Organiser par recueil
        (illu.recueils_ids || []).forEach(rid => {
          if (!recueilsMap[rid]) return;
          if (!parAnnee[annee].recueils[rid]) parAnnee[annee].recueils[rid] = { info: recueilsMap[rid], livres: {}, illus: [] };
          // Organiser par livre dans le recueil
          (illu.livres_ids || []).forEach(lid => {
            if (!livresMap[lid]) return;
            if (livresMap[lid].recueils_ids && livresMap[lid].recueils_ids.includes(rid)) {
              if (!parAnnee[annee].recueils[rid].livres[lid]) parAnnee[annee].recueils[rid].livres[lid] = { info: livresMap[lid], illus: [] };
              parAnnee[annee].recueils[rid].livres[lid].illus.push({ ...illu, aColorie: colosSet.has(illu.id) });
            }
          });
        });
      });

      // Totaux pour jauges
      const totauxAnnee = {};
      const totauxLivre = {};
      const totauxRecueil = {};
      (toutesIllus || []).forEach(illu => {
        const a = illu.annee || 'Sans année';
        totauxAnnee[a] = (totauxAnnee[a] || 0) + 1;
        (illu.livres_ids || []).forEach(lid => { totauxLivre[lid] = (totauxLivre[lid] || 0) + 1; });
        (illu.recueils_ids || []).forEach(rid => { totauxRecueil[rid] = (totauxRecueil[rid] || 0) + 1; });
      });

      setData({ parAnnee, totauxAnnee, totauxLivre, totauxRecueil });
      } catch(e) { console.error('SectionMaCollection error:', e); }
      setLoading(false);
    };
    charger();
  }, [userId]);

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (!data || Object.keys(data.parAnnee).length === 0) return <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Aucune illustration dans ta collection.</p>;

  const { parAnnee, totauxAnnee, totauxLivre, totauxRecueil } = data;
  const anneesSorted = Object.keys(parAnnee).sort((a, b) => b - a);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {anneesSorted.map(annee => {
        const anneeData = parAnnee[annee];
        const totalAnnee = totauxAnnee[annee] || 1;
        const jaiAnnee = anneeData.illus.length;
        const colorieAnnee = anneeData.illus.filter(i => i.aColorie).length;
        const pctJai = (jaiAnnee / totalAnnee) * 100;
        const pctColo = (colorieAnnee / totalAnnee) * 100;
        const ouvert = anneesOuvertes[annee];

        return (
          <div key={annee} style={{ border: '1px solid rgba(0,212,212,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Ligne année */}
            <div onClick={() => setAnneesOuvertes(p => ({ ...p, [annee]: !p[annee] }))}
              style={{ padding: '12px 16px', cursor: 'pointer', background: ouvert ? 'rgba(0,212,212,0.06)' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: ouvert ? '#00d4d4' : 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: 'bold', minWidth: '50px' }}>{annee}</span>
              <div style={{ flex: 1 }}>
                <JaugeDouble pctJai={pctJai} pctColorie={pctColo} pctJeVeux={0} hauteur={8} showLabels={false} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', whiteSpace: 'nowrap' }}>{jaiAnnee}/{totalAnnee}</span>
              <span style={{ color: ouvert ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '16px', transition: 'transform .2s', transform: ouvert ? 'rotate(90deg)' : 'none' }}>›</span>
            </div>

            {ouvert && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Recueils de cette année */}
                {Object.values(anneeData.recueils).map(recueilData => {
                  const rid = recueilData.info.id;
                  const totalR = totauxRecueil[rid] || 1;
                  const illusRecueil = Object.values(recueilData.livres).flatMap(l => l.illus);
                  const jaiR = illusRecueil.length;
                  const colorieR = illusRecueil.filter(i => i.aColorie).length;
                  const ouvertR = recueilsOuverts[rid];

                  return (
                    <div key={rid} style={{ border: '1px solid rgba(0,212,212,0.15)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div onClick={() => setRecueilsOuverts(p => ({ ...p, [rid]: !p[rid] }))}
                        style={{ padding: '10px 14px', cursor: 'pointer', background: ouvertR ? 'rgba(0,212,212,0.04)' : 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {recueilData.info.visuel_presentation
                          ? <img src={cheminVersUrl(recueilData.info.visuel_presentation)} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                          : <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#111', flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#00d4d4', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{recueilData.info.nom}</p>
                          <JaugeDouble pctJai={(jaiR/totalR)*100} pctColorie={(colorieR/totalR)*100} pctJeVeux={0} hauteur={6} showLabels={false} />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiR}/{totalR}</span>
                        <span style={{ color: ouvertR ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '16px', transition: 'transform .2s', transform: ouvertR ? 'rotate(90deg)' : 'none' }}>›</span>
                      </div>

                      {ouvertR && (
                        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.values(recueilData.livres).map(livreData => {
                            const lid = livreData.info.id;
                            const totalL = totauxLivre[lid] || 1;
                            const jaiL = livreData.illus.length;
                            const colorieL = livreData.illus.filter(i => i.aColorie).length;
                            const ouvertL = livresOuverts[lid];
                            const estDossier = !livreData.info.visuel_presentation;

                            return (
                              <div key={lid} style={{ border: `1px solid ${estDossier ? 'rgba(255,210,80,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', overflow: 'hidden' }}>
                                <div onClick={() => setLivresOuverts(p => ({ ...p, [lid]: !p[lid] }))}
                                  style={{ padding: '8px 12px', cursor: 'pointer', background: ouvertL ? 'rgba(255,255,255,0.03)' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {estDossier
                                    ? <span style={{ fontSize: '16px' }}>📁</span>
                                    : <img src={cheminVersUrl(livreData.info.visuel_presentation)} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />}
                                  <div style={{ flex: 1 }}>
                                    <p style={{ color: estDossier ? 'rgba(255,210,80,0.8)' : 'rgba(255,255,255,0.8)', fontSize: '11px', marginBottom: '3px' }}>{livreData.info.nom}</p>
                                    <JaugeDouble pctJai={(jaiL/totalL)*100} pctColorie={(colorieL/totalL)*100} pctJeVeux={0} hauteur={5} showLabels={false} />
                                  </div>
                                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiL}/{totalL}</span>
                                  <span style={{ color: ouvertL ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '14px', transition: 'transform .2s', transform: ouvertL ? 'rotate(90deg)' : 'none' }}>›</span>
                                </div>
                                {ouvertL && (
                                  <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {livreData.illus.map(illu => (
                                      <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Illustrations sans recueil */}
                {(() => {
                  const illusSansRecueil = anneeData.illus.filter(i => !i.recueils_ids || i.recueils_ids.length === 0);
                  if (illusSansRecueil.length === 0) return null;
                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {illusSansRecueil.map(illu => (
                        <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SECTION MES FAVORIS ─────────────────────────────────────────────────────
function SectionMesFavoris({ userId }) {
  const [illus, setIllus] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const charger = async () => {
      const { data: coll } = await supabase.from('collection').select('illustration_id').eq('user_id', userId).eq('je_veux', true);
      if (!coll || coll.length === 0) { setLoading(false); return; }
      const ids = coll.map(c => c.illustration_id);
      const { data: illusData } = await supabase.from('illustrations').select('id, nom, annee, visuels, prix').in('id', ids).order('nom');
      setIllus(illusData || []);
      setLoading(false);
    };
    charger();
  }, [userId]);

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (illus.length === 0) return <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Aucun favori pour l'instant.</p>;

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '14px' }}>{illus.length} illustration{illus.length > 1 ? 's' : ''} dans tes favoris</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {illus.map(illu => {
          const url = getVisuelPresentation(illu.visuels);
          return (
            <div key={illu.id} style={{ flexShrink: 0, width: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,62,181,0.25)', background: '#0a0a0a', position: 'relative' }}>
              {url ? <img src={url} alt={illu.nom} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100px', background: '#111' }} />}
              <div style={{ position: 'absolute', top: '3px', right: '3px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff3eb5" />
                </svg>
              </div>
              <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.85)' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
                {illu.prix && <p style={{ color: '#ff3eb5', fontSize: '8px' }}>{illu.prix} €</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SECTION MES INFOS ───────────────────────────────────────────────────────
function SectionMesInfos({ userId }) {
  const [profil, setProfil] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(null);

  React.useEffect(() => {
    supabase.from('profils').select('*').eq('id', userId).single()
      .then(({ data }) => { setProfil(data || {}); setLoading(false); });
  }, [userId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    let avatarUrl = profil.avatar_url;
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const nomFichier = `avatars/${userId}.${ext}`;
      await supabase.storage.from('avatars').upload(nomFichier, avatarFile, { upsert: true });
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(nomFichier);
      avatarUrl = urlData.publicUrl;
    }
    await supabase.from('profils').update({
      pseudo: profil.pseudo, prenom: profil.prenom, nom: profil.nom,
      telephone: profil.telephone, adresse: profil.adresse, complement: profil.complement,
      code_postal: profil.code_postal, ville: profil.ville, pays: profil.pays,
      avatar_url: avatarUrl,
    }).eq('id', userId);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;

  const champ = (label, key, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
      <input type={type} value={profil[key] || ''} onChange={e => setProfil(p => ({ ...p, [key]: e.target.value }))}
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,212,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <img src={avatarPreview || profil.avatar_url || `${R2}/site/Logo.png`} alt="avatar"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,212,212,0.4)' }} />
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px' }}>Photo de profil</p>
          <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {champ('Pseudo', 'pseudo')}
        {champ('Prénom', 'prenom')}
        {champ('Nom', 'nom')}
        {champ('Téléphone', 'telephone', 'tel')}
        {champ('Adresse', 'adresse')}
        {champ('Complément', 'complement')}
        {champ('Code postal', 'code_postal')}
        {champ('Ville', 'ville')}
        {champ('Pays', 'pays')}
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ background: saved ? 'rgba(0,212,212,0.3)' : 'linear-gradient(135deg, rgba(0,212,212,0.2), rgba(0,150,150,0.2))', border: `1px solid ${saved ? '#00d4d4' : 'rgba(0,212,212,0.4)'}`, borderRadius: '10px', padding: '10px 24px', color: saved ? '#00d4d4' : '#fff', fontSize: '13px', cursor: saving ? 'wait' : 'pointer', alignSelf: 'flex-start', transition: 'all .3s' }}>
        {saved ? '✓ Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}

// ─── SECTION MES COMMANDES ───────────────────────────────────────────────────
function SectionMesCommandes({ userId }) {
  const [commandes, setCommandes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [telechargement, setTelechargement] = React.useState({});

  React.useEffect(() => {
    supabase.from('commandes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { setCommandes(data || []); setLoading(false); });
  }, [userId]);

  const telechargerFichier = async (commande, type) => {
    const key = `${commande.id}_${type}`;
    setTelechargement(p => ({ ...p, [key]: true }));
    try {
      const cheminR2 = type === 'produit' ? commande.fichier_pdf : commande.facture_pdf;
      const response = await fetch('/api/download-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chemin: cheminR2, userId }),
      });
      const data = await response.json();
      if (data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = type === 'produit' ? `${commande.nom_produit}.pdf` : `Facture_${commande.id.slice(0, 8)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) { console.error(e); }
    setTelechargement(p => ({ ...p, [key]: false }));
  };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (commandes.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <p style={{ fontSize: '32px', marginBottom: '12px' }}>🛒</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Aucune commande pour l'instant.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {commandes.map(cmd => (
        <div key={cmd.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{cmd.nom_produit}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
              {new Date(cmd.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {cmd.prix ? ` · ${cmd.prix} €` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {cmd.fichier_pdf && (
              <button onClick={() => telechargerFichier(cmd, 'produit')} disabled={telechargement[`${cmd.id}_produit`]}
                style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.35)', borderRadius: '8px', padding: '7px 12px', color: '#00d4d4', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {telechargement[`${cmd.id}_produit`] ? '...' : '⬇ Télécharger'}
              </button>
            )}
            {cmd.facture_pdf && (
              <button onClick={() => telechargerFichier(cmd, 'facture')} disabled={telechargement[`${cmd.id}_facture`]}
                style={{ background: 'rgba(255,210,80,0.1)', border: '1px solid rgba(255,210,80,0.3)', borderRadius: '8px', padding: '7px 12px', color: 'rgba(255,210,80,0.8)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {telechargement[`${cmd.id}_facture`] ? '...' : '🧾 Facture'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SECTION MES COLORIAGES ───────────────────────────────────────────────────
function SectionMesColoriages({ userId, userPseudo }) {
  const [colos, setColos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [coloZoom, setColoZoom] = React.useState(null);
  const [commentaires, setCommentaires] = React.useState([]);
  const [likes, setLikes] = React.useState([]);
  const [texte, setTexte] = React.useState('');
  const [envoi, setEnvoi] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState(null);
  const [suppression, setSuppression] = React.useState(false);

  React.useEffect(() => {
    chargerColos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const chargerColos = async () => {
    const { data } = await supabase.from('coloriages')
      .select('id, illustration_id, image_url, date_coloriage, created_at')
      .eq('user_id', userId)
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) { setColos([]); setLoading(false); return; }

    // Charger les noms d'illustrations
    const illuIds = [...new Set(data.map(c => c.illustration_id))];
    const { data: illus } = await supabase.from('illustrations').select('id, nom, annee').in('id', illuIds);
    const illusMap = {};
    (illus || []).forEach(i => { illusMap[i.id] = i; });

    // Charger les nouveaux commentaires non vus
    const coloIds = data.map(c => c.id);
    const { data: newComments } = await supabase.from('commentaires_coloriages')
      .select('coloriage_id').in('coloriage_id', coloIds).eq('vu', false).neq('user_id', userId);
    const notifSet = new Set((newComments || []).map(c => c.coloriage_id));

    setColos(data.map(c => ({ ...c, illu: illusMap[c.illustration_id], hasNotif: notifSet.has(c.id) })));
    setLoading(false);
  };

  const ouvrirZoom = async (colo) => {
    setColoZoom(colo);
    // Marquer comme vu
    await supabase.from('commentaires_coloriages')
      .update({ vu: true }).eq('coloriage_id', colo.id).neq('user_id', userId);
    // Rafraîchir notif
    setColos(prev => prev.map(c => c.id === colo.id ? { ...c, hasNotif: false } : c));

    // Charger commentaires et likes
    const { data: comRaw } = await supabase.from('commentaires_coloriages')
      .select('id, texte, created_at, user_id').eq('coloriage_id', colo.id).order('created_at', { ascending: true });
    const { data: lks } = await supabase.from('likes_coloriages').select('user_id').eq('coloriage_id', colo.id);

    if (comRaw && comRaw.length > 0) {
      const uids = [...new Set(comRaw.map(c => c.user_id))];
      const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', uids);
      const pm = {};
      (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
      setCommentaires(comRaw.map(c => ({ ...c, pseudo: pm[c.user_id] || 'Anonyme' })));
    } else setCommentaires([]);
    setLikes(lks || []);
  };

  const envoyerCommentaire = async () => {
    if (!texte.trim() || !coloZoom) return;
    setEnvoi(true);
    const { data } = await supabase.from('commentaires_coloriages')
      .insert({ coloriage_id: coloZoom.id, user_id: userId, texte: texte.trim(), vu: true })
      .select('id, texte, created_at, user_id').single();
    if (data) setCommentaires(prev => [...prev, { ...data, pseudo: userPseudo }]);
    setTexte('');
    setEnvoi(false);
  };

  const supprimerColoriage = async (colo) => {
    setSuppression(true);
    try {
      // Supprimer sur R2
      const urlPath = colo.image_url.replace('https://images.kevinteoart.fr/', '');
      await fetch('/api/delete-colo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chemin: urlPath, userId }),
      });
      // Supprimer dans Supabase
      await supabase.from('coloriages').delete().eq('id', colo.id);
      setColos(prev => prev.filter(c => c.id !== colo.id));
      if (coloZoom?.id === colo.id) setColoZoom(null);
    } catch (e) { console.error(e); }
    setSuppression(false);
    setConfirmation(null);
  };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (colos.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Tu n'as pas encore partagé de coloriage.</p>
    </div>
  );

  return (
    <>
      {/* Zoom coloriage */}
      {coloZoom && (
        <div onClick={() => setColoZoom(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <img src={coloZoom.image_url} alt="" style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '10px 10px 0 0' }} />
            <div style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{coloZoom.illu?.nom}</p>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                  ❤️ {likes.length} · 💬 {commentaires.length}
                </span>
              </div>
              {commentaires.length > 0 && (
                <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {commentaires.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                      <span style={{ color: 'rgba(255,210,80,0.7)', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.pseudo}</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>{c.texte}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '6px' }}>
                <textarea value={texte} onChange={e => setTexte(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerCommentaire(); } }}
                  placeholder="Répondre…" rows={1}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '11px', resize: 'none', fontFamily: 'inherit' }} />
                <button onClick={envoyerCommentaire} disabled={!texte.trim() || envoi}
                  style={{ background: texte.trim() ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${texte.trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '6px 12px', color: texte.trim() ? '#00d4d4' : 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: texte.trim() ? 'pointer' : 'default' }}>
                  Envoyer
                </button>
              </div>
              <button onClick={() => setConfirmation(coloZoom)}
                style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,100,100,0.7)', fontSize: '11px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                🗑 Supprimer ce coloriage
              </button>
            </div>
          </div>
          <button onClick={() => setColoZoom(null)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Confirmation suppression */}
      {confirmation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '16px', padding: '28px 32px', maxWidth: '380px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>🗑</p>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>Supprimer ce coloriage ?</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '24px' }}>Cette action est irréversible. L'image sera supprimée définitivement.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmation(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                Annuler
              </button>
              <button onClick={() => supprimerColoriage(confirmation)} disabled={suppression}
                style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 20px', color: '#ff8080', cursor: 'pointer', fontSize: '13px', opacity: suppression ? 0.6 : 1 }}>
                {suppression ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {colos.map(colo => (
          <div key={colo.id} onClick={() => ouvrirZoom(colo)}
            style={{ position: 'relative', width: '120px', cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,210,80,0.2)', background: '#0a0a0a' }}>
            <img src={colo.image_url} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
            {colo.hasNotif && (
              <div style={{ position: 'absolute', top: '4px', right: '4px', background: '#ff3eb5', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>🔔</div>
            )}
            <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.85)' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{colo.illu?.nom}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px' }}>{colo.illu?.annee}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
function MonCompte() {
  const navigate = useNavigate();
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [onglet, setOnglet] = React.useState(null); // null = accueil Mon Compte
  const [showFavoris, setShowFavoris] = React.useState(false);

  // Stats pour la jauge globale
  const [stats, setStats] = React.useState({ totalIllus: 0, jAi: 0, colorie: 0, jeVeux: 0 });

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUserId(user.id);
      const { data: profil } = await supabase.from('profils').select('pseudo, avatar_url').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || 'Anonyme');
      setAvatarUrl(profil?.avatar_url);

      // Stats globales
      const { count: total } = await supabase.from('illustrations').select('id', { count: 'exact', head: true }).eq('statut', 'published');
      const { count: jAiCount } = await supabase.from('collection').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('j_ai', true);
      const { count: colorieCount } = await supabase.from('coloriages').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: jeVeuxCount } = await supabase.from('collection').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('je_veux', true);

      setStats({ totalIllus: total || 0, jAi: jAiCount || 0, colorie: colorieCount || 0, jeVeux: jeVeuxCount || 0 });
      setLoading(false);
    };
    charger();
  }, [navigate]);

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;

  const pctJai = stats.totalIllus > 0 ? (stats.jAi / stats.totalIllus) * 100 : 0;
  const pctColo = stats.totalIllus > 0 ? (stats.colorie / stats.totalIllus) * 100 : 0;
  const pctJeVeux = stats.totalIllus > 0 ? (stats.jeVeux / stats.totalIllus) * 100 : 0;

  const btnOnglet = (id, label, couleur, borderColor) => (
    <button onClick={() => { setOnglet(id); setShowFavoris(false); }}
      style={{ background: onglet === id ? `rgba(${couleur},0.15)` : 'rgba(255,255,255,0.04)', border: `1px solid ${onglet === id ? `rgba(${couleur},0.6)` : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: isMobile ? '10px 14px' : '12px 24px', color: onglet === id ? `rgb(${couleur})` : 'rgba(255,255,255,0.6)', fontSize: isMobile ? '12px' : '13px', cursor: 'pointer', fontWeight: onglet === id ? 'bold' : 'normal', transition: 'all .2s' }}>
      {label}
    </button>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        .dropdown-cat { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 100; min-width: 200px; }
        .dropdown-item { padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
      `}</style>

      <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, cursor: 'pointer', fontSize: '22px' }}>🔔</div>

      {/* BANNIÈRE */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* NAVIGATION */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
        <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/catalogue')} />
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => navigate('/livres')} />
            <div style={{ position: 'relative' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => setShowCategories(v => !v)} />
              {showCategories && (
                <div className="dropdown-cat">
                  <div className="dropdown-item" onClick={() => { navigate('/catalogue'); setShowCategories(false); }}>Toutes les catégories</div>
                  {CATEGORIES.map(cat => (
                    <div key={cat} className="dropdown-item" onClick={() => { navigate('/catalogue'); setShowCategories(false); }}>{cat}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <img src={`${R2}/site/Logo.png`} alt="logo" style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', zIndex: 10, flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => {}} />
            <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => {}} />
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }} onClick={() => navigate('/mon-compte')} />
          </div>
        </div>
      </div>

      {/* BARRES + CONTENU */}
      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {BARRES.map((barre, i) => (
              <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content', opacity: barre.opacite }}>
                  {[...barre.images, ...barre.images].map((img, j) => (
                    <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', display: 'block' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 200}px` }}>
          {loading ? <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p> : (
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* TITRE + AVATAR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {avatarUrl && <img src={avatarUrl} alt="avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,212,212,0.4)' }} />}
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Mon Compte</p>
                  <p style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold' }}>Ma Collection · {userPseudo}</p>
                </div>
              </div>

              {/* JAUGE GLOBALE */}
              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '16px', padding: '16px 20px' }}>
                <JaugeDouble pctJai={pctJai} pctColorie={pctColo} pctJeVeux={pctJeVeux} hauteur={14} showLabels={true} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '6px' }}>
                  {stats.jAi} / {stats.totalIllus} illustrations · {stats.colorie} coloriages · {stats.jeVeux} favoris
                </p>
              </div>

              {/* BOUTONS ONGLETS */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {btnOnglet('collection', '📚 Ma Collection', '0,212,212', 'rgba(0,212,212,0.6)')}
                <button onClick={() => { setShowFavoris(true); setOnglet(null); }}
                  style={{ background: showFavoris ? 'rgba(255,62,181,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showFavoris ? 'rgba(255,62,181,0.6)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: isMobile ? '10px 14px' : '12px 24px', color: showFavoris ? '#ff3eb5' : 'rgba(255,255,255,0.6)', fontSize: isMobile ? '12px' : '13px', cursor: 'pointer', fontWeight: showFavoris ? 'bold' : 'normal', transition: 'all .2s' }}>
                  ♡ Mes Favoris
                </button>
                {btnOnglet('coloriages', '🎨 Mes Coloriages', '255,210,80', 'rgba(255,210,80,0.6)')}
                {btnOnglet('infos', '👤 Mes Infos', '255,255,255', 'rgba(255,255,255,0.4)')}
                {btnOnglet('commandes', '🛒 Mes Commandes', '255,210,80', 'rgba(255,210,80,0.6)')}
              </div>

              {/* CONTENU ONGLET */}
              {onglet === 'collection' && (
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,212,0.15)', borderRadius: '16px', padding: '20px' }}>
                  <SectionMaCollection userId={userId} totalIllus={stats.totalIllus} />
                </div>
              )}
              {showFavoris && (
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,62,181,0.15)', borderRadius: '16px', padding: '20px' }}>
                  <SectionMesFavoris userId={userId} />
                </div>
              )}
              {onglet === 'coloriages' && (
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,80,0.15)', borderRadius: '16px', padding: '20px' }}>
                  <SectionMesColoriages userId={userId} userPseudo={userPseudo} />
                </div>
              )}
              {onglet === 'infos' && (
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px' }}>
                  <SectionMesInfos userId={userId} />
                </div>
              )}
              {onglet === 'commandes' && (
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,80,0.15)', borderRadius: '16px', padding: '20px' }}>
                  <SectionMesCommandes userId={userId} />
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* BANNIÈRE BAS */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
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

export default MonCompte;
