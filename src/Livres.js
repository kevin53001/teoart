import React from 'react';
import OngletsLateraux from './OngletsLateraux';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import BoutonsFlottants from './BoutonsFlottants';
import Cloche from './Cloche';

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

function getVisuelPresentation(visuels) {
  if (!visuels) return null;
  const cle = Object.keys(visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
  if (cle) return cheminVersUrl(visuels[cle]);
  if (visuels['B']) return cheminVersUrl(visuels['B']);
  if (visuels['b']) return cheminVersUrl(visuels['b']);
  return null;
}

// ─── ZoomSocial ──────────────────────────────────────────────────────────────
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

// ─── PopupFiche complète (identique Catalogue) ───────────────────────────────
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
        <div onClick={() => setZoomIndex(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px' }}>
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

      {onSuivant && <div onClick={(e) => { e.stopPropagation(); onSuivant(); }} style={{ position: 'fixed', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '20px', zIndex: 400 }}>‹</div>}
      {onPrecedent && <div onClick={(e) => { e.stopPropagation(); onPrecedent(); }} style={{ position: 'fixed', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '20px', zIndex: 400 }}>›</div>}

      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 20px' }}>
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

// ─── Vignette principale recueil/livre ───────────────────────────────────────
function VignetteVisuel({ item, taille = 150, onClick, badge = null, jAi = false, jeVeux = false, onToggleJAi, onToggleJeVeux }) {
  const cardRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const url = cheminVersUrl(item.visuel_presentation);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    el.style.transform = `rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.04)`;
    if (wrapRef.current) wrapRef.current.style.transform = 'perspective(800px)';
  };
  const handleMouseLeave = () => {
    if (cardRef.current) { cardRef.current.style.transform = ''; cardRef.current.classList.remove('shining'); }
    if (wrapRef.current) wrapRef.current.style.transform = '';
  };
  const handleMouseEnter = () => {
    const el = cardRef.current;
    el.classList.remove('shining'); void el.offsetWidth; el.classList.add('shining');
  };

  return (
    <div ref={wrapRef} style={{ perspective: '800px', flexShrink: 0 }}>
      <div ref={cardRef} className="teoart-card"
        onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}
        style={{ width: `${taille}px`, cursor: 'pointer', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#111', overflow: 'hidden', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.6)', willChange: 'transform' }}>
        {url
          ? <img src={url} alt={item.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />
        }
        {badge && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', background: badge.bg, border: badge.border, borderRadius: '4px', padding: '1px 5px', fontSize: '8px', color: badge.color }}>{badge.label}</div>
        )}
        {onToggleJAi && (
          <div onClick={e => { e.stopPropagation(); onToggleJAi(); }}
            style={{ position: 'absolute', top: '5px', left: '5px', borderRadius: '4px', padding: '2px 5px', fontSize: '9px', fontWeight: 'bold', zIndex: 20, cursor: 'pointer', background: jAi ? '#00d4d4' : 'rgba(0,0,0,0.55)', color: jAi ? '#000' : 'rgba(255,255,255,0.45)', border: jAi ? 'none' : '1px solid rgba(255,80,80,0.4)' }}>
            {jAi ? "✓ J'ai" : "✕ J'ai"}
          </div>
        )}
        {onToggleJeVeux && (
          <div onClick={e => { e.stopPropagation(); onToggleJeVeux(); }}
            style={{ position: 'absolute', top: '4px', right: badge ? '50px' : '4px', zIndex: 20, cursor: 'pointer', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              {jeVeux
                ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
                : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              }
            </svg>
          </div>
        )}
        <div className="badge-panier-v" onClick={e => e.stopPropagation()} title="Ajouter au panier">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1.4" fill="#000" /><circle cx="19" cy="21" r="1.4" fill="#000" />
            <path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" />
          </svg>
        </div>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.85)' }}>
          <p style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nom}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{item.annee}{item.prix ? ` · ${item.prix} €` : ''}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Vignette illustration dépliée — cliquable → popup ───────────────────────
function VignetteIllu({ illu, taille, jAi, jeVeux, aColorie, onToggleJAi, onToggleJeVeux, onClick }) {
  const urlIllu = (() => {
    if (!illu.visuels) return null;
    const cle = Object.keys(illu.visuels).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
    if (cle) return cheminVersUrl(illu.visuels[cle]);
    if (illu.visuels['B']) return cheminVersUrl(illu.visuels['B']);
    if (illu.visuels['b']) return cheminVersUrl(illu.visuels['b']);
    return null;
  })();

  return (
    <div onClick={onClick}
      style={{ flexShrink: 0, width: `${taille}px`, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', position: 'relative', cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,212,0.4)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'scale(1)'; }}>
      {urlIllu
        ? <img src={urlIllu} alt={illu.nom} style={{ width: '100%', height: `${taille}px`, objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: `${taille}px`, background: '#111' }} />
      }
      {/* Badge J'ai */}
      <div onClick={e => { e.stopPropagation(); onToggleJAi && onToggleJAi(); }}
        style={{ position: 'absolute', top: '3px', left: '3px', borderRadius: '3px', padding: '1px 4px', fontSize: '8px', fontWeight: 'bold', zIndex: 10, cursor: 'pointer', background: jAi ? '#00d4d4' : 'rgba(0,0,0,0.6)', color: jAi ? '#000' : 'rgba(255,255,255,0.4)', border: jAi ? 'none' : '1px solid rgba(255,80,80,0.35)' }}>
        {jAi ? '✓' : '✕'}
      </div>
      {/* Coeur Je veux */}
      <div onClick={e => { e.stopPropagation(); onToggleJeVeux && onToggleJeVeux(); }}
        style={{ position: 'absolute', top: '3px', right: '3px', zIndex: 10, cursor: 'pointer', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" width="12" height="12">
          {jeVeux
            ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
            : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          }
        </svg>
      </div>
      {aColorie && (
        <div style={{ position: 'absolute', bottom: `${taille > 80 ? 22 : 18}px`, left: '3px', zIndex: 10, width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,210,80,0.2)', border: '1px solid rgba(255,210,80,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>🎨</div>
      )}
      <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,0.8)' }}>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{illu.nom}</p>
      </div>
    </div>
  );
}

function VisuelsItem({ item }) {
  const visuels = [item.visuel_presentation, item.visuel_front, item.visuel_back].filter(Boolean);
  const [idx, setIdx] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setZoom(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (visuels.length === 0) return (
    <div style={{ width: '110px', height: '110px', borderRadius: '10px', background: 'linear-gradient(135deg,#0a0a0a,#1a1a1a)', border: '1px solid rgba(255,210,80,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: '40px' }}>📁</span>
    </div>
  );

  return (
    <>
      {zoom && (
        <div onClick={() => setZoom(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button onClick={() => setZoom(false)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 10000 }}>✕</button>
          <img src={cheminVersUrl(visuels[idx])} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '10px', display: 'block' }} />
          {visuels.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + visuels.length) % visuels.length); }}
              style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>‹</button>
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % visuels.length); }}
              style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>›</button>
            <p style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', zIndex: 10000 }}>{idx + 1} / {visuels.length}</p>
          </>}
        </div>
      )}
      <div style={{ flexShrink: 0 }}>
        <img src={cheminVersUrl(visuels[idx])} alt={item.nom} onClick={() => setZoom(true)}
          style={{ width: '110px', borderRadius: '10px', display: 'block', marginBottom: '6px', cursor: 'zoom-in' }} />
        {visuels.length > 1 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {visuels.map((v, i) => (
              <img key={i} src={cheminVersUrl(v)} alt="" onClick={() => setIdx(i)}
                style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: `2px solid ${i === idx ? '#00d4d4' : 'transparent'}`, opacity: i === idx ? 1 : 0.4 }} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function LogoPremium({ onClick, isMobile, L }) {
  const ref = React.useRef(null);
  const wrapRef = React.useRef(null);
  const handleMouseMove = (e) => {
    const el = ref.current; if (!el) return;
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
    const el = ref.current; if (!el) return;
    el.classList.remove('shining-logo'); void el.offsetWidth; el.classList.add('shining-logo');
  };
  return (
    <div ref={wrapRef} style={{ perspective: '600px', flexShrink: 0, zIndex: 10 }}>
      <img ref={ref} src={`${R2}/site/Logo.png`} alt="logo"
        onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}
        style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', cursor: 'pointer', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', willChange: 'transform' }} />
    </div>
  );
}

function SectionTitre({ couleur, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, transparent, ${couleur}66)` }} />
      {/* POINT 7 : police x2 */}
      <p style={{ color: couleur, fontSize: '26px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>{label}</p>
      <div style={{ flex: 1, height: '2px', background: `linear-gradient(to left, transparent, ${couleur}66)` }} />
    </div>
  );
}

function Livres() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recueils, setRecueils] = React.useState([]);
  const [tousLivres, setTousLivres] = React.useState([]);
  const [tousLesLivres, setTousLesLivres] = React.useState([]);
  const [toutes, setToutes] = React.useState([]); // toutes illustrations pour similaires popup
  const [loading, setLoading] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [collection, setCollection] = React.useState({});
  const [itemsAuto, setItemsAuto] = React.useState({ recueils: new Set(), livres: new Set() });
  const [collectionIllus, setCollectionIllus] = React.useState({});
  const [coloriages, setColoriages] = React.useState({});
  const [showCategories, setShowCategories] = React.useState(false);

  // Popup recueil/livre
  const [popupItem, setPopupItem] = React.useState(null);
  const [popupType, setPopupType] = React.useState(null);
  const [contenuPopup, setContenuPopup] = React.useState([]);
  const [itemOuvert, setItemOuvert] = React.useState(null);
  const [illustrationsOuvertes, setIllustrationsOuvertes] = React.useState([]);
  const [loadingIllus, setLoadingIllus] = React.useState(false);

  // Popup fiche illustration
  const [popupIllu, setPopupIllu] = React.useState(null);
  const [popupIlluListe, setPopupIlluListe] = React.useState([]);
  const [popupIlluIndex, setPopupIlluIndex] = React.useState(null);
  const [confirmation, setConfirmation] = React.useState(null);

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

      const { data: profil } = await supabase.from('profils').select('pseudo').eq('id', user.id).single();
      setUserPseudo(profil?.pseudo || 'Anonyme');

      const { data: r } = await supabase.from('recueils').select('id, nom, slug, annee, visuel_presentation, visuel_front, visuel_back, prix, description').eq('statut', 'published').order('annee', { ascending: false });
      const { data: l } = await supabase.from('livres').select('id, nom, slug, annee, recueils_ids, visuel_presentation, visuel_front, visuel_back, prix, description').in('statut', ['published', 'dossier']).order('nom');

      // Toutes les illustrations pour la PopupFiche (similaires)
      const { data: illus } = await supabase.from('illustrations').select('id, nom, annee, categorie, visuels, prix, description, tags, livres_ids, recueils_ids').eq('statut', 'published').order('nom');
      setToutes(illus || []);

      setRecueils(r || []);
      setTousLesLivres(l || []);
      setTousLivres((l || []).filter(li => li.visuel_presentation));

      const { data: coll } = await supabase.from('collection_livres').select('item_id, item_type, j_ai, je_veux').eq('user_id', user.id);
      const collMap = {};
      (coll || []).forEach(c => { collMap[`${c.item_type}_${c.item_id}`] = { j_ai: c.j_ai, je_veux: c.je_veux }; });

      const { data: collIllus } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto').eq('user_id', user.id);
      const collIllusMap = {};
      (collIllus || []).forEach(c => { collIllusMap[c.illustration_id] = { j_ai: c.j_ai, je_veux: c.je_veux, j_ai_auto: c.j_ai_auto || false }; });
      setCollectionIllus(collIllusMap);

      const { data: colos } = await supabase.from('coloriages').select('illustration_id').eq('user_id', user.id);
      const colosMap = {};
      (colos || []).forEach(c => { colosMap[c.illustration_id] = true; });
      setColoriages(colosMap);

      const { data: illusAuto } = await supabase.from('collection').select('illustration_id').eq('user_id', user.id).eq('j_ai_auto', true);
      if (illusAuto && illusAuto.length > 0) {
        const illuIds = illusAuto.map(i => i.illustration_id);
        const { data: illusAvecRecueils } = await supabase.from('illustrations').select('recueils_ids, livres_ids').in('id', illuIds.slice(0, 100));
        const recueilsAuto = new Set(); const livresAuto = new Set();
        (illusAvecRecueils || []).forEach(i => {
          (i.recueils_ids || []).forEach(rid => recueilsAuto.add(rid));
          (i.livres_ids || []).forEach(lid => livresAuto.add(lid));
        });
        recueilsAuto.forEach(rid => { if (!collMap[`recueil_${rid}`]) collMap[`recueil_${rid}`] = { j_ai: true, je_veux: false }; });
        livresAuto.forEach(lid => { if (!collMap[`livre_${lid}`]) collMap[`livre_${lid}`] = { j_ai: true, je_veux: false }; });
        setItemsAuto({ recueils: recueilsAuto, livres: livresAuto });
      }

      setCollection(collMap);
      setLoading(false);

      if (location.state?.ouvrirItem) {
        const item = location.state.ouvrirItem;
        if (item.type === 'recueil') {
          const recueilTrouve = (r || []).find(rec => rec.id === item.id);
          if (recueilTrouve) {
            const livresDuRecueil = (l || []).filter(li => li.recueils_ids && li.recueils_ids.includes(recueilTrouve.id));
            setContenuPopup(livresDuRecueil); setPopupItem(recueilTrouve); setPopupType('recueil');
          }
        } else {
          const livreTrouve = (l || []).find(li => li.id === item.id);
          if (livreTrouve) { setPopupItem(livreTrouve); setPopupType('livre'); }
        }
      }
    };
    charger();
  }, [navigate, location.state]);

  const ouvrirRecueil = async (recueil) => {
    const livresDuRecueil = tousLesLivres.filter(l => l.recueils_ids && l.recueils_ids.includes(recueil.id));
    setContenuPopup(livresDuRecueil); setPopupItem(recueil); setPopupType('recueil');
    setItemOuvert(null); setIllustrationsOuvertes([]);
    const key = `recueil_${recueil.id}`;
    if (!collection[key]?.j_ai) {
      const { data: illus } = await supabase.from('illustrations').select('id').eq('statut', 'published').contains('recueils_ids', [recueil.id]);
      const illuIds = (illus || []).map(i => i.id);
      if (illuIds.length > 0) {
        const { data: collLiveR } = await supabase.from('collection').select('illustration_id').eq('user_id', userId).eq('j_ai', true).in('illustration_id', illuIds);
        const cochesSetR = new Set((collLiveR || []).map(c => c.illustration_id));
        if (illuIds.every(id => cochesSetR.has(id))) {
          setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: true } }));
          await supabase.from('collection_livres').upsert({ user_id: userId, item_id: recueil.id, item_type: 'recueil', j_ai: true, je_veux: collection[key]?.je_veux || false }, { onConflict: 'user_id,item_id,item_type' });
        }
      }
    }
  };

  const ouvrirLivre = async (livre) => {
    if (itemOuvert?.id === livre.id) { setItemOuvert(null); setIllustrationsOuvertes([]); return; }
    setItemOuvert(livre); setLoadingIllus(true); setIllustrationsOuvertes([]);
    const { data } = await supabase.from('illustrations').select('id, nom, visuels, annee, prix, categorie, description, tags, livres_ids, recueils_ids').eq('statut', 'published').contains('livres_ids', [livre.id]).order('nom');
    const illus = data || [];
    setIllustrationsOuvertes(illus); setLoadingIllus(false);
    if (illus.length > 0) {
      const key = `livre_${livre.id}`;
      if (!collection[key]?.j_ai) {
        const illuIds = illus.map(i => i.id);
        const { data: collLive } = await supabase.from('collection').select('illustration_id').eq('user_id', userId).eq('j_ai', true).in('illustration_id', illuIds);
        const cochesSet = new Set((collLive || []).map(c => c.illustration_id));
        if (illuIds.every(id => cochesSet.has(id))) {
          setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: true } }));
          await supabase.from('collection_livres').upsert({ user_id: userId, item_id: livre.id, item_type: 'livre', j_ai: true, je_veux: collection[key]?.je_veux || false }, { onConflict: 'user_id,item_id,item_type' });
        }
      }
    }
  };

  const faireToggleJAi = async (itemId, type) => {
    const key = `${type}_${itemId}`; const actuel = collection[key] || {}; const nouveau = !(actuel.j_ai || false);
    setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: nouveau } }));
    const { error } = await supabase.from('collection_livres').upsert({ user_id: userId, item_id: itemId, item_type: type, j_ai: nouveau, je_veux: actuel.je_veux || false }, { onConflict: 'user_id,item_id,item_type' });
    if (error) { console.error(error); setCollection(prev => ({ ...prev, [key]: { ...prev[key], j_ai: actuel.j_ai || false } })); return; }
    try {
      let illuIds = [];
      if (type === 'recueil') { const { data: illus } = await supabase.from('illustrations').select('id').eq('statut', 'published').contains('recueils_ids', [itemId]); illuIds = (illus || []).map(i => i.id); }
      else if (type === 'livre') { const { data: illus } = await supabase.from('illustrations').select('id').eq('statut', 'published').contains('livres_ids', [itemId]); illuIds = (illus || []).map(i => i.id); }
      if (illuIds.length > 0) {
        await supabase.from('collection').upsert(illuIds.map(illuId => ({ user_id: userId, illustration_id: illuId, j_ai: nouveau, j_ai_auto: collectionIllus[illuId]?.j_ai_auto || false, je_veux: collectionIllus[illuId]?.je_veux || false })), { onConflict: 'user_id,illustration_id' });
        setCollectionIllus(prev => { const next = { ...prev }; illuIds.forEach(id => { next[id] = { ...prev[id], j_ai: nouveau }; }); return next; });
      }
    } catch (e) { console.error(e); }
  };

  const toggleJAi = (itemId, type) => {
    const nouveau = !(collection[`${type}_${itemId}`]?.j_ai || false);
    // Décochage d'un item de la sélection initiale → confirmation
    const estAuto = type === 'recueil' ? itemsAuto.recueils.has(itemId) : itemsAuto.livres.has(itemId);
    if (!nouveau && estAuto) {
      setConfirmation({ itemId, type });
      return;
    }
    faireToggleJAi(itemId, type);
  };

  const toggleJeVeux = async (itemId, type) => {
    const key = `${type}_${itemId}`; const actuel = collection[key] || {}; const nouveau = !(actuel.je_veux || false);
    setCollection(prev => ({ ...prev, [key]: { ...prev[key], je_veux: nouveau } }));
    const { error } = await supabase.from('collection_livres').upsert({ user_id: userId, item_id: itemId, item_type: type, j_ai: actuel.j_ai || false, je_veux: nouveau }, { onConflict: 'user_id,item_id,item_type' });
    if (error) { console.error(error); setCollection(prev => ({ ...prev, [key]: { ...prev[key], je_veux: actuel.je_veux || false } })); }
  };

  const faireToggleJAiIllu = async (illuId) => {
    const nouveau = !(collectionIllus[illuId]?.j_ai || false);
    setCollectionIllus(prev => ({ ...prev, [illuId]: { ...prev[illuId], j_ai: nouveau } }));
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, j_ai: nouveau, j_ai_auto: false, je_veux: collectionIllus[illuId]?.je_veux || false }, { onConflict: 'user_id,illustration_id' });
  };

  const toggleJAiIllu = (illuId) => {
    const actuel = collectionIllus[illuId] || {};
    const nouveau = !(actuel.j_ai || false);
    // Si on décoche une illustration cochée automatiquement → demander confirmation
    if (!nouveau && actuel.j_ai_auto) {
      setConfirmation({ illuId });
      return;
    }
    faireToggleJAiIllu(illuId);
  };

  const toggleJeVeuxIllu = async (illuId) => {
    const nouveau = !(collectionIllus[illuId]?.je_veux || false);
    setCollectionIllus(prev => ({ ...prev, [illuId]: { ...prev[illuId], je_veux: nouveau } }));
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, je_veux: nouveau, j_ai: collectionIllus[illuId]?.j_ai || false, j_ai_auto: collectionIllus[illuId]?.j_ai_auto || false }, { onConflict: 'user_id,illustration_id' });
  };

  // Ouvrir popup fiche illustration depuis les dépliés
  const ouvrirPopupIllu = (illu, liste) => {
    const idx = liste.findIndex(i => i.id === illu.id);
    setPopupIllu(illu); setPopupIlluListe(liste); setPopupIlluIndex(idx);
  };
  const popupIlluSuivant = () => { const next = (popupIlluIndex + 1) % popupIlluListe.length; setPopupIllu(popupIlluListe[next]); setPopupIlluIndex(next); };
  const popupIlluPrecedent = () => { const prev = (popupIlluIndex - 1 + popupIlluListe.length) % popupIlluListe.length; setPopupIllu(popupIlluListe[prev]); setPopupIlluIndex(prev); };

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;
  const TAILLE_RECUEIL = isMobile ? 130 : 170;
  const TAILLE_LIVRE = isMobile ? 110 : 140;
  const TAILLE_ILLUS = isMobile ? 85 : 100;

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .teoart-card::before {
          content: ''; position: absolute; top: -20%; left: -150%; width: 80%; height: 140%;
          background: linear-gradient(to right, transparent 0%, rgba(255,215,80,0.02) 10%, rgba(255,225,110,0.07) 25%, rgba(255,235,150,0.12) 40%, rgba(255,245,170,0.08) 50%, rgba(255,235,140,0.11) 62%, rgba(255,220,100,0.06) 75%, rgba(255,210,80,0.02) 88%, transparent 100%);
          transform: skewX(-28deg); z-index: 10; pointer-events: none; mix-blend-mode: screen;
        }
        .teoart-card.shining::before { animation: shine 1.0s ease-in-out forwards; }
        @keyframes shine { 0% { left: -150%; } 100% { left: 220%; } }
        .teoart-card:hover { border-color: rgba(255,210,80,0.5) !important; box-shadow: 0 4px 8px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(255,210,80,0.15) !important; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        img { -webkit-user-drag: none; user-drag: none; pointer-events: auto; }
        * { -webkit-user-select: none; user-select: none; }
        input, textarea { -webkit-user-select: text; user-select: text; }
        .badge-panier-v { position: absolute; bottom: 6px; right: 6px; z-index: 20; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; background: #ff3eb5; display: flex; align-items: center; justify-content: center; transition: transform .2s; box-shadow: 0 2px 8px rgba(255,62,181,0.6); }
        .badge-panier-v:hover { transform: scale(1.15); }
        .dropdown-cat { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 100; min-width: 200px; }
        .dropdown-item { padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .popup-anim { animation: slideDown 0.25s ease; }
        .shining-logo { position: relative; overflow: hidden; }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        @keyframes scrollSim { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.35); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,212,0.6); }
      `}</style>

      <BoutonsFlottants />
      <Cloche />

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
        <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/accueil' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/accueil')} />
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px', ...(location.pathname === '/livres' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/livres')} />
            <div style={{ position: 'relative' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/catalogue' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => setShowCategories(v => !v)} />
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
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/pensees' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/pensees')} />
            <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => {}} />
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0', ...(location.pathname === '/mon-compte' && { filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(0,212,212,0.5))' }) }} onClick={() => navigate('/mon-compte')} />
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
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

              <SectionTitre couleur="#00d4d4" label="Recueils" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '40px' }}>
                {recueils.map(r => (
                  <VignetteVisuel key={r.id} item={r} taille={TAILLE_RECUEIL}
                    jAi={collection[`recueil_${r.id}`]?.j_ai || false}
                    jeVeux={collection[`recueil_${r.id}`]?.je_veux || false}
                    onToggleJAi={() => toggleJAi(r.id, 'recueil')}
                    onToggleJeVeux={() => toggleJeVeux(r.id, 'recueil')}
                    onClick={() => ouvrirRecueil(r)} />
                ))}
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,210,80,0.2), transparent)', marginBottom: '40px' }} />

              <SectionTitre couleur="rgba(255,255,255,0.6)" label="Tous les livres" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                {tousLivres.map(l => (
                  <VignetteVisuel key={l.id} item={l} taille={TAILLE_LIVRE}
                    jAi={collection[`livre_${l.id}`]?.j_ai || false}
                    jeVeux={collection[`livre_${l.id}`]?.je_veux || false}
                    onToggleJAi={() => toggleJAi(l.id, 'livre')}
                    onToggleJeVeux={() => toggleJeVeux(l.id, 'livre')}
                    onClick={() => { setPopupItem(l); setPopupType('livre'); setItemOuvert(null); setIllustrationsOuvertes([]); }} />
                ))}
              </div>

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

      {/* ── POPUP RECUEIL OU LIVRE ── */}
      {popupItem && (
        <div onClick={() => { setPopupItem(null); setItemOuvert(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} className="popup-anim"
            style={{ background: '#111', border: `1px solid ${popupType === 'recueil' ? 'rgba(0,212,212,0.3)' : 'rgba(255,210,80,0.25)'}`, borderRadius: '20px', maxWidth: '860px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '24px' }}>

            <button onClick={() => { setPopupItem(null); setItemOuvert(null); }} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer' }}>✕</button>

            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap' }}>
              <VisuelsItem item={popupItem} />
              <div style={{ flex: 1 }}>
                <p style={{ color: popupType === 'recueil' ? '#00d4d4' : 'rgba(255,210,80,0.8)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  {popupType === 'recueil' ? 'Recueil' : 'Livre'}
                </p>
                <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{popupItem.nom}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px' }}>
                  {popupItem.annee}{popupItem.prix ? ` · ${popupItem.prix} €` : ''}
                  {popupType === 'recueil' ? ` · ${contenuPopup.length} livre${contenuPopup.length > 1 ? 's' : ''}` : ''}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => toggleJAi(popupItem.id, popupType)}
                    style={{ background: collection[`${popupType}_${popupItem.id}`]?.j_ai ? '#00d4d4' : 'rgba(255,255,255,0.07)', border: collection[`${popupType}_${popupItem.id}`]?.j_ai ? 'none' : '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 12px', color: collection[`${popupType}_${popupItem.id}`]?.j_ai ? '#000' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    {collection[`${popupType}_${popupItem.id}`]?.j_ai ? "✓ J'ai" : "✕ J'ai"}
                  </button>
                  <button onClick={() => toggleJeVeux(popupItem.id, popupType)}
                    style={{ background: collection[`${popupType}_${popupItem.id}`]?.je_veux ? 'rgba(255,77,125,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${collection[`${popupType}_${popupItem.id}`]?.je_veux ? 'rgba(255,77,125,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg viewBox="0 0 24 24" width="11" height="11">
                      {collection[`${popupType}_${popupItem.id}`]?.je_veux
                        ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
                        : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                      }
                    </svg>
                    Je veux
                  </button>
                  <button style={{ background: '#ff3eb5', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#000', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1.4" fill="#000" /><circle cx="19" cy="21" r="1.4" fill="#000" />
                      <path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" />
                    </svg>
                    Panier
                  </button>
                </div>
                {popupItem.description && (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.7', marginTop: '12px' }}>{popupItem.description}</p>
                )}
              </div>
            </div>

            {/* CONTENU RECUEIL */}
            {popupType === 'recueil' && contenuPopup.length > 0 && (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Contenu du recueil</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {contenuPopup.map(livre => {
                    const estDossier = !livre.visuel_presentation;
                    const estOuvert = itemOuvert?.id === livre.id;
                    return (
                      <div key={livre.id}>
                        <div onClick={() => ouvrirLivre(livre)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${estOuvert ? 'rgba(0,212,212,0.4)' : estDossier ? 'rgba(255,210,80,0.25)' : 'rgba(255,255,255,0.08)'}`, background: estOuvert ? 'rgba(0,212,212,0.04)' : 'rgba(255,255,255,0.02)', transition: 'all .2s' }}>
                          {/* POINT 8 : dossiers sans visuel → icône 📁 */}
                          {estDossier ? (
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg,#0a0a0a,#111)', border: '1px solid rgba(255,210,80,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '18px', opacity: 0.8 }}>📁</span>
                            </div>
                          ) : (
                            <img src={cheminVersUrl(livre.visuel_presentation)} alt={livre.nom} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ color: estDossier ? 'rgba(255,210,80,0.85)' : '#fff', fontSize: '13px', fontWeight: 'bold' }}>{livre.nom}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{estDossier ? 'Dossier' : 'Livre'}{livre.annee ? ` · ${livre.annee}` : ''}</p>
                          </div>
                          <span style={{ color: estOuvert ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontSize: '18px', transition: 'transform .2s', transform: estOuvert ? 'rotate(90deg)' : 'none' }}>›</span>
                        </div>

                        {estOuvert && (
                          <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', border: '1px solid rgba(0,212,212,0.08)' }}>
                            {loadingIllus ? (
                              <p style={{ color: '#00d4d4', textAlign: 'center', fontSize: '12px' }}>Chargement...</p>
                            ) : illustrationsOuvertes.length === 0 ? (
                              <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: '12px' }}>Aucune illustration trouvée.</p>
                            ) : (
                              <>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                  {illustrationsOuvertes.length} illustration{illustrationsOuvertes.length > 1 ? 's' : ''} — cliquer pour ouvrir la fiche
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {illustrationsOuvertes.map(illu => (
                                    <VignetteIllu key={illu.id} illu={illu} taille={TAILLE_ILLUS}
                                      jAi={collectionIllus[illu.id]?.j_ai || false}
                                      jeVeux={collectionIllus[illu.id]?.je_veux || false}
                                      aColorie={coloriages[illu.id] || false}
                                      onToggleJAi={() => toggleJAiIllu(illu.id)}
                                      onToggleJeVeux={() => toggleJeVeuxIllu(illu.id)}
                                      onClick={() => ouvrirPopupIllu(illu, illustrationsOuvertes)}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONTENU LIVRE */}
            {popupType === 'livre' && (
              <PopupContenuLivre livre={popupItem} taille={TAILLE_ILLUS}
                collectionIllus={collectionIllus} coloriages={coloriages}
                onToggleJAi={toggleJAiIllu} onToggleJeVeux={toggleJeVeuxIllu}
                onClickIllu={(illu, liste) => ouvrirPopupIllu(illu, liste)} />
            )}
          </div>
        </div>
      )}

      {/* ── POPUP FICHE ILLUSTRATION ── */}
      {popupIllu && (
        <PopupFiche
          illu={popupIllu}
          illustrations={toutes}
          jAi={collectionIllus[popupIllu.id]?.j_ai || false}
          jeVeux={collectionIllus[popupIllu.id]?.je_veux || false}
          aColorié={coloriages[popupIllu.id] || false}
          onToggleJAi={() => toggleJAiIllu(popupIllu.id)}
          onToggleJeVeux={() => toggleJeVeuxIllu(popupIllu.id)}
          onClose={() => setPopupIllu(null)}
          onOpenSimilaire={(illu) => setPopupIllu(illu)}
          onSuivant={popupIlluListe.length > 1 ? popupIlluSuivant : null}
          onPrecedent={popupIlluListe.length > 1 ? popupIlluPrecedent : null}
          userPseudo={userPseudo}
          userId={userId}
          onColoUploaded={() => setColoriages(prev => ({ ...prev, [popupIllu.id]: true }))}
        />
      )}

      {confirmation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,210,80,0.4)', borderRadius: '16px', padding: '28px 32px', maxWidth: '420px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>🤔</p>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Attends, t'es sûr·e ?</p>
            {confirmation.illuId ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.8', marginBottom: '24px' }}>
                Cette illustration fait partie d'un livre ou recueil que tu as sélectionné lors de ta première visite.<br /><br />
                Tu veux vraiment la retirer de ta collection ? Elle ne disparaîtra pas dans un trou noir, mais quand même... c'est du travail de Kevin ! 😅
              </p>
            ) : confirmation.type === 'recueil' ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.8', marginBottom: '24px' }}>
                Ce recueil faisait partie de ta sélection initiale. Si tu le décoches, toutes ses illustrations seront retirées aussi.<br /><br />
                C'est un grand geste... Kevin en a peut-être perdu le sommeil pour le créer. Tu es vraiment sûr·e ? 😢
              </p>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.8', marginBottom: '24px' }}>
                Ce livre faisait partie de ta sélection initiale. Si tu le décoches, toutes ses illustrations seront retirées aussi.<br /><br />
                Des heures de travail, des pages de coloriage, des crayons usés jusqu'au bout... tout ça pour rien ? 😩
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmation(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>Non, je la garde !</button>
              <button onClick={() => {
                if (confirmation.illuId) faireToggleJAiIllu(confirmation.illuId);
                else faireToggleJAi(confirmation.itemId, confirmation.type);
                setConfirmation(null);
              }} style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 20px', color: '#ff8080', cursor: 'pointer', fontSize: '13px' }}>Oui, je décoche</button>
            </div>
          </div>
        </div>
      )}
      <OngletsLateraux userId={userId} onOuvrirFiche={(illu) => setPopupIllu(illu)} />
    </div>
  );
}

function PopupContenuLivre({ livre, taille, collectionIllus, coloriages, onToggleJAi, onToggleJeVeux, onClickIllu }) {
  const [illustrations, setIllustrations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.from('illustrations')
      .select('id, nom, visuels, annee, prix, categorie, description, tags, livres_ids, recueils_ids')
      .eq('statut', 'published')
      .contains('livres_ids', [livre.id])
      .order('nom')
      .then(({ data }) => { setIllustrations(data || []); setLoading(false); });
  }, [livre.id]);

  if (loading) return <p style={{ color: '#00d4d4', textAlign: 'center', fontSize: '12px' }}>Chargement...</p>;
  if (illustrations.length === 0) return <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: '12px' }}>Aucune illustration trouvée.</p>;

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
        {illustrations.length} illustration{illustrations.length > 1 ? 's' : ''} — cliquer pour ouvrir la fiche
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {illustrations.map(illu => (
          <VignetteIllu key={illu.id} illu={illu} taille={taille}
            jAi={collectionIllus?.[illu.id]?.j_ai || false}
            jeVeux={collectionIllus?.[illu.id]?.je_veux || false}
            aColorie={coloriages?.[illu.id] || false}
            onToggleJAi={() => onToggleJAi && onToggleJAi(illu.id)}
            onToggleJeVeux={() => onToggleJeVeux && onToggleJeVeux(illu.id)}
            onClick={() => onClickIllu && onClickIllu(illu, illustrations)}
          />
        ))}
      </div>
    </div>
  );
}

export default Livres;