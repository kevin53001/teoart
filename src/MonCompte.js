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

// ─── POINT 1 : labels blancs, police plus grande ───────────────────────────
function UneBarre({ pct, couleur, label, delai = 0, hauteur = 8, showLabel = true }) {
  const [anim, setAnim] = React.useState(0);
  const [affiche, setAffiche] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setAnim(pct), 200 + delai);
    let start = null;
    const duree = 2200;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duree, 1);
      setAffiche(Math.round(prog * pct));
      if (prog < 1) requestAnimationFrame(step);
    };
    const t2 = setTimeout(() => requestAnimationFrame(step), 200 + delai);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pct, delai]);
  const barreHauteur = showLabel ? Math.max(hauteur, 26) : hauteur;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      {showLabel && (
        // POINT 1 : couleur blanc (#fff), fontSize 14px (au lieu de 11px et couleur variable)
        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', minWidth: '120px', flexShrink: 0 }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: `${barreHauteur}px`, background: 'rgba(255,255,255,0.06)', borderRadius: `${barreHauteur}px`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${anim}%`, backgroundImage: couleur, borderRadius: `${barreHauteur}px`, transition: `width 2.2s cubic-bezier(0.4,0,0.2,1) ${delai}ms`, minWidth: anim > 0 ? '40px' : '0' }} />
        {showLabel && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
            {/* POINT 1 : pourcentage en blanc, fontSize 13px */}
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.9)', zIndex: 2 }}>{affiche}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function JaugeDouble({ pctJai, pctColorie, pctJeVeux, hauteur = 8, showLabels = true, couleurBarre = null }) {
  const cJai = couleurBarre || "linear-gradient(90deg,#00d4d4,#00aaaa)";
  if (showLabels) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <UneBarre pct={pctJai}    couleur="linear-gradient(90deg,#00d4d4,#00aaaa)"   label="✓ J'ai"    delai={0}   hauteur={hauteur} showLabel={true} />
        <UneBarre pct={pctColorie} couleur="linear-gradient(90deg,#ffd250,#ffb428)"  label="🎨 Colorié" delai={200} hauteur={hauteur} showLabel={true} />
        <UneBarre pct={pctJeVeux} couleur="linear-gradient(90deg,#ff3eb5,#cc2090)"   label="♡ Je veux" delai={400} hauteur={hauteur} showLabel={true} />
      </div>
    );
  }
  // Sans labels : barres compactes sans jauge (utilisées dans Ma Collection)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
      <UneBarre pct={pctJai}    couleur={cJai} label="" delai={0} hauteur={Math.max(4, hauteur-2)} showLabel={false} />
      {pctColorie > 0 && <UneBarre pct={pctColorie} couleur="linear-gradient(90deg,#ffd250,#ffb428)" label="" delai={0} hauteur={Math.max(3, hauteur-3)} showLabel={false} />}
    </div>
  );
}

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

function SectionMaCollection({ userId, totalIllus }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [anneesOuvertes, setAnneesOuvertes] = React.useState({});
  const [recueilsOuverts, setRecueilsOuverts] = React.useState({});
  const [livresOuverts, setLivresOuverts] = React.useState({});

  const COULEURS_ARC = ['#ff3eb5','#ff6b35','#ffd250','#a8e063','#00d4d4','#4a9eff','#9b59b6'];
  const getCouleurAnnee = (idx) => COULEURS_ARC[idx % COULEURS_ARC.length];
  const EXCLUS = new Set(['recueil_recueil de noel_2026', 'livre_colormefree']);

  React.useEffect(() => {
    const charger = async () => {
      try {
        const { data: collIllus } = await supabase.from('collection').select('illustration_id').eq('user_id', userId).eq('j_ai', true);
        const { data: colos } = await supabase.from('coloriages').select('illustration_id').eq('user_id', userId);
        const colosSet = new Set((colos || []).map(c => c.illustration_id));
        const illuIds = new Set((collIllus || []).map(c => c.illustration_id));

        const { data: tousLivres } = await supabase.from('livres').select('id, nom, annee, visuel_presentation, recueils_ids').in('statut', ['published', 'dossier']);
        const { data: tousRecueils } = await supabase.from('recueils').select('id, nom, annee, visuel_presentation').eq('statut', 'published');
        const { data: toutesIllus } = await supabase.from('illustrations').select('id, nom, annee, visuels, livres_ids, recueils_ids').eq('statut', 'published').order('nom');

        const livresMap = {};
        (tousLivres || []).forEach(l => { livresMap[l.id] = l; });
        const recueilsMap = {};
        (tousRecueils || []).forEach(r => { recueilsMap[r.id] = r; });

        const totauxAnnee = {};
        const totauxLivre = {};
        const totauxRecueil = {};
        const parAnnee = {};
        const horsAnnees = {};
        const illusParAnnee = {};

        EXCLUS.forEach(eid => {
          if (recueilsMap[eid]) horsAnnees[eid] = { type: 'recueil', info: recueilsMap[eid], illuIds: new Set(), livres: {} };
          if (livresMap[eid]) horsAnnees[eid] = { type: 'livre', info: livresMap[eid], illuIds: new Set() };
        });

        (toutesIllus || []).forEach(illu => {
          const illuPossedee = illuIds.has(illu.id) ? { ...illu, aColorie: colosSet.has(illu.id) } : null;
          const ridsExclus = (illu.recueils_ids || []).filter(rid => EXCLUS.has(rid));
          const ridsNormaux = (illu.recueils_ids || []).filter(rid => !EXCLUS.has(rid));
          const lidsExclus = (illu.livres_ids || []).filter(lid => EXCLUS.has(lid));
          const lidsNormaux = (illu.livres_ids || []).filter(lid => !EXCLUS.has(lid));

          ridsExclus.forEach(rid => {
            if (!horsAnnees[rid]) return;
            horsAnnees[rid].illuIds.add(illu.id);
            (illu.livres_ids || []).forEach(lid => {
              if (!livresMap[lid]) return;
              if (livresMap[lid].recueils_ids && livresMap[lid].recueils_ids.includes(rid)) {
                if (!horsAnnees[rid].livres[lid]) horsAnnees[rid].livres[lid] = { info: livresMap[lid], illuIds: new Set() };
                horsAnnees[rid].livres[lid].illuIds.add(illu.id);
                if (illuPossedee) {
                  if (!horsAnnees[rid].livres[lid].illus) horsAnnees[rid].livres[lid].illus = [];
                  if (!horsAnnees[rid].livres[lid].illus.find(i => i.id === illu.id)) horsAnnees[rid].livres[lid].illus.push(illuPossedee);
                }
              }
            });
            if (illuPossedee) {
              if (!horsAnnees[rid].illus) horsAnnees[rid].illus = [];
              if (!horsAnnees[rid].illus.find(i => i.id === illu.id)) horsAnnees[rid].illus.push(illuPossedee);
            }
          });
          lidsExclus.forEach(lid => {
            if (!horsAnnees[lid]) return;
            horsAnnees[lid].illuIds.add(illu.id);
            if (illuPossedee) {
              if (!horsAnnees[lid].illus) horsAnnees[lid].illus = [];
              if (!horsAnnees[lid].illus.find(i => i.id === illu.id)) horsAnnees[lid].illus.push(illuPossedee);
            }
          });

          const toutExclu = ridsNormaux.length === 0 && lidsNormaux.length === 0 && (ridsExclus.length > 0 || lidsExclus.length > 0);
          if (toutExclu) {
            ridsExclus.forEach(rid => { totauxRecueil[rid] = (totauxRecueil[rid] || 0) + 1; });
            lidsExclus.forEach(lid => { totauxLivre[lid] = (totauxLivre[lid] || 0) + 1; });
            return;
          }

          ridsNormaux.forEach(rid => {
            if (!recueilsMap[rid]) return;
            const anneeRecueil = String(recueilsMap[rid].annee || illu.annee || 'Sans année');
            if (!parAnnee[anneeRecueil]) parAnnee[anneeRecueil] = { recueils: {}, horsSerieParent: {} };
            if (!illusParAnnee[anneeRecueil]) illusParAnnee[anneeRecueil] = new Set();
            if (!illusParAnnee[anneeRecueil].has(illu.id)) { illusParAnnee[anneeRecueil].add(illu.id); totauxAnnee[anneeRecueil] = (totauxAnnee[anneeRecueil] || 0) + 1; }
            totauxRecueil[rid] = (totauxRecueil[rid] || 0) + 1;
            if (!parAnnee[anneeRecueil].recueils[rid]) parAnnee[anneeRecueil].recueils[rid] = { info: recueilsMap[rid], livres: {}, illuIds: new Set() };
            parAnnee[anneeRecueil].recueils[rid].illuIds.add(illu.id);
            lidsNormaux.forEach(lid => {
              if (!livresMap[lid]) return;
              if (livresMap[lid].recueils_ids && livresMap[lid].recueils_ids.includes(rid)) {
                totauxLivre[lid] = (totauxLivre[lid] || 0) + 1;
                if (!parAnnee[anneeRecueil].recueils[rid].livres[lid]) parAnnee[anneeRecueil].recueils[rid].livres[lid] = { info: livresMap[lid], illus: [], illuIds: new Set() };
                if (!parAnnee[anneeRecueil].recueils[rid].livres[lid].illuIds.has(illu.id)) {
                  parAnnee[anneeRecueil].recueils[rid].livres[lid].illuIds.add(illu.id);
                  if (illuPossedee) parAnnee[anneeRecueil].recueils[rid].livres[lid].illus.push(illuPossedee);
                }
              }
            });
          });

          lidsNormaux.forEach(lid => {
            if (!livresMap[lid]) return;
            const ridsduLivre = (livresMap[lid].recueils_ids || []).filter(rid => ridsNormaux.includes(rid));
            if (ridsduLivre.length > 0) return;
            const anneeLivre = String(livresMap[lid].annee || illu.annee || 'Sans année');
            if (!parAnnee[anneeLivre]) parAnnee[anneeLivre] = { recueils: {}, horsSerieParent: {} };
            if (!illusParAnnee[anneeLivre]) illusParAnnee[anneeLivre] = new Set();
            if (!illusParAnnee[anneeLivre].has(illu.id)) { illusParAnnee[anneeLivre].add(illu.id); totauxAnnee[anneeLivre] = (totauxAnnee[anneeLivre] || 0) + 1; }
            totauxLivre[lid] = (totauxLivre[lid] || 0) + 1;
            if (!parAnnee[anneeLivre].horsSerieParent[lid]) parAnnee[anneeLivre].horsSerieParent[lid] = { info: livresMap[lid], illus: [], illuIds: new Set() };
            if (!parAnnee[anneeLivre].horsSerieParent[lid].illuIds.has(illu.id)) {
              parAnnee[anneeLivre].horsSerieParent[lid].illuIds.add(illu.id);
              if (illuPossedee) parAnnee[anneeLivre].horsSerieParent[lid].illus.push(illuPossedee);
            }
          });

          if (ridsNormaux.length === 0 && lidsNormaux.length === 0) {
            const annee = String(illu.annee || 'Sans année');
            if (!parAnnee[annee]) parAnnee[annee] = { recueils: {}, horsSerieParent: {} };
            if (!illusParAnnee[annee]) illusParAnnee[annee] = new Set();
            if (!illusParAnnee[annee].has(illu.id)) { illusParAnnee[annee].add(illu.id); totauxAnnee[annee] = (totauxAnnee[annee] || 0) + 1; }
          }
        });

        setData({ parAnnee, totauxAnnee, totauxLivre, totauxRecueil, horsAnnees });
      } catch(e) { console.error('SectionMaCollection error:', e); }
      setLoading(false);
    };
    charger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (!data) return null;

  const { parAnnee, totauxAnnee, totauxLivre, totauxRecueil, horsAnnees } = data;
  const anneesSorted = Object.keys(parAnnee).filter(a => totauxAnnee[a] > 0).sort((a, b) => b - a);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {anneesSorted.map((annee, anneeIdx) => {
        const anneeData = parAnnee[annee];
        const totalAnnee = totauxAnnee[annee] || 1;
        const jaiAnnee = Object.values(anneeData.recueils).reduce((acc, r) => acc + Object.values(r.livres).reduce((a, l) => a + l.illus.length, 0), 0)
          + Object.values(anneeData.horsSerieParent || {}).reduce((a, l) => a + l.illus.length, 0);
        const ouvert = anneesOuvertes[annee];
        const couleurAnnee = getCouleurAnnee(anneeIdx);

        return (
          <div key={annee} style={{ border: `1px solid rgba(0,212,212,0.2)`, borderRadius: '12px', overflow: 'hidden' }}>
            <div onClick={() => setAnneesOuvertes(p => ({ ...p, [annee]: !p[annee] }))}
              style={{ padding: '12px 16px', cursor: 'pointer', background: ouvert ? 'rgba(0,212,212,0.06)' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'rgba(255,210,80,0.9)', fontSize: '15px', fontWeight: 'bold', minWidth: '50px' }}>{annee}</span>
              {/* POINT 2 : plus de JaugeDouble ici — juste la barre de progression couleur année */}
              <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(jaiAnnee / totalAnnee) * 100}%`, background: `linear-gradient(90deg,${couleurAnnee},${couleurAnnee}aa)`, borderRadius: '6px', transition: 'width 1.2s ease' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', whiteSpace: 'nowrap' }}>{jaiAnnee}/{totalAnnee}</span>
              <span style={{ color: ouvert ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.3)', fontSize: '16px', transition: 'transform .2s', transform: ouvert ? 'rotate(90deg)' : 'none' }}>›</span>
            </div>

            {ouvert && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.values(anneeData.recueils).map((recueilData) => {
                  const rid = recueilData.info.id;
                  const totalR = totauxRecueil[rid] || 1;
                  const jaiR = Object.values(recueilData.livres).reduce((a, l) => a + l.illus.length, 0);
                  const ouvertR = recueilsOuverts[rid];
                  return (
                    <div key={rid} style={{ border: '1px solid rgba(0,212,212,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div onClick={() => setRecueilsOuverts(p => ({ ...p, [rid]: !p[rid] }))}
                        style={{ padding: '10px 14px', cursor: 'pointer', background: ouvertR ? 'rgba(0,212,212,0.04)' : 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {recueilData.info.visuel_presentation
                          ? <img src={cheminVersUrl(recueilData.info.visuel_presentation)} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                          : <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#111', flexShrink: 0 }} />}
                        {/* POINT 2 : pas de JaugeDouble sur recueil — nom + compteur uniquement */}
                        <p style={{ flex: 1, color: 'rgba(255,210,80,0.8)', fontSize: '12px', fontWeight: 'bold' }}>{recueilData.info.nom}</p>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiR}/{totalR}</span>
                        <span style={{ color: ouvertR ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.3)', fontSize: '16px', transition: 'transform .2s', transform: ouvertR ? 'rotate(90deg)' : 'none' }}>›</span>
                      </div>
                      {ouvertR && (
                        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.values(recueilData.livres).map((livreData, lIdx) => {
                            const lid = livreData.info.id;
                            const totalL = totauxLivre[lid] || 1;
                            const jaiL = livreData.illus.length;
                            const ouvertL = livresOuverts[lid];
                            const estDossier = !livreData.info.visuel_presentation;
                            const couleurL = getCouleurAnnee(lIdx);
                            return (
                              <div key={lid} style={{ border: `1px solid ${estDossier ? 'rgba(255,210,80,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', overflow: 'hidden' }}>
                                <div onClick={() => setLivresOuverts(p => ({ ...p, [lid]: !p[lid] }))}
                                  style={{ padding: '8px 12px', cursor: 'pointer', background: ouvertL ? 'rgba(255,255,255,0.03)' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {estDossier ? <span style={{ fontSize: '16px' }}>📁</span>
                                    : <img src={cheminVersUrl(livreData.info.visuel_presentation)} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />}
                                  {/* POINT 2 : pas de JaugeDouble sur livre — nom + compteur uniquement */}
                                  <p style={{ flex: 1, color: estDossier ? 'rgba(255,210,80,0.8)' : 'rgba(255,255,255,0.85)', fontSize: '11px' }}>{livreData.info.nom}</p>
                                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiL}/{totalL}</span>
                                  <span style={{ color: ouvertL ? couleurL : 'rgba(255,255,255,0.3)', fontSize: '14px', transition: 'transform .2s', transform: ouvertL ? 'rotate(90deg)' : 'none' }}>›</span>
                                </div>
                                {ouvertL && jaiL > 0 && (
                                  <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {livreData.illus.map(illu => <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />)}
                                  </div>
                                )}
                                {ouvertL && jaiL === 0 && (
                                  <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)' }}>
                                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center' }}>Aucune illustration possédée</p>
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

                {Object.values(anneeData.horsSerieParent || {}).filter(l => totauxLivre[l.info.id] > 0).map((livreData, lIdx) => {
                  const lid = livreData.info.id;
                  const totalL = totauxLivre[lid] || 1;
                  const jaiL = livreData.illus.length;
                  const ouvertL = livresOuverts[`hs_${lid}`];
                  const estDossier = !livreData.info.visuel_presentation;
                  return (
                    <div key={`hs_${lid}`} style={{ border: `1px solid ${estDossier ? 'rgba(255,210,80,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', overflow: 'hidden' }}>
                      <div onClick={() => setLivresOuverts(p => ({ ...p, [`hs_${lid}`]: !p[`hs_${lid}`] }))}
                        style={{ padding: '8px 12px', cursor: 'pointer', background: ouvertL ? 'rgba(255,255,255,0.03)' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {estDossier ? <span style={{ fontSize: '16px' }}>📁</span>
                          : <img src={cheminVersUrl(livreData.info.visuel_presentation)} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />}
                        {/* POINT 2 : pas de JaugeDouble sur livre hors-série — nom + compteur */}
                        <p style={{ flex: 1, color: estDossier ? 'rgba(255,210,80,0.8)' : 'rgba(255,255,255,0.8)', fontSize: '11px' }}>{livreData.info.nom}</p>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiL}/{totalL}</span>
                        <span style={{ color: ouvertL ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '14px', transition: 'transform .2s', transform: ouvertL ? 'rotate(90deg)' : 'none' }}>›</span>
                      </div>
                      {ouvertL && jaiL > 0 && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {livreData.illus.map(illu => <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />)}
                        </div>
                      )}
                      {ouvertL && jaiL === 0 && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)' }}>
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center' }}>Aucune illustration possédée</p>
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

      {horsAnnees && Object.values(horsAnnees).map((entree) => {
        const eid = entree.info.id;
        const totalE = totauxRecueil[eid] || totauxLivre[eid] || 1;
        const jaiE = entree.illus ? entree.illus.length : 0;
        const ouvert = anneesOuvertes[`ha_${eid}`];
        return (
          <div key={`ha_${eid}`} style={{ border: `1px solid rgba(255,210,80,0.25)`, borderRadius: '12px', overflow: 'hidden' }}>
            <div onClick={() => setAnneesOuvertes(p => ({ ...p, [`ha_${eid}`]: !p[`ha_${eid}`] }))}
              style={{ padding: '12px 16px', cursor: 'pointer', background: ouvert ? 'rgba(255,210,80,0.06)' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {entree.info.visuel_presentation
                ? <img src={cheminVersUrl(entree.info.visuel_presentation)} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                : <span style={{ fontSize: '20px' }}>📁</span>}
              {/* POINT 2 : pas de JaugeDouble sur hors-années — nom + compteur */}
              <span style={{ flex: 1, color: 'rgba(255,210,80,0.9)', fontSize: '14px', fontWeight: 'bold' }}>{entree.info.nom}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', whiteSpace: 'nowrap' }}>{jaiE}/{totalE}</span>
              <span style={{ color: ouvert ? 'rgba(255,210,80,0.9)' : 'rgba(255,255,255,0.3)', fontSize: '16px', transition: 'transform .2s', transform: ouvert ? 'rotate(90deg)' : 'none' }}>›</span>
            </div>
            {ouvert && entree.type === 'recueil' && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.values(entree.livres || {}).map((livreData) => {
                  const lid = livreData.info.id;
                  const totalL = totauxLivre[lid] || 1;
                  const jaiL = livreData.illus ? livreData.illus.length : 0;
                  const ouvertL = livresOuverts[`ha_${lid}`];
                  const estDossier = !livreData.info.visuel_presentation;
                  return (
                    <div key={lid} style={{ border: `1px solid ${estDossier ? 'rgba(255,210,80,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', overflow: 'hidden' }}>
                      <div onClick={() => setLivresOuverts(p => ({ ...p, [`ha_${lid}`]: !p[`ha_${lid}`] }))}
                        style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {estDossier ? <span style={{ fontSize: '16px' }}>📁</span>
                          : <img src={cheminVersUrl(livreData.info.visuel_presentation)} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />}
                        <p style={{ flex: 1, color: estDossier ? 'rgba(255,210,80,0.8)' : 'rgba(255,255,255,0.8)', fontSize: '11px' }}>{livreData.info.nom}</p>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', whiteSpace: 'nowrap' }}>{jaiL}/{totalL}</span>
                        <span style={{ color: ouvertL ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '14px', transition: 'transform .2s', transform: ouvertL ? 'rotate(90deg)' : 'none' }}>›</span>
                      </div>
                      {ouvertL && jaiL > 0 && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {livreData.illus.map(illu => <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />)}
                        </div>
                      )}
                      {ouvertL && jaiL === 0 && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)' }}>
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center' }}>Aucune illustration possédée</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {ouvert && entree.type === 'livre' && entree.illus && (
              <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {entree.illus.map(illu => <VignetteIlluLecture key={illu.id} illu={illu} taille={85} aColorie={illu.aColorie} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers copiés depuis Catalogue.js (nécessaires pour PopupFiche) ────────
function extraireColoriste(chemin) {
  if (!chemin) return null;
  const nomFichier = chemin.split('\\').pop().split('/').pop();
  const match = nomFichier.match(/\s*-\s*C\d*\s*-\s*(.+)\.\w+$/i);
  if (match) return match[1].trim();
  return null;
}
function estVisuelCChemin(chemin) {
  if (!chemin) return false;
  const nomFichier = chemin.split('\\').pop().split('/').pop();
  return /\s*-\s*C\d*\s*[-.]/.test(nomFichier);
}
function getVisuelsOrdonnes(visuels) {
  if (!visuels) return [];
  const result = []; const valeursAjoutees = new Set();
  Object.entries(visuels).forEach(([k, v]) => {
    if (k.toUpperCase() === 'A') return;
    if ((k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation')) && v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); }
  });
  ['B', 'b'].forEach(k => { if (visuels[k] && !valeursAjoutees.has(visuels[k])) { result.push(visuels[k]); valeursAjoutees.add(visuels[k]); } });
  Object.entries(visuels).forEach(([k, v]) => { if (k.toUpperCase() === 'A') return; if (/^C\d*$/i.test(k) && v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); } });
  Object.entries(visuels).forEach(([k, v]) => { if (k.toUpperCase() === 'A') return; if (v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); } });
  return result;
}

// ─── ZoomSocial (likes + commentaires sur un coloriage zoomé) ────────────────
function ZoomSocial({ coloriage, userId, userPseudo }) {
  const [likes, setLikes] = React.useState([]);
  const [commentaires, setCommentaires] = React.useState([]);
  const [texte, setTexte] = React.useState('');
  const [envoi, setEnvoi] = React.useState(false);
  const coloId = coloriage?.id;
  const jaLike = likes.some(l => l.user_id === userId);

  React.useEffect(() => {
    if (!coloId) return;
    const charger = async () => {
      const { data: l } = await supabase.from('likes_coloriages').select('user_id').eq('coloriage_id', coloId);
      const { data: commentsRaw } = await supabase.from('commentaires_coloriages').select('id, texte, created_at, user_id').eq('coloriage_id', coloId).order('created_at', { ascending: true });
      setLikes(l || []);
      if (commentsRaw && commentsRaw.length > 0) {
        const uids = [...new Set(commentsRaw.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', uids);
        const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
        setCommentaires(commentsRaw.map(c => ({ ...c, pseudo: pm[c.user_id] || 'Anonyme' })));
      } else setCommentaires([]);
    };
    charger();
  }, [coloId]);

  const toggleLike = async () => {
    if (!coloId || !userId) return;
    if (jaLike) { await supabase.from('likes_coloriages').delete().eq('coloriage_id', coloId).eq('user_id', userId); setLikes(prev => prev.filter(l => l.user_id !== userId)); }
    else { await supabase.from('likes_coloriages').insert({ coloriage_id: coloId, user_id: userId }); setLikes(prev => [...prev, { user_id: userId }]); }
  };

  const envoyerCommentaire = async () => {
    if (!texte.trim() || !coloId || !userId) return;
    setEnvoi(true);
    const { data } = await supabase.from('commentaires_coloriages').insert({ coloriage_id: coloId, user_id: userId, texte: texte.trim() }).select('id, texte, created_at, user_id').single();
    if (data) setCommentaires(prev => [...prev, { ...data, pseudo: userPseudo }]);
    setTexte(''); setEnvoi(false);
  };

  if (!coloriage) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 14px', background: 'rgba(0,0,0,0.7)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={toggleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: jaLike ? '#ff4d7d' : 'rgba(255,255,255,0.5)', fontSize: '12px', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            {jaLike ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" /> : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />}
          </svg>
          <span>{likes.length > 0 ? likes.length : ''} {jaLike ? "J'aime ✓" : "J'aime"}</span>
        </button>
        {coloriage.pseudo && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>🎨 par <span style={{ color: 'rgba(255,210,80,0.7)' }}>{coloriage.pseudo}</span></span>}
      </div>
      {commentaires.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
          {commentaires.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '3px' }}>
              <span style={{ color: 'rgba(255,210,80,0.7)', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.pseudo}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>{c.texte}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px' }}>
        <textarea rows={1} placeholder="Ajouter un commentaire…" value={texte} onChange={e => setTexte(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerCommentaire(); } }}
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '11px', resize: 'none', fontFamily: 'inherit' }} />
        <button onClick={envoyerCommentaire} disabled={!texte.trim() || envoi}
          style={{ background: texte.trim() ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${texte.trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '5px 10px', color: texte.trim() ? '#00d4d4' : 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: texte.trim() ? 'pointer' : 'default' }}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

// ─── PopupFiche (identique à Catalogue.js) ───────────────────────────────────
function PopupFiche({ illu, illustrations, jAi, jeVeux, aColorié, onToggleJAi, onToggleJeVeux, onClose, onOpenSimilaire, onSuivant, onPrecedent, userPseudo, userId, onColoUploaded }) {
  const visuelsChemins = getVisuelsOrdonnes(illu.visuels);
  const visuels = visuelsChemins.map(v => cheminVersUrl(v)).filter(Boolean);
  const [colosPropres, setColosPropres] = React.useState([]);
  const [visuelActif, setVisuelActif] = React.useState(0);
  const totalVisuels = visuels.length + colosPropres.length;
  const [zoomIndex, setZoomIndex] = React.useState(null);
  const [showPartagerColo, setShowPartagerColo] = React.useState(false);
  const [coloImage, setColoImage] = React.useState(null);
  const [coloDate, setColoDate] = React.useState('');
  const [coloEnvoi, setColoEnvoi] = React.useState(false);
  const [coloOk, setColoOk] = React.useState(false);
  const [livresIllu, setLivresIllu] = React.useState([]);

  React.useEffect(() => {
    setVisuelActif(0); setShowPartagerColo(false); setColoOk(false); setZoomIndex(null); setLivresIllu([]); setColosPropres([]);
    const charger = async () => {
      const resultats = [];
      if (illu.livres_ids && illu.livres_ids.length > 0) {
        const { data: livres } = await supabase.from('livres').select('id, nom, visuel_presentation, slug').in('id', illu.livres_ids).not('visuel_presentation', 'is', null);
        (livres || []).forEach(l => resultats.push({ ...l, type: 'livre' }));
      }
      if (illu.recueils_ids && illu.recueils_ids.length > 0) {
        const { data: recueils } = await supabase.from('recueils').select('id, nom, visuel_presentation, slug').in('id', illu.recueils_ids);
        const idsDejaAjoutes = new Set(resultats.map(r => r.id));
        (recueils || []).forEach(r => { if (!idsDejaAjoutes.has(r.id)) resultats.push({ ...r, type: 'recueil' }); });
      }
      setLivresIllu(resultats);
      const { data: colos } = await supabase.from('coloriages').select('id, image_url, user_id').eq('illustration_id', illu.id).not('image_url', 'is', null).order('created_at', { ascending: true });
      if (colos && colos.length > 0) {
        const uids = colos.map(c => c.user_id);
        const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', uids);
        const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
        setColosPropres(colos.map(c => ({ id: c.id, image_url: c.image_url, user_id: c.user_id, pseudo: pm[c.user_id] || 'Anonyme' })));
      } else setColosPropres([]);
    };
    charger();
  }, [illu.id, illu.livres_ids, illu.recueils_ids]);

  const getUrlVisuelActif = (index) => { if (index < visuels.length) return visuels[index]; return colosPropres[index - visuels.length]?.image_url || null; };
  const getColoActif = (index) => { if (index < visuels.length) return null; return colosPropres[index - visuels.length] || null; };
  const urlZoom = zoomIndex !== null ? getUrlVisuelActif(zoomIndex) : null;
  const coloZoom = zoomIndex !== null ? getColoActif(zoomIndex) : null;
  const zoomSuivant = (e) => { e.stopPropagation(); setZoomIndex(i => (i + 1) % totalVisuels); };
  const zoomPrecedent = (e) => { e.stopPropagation(); setZoomIndex(i => (i - 1 + totalVisuels) % totalVisuels); };
  const cheminActif = visuelsChemins[visuelActif];
  const coloriste = estVisuelCChemin(cheminActif) ? extraireColoriste(cheminActif) : null;

  const similaires = React.useMemo(() => {
    if (!illu.tags || illu.tags.length === 0) return [];
    return illustrations.filter(i => i.id !== illu.id && i.tags && i.tags.some(t => illu.tags.includes(t)))
      .sort((a, b) => b.tags.filter(t => illu.tags.includes(t)).length - a.tags.filter(t => illu.tags.includes(t)).length)
      .slice(0, 20);
  }, [illu, illustrations]);

  const formatDescription = (desc) => {
    if (!desc) return null;
    return desc.split('\n').map((line, i, arr) => (<React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>));
  };

  const handlePartagerColo = async (avecImage = false) => {
    setColoEnvoi(true);
    try {
      let imageUrl = null;
      if (avecImage && coloImage) {
        const ext = coloImage.name.split('.').pop();
        const nomFichier = `${userId}_${illu.id}_${Date.now()}.${ext}`;
        const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(coloImage); });
        const response = await fetch('/api/upload-colo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: nomFichier, fileType: coloImage.type, fileBase64: base64 }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        imageUrl = data.url;
      }
      await supabase.from('coloriages').upsert({ user_id: userId, illustration_id: illu.id, image_url: imageUrl, date_coloriage: coloDate || null });
      setColoOk(true);
      if (onColoUploaded) onColoUploaded();
      const { data: colosRefresh } = await supabase.from('coloriages').select('id, image_url, user_id').eq('illustration_id', illu.id).not('image_url', 'is', null).order('created_at', { ascending: true });
      if (colosRefresh && colosRefresh.length > 0) {
        const uids = [...new Set(colosRefresh.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', uids);
        const pm = {}; (profils || []).forEach(p => { pm[p.id] = p.pseudo; });
        setColosPropres(colosRefresh.map(c => ({ id: c.id, image_url: c.image_url, user_id: c.user_id, pseudo: pm[c.user_id] || 'Anonyme' })));
      }
    } catch (e) { console.error(e); }
    setColoEnvoi(false);
  };

  return (
    <>
      {zoomIndex !== null && (
        <div onClick={() => setZoomIndex(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} onClick={e => e.stopPropagation()}>
            {urlZoom && <img src={urlZoom} alt="" style={{ maxWidth: '88vw', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px' }} />}
          </div>
          {coloZoom && <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px' }}><ZoomSocial coloriage={coloZoom} userId={userId} userPseudo={userPseudo} /></div>}
          <button onClick={() => setZoomIndex(null)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', zIndex: 10 }}>✕</button>
          {totalVisuels > 1 && <>
            <button onClick={zoomPrecedent} style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>‹</button>
            <button onClick={zoomSuivant} style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>›</button>
            <p style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{zoomIndex + 1} / {totalVisuels}{coloZoom ? ' 🎨' : ''}</p>
          </>}
        </div>
      )}

      {onSuivant && <div onClick={(e) => { e.stopPropagation(); onSuivant(); }} style={{ position: 'fixed', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '20px', zIndex: 300 }}>‹</div>}
      {onPrecedent && <div onClick={(e) => { e.stopPropagation(); onPrecedent(); }} style={{ position: 'fixed', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '20px', zIndex: 300 }}>›</div>}

      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 20px' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', maxWidth: '820px', width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer', zIndex: 10 }}>✕</button>
          <div style={{ padding: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Visuels */}
            <div style={{ flex: '0 0 220px' }}>
              <div style={{ position: 'relative' }}>
                {getUrlVisuelActif(visuelActif) && (
                  <img src={getUrlVisuelActif(visuelActif)} alt={illu.nom} onClick={() => setZoomIndex(visuelActif)}
                    style={{ width: '100%', borderRadius: '10px', display: 'block', marginBottom: '8px', cursor: 'zoom-in' }} />
                )}
                {visuelActif < visuels.length && coloriste && (
                  <div style={{ position: 'absolute', bottom: '12px', right: '6px', background: 'rgba(0,0,0,0.72)', borderRadius: '4px', padding: '2px 7px', fontSize: '9px', color: 'rgba(255,255,255,0.75)' }}>Réalisé par {coloriste}</div>
                )}
                {visuelActif >= visuels.length && getColoActif(visuelActif) && (
                  <div style={{ position: 'absolute', bottom: '12px', right: '6px', background: 'rgba(0,0,0,0.72)', borderRadius: '4px', padding: '2px 7px', fontSize: '9px', color: 'rgba(255,210,80,0.9)' }}>🎨 {getColoActif(visuelActif).pseudo}</div>
                )}
              </div>
              {totalVisuels > 1 && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {visuels.map((url, i) => (
                    <img key={`v-${i}`} src={url} alt="" onClick={() => setVisuelActif(i)}
                      style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', border: `2px solid ${i === visuelActif ? '#00d4d4' : 'transparent'}`, opacity: i === visuelActif ? 1 : 0.4 }} />
                  ))}
                  {colosPropres.map((colo, i) => {
                    const idxGlobal = visuels.length + i;
                    return (
                      <div key={`colo-${i}`} onClick={() => setVisuelActif(idxGlobal)} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={colo.image_url} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', border: `2px solid ${idxGlobal === visuelActif ? 'rgba(255,210,80,0.8)' : 'transparent'}`, opacity: idxGlobal === visuelActif ? 1 : 0.45, display: 'block' }} />
                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'rgba(255,210,80,0.9)', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>🎨</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Infos */}
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold' }}>{illu.nom}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{illu.categorie} · {illu.annee}</p>
              {illu.prix && <p style={{ color: '#00d4d4', fontSize: '15px', fontWeight: 'bold' }}>{illu.prix} €</p>}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button onClick={onToggleJAi} style={{ background: jAi ? '#00d4d4' : 'rgba(255,255,255,0.07)', border: jAi ? 'none' : '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 10px', color: jAi ? '#000' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                  {jAi ? "✓ J'ai" : "✕ J'ai"}
                </button>
                <button onClick={onToggleJeVeux} style={{ background: jeVeux ? 'rgba(255,77,125,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${jeVeux ? 'rgba(255,77,125,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" width="11" height="11">
                    {jeVeux ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" /> : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />}
                  </svg>
                  Je veux
                </button>
                <button onClick={() => setShowPartagerColo(v => !v)}
                  style={{ background: aColorié ? 'rgba(255,210,80,0.15)' : showPartagerColo ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${aColorié ? 'rgba(255,210,80,0.5)' : showPartagerColo ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 10px', color: aColorié ? 'rgba(255,210,80,0.9)' : showPartagerColo ? '#00d4d4' : 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer' }}>
                  🎨 {aColorié ? 'Colorié ✓' : 'Mon colo'}
                </button>
                <button style={{ background: '#ff3eb5', border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#000', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.4" fill="#000" /><circle cx="19" cy="21" r="1.4" fill="#000" /><path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" /></svg>
                  Panier
                </button>
              </div>
              {showPartagerColo && (
                <div style={{ background: 'rgba(0,212,212,0.05)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {coloOk ? <p style={{ color: '#00d4d4', fontSize: '12px', textAlign: 'center' }}>🎉 Coloriage partagé ! Merci {userPseudo} !</p> : (
                    <>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Sous le pseudo : <strong style={{ color: '#00d4d4' }}>{userPseudo}</strong></p>
                      <input type="file" accept="image/*" onChange={e => setColoImage(e.target.files[0])} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer' }} />
                      <input type="date" value={coloDate} onChange={e => setColoDate(e.target.value)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '5px 8px', color: '#fff', fontSize: '11px' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handlePartagerColo(false)} disabled={coloEnvoi} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '7px', color: '#fff', fontSize: '10px', cursor: 'pointer', opacity: coloEnvoi ? 0.6 : 1 }}>✓ Sans image</button>
                        <button onClick={() => handlePartagerColo(true)} disabled={!coloImage || coloEnvoi} style={{ flex: 1, background: coloImage ? 'linear-gradient(135deg,#00d4d4,#0099aa)' : 'rgba(255,255,255,0.04)', border: `1px solid ${coloImage ? 'transparent' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '7px', color: coloImage ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '10px', cursor: coloImage ? 'pointer' : 'not-allowed', opacity: coloEnvoi ? 0.6 : 1 }}>🎨 Avec image</button>
                        <button onClick={() => setShowPartagerColo(false)} style={{ background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '6px', padding: '7px 10px', color: 'rgba(255,100,100,0.7)', fontSize: '10px', cursor: 'pointer' }}>Annuler</button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {illu.description && (
                <div style={{ maxHeight: '160px', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', lineHeight: '1.7' }}>{formatDescription(illu.description)}</p>
                </div>
              )}
              {livresIllu.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Dans :</span>
                  {livresIllu.map(l => (
                    <span key={l.id} style={{ background: 'rgba(0,212,212,0.08)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '6px', padding: '2px 8px', color: '#00d4d4', fontSize: '10px' }}>📚 {l.nom}</span>
                  ))}
                </div>
              )}
              {illu.tags && illu.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {illu.tags.map((tag, i) => <span key={i} style={{ background: 'rgba(0,212,212,0.07)', border: '1px solid rgba(0,212,212,0.12)', borderRadius: '10px', padding: '1px 6px', color: 'rgba(0,212,212,0.6)', fontSize: '9px' }}>{tag}</span>)}
                </div>
              )}
            </div>
          </div>
          {similaires.length > 0 && (
            <div style={{ padding: '0 24px 20px' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Illustrations similaires</p>
              <div style={{ overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '30px', height: '100%', background: 'linear-gradient(to right, #111, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '30px', height: '100%', background: 'linear-gradient(to left, #111, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ animation: 'scrollSim 45s linear infinite', display: 'flex', gap: '8px', width: 'max-content' }}
                  onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
                  onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}>
                  {[...similaires, ...similaires].map((sim, idx) => {
                    const url = getVisuelPresentation(sim.visuels);
                    return (
                      <div key={idx} onClick={() => onOpenSimilaire(sim)}
                        style={{ flexShrink: 0, width: '160px', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,212,0.35)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                        {url ? <img src={url} alt={sim.nom} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.02)' }} />}
                        <div style={{ padding: '4px 7px' }}><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sim.nom}</p></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Mes Favoris avec popup complète ─────────────────────────────────────────
function SectionMesFavoris({ userId, userPseudo, onOuvrirPopup }) {
  const [illus, setIllus] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [collection, setCollection] = React.useState({});
  const [coloriages, setColoriages] = React.useState({});

  React.useEffect(() => {
    const charger = async () => {
      const { data: coll } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto').eq('user_id', userId).eq('je_veux', true);
      if (!coll || coll.length === 0) { setLoading(false); return; }
      const ids = coll.map(c => c.illustration_id);
      const { data: illusData } = await supabase.from('illustrations').select('id, nom, annee, categorie, visuels, prix, description, tags, livres_ids, recueils_ids').in('id', ids).order('nom');
      // charger aussi tout le reste de la collection pour j_ai / colorie
      const { data: collTout } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto').eq('user_id', userId);
      const { data: colosTout } = await supabase.from('coloriages').select('illustration_id').eq('user_id', userId);
      const collMap = {};
      (collTout || []).forEach(c => { collMap[c.illustration_id] = { j_ai: c.j_ai, je_veux: c.je_veux, j_ai_auto: c.j_ai_auto || false }; });
      const coloMap = {};
      (colosTout || []).forEach(c => { coloMap[c.illustration_id] = true; });
      setIllus(illusData || []);
      setCollection(collMap);
      setColoriages(coloMap);
      setLoading(false);
    };
    charger();
  }, [userId]);



  const ouvrirPopup = (illu, index) => { if (onOuvrirPopup) onOuvrirPopup(illu, index, illus); };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;
  if (illus.length === 0) return <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Aucun favori pour l'instant.</p>;

  return (
    <>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '14px' }}>{illus.length} illustration{illus.length > 1 ? 's' : ''} dans tes favoris</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {illus.map((illu, idx) => {
          const url = getVisuelPresentation(illu.visuels);
          return (
            <div key={illu.id} onClick={() => ouvrirPopup(illu, idx)}
              style={{ flexShrink: 0, width: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,62,181,0.25)', background: '#0a0a0a', position: 'relative', cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,62,181,0.6)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,62,181,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}>
              {url ? <img src={url} alt={illu.nom} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100px', background: '#111' }} />}
              <div style={{ position: 'absolute', top: '3px', right: '3px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff3eb5" /></svg>
              </div>
              <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.85)' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
                {illu.prix && <p style={{ color: '#ff3eb5', fontSize: '8px' }}>{illu.prix} €</p>}
              </div>
            </div>
          );
        })}
      </div>

    </>
  );
}

// ─── Composant cadrage avatar (crop circulaire par drag) ────────────────────
function AvatarCrop({ src, onConfirm, onCancel }) {
  const canvasRef = React.useRef(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [scale, setScale] = React.useState(1);
  const [dragging, setDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState(null);
  const imgRef = React.useRef(null);
  const SIZE = 280; // taille du canvas carré

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // centrer l'image au départ
      const sc = Math.max(SIZE / img.width, SIZE / img.height);
      setScale(sc);
      setOffset({ x: (SIZE - img.width * sc) / 2, y: (SIZE - img.height * sc) / 2 });
    };
    img.src = src;
  }, [src]);

  React.useEffect(() => { dessiner(); }, [offset, scale]); // eslint-disable-line

  const dessiner = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    // fond sombre
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // image
    ctx.drawImage(img, offset.x, offset.y, img.width * scale, img.height * scale);
    // masque : tout assombrir sauf le cercle
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // cercle guide
    ctx.strokeStyle = '#00d4d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
  };

  const onMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMouseMove = (e) => { if (!dragging || !dragStart) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp = () => setDragging(false);
  const onWheel = (e) => { e.preventDefault(); setScale(s => Math.max(0.2, Math.min(5, s - e.deltaY * 0.001))); };

  // touch support
  const lastTouch = React.useRef(null);
  const onTouchStart = (e) => { const t = e.touches[0]; setDragging(true); setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y }); lastTouch.current = t; };
  const onTouchMove = (e) => { if (!dragging || !dragStart) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }); };
  const onTouchEnd = () => setDragging(false);

  const confirmer = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    if (!img) return;
    // recalculer le ratio canvas affichage → export 400px
    const ratio = 400 / SIZE;
    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, offset.x * ratio, offset.y * ratio, img.width * scale * ratio, img.height * scale * ratio);
    canvas.toBlob(blob => { onConfirm(blob); }, 'image/jpeg', 0.92);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Cadre ta photo de profil</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Glisse pour repositionner · Molette pour zoomer</p>
      <canvas
        ref={canvasRef}
        width={SIZE} height={SIZE}
        style={{ borderRadius: '50%', cursor: dragging ? 'grabbing' : 'grab', border: '3px solid rgba(0,212,212,0.5)', touchAction: 'none' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      />
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '10px 24px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Annuler</button>
        <button onClick={confirmer} style={{ background: 'rgba(0,212,212,0.2)', border: '1px solid rgba(0,212,212,0.5)', borderRadius: '10px', padding: '10px 24px', color: '#00d4d4', fontSize: '13px', cursor: 'pointer' }}>✓ Valider ce cadrage</button>
      </div>
    </div>
  );
}

// ─── POINT 4 : Mes Infos — refonte 2 colonnes ──────────────────────────────
function SectionMesInfos({ userId }) {
  const [profil, setProfil] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(null);
  const [showCrop, setShowCrop] = React.useState(false);
  const [cropSrc, setCropSrc] = React.useState(null);

  // POINT 5 : états pour la réinitialisation du mot de passe
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetEnvoye, setResetEnvoye] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetErreur, setResetErreur] = React.useState('');

  React.useEffect(() => {
    supabase.from('profils').select('*').eq('id', userId).single().then(({ data }) => {
      setProfil(data || {});
      setResetEmail(data?.email || '');
      setLoading(false);
    });
  }, [userId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setShowCrop(true);
  };

  const handleCropConfirm = (blob) => {
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(blob));
    setShowCrop(false);
    setCropSrc(null);
  };

  const handleSave = async () => {
    setSaving(true);
    let avatarUrl = profil.avatar_url;
    if (avatarFile) {
      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
        const response = await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, userId }),
        });
        const data = await response.json();
        if (data.url) { avatarUrl = data.url; }
        else { console.error('upload-avatar erreur:', data.error); }
      } catch (e) { console.error('upload-avatar exception:', e); }
    }
    await supabase.from('profils').update({
      pseudo: profil.pseudo, prenom: profil.prenom, nom: profil.nom,
      telephone: profil.telephone, adresse: profil.adresse, complement: profil.complement,
      code_postal: profil.code_postal, ville: profil.ville, etat: profil.etat, pays: profil.pays, avatar_url: avatarUrl,
    }).eq('id', userId);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  // POINT 5 : envoi du mail de réinitialisation
  const handleReset = async () => {
    if (!resetEmail.trim()) { setResetErreur('Adresse email requise.'); return; }
    setResetLoading(true); setResetErreur('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: 'https://www.kevinteoart.fr/reset-password',
    });
    setResetLoading(false);
    if (error) { setResetErreur(error.message); }
    else { setResetEnvoye(true); }
  };

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p>;

  const styleInput = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', width: '100%' };
  const styleLabel = { color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'block' };

  const champ = (label, key, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={styleLabel}>{label}</label>
      <input type={type} value={profil[key] || ''} onChange={e => setProfil(p => ({ ...p, [key]: e.target.value }))}
        style={styleInput}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,212,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
    </div>
  );

  const styleEncart = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' };
  const styleTitreEncart = { color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' };

  return (
    <>
      {showCrop && cropSrc && (
        <AvatarCrop src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => { setShowCrop(false); setCropSrc(null); }} />
      )}

      {/* Layout global : colonnes + bouton en dessous */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Ligne des deux colonnes ── */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Colonne gauche : 3 encarts ── */}
          <div style={{ flex: '2 1 340px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Encart 1 : Identité */}
            <div style={styleEncart}>
              <p style={styleTitreEncart}>👤 Identité</p>
              {champ('Pseudo', 'pseudo')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {champ('Prénom', 'prenom')}
                {champ('Nom', 'nom')}
              </div>
              {champ('Téléphone', 'telephone', 'tel')}
            </div>

            {/* Encart 2 : Mot de passe + reset */}
            <div style={styleEncart}>
              <p style={styleTitreEncart}>🔒 Mot de passe</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                Pour changer ton mot de passe, un lien de réinitialisation sera envoyé à ton adresse email.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={styleLabel}>Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => { setResetEmail(e.target.value); setResetEnvoye(false); setResetErreur(''); }}
                  style={styleInput}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,212,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  placeholder="ton@email.com"
                />
              </div>
              {resetErreur && <p style={{ color: '#ff8080', fontSize: '11px' }}>{resetErreur}</p>}
              {resetEnvoye
                ? <p style={{ color: '#00d4d4', fontSize: '12px' }}>✓ Email envoyé ! Vérifie ta boîte mail.</p>
                : (
                  <button onClick={handleReset} disabled={resetLoading}
                    style={{ background: 'rgba(0,212,212,0.12)', border: '1px solid rgba(0,212,212,0.35)', borderRadius: '8px', padding: '9px 16px', color: '#00d4d4', fontSize: '12px', cursor: resetLoading ? 'wait' : 'pointer', alignSelf: 'flex-start', transition: 'all .2s' }}>
                    {resetLoading ? 'Envoi...' : '📧 Envoyer le lien de réinitialisation'}
                  </button>
                )
              }
            </div>

            {/* Encart 3 : Adresse */}
            <div style={styleEncart}>
              <p style={styleTitreEncart}>📍 Adresse</p>
              {champ('Adresse', 'adresse')}
              {champ('Complément', 'complement')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                {champ('Code postal', 'code_postal')}
                {champ('Ville', 'ville')}
              </div>
              {champ('État / Province (optionnel)', 'etat')}
              {champ('Pays', 'pays')}
            </div>
          </div>

          {/* ── Colonne droite : photo de profil — alignée en haut, hauteur = 3 encarts gauche ── */}
          <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}>
            {/* paddingBottom pour ne pas dépasser sous le 3e encart (le bouton est en dehors) */}
            <div style={{ ...styleEncart, alignItems: 'center', justifyContent: 'flex-start', gap: '20px', height: '100%' }}>
              <p style={styleTitreEncart}>🖼 Photo de profil</p>
              <div style={{ width: '140px', height: '140px', flexShrink: 0 }}>
                <img
                  src={avatarPreview || profil.avatar_url || `${R2}/site/Logo.png`}
                  alt="avatar"
                  style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(0,212,212,0.4)', display: 'block' }}
                />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center' }}>
                JPG, PNG<br/>Recommandé 400×400px
              </p>
              <label style={{ background: 'rgba(0,212,212,0.12)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '8px', padding: '10px 18px', color: '#00d4d4', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}>
                📷 Choisir une photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
              {avatarPreview && (
                <>
                  <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  <p style={{ color: 'rgba(0,212,212,0.7)', fontSize: '10px', textAlign: 'center' }}>
                    ✓ Photo cadrée.<br/>Clique sur "Sauvegarder" pour confirmer.
                  </p>
                  <button onClick={() => { setCropSrc(avatarPreview); setShowCrop(true); }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', cursor: 'pointer' }}>
                    ✏️ Recadrer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Bouton sauvegarder — centré sous les deux colonnes ── */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ background: saved ? 'rgba(0,212,212,0.3)' : 'linear-gradient(135deg, rgba(0,212,212,0.2), rgba(0,150,150,0.2))', border: `1px solid ${saved ? '#00d4d4' : 'rgba(0,212,212,0.4)'}`, borderRadius: '10px', padding: '11px 48px', color: saved ? '#00d4d4' : '#fff', fontSize: '13px', cursor: saving ? 'wait' : 'pointer', transition: 'all .3s' }}>
            {saved ? '✓ Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>
    </>
  );
}

function SectionMesCommandes({ userId }) {
  const [commandes, setCommandes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [telechargement, setTelechargement] = React.useState({});

  React.useEffect(() => {
    supabase.from('commandes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(({ data }) => { setCommandes(data || []); setLoading(false); });
  }, [userId]);

  const telechargerFichier = async (commande, type) => {
    const key = `${commande.id}_${type}`;
    setTelechargement(p => ({ ...p, [key]: true }));
    try {
      const cheminR2 = type === 'produit' ? commande.fichier_pdf : commande.facture_pdf;
      const response = await fetch('/api/download-secure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chemin: cheminR2, userId }) });
      const data = await response.json();
      if (data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = type === 'produit' ? `${commande.nom_produit}.pdf` : `Facture_${commande.id.slice(0, 8)}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
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
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{new Date(cmd.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}{cmd.prix ? ` · ${cmd.prix} €` : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {cmd.fichier_pdf && <button onClick={() => telechargerFichier(cmd, 'produit')} disabled={telechargement[`${cmd.id}_produit`]} style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.35)', borderRadius: '8px', padding: '7px 12px', color: '#00d4d4', fontSize: '11px', cursor: 'pointer' }}>{telechargement[`${cmd.id}_produit`] ? '...' : '⬇ Télécharger'}</button>}
            {cmd.facture_pdf && <button onClick={() => telechargerFichier(cmd, 'facture')} disabled={telechargement[`${cmd.id}_facture`]} style={{ background: 'rgba(255,210,80,0.1)', border: '1px solid rgba(255,210,80,0.3)', borderRadius: '8px', padding: '7px 12px', color: 'rgba(255,210,80,0.8)', fontSize: '11px', cursor: 'pointer' }}>{telechargement[`${cmd.id}_facture`] ? '...' : '🧾 Facture'}</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

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

  React.useEffect(() => { chargerColos(); }, [userId]); // eslint-disable-line

  const chargerColos = async () => {
    const { data } = await supabase.from('coloriages').select('id, illustration_id, image_url, date_coloriage, created_at').eq('user_id', userId).not('image_url', 'is', null).order('created_at', { ascending: false });
    if (!data || data.length === 0) { setColos([]); setLoading(false); return; }
    const illuIds = [...new Set(data.map(c => c.illustration_id))];
    const { data: illus } = await supabase.from('illustrations').select('id, nom, annee').in('id', illuIds);
    const illusMap = {};
    (illus || []).forEach(i => { illusMap[i.id] = i; });
    const coloIds = data.map(c => c.id);
    const { data: newComments } = await supabase.from('commentaires_coloriages').select('coloriage_id').in('coloriage_id', coloIds).eq('vu', false).neq('user_id', userId);
    const notifSet = new Set((newComments || []).map(c => c.coloriage_id));
    setColos(data.map(c => ({ ...c, illu: illusMap[c.illustration_id], hasNotif: notifSet.has(c.id) })));
    setLoading(false);
  };

  const ouvrirZoom = async (colo) => {
    setColoZoom(colo);
    await supabase.from('commentaires_coloriages').update({ vu: true }).eq('coloriage_id', colo.id).neq('user_id', userId);
    setColos(prev => prev.map(c => c.id === colo.id ? { ...c, hasNotif: false } : c));
    const { data: comRaw } = await supabase.from('commentaires_coloriages').select('id, texte, created_at, user_id').eq('coloriage_id', colo.id).order('created_at', { ascending: true });
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
    const { data } = await supabase.from('commentaires_coloriages').insert({ coloriage_id: coloZoom.id, user_id: userId, texte: texte.trim(), vu: true }).select('id, texte, created_at, user_id').single();
    if (data) setCommentaires(prev => [...prev, { ...data, pseudo: userPseudo }]);
    setTexte(''); setEnvoi(false);
  };

  const supprimerColoriage = async (colo) => {
    setSuppression(true);
    try {
      const urlPath = colo.image_url.replace('https://images.kevinteoart.fr/', '');
      await fetch('/api/delete-colo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chemin: urlPath, userId }) });
      await supabase.from('coloriages').delete().eq('id', colo.id);
      setColos(prev => prev.filter(c => c.id !== colo.id));
      if (coloZoom?.id === colo.id) setColoZoom(null);
    } catch (e) { console.error(e); }
    setSuppression(false); setConfirmation(null);
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
      {coloZoom && (
        <div onClick={() => setColoZoom(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column' }}>
            <img src={coloZoom.image_url} alt="" style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '10px 10px 0 0' }} />
            <div style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{coloZoom.illu?.nom}</p>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>❤️ {likes.length} · 💬 {commentaires.length}</span>
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
                <textarea value={texte} onChange={e => setTexte(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerCommentaire(); } }} placeholder="Répondre…" rows={1} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '11px', resize: 'none', fontFamily: 'inherit' }} />
                <button onClick={envoyerCommentaire} disabled={!texte.trim() || envoi} style={{ background: texte.trim() ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${texte.trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '6px 12px', color: texte.trim() ? '#00d4d4' : 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: texte.trim() ? 'pointer' : 'default' }}>Envoyer</button>
              </div>
              <button onClick={() => setConfirmation(coloZoom)} style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,100,100,0.7)', fontSize: '11px', cursor: 'pointer', alignSelf: 'flex-start' }}>🗑 Supprimer ce coloriage</button>
            </div>
          </div>
          <button onClick={() => setColoZoom(null)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {confirmation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '16px', padding: '28px 32px', maxWidth: '380px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>🗑</p>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>Supprimer ce coloriage ?</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '24px' }}>Cette action est irréversible. L'image sera supprimée définitivement.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmation(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>Annuler</button>
              <button onClick={() => supprimerColoriage(confirmation)} disabled={suppression} style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 20px', color: '#ff8080', cursor: 'pointer', fontSize: '13px', opacity: suppression ? 0.6 : 1 }}>{suppression ? 'Suppression...' : 'Oui, supprimer'}</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {colos.map(colo => (
          <div key={colo.id} onClick={() => ouvrirZoom(colo)} style={{ position: 'relative', width: '120px', cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,210,80,0.2)', background: '#0a0a0a' }}>
            <img src={colo.image_url} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
            {colo.hasNotif && <div style={{ position: 'absolute', top: '4px', right: '4px', background: '#ff3eb5', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>🔔</div>}
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

function BoutonOnglet({ label, couleur, couleurRgb, actif, onClick }) {
  const ref = React.useRef(null);
  const handleMouseEnter = () => { const el = ref.current; el.classList.remove('shining'); void el.offsetWidth; el.classList.add('shining'); };
  return (
    <button ref={ref} className={`btn-onglet${actif ? ' actif' : ''}`} onMouseEnter={handleMouseEnter} onClick={onClick}
      style={{ background: actif ? `linear-gradient(135deg, rgba(${couleurRgb},0.35), rgba(${couleurRgb},0.15))` : `linear-gradient(135deg, rgba(${couleurRgb},0.18), rgba(${couleurRgb},0.08))`, border: `1px solid rgba(${couleurRgb},${actif ? '0.8' : '0.45'})`, color: couleur, boxShadow: actif ? `0 0 18px rgba(${couleurRgb},0.3), 0 4px 12px rgba(0,0,0,0.5)` : `0 2px 8px rgba(0,0,0,0.4)`, transform: actif ? 'scale(1.07)' : 'scale(1)' }}>
      {label}
    </button>
  );
}

function LogoPremium({ onClick, isMobile, L }) {
  const ref = React.useRef(null);
  const wrapRef = React.useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    el.style.transform = `rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.08)`;
    if (wrapRef.current) wrapRef.current.style.transform = 'perspective(600px)';
  };
  const handleMouseLeave = () => {
    if (ref.current) { ref.current.style.transform = ''; ref.current.classList.remove('shining-logo'); }
    if (wrapRef.current) wrapRef.current.style.transform = '';
  };
  const handleMouseEnter = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('shining-logo'); void el.offsetWidth; el.classList.add('shining-logo');
  };

  return (
    <div ref={wrapRef} style={{ perspective: '600px', flexShrink: 0, zIndex: 10 }}>
      <img
        ref={ref}
        src={`${R2}/site/Logo.png`}
        alt="logo"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          width: `${L}px`, height: `${L}px`, borderRadius: '50%',
          border: `${isMobile ? 3 : 4}px solid #000`,
          boxShadow: '0 0 0 3px #00d4d4',
          objectFit: 'cover', cursor: 'pointer',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease, box-shadow 0.3s',
          willChange: 'transform',
        }}
      />
    </div>
  );
}

function MonCompte() {
  const navigate = useNavigate();
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [onglet, setOnglet] = React.useState(null);
  const [showFavoris, setShowFavoris] = React.useState(false);
  const [stats, setStats] = React.useState({ totalIllus: 0, jAi: 0, colorie: 0, jeVeux: 0 });
  const [popupIllu, setPopupIllu] = React.useState(null);
  const [popupIlluIndex, setPopupIlluIndex] = React.useState(null);
  const [popupIlluList, setPopupIlluList] = React.useState([]);
  const [popupCollection] = React.useState({});
  const [popupColoriages] = React.useState({});

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  React.useEffect(() => {
    const blockContext = (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); };
    const blockDrag = (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); };
    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('dragstart', blockDrag);
    return () => {
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('dragstart', blockDrag);
    };
  }, []);

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUserId(user.id);
      const { data: profil } = await supabase.from('profils').select('pseudo, avatar_url').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || 'Anonyme');
      setAvatarUrl(profil?.avatar_url);
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

  const BTNS_CONFIG = [
    { id: 'collection', label: '📚 Ma Collection', couleur: '#ff3eb5', couleurRgb: '255,62,181' },
    { id: 'favoris',    label: '♡ Mes Favoris',    couleur: 'rgba(255,210,80,0.9)', couleurRgb: '255,210,80' },
    { id: 'coloriages', label: '🎨 Mes Coloriages', couleur: '#00d4d4', couleurRgb: '0,212,212' },
    { id: 'infos',      label: '👤 Mes Infos',      couleur: 'rgba(255,210,80,0.9)', couleurRgb: '255,210,80' },
    { id: 'commandes',  label: '🛒 Mes Commandes',  couleur: '#ff3eb5', couleurRgb: '255,62,181' },
  ];

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
        .btn-onglet { position: relative; overflow: hidden; border-radius: 14px; padding: 12px 20px; cursor: pointer; font-size: 13px; font-weight: bold; transition: transform .2s, box-shadow .2s; flex: 1; min-width: 120px; }
        .btn-onglet::before { content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%; background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%, transparent 100%); transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen; }
        .btn-onglet.shining::before { animation: btn-shine 0.8s ease-in-out forwards; }
        @keyframes btn-shine { 0% { left: -150%; } 100% { left: 220%; } }
        .btn-onglet:hover { transform: scale(1.04); }
        .btn-onglet.actif { transform: scale(1.07); }
        .shining-logo { position: relative; overflow: hidden; }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        @keyframes scrollSim { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.35); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,212,0.6); }
      `}</style>

      <button onClick={async () => { const { supabase: sb } = await import('./supabase'); await sb.auth.signOut(); window.location.href = '/'; }} style={{ position: 'fixed', top: '12px', left: '16px', zIndex: 100, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>⏻ Déco</button>
      <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, cursor: 'pointer', fontSize: '22px' }}>🔔</div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
        <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/accueil')} />
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => navigate('/livres')} />
            <div style={{ position: 'relative' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => setShowCategories(v => !v)} />
              {showCategories && (
                <div className="dropdown-cat">
                  <div className="dropdown-item" onClick={() => { navigate('/catalogue'); setShowCategories(false); }}>Toutes les catégories</div>
                  {CATEGORIES.map(cat => <div key={cat} className="dropdown-item" onClick={() => { navigate('/catalogue'); setShowCategories(false); }}>{cat}</div>)}
                </div>
              )}
            </div>
          </div>
          <LogoPremium onClick={() => navigate('/presentation')} isMobile={isMobile} L={L} />
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/pensees')} />
            <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => {}} />
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }} onClick={() => navigate('/mon-compte')} />
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {BARRES.map((barre, i) => (
              <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content', opacity: barre.opacite }}>
                  {[...barre.images, ...barre.images].map((img, j) => <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', display: 'block' }} />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 200}px` }}>
          {loading ? <p style={{ color: '#00d4d4', textAlign: 'center' }}>Chargement...</p> : (
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* ── POINT 6 : Titre centré, une seule ligne blanche ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                {avatarUrl && (
                  <img src={avatarUrl} alt="avatar" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,212,212,0.4)', flexShrink: 0 }} />
                )}
                <p style={{ color: '#fff', fontSize: isMobile ? '16px' : '22px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  MON COMPTE — Ma Collection Kevin Teo'Art
                </p>
              </div>

              {/* ── Triple jauge globale (point 1 déjà appliqué dans UneBarre) ── */}
              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '16px', padding: '18px 24px' }}>
                <JaugeDouble pctJai={pctJai} pctColorie={pctColo} pctJeVeux={pctJeVeux} hauteur={14} showLabels={true} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '10px', textAlign: 'center' }}>
                  {stats.jAi} / {stats.totalIllus} illustrations · {stats.colorie} coloriages · {stats.jeVeux} favoris
                </p>
              </div>

              {/* ── Boutons onglets ── */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                {BTNS_CONFIG.map(btn => {
                  const actif = btn.id === 'favoris' ? showFavoris : onglet === btn.id;
                  return <BoutonOnglet key={btn.id} label={btn.label} couleur={btn.couleur} couleurRgb={btn.couleurRgb} actif={actif}
                    onClick={() => { if (btn.id === 'favoris') { setShowFavoris(true); setOnglet(null); } else { setOnglet(btn.id); setShowFavoris(false); } }} />;
                })}
              </div>

              {onglet === 'collection' && <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,62,181,0.15)', borderRadius: '16px', padding: '20px' }}><SectionMaCollection userId={userId} totalIllus={stats.totalIllus} /></div>}
              {showFavoris && (
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,80,0.15)', borderRadius: '16px', padding: '20px' }}>
                  <SectionMesFavoris
                    userId={userId}
                    userPseudo={userPseudo}
                    onOuvrirPopup={(illu, index, list) => {
                      setPopupIllu(illu);
                      setPopupIlluIndex(index);
                      setPopupIlluList(list);
                    }}
                  />
                </div>
              )}
              {onglet === 'coloriages' && <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,212,0.15)', borderRadius: '16px', padding: '20px' }}><SectionMesColoriages userId={userId} userPseudo={userPseudo} /></div>}
              {onglet === 'infos'   && <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,80,0.15)', borderRadius: '16px', padding: '20px' }}><SectionMesInfos userId={userId} /></div>}
              {onglet === 'commandes' && <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,62,181,0.15)', borderRadius: '16px', padding: '20px' }}><SectionMesCommandes userId={userId} /></div>}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>
      {popupIllu && (
        <PopupFiche
          illu={popupIllu}
          illustrations={popupIlluList}
          jAi={popupCollection[popupIllu.id]?.j_ai || false}
          jeVeux={popupCollection[popupIllu.id]?.je_veux || false}
          aColorié={popupColoriages[popupIllu.id] || false}
          onToggleJAi={() => {}}
          onToggleJeVeux={() => {}}
          onClose={() => setPopupIllu(null)}
          onOpenSimilaire={(illu) => setPopupIllu(illu)}
          onSuivant={() => {
            const next = (popupIlluIndex + 1) % popupIlluList.length;
            setPopupIllu(popupIlluList[next]);
            setPopupIlluIndex(next);
          }}
          onPrecedent={() => {
            const prev = (popupIlluIndex - 1 + popupIlluList.length) % popupIlluList.length;
            setPopupIllu(popupIlluList[prev]);
            setPopupIlluIndex(prev);
          }}
          userPseudo={userPseudo}
          userId={userId}
          onColoUploaded={() => {}}
        />
      )}
    </div>
  );
}

export default MonCompte;