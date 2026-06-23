import React from 'react';
import ReactDOM from 'react-dom';
import { supabase } from './supabase';
import { compresserImage } from './compresserImage';

const R2 = 'https://images.kevinteoart.fr';

/**
 * PopupColoVignette — popup flottant pour partager un coloriage
 * Appelable depuis la vignette catalogue ET depuis la fiche illustration
 *
 * Props :
 *  - illu        : objet illustration { id, nom }
 *  - userId      : id de l'utilisateur connecté
 *  - userPseudo  : pseudo de l'utilisateur connecté
 *  - onClose     : callback fermeture
 *  - onUploaded  : callback après upload réussi
 */
function PopupColoVignette({ illu, userId, userPseudo, onClose, onUploaded }) {
  const [coloImage, setColoImage] = React.useState(null);
  const [coloDate, setColoDate]   = React.useState('');
  const [coloNote, setColoNote]   = React.useState('');
  const [envoi, setEnvoi]         = React.useState(false);
  const [ok, setOk]               = React.useState(false);

  const handleUpload = async () => {
    setEnvoi(true);
    try {
      let imageUrl = null;
      if (coloImage) {
        const nomFichierSansExt = `${userId}_${illu.id}_${Date.now()}`;
        const { base64, fileType, fileName } = await compresserImage(coloImage, nomFichierSansExt);
        const response = await fetch('/api/upload-colo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, fileType, fileBase64: base64 }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        imageUrl = data.url;
      }
      await supabase.from('coloriages').upsert({
        user_id: userId,
        illustration_id: illu.id,
        image_url: imageUrl,
        date_coloriage: coloDate || null,
        note: coloNote.trim() || null,
      });
      setOk(true);
      setTimeout(() => { onUploaded(); }, 3000);
    } catch (e) {
      console.error(e);
    }
    setEnvoi(false);
  };

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid rgba(255,210,80,0.3)', borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%', textAlign: 'center' }}
      >
        {ok ? (
          /* ── Mini popup confirmation ── */
          <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <p style={{ fontSize: '32px', margin: 0 }}>🎉</p>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
              Merci, ton colo est ajouté à la galerie !
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</p>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{illu.nom}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '16px' }}>Partage ton coloriage !</p>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '12px' }}>
              Pseudo : <strong style={{ color: '#00d4d4' }}>{userPseudo}</strong>
            </p>

            {/* Choisir une image */}
            <label style={{ display: 'block', cursor: 'pointer', marginBottom: '14px' }}>
              <input type="file" accept="image/*" onChange={e => setColoImage(e.target.files[0])} style={{ display: 'none' }} />
              <div style={{ background: coloImage ? 'linear-gradient(135deg, rgba(0,212,212,0.22), rgba(0,153,170,0.22))' : 'rgba(255,255,255,0.07)', border: `1px solid ${coloImage ? 'rgba(0,212,212,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '8px', padding: '8px 12px', color: coloImage ? '#00d4d4' : 'rgba(255,255,255,0.5)', fontSize: '11px', textAlign: 'center', transition: 'all .2s', boxShadow: coloImage ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none' }}>
                {coloImage ? `✓ ${coloImage.name}` : 'Choisir une image'}
              </div>
            </label>

            {/* Date — moitié gauche */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', whiteSpace: 'nowrap' }}>Réalisé le :</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontStyle: 'italic' }}>(optionnel)</span>
              </div>
              <input
                type="date" value={coloDate} onChange={e => setColoDate(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '11px', width: '50%', flexShrink: 0 }}
              />
            </div>

            {/* Note */}
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Note :</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontStyle: 'italic' }}>(optionnel)</span>
              </div>
              <textarea
                value={coloNote}
                onChange={e => setColoNote(e.target.value)}
                placeholder="Un petit mot sur ce coloriage…"
                rows={3}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '11px', resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={handleUpload} disabled={!coloImage || envoi}
                style={{ flex: 1, background: coloImage ? 'linear-gradient(135deg, rgba(255,210,80,0.9), rgba(200,130,0,0.9))' : 'rgba(255,255,255,0.04)', border: coloImage ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 10px', color: coloImage ? '#000' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '11px', cursor: coloImage ? 'pointer' : 'not-allowed', opacity: envoi ? 0.6 : 1, boxShadow: coloImage ? '0 3px 10px rgba(255,210,80,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none' }}
              >
                <img src={`${R2}/site/pastille_colos.png`} alt="" style={{ width: '11px', height: '11px', objectFit: 'contain', marginRight: '4px', verticalAlign: 'middle' }} />
                Valider
              </button>
              <button
                onClick={onClose}
                style={{ background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '8px 12px', color: 'rgba(255,100,100,0.7)', fontSize: '11px', cursor: 'pointer' }}
              >
                Annuler
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default PopupColoVignette;