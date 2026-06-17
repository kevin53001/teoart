import React from 'react';
import { supabase } from './supabase';
import { usePanier } from './PanierContext';

const R2 = 'https://images.kevinteoart.fr';
const BASE_LOCAL = "C:\\Users\\Kevin\\Desktop\\Kevin Teo'Art - base de données\\";

// ─── Helpers ────────────────────────────────────────────────────────────────

function cheminVersUrl(chemin) {
  if (!chemin) return null;
  const relatif = chemin.replace(BASE_LOCAL, '').replaceAll('\\', '/');
  return `${R2}/${relatif.split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
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
  const result = [];
  const valeursAjoutees = new Set();
  Object.entries(visuels).forEach(([k, v]) => {
    if (k.toUpperCase() === 'A') return;
    if ((k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation')) && v && !valeursAjoutees.has(v)) {
      result.push(v); valeursAjoutees.add(v);
    }
  });
  ['B', 'b'].forEach(k => {
    if (visuels[k] && !valeursAjoutees.has(visuels[k])) { result.push(visuels[k]); valeursAjoutees.add(visuels[k]); }
  });
  Object.entries(visuels).forEach(([k, v]) => {
    if (k.toUpperCase() === 'A') return;
    if (/^C\d*$/i.test(k) && v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); }
  });
  Object.entries(visuels).forEach(([k, v]) => {
    if (k.toUpperCase() === 'A') return;
    if (v && !valeursAjoutees.has(v)) { result.push(v); valeursAjoutees.add(v); }
  });
  return result;
}

function getVisuelPres(v) {
  if (!v) return null;
  const cle = Object.keys(v).find(k => k.toLowerCase().includes('présentation') || k.toLowerCase().includes('presentation'));
  if (cle) return cheminVersUrl(v[cle]);
  if (v['B']) return cheminVersUrl(v['B']);
  if (v['b']) return cheminVersUrl(v['b']);
  return null;
}

function formatDescription(desc) {
  if (!desc) return null;
  return desc.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
  ));
}

// ─── ZoomSocial ─────────────────────────────────────────────────────────────

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
        const userIds = [...new Set(commentsRaw.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', userIds);
        const profilsMap = {}; (profils || []).forEach(p => { profilsMap[p.id] = p.pseudo; });
        setCommentaires(commentsRaw.map(c => ({ ...c, pseudo: profilsMap[c.user_id] || 'Anonyme' })));
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
    <div className="zoom-social">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className={`zoom-like-btn${jaLike ? ' actif' : ''}`} onClick={toggleLike}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            {jaLike ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
              : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />}
          </svg>
          <span style={{ fontSize: '12px' }}>{likes.length > 0 ? likes.length : ''} {jaLike ? "J'aime ✓" : "J'aime"}</span>
        </button>
        {coloriage.pseudo && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>par <span style={{ color: 'rgba(255,210,80,0.7)' }}>{coloriage.pseudo}</span></span>}
      </div>
      {commentaires.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
          {commentaires.map(c => (
            <div key={c.id} className="zoom-commentaire">
              <span style={{ color: 'rgba(255,210,80,0.7)', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.pseudo || 'Anonyme'}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', lineHeight: '1.4' }}>{c.texte}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
        <textarea className="zoom-commentaire-input" rows={1} placeholder="Ajouter un commentaire…" value={texte}
          onChange={e => setTexte(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerCommentaire(); } }}
          style={{ flex: 1 }} />
        <button onClick={envoyerCommentaire} disabled={!texte.trim() || envoi}
          style={{ background: texte.trim() ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${texte.trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '5px 10px', color: texte.trim() ? '#00d4d4' : 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: texte.trim() ? 'pointer' : 'default', transition: 'all .2s', whiteSpace: 'nowrap' }}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

// ─── ZoomSocialVisuelC ───────────────────────────────────────────────────────

function ZoomSocialVisuelC({ visuelUrl, coloriste, userId, userPseudo }) {
  const [likes, setLikes] = React.useState([]);
  const [commentaires, setCommentaires] = React.useState([]);
  const [texte, setTexte] = React.useState('');
  const [envoi, setEnvoi] = React.useState(false);
  const jaLike = likes.some(l => l.user_id === userId);

  React.useEffect(() => {
    if (!visuelUrl) return;
    const charger = async () => {
      const { data: l } = await supabase.from('likes_visuels_c').select('user_id').eq('visuel_url', visuelUrl);
      const { data: commentsRaw } = await supabase.from('commentaires_visuels_c').select('id, texte, created_at, user_id').eq('visuel_url', visuelUrl).order('created_at', { ascending: true });
      setLikes(l || []);
      if (commentsRaw && commentsRaw.length > 0) {
        const userIds = [...new Set(commentsRaw.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', userIds);
        const profilsMap = {}; (profils || []).forEach(p => { profilsMap[p.id] = p.pseudo; });
        setCommentaires(commentsRaw.map(c => ({ ...c, pseudo: profilsMap[c.user_id] || 'Anonyme' })));
      } else setCommentaires([]);
    };
    charger();
  }, [visuelUrl]);

  const toggleLike = async () => {
    if (!visuelUrl || !userId) return;
    if (jaLike) {
      await supabase.from('likes_visuels_c').delete().eq('visuel_url', visuelUrl).eq('user_id', userId);
      setLikes(prev => prev.filter(l => l.user_id !== userId));
    } else {
      await supabase.from('likes_visuels_c').insert({ visuel_url: visuelUrl, user_id: userId });
      setLikes(prev => [...prev, { user_id: userId }]);
    }
  };

  const envoyerCommentaire = async () => {
    if (!texte.trim() || !visuelUrl || !userId) return;
    setEnvoi(true);
    const { data } = await supabase.from('commentaires_visuels_c').insert({ visuel_url: visuelUrl, user_id: userId, texte: texte.trim() }).select('id, texte, created_at, user_id').single();
    if (data) setCommentaires(prev => [...prev, { ...data, pseudo: userPseudo }]);
    setTexte(''); setEnvoi(false);
  };

  if (!visuelUrl) return null;
  return (
    <div className="zoom-social">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className={`zoom-like-btn${jaLike ? ' actif' : ''}`} onClick={toggleLike}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            {jaLike ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" />
              : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />}
          </svg>
          <span style={{ fontSize: '12px' }}>{likes.length > 0 ? likes.length : ''} {jaLike ? "J'aime ✓" : "J'aime"}</span>
        </button>
        {coloriste && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>par <span style={{ color: 'rgba(255,210,80,0.7)' }}>{coloriste}</span></span>}
      </div>
      {commentaires.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
          {commentaires.map(c => (
            <div key={c.id} className="zoom-commentaire">
              <span style={{ color: 'rgba(255,210,80,0.7)', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.pseudo || 'Anonyme'}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', lineHeight: '1.4' }}>{c.texte}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
        <textarea className="zoom-commentaire-input" rows={1} placeholder="Ajouter un commentaire…" value={texte}
          onChange={e => setTexte(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerCommentaire(); } }}
          style={{ flex: 1 }} />
        <button onClick={envoyerCommentaire} disabled={!texte.trim() || envoi}
          style={{ background: texte.trim() ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${texte.trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '5px 10px', color: texte.trim() ? '#00d4d4' : 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: texte.trim() ? 'pointer' : 'default', transition: 'all .2s', whiteSpace: 'nowrap' }}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

// ─── PopupFicheIllu ─────────────────────────────────────────────────────────
// Props :
//   illu           — objet illustration (obligatoire)
//   illustrations  — tableau complet pour les similaires ([] par défaut)
//   jAi, jeVeux, aColorié — booléens état collection
//   onToggleJAi, onToggleJeVeux — callbacks
//   onClose        — fermeture popup
//   onOpenSimilaire — clic sur similaire
//   onSuivant, onPrecedent — navigation flèches
//   userPseudo, userId
//   onColoUploaded — callback après upload colo
//   onOuvrirLivre  — clic sur badge livre/recueil
//   onFiltrerPatreon — clic sur badge Patreon

export default function PopupFicheIllu({
  illu,
  illustrations = [],
  jAi = false,
  jeVeux = false,
  aColorié = false,
  onToggleJAi = () => {},
  onToggleJeVeux = () => {},
  onClose = () => {},
  onOpenSimilaire = () => {},
  onSuivant = () => {},
  onPrecedent = () => {},
  userPseudo = '',
  userId = null,
  onColoUploaded = () => {},
  onOuvrirLivre = null,
  onFiltrerPatreon = null,
}) {
  const { ajouterIllustration, estDansPanier, supprimerArticle } = usePanier();
  const [ajoutConfirme, setAjoutConfirme] = React.useState(false);
  const [confirmJai, setConfirmJai] = React.useState(false);
  const [dlGratuit, setDlGratuit] = React.useState('idle'); // idle | loading | done

  const visuelsChemins = getVisuelsOrdonnes(illu?.visuels);
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

  const dansPanier = illu ? estDansPanier('illustration', illu.id) : false;

  const handleDlGratuit = async () => {
    if (dlGratuit !== 'idle' || !illu?.fichier_pdf) return;
    setDlGratuit('loading');
    try {
      const resp = await fetch('/api/download-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId: illu.id, itemType: 'illustration', fichierPdf: illu.fichier_pdf }),
      });
      const { url, error } = await resp.json();
      if (error) throw new Error(error);
      const a = document.createElement('a');
      a.href = url; a.download = `${illu.nom}.pdf`; a.click();
      setDlGratuit('done');
      setTimeout(() => setDlGratuit('idle'), 3000);
    } catch { setDlGratuit('idle'); }
  };

  const handleAjouterPanier = () => {
    if (!illu) return;
    if (dansPanier) { supprimerArticle('illustration', illu.id); return; }
    if (jAi) { setConfirmJai(true); return; }
    const imageUrl = visuels[0] || null;
    ajouterIllustration({ ...illu, image: imageUrl });
    setAjoutConfirme(true);
    setTimeout(() => setAjoutConfirme(false), 2000);
  };

  const confirmerAjoutMalgréJai = () => {
    const imageUrl = visuels[0] || null;
    ajouterIllustration({ ...illu, image: imageUrl });
    setConfirmJai(false);
    setAjoutConfirme(true);
    setTimeout(() => setAjoutConfirme(false), 2000);
  };

  React.useEffect(() => {
    if (!illu) return;
    setVisuelActif(0); setShowPartagerColo(false); setColoOk(false); setZoomIndex(null); setLivresIllu([]); setColosPropres([]); setAjoutConfirme(false);
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
        const userIds = colos.map(c => c.user_id);
        const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', userIds);
        const profilsMap = {}; (profils || []).forEach(p => { profilsMap[p.id] = p.pseudo; });
        setColosPropres(colos.map(c => ({ id: c.id, image_url: c.image_url, user_id: c.user_id, pseudo: profilsMap[c.user_id] || 'Anonyme' })));
      } else setColosPropres([]);
    };
    charger();
  }, [illu, illu?.id, illu?.livres_ids, illu?.recueils_ids]);

  const getUrlVisuelActif = (index) => { if (index < visuels.length) return visuels[index]; return colosPropres[index - visuels.length]?.image_url || null; };
  const getColoActif = (index) => { if (index < visuels.length) return null; return colosPropres[index - visuels.length] || null; };
  const urlZoom = zoomIndex !== null ? getUrlVisuelActif(zoomIndex) : null;
  const coloZoom = zoomIndex !== null ? getColoActif(zoomIndex) : null;
  const zoomSuivant = (e) => { e.stopPropagation(); setZoomIndex(i => (i + 1) % totalVisuels); };
  const zoomPrecedent = (e) => { e.stopPropagation(); setZoomIndex(i => (i - 1 + totalVisuels) % totalVisuels); };
  const cheminActif = visuelsChemins[visuelActif];
  const coloriste = estVisuelCChemin(cheminActif) ? extraireColoriste(cheminActif) : null;

  const similaires = React.useMemo(() => {
    if (!illu || !illu.tags || illu.tags.length === 0) return [];
    return illustrations.filter(i => i.id !== illu.id && i.tags && i.tags.some(t => illu.tags.includes(t)))
      .sort((a, b) => b.tags.filter(t => illu.tags.includes(t)).length - a.tags.filter(t => illu.tags.includes(t)).length)
      .slice(0, 20);
  }, [illu, illustrations]);

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
      setColoOk(true); onColoUploaded();
      const { data: colosRefresh } = await supabase.from('coloriages').select('id, image_url, user_id').eq('illustration_id', illu.id).not('image_url', 'is', null).order('created_at', { ascending: true });
      if (colosRefresh && colosRefresh.length > 0) {
        const userIds = [...new Set(colosRefresh.map(c => c.user_id))];
        const { data: profils } = await supabase.from('profils').select('id, pseudo').in('id', userIds);
        const profilsMap = {}; (profils || []).forEach(p => { profilsMap[p.id] = p.pseudo; });
        setColosPropres(colosRefresh.map(c => ({ id: c.id, image_url: c.image_url, user_id: c.user_id, pseudo: profilsMap[c.user_id] || 'Anonyme' })));
      }
    } catch (e) { console.error(e); }
    setColoEnvoi(false);
  };

  if (!illu) return null;

  return (
    <>
      {/* Zoom plein écran */}
      {zoomIndex !== null && (
        <div onClick={() => setZoomIndex(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            {urlZoom && <img src={urlZoom} alt="" style={{ maxWidth: '88vw', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px', display: 'block' }} />}
          </div>
          {coloZoom && <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px' }}><ZoomSocial coloriage={coloZoom} userId={userId} userPseudo={userPseudo} /></div>}
          {!coloZoom && zoomIndex !== null && estVisuelCChemin(visuelsChemins[zoomIndex]) && (
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px' }}>
              <ZoomSocialVisuelC visuelUrl={urlZoom} coloriste={extraireColoriste(visuelsChemins[zoomIndex])} userId={userId} userPseudo={userPseudo} />
            </div>
          )}
          <button onClick={() => setZoomIndex(null)} style={{ position: 'fixed', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', zIndex: 10 }}>✕</button>
          {totalVisuels > 1 && <>
            <button onClick={zoomPrecedent} style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>‹</button>
            <button onClick={zoomSuivant} style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>›</button>
            <p style={{ position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{zoomIndex + 1} / {totalVisuels}</p>
          </>}
        </div>
      )}

      {/* Fond overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 20px' }}>

        {/* Popup "J'ai déjà ça" */}
        {confirmJai && (
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,210,80,0.4)', borderRadius: '16px', padding: '28px 24px', maxWidth: '340px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '32px' }}>👀</p>
              <p style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>Eh, tu l'as déjà celui-là !</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6 }}>Tu as coché "J'ai" sur cette illustration... Tu collectionnes les doublons maintenant ? C'est pour offrir ?</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setConfirmJai(false)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}>Oups, annuler</button>
                <button onClick={confirmerAjoutMalgréJai} style={{ flex: 1, background: 'linear-gradient(135deg, #ffd24d, #c48a00)', border: 'none', borderRadius: '10px', padding: '10px', color: '#000', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,210,80,0.35)' }}>Oui, j'assume !</button>
              </div>
            </div>
          </div>
        )}
        {/* Flèches navigation entre illustrations */}
        <button onClick={(e) => { e.stopPropagation(); onPrecedent(); }} style={{ position: 'fixed', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1010 }}>‹</button>
        <button onClick={(e) => { e.stopPropagation(); onSuivant(); }} style={{ position: 'fixed', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1010 }}>›</button>

        <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', maxWidth: '820px', width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer', zIndex: 10 }}>✕</button>

          <div style={{ padding: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Colonne gauche : image + miniatures */}
            <div style={{ flex: '0 0 220px' }}>
              <div style={{ position: 'relative' }}>
                {getUrlVisuelActif(visuelActif) && (
                  <img src={getUrlVisuelActif(visuelActif)} alt={illu.nom} className="visuel-zoom" onClick={() => setZoomIndex(visuelActif)}
                    style={{ width: '100%', borderRadius: '10px', display: 'block', marginBottom: '8px' }} />
                )}
                {visuelActif < visuels.length && coloriste && (
                  <div style={{ position: 'absolute', bottom: '12px', right: '6px', background: 'rgba(0,0,0,0.72)', borderRadius: '4px', padding: '2px 7px', fontSize: '9px', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)' }}>Réalisé par {coloriste}</div>
                )}
                {visuelActif >= visuels.length && getColoActif(visuelActif) && (
                  <div style={{ position: 'absolute', bottom: '12px', right: '6px', background: 'rgba(0,0,0,0.72)', borderRadius: '4px', padding: '2px 7px', fontSize: '9px', color: 'rgba(255,210,80,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <img src={`${R2}/site/pastille_colos.png`} alt="" style={{ width: '12px', height: '12px', objectFit: 'contain' }} /> {getColoActif(visuelActif).pseudo}
                  </div>
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
                      <div key={`colo-${i}`} className="miniature-colo" onClick={() => setVisuelActif(idxGlobal)} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={colo.image_url} alt={`Coloriage de ${colo.pseudo}`} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', border: `2px solid ${idxGlobal === visuelActif ? 'rgba(255,210,80,0.8)' : 'transparent'}`, opacity: idxGlobal === visuelActif ? 1 : 0.45, display: 'block' }} />
                        <div className="miniature-colo-badge"><img src={`${R2}/site/pastille_colos.png`} alt="" style={{ width: '10px', height: '10px', objectFit: 'contain' }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Colonne droite : infos */}
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#fff', fontSize: '17px', fontWeight: 'bold' }}>{illu.nom}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{illu.categorie} · {illu.annee}</p>
              {illu.prix && <p style={{ color: '#00d4d4', fontSize: '15px', fontWeight: 'bold' }}>{illu.prix} €</p>}

              {/* Boutons actions */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button onClick={onToggleJAi} style={{ background: jAi ? '#00d4d4' : 'rgba(255,255,255,0.07)', border: jAi ? 'none' : '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '6px 10px', color: jAi ? '#000' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>{jAi ? "✓ J'ai" : "✕ J'ai"}</button>
                <button onClick={onToggleJeVeux} style={{ background: jeVeux ? 'rgba(255,77,125,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${jeVeux ? 'rgba(255,77,125,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" width="11" height="11">{jeVeux ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d7d" /> : <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />}</svg>
                  Je veux
                </button>
                <button onClick={() => setShowPartagerColo(v => !v)}
                  style={{ background: aColorié ? 'rgba(255,210,80,0.15)' : showPartagerColo ? 'rgba(0,212,212,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${aColorié ? 'rgba(255,210,80,0.5)' : showPartagerColo ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 10px', color: aColorié ? 'rgba(255,210,80,0.9)' : showPartagerColo ? '#00d4d4' : 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <img src={`${R2}/site/pastille_colos.png`} alt="" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />
                  {aColorié ? 'Colorié ✓' : 'Mon colo'}
                </button>

                {/* Bouton FREE ou Panier */}
                {illu.prix !== undefined && illu.prix !== null && (
                  parseFloat(illu.prix) === 0 ? (
                    <button onClick={handleDlGratuit} disabled={dlGratuit === 'loading'}
                      style={{ background: dlGratuit === 'done' ? 'rgba(0,212,212,0.18)' : 'linear-gradient(135deg, #00d4d4, #009999)', border: dlGratuit === 'done' ? '1px solid rgba(0,212,212,0.5)' : 'none', borderRadius: '8px', padding: '6px 12px', color: dlGratuit === 'done' ? '#00d4d4' : '#000', fontWeight: 'bold', fontSize: '11px', cursor: dlGratuit !== 'idle' ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all .2s', boxShadow: dlGratuit === 'done' ? 'none' : '0 4px 14px rgba(0,212,212,0.45), inset 0 1px 0 rgba(255,255,255,0.15)', letterSpacing: '0.5px' }}>
                      {dlGratuit === 'loading' ? '⏳' : dlGratuit === 'done' ? '✓ Téléchargé' : 'FREE'}
                    </button>
                  ) : illu.prix && (
                    <button onClick={handleAjouterPanier}
                      style={{ background: dansPanier ? 'rgba(0,212,212,0.18)' : ajoutConfirme ? 'linear-gradient(135deg, #00d4d4, #009999)' : 'linear-gradient(135deg, #ff3eb5, #c9007a)', border: dansPanier ? '1px solid rgba(0,212,212,0.5)' : 'none', borderRadius: '8px', padding: '6px 10px', color: dansPanier ? '#00d4d4' : '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all .2s', boxShadow: dansPanier ? 'none' : '0 4px 14px rgba(255,62,181,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                      {dansPanier ? <>✕ Retirer</> : ajoutConfirme ? <>✓ Ajouté !</> : (
                        <><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.4" fill="#fff" /><circle cx="19" cy="21" r="1.4" fill="#fff" /><path d="M2.5 3h2.4l2.2 12.4a2 2 0 002 1.6h9.2a2 2 0 001.9-1.4L22 8H6.2" /></svg>Panier</>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Partager colo */}
              {showPartagerColo && (
                <div style={{ background: 'rgba(0,212,212,0.05)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {coloOk ? <p style={{ color: '#00d4d4', fontSize: '12px', textAlign: 'center' }}>🎉 Ton coloriage a été partagé ! Merci {userPseudo} !</p> : (
                    <>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Partagé sous le pseudo : <strong style={{ color: '#00d4d4' }}>{userPseudo}</strong></p>
                      <label style={{ display: 'block', cursor: 'pointer' }}>
                        <input type="file" accept="image/*" onChange={e => setColoImage(e.target.files[0])} style={{ display: 'none' }} />
                        <div style={{ background: coloImage ? 'linear-gradient(135deg, rgba(0,212,212,0.25), rgba(0,153,170,0.25))' : 'rgba(255,255,255,0.07)', border: `1px solid ${coloImage ? 'rgba(0,212,212,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '8px', padding: '7px 10px', color: coloImage ? '#00d4d4' : 'rgba(255,255,255,0.5)', fontSize: '11px', textAlign: 'center', transition: 'all .2s', boxShadow: coloImage ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none' }}>
                          {coloImage ? `✓ ${coloImage.name}` : 'Choisir une image'}
                        </div>
                      </label>
                      <input type="date" value={coloDate} onChange={e => setColoDate(e.target.value)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '5px 8px', color: '#fff', fontSize: '11px' }} />
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button onClick={() => handlePartagerColo(true)} disabled={!coloImage || coloEnvoi} style={{ flex: 1, background: coloImage ? 'linear-gradient(135deg, #00d4d4, #0099aa)' : 'rgba(255,255,255,0.04)', border: coloImage ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px', color: coloImage ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '10px', cursor: coloImage ? 'pointer' : 'not-allowed', opacity: coloEnvoi ? 0.6 : 1, boxShadow: coloImage ? '0 3px 10px rgba(0,212,212,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none' }}>
                          <img src={`${R2}/site/pastille_colos.png`} alt="" style={{ width: '11px', height: '11px', objectFit: 'contain', marginRight: '4px', verticalAlign: 'middle' }} />Valider
                        </button>
                        <button onClick={() => setShowPartagerColo(false)} style={{ background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '6px', padding: '7px 10px', color: 'rgba(255,100,100,0.7)', fontSize: '10px', cursor: 'pointer' }}>Annuler</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Description */}
              {illu.description && (
                <div style={{ maxHeight: '160px', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', lineHeight: '1.7' }}>{formatDescription(illu.description)}</p>
                </div>
              )}

              {/* Mention droits d'auteur */}
              <div style={{ background: 'rgba(255,210,80,0.06)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
                <p style={{ color: 'rgba(255,210,80,0.85)', fontSize: '10px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                  L'ensemble des illustrations disponibles sur ce site (même les gratuites) sont destinées à un usage personnel uniquement. Toute reproduction, redistribution, revente ou utilisation commerciale est interdite sans autorisation écrite de Kevin Teo'Art.
                </p>
              </div>

              {/* Livres + Patreon */}
              {(livresIllu.length > 0 || illu.sous_categorie_patreon) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {livresIllu.length > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Dans :</span>}
                  {livresIllu.map(l => (
                    <button key={l.id} onClick={() => { onClose(); if (onOuvrirLivre) onOuvrirLivre(l); }}
                      style={{ background: 'rgba(0,212,212,0.08)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '6px', padding: '2px 8px', color: '#00d4d4', fontSize: '10px', cursor: 'pointer' }}>
                      <img src={`${R2}/site/pastille_livres.png`} alt="" style={{ width: '11px', height: '11px', objectFit: 'contain', marginRight: '4px', verticalAlign: 'middle' }} />{l.nom}
                    </button>
                  ))}
                  {illu.sous_categorie_patreon && (
                    <button onClick={() => onFiltrerPatreon && onFiltrerPatreon(illu.sous_categorie_patreon)}
                      style={{ background: 'rgba(255,210,80,0.12)', border: '1px solid rgba(255,210,80,0.45)', borderRadius: '6px', padding: '2px 8px', color: 'rgba(255,210,80,0.95)', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,210,80,0.22)'; e.currentTarget.style.borderColor = 'rgba(255,210,80,0.7)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,210,80,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,210,80,0.45)'; }}>
                      ⭐ {illu.sous_categorie_patreon}
                    </button>
                  )}
                </div>
              )}

              {/* Tags */}
              {illu.tags && illu.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {illu.tags.map((tag, i) => <span key={i} style={{ background: 'rgba(0,212,212,0.07)', border: '1px solid rgba(0,212,212,0.12)', borderRadius: '10px', padding: '1px 6px', color: 'rgba(0,212,212,0.6)', fontSize: '9px' }}>{tag}</span>)}
                </div>
              )}
            </div>
          </div>

          {/* Similaires */}
          {similaires.length > 0 && (
            <div style={{ padding: '0 24px 20px' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Illustrations similaires</p>
              <div style={{ overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '30px', height: '100%', background: 'linear-gradient(to right, #111, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '30px', height: '100%', background: 'linear-gradient(to left, #111, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div className="similaires-scroll">
                  {[...similaires, ...similaires].map((sim, idx) => {
                    const url = getVisuelPres(sim.visuels);
                    return (
                      <div key={idx} onClick={() => onOpenSimilaire(sim)}
                        style={{ flexShrink: 0, width: '160px', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', transition: 'border-color .2s' }}
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