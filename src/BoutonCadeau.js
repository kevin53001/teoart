import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';

// Visuels (non pilotables depuis Admin, seuls le message et le PDF le sont) :
const VISUEL_BOUTON_CADEAU = `${R2}/site/pastille_birthday.png`;    // bouton flottant scintillant
const VISUEL_ENCART_CADEAU = `${R2}/site/pastille_cadeau.png`;      // visuel dans l'encart (optionnel)

// Taille du bouton flottant — 2.5x le bouton Tchat (39px)
const TAILLE_BOUTON = 98;

function aujourdhuiMMDD() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateNaissanceMMDD(dateNaissance) {
  if (!dateNaissance) return null;
  // dateNaissance attendu au format 'YYYY-MM-DD'
  const parts = dateNaissance.split('-');
  if (parts.length !== 3) return null;
  return `${parts[1]}-${parts[2]}`;
}

function BoutonCadeau({ hidden = false }) {
  const [userId, setUserId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const [jourReference, setJourReference] = useState(null); // 'MM-DD' à verrouiller au clic
  const [dejaVerrouille, setDejaVerrouille] = useState(false);
  const [telechargement, setTelechargement] = useState(false);
  const [config, setConfig] = useState(null); // { message, chemin_pdf, actif } — piloté depuis Admin

  // ── Détermine si le bouton doit apparaître aujourd'hui ──
  const verifierAnniversaire = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: profil }, { data: conf }] = await Promise.all([
      supabase.from('profils').select('date_naissance, cadeau_anniv_jour_verrouille, cadeau_anniv_annee_recue').eq('id', user.id).single(),
      supabase.from('config_cadeau_anniversaire').select('message, chemin_pdf, actif').eq('id', 1).single(),
    ]);
    if (!profil || !conf) return;
    setConfig(conf);
    if (!conf.actif) { setVisible(false); return; }

    const aujourdhui = aujourdhuiMMDD();
    const anneeActuelle = new Date().getFullYear();

    // Jour de référence : celui déjà verrouillé en priorité, sinon la date de naissance actuelle
    const jourVerrouille = profil.cadeau_anniv_jour_verrouille;
    const jourActuel = jourVerrouille || dateNaissanceMMDD(profil.date_naissance);
    if (!jourActuel) return; // pas de date de naissance renseignée

    setJourReference(jourActuel);
    setDejaVerrouille(!!jourVerrouille);

    const dejaReclameCetteAnnee = profil.cadeau_anniv_annee_recue === anneeActuelle;

    if (jourActuel === aujourdhui && !dejaReclameCetteAnnee) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, []);

  useEffect(() => { verifierAnniversaire(); }, [verifierAnniversaire]);

  const ouvrirEncart = () => setOuvert(true);

  const recupererCadeau = async () => {
    if (telechargement || !userId || !jourReference || !config) return;
    setTelechargement(true);

    try {
      const anneeActuelle = new Date().getFullYear();

      // Génère l'URL signée (même système que les illustrations gratuites du Catalogue)
      const resp = await fetch('/api/download-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId: 'cadeau_anniversaire', itemType: 'cadeau', fichierPdf: config.chemin_pdf }),
      });
      const { url, error } = await resp.json();
      if (error) throw new Error(error);

      // Verrouille le jour de référence si ce n'est pas déjà fait (1er clic — anti-triche)
      const update = { cadeau_anniv_annee_recue: anneeActuelle };
      if (!dejaVerrouille) update.cadeau_anniv_jour_verrouille = jourReference;
      await supabase.from('profils').update(update).eq('id', userId);

      // Déclenche le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Cadeau-anniversaire-Kevin-TeoArt.pdf';
      a.click();

      // Referme l'encart et masque le bouton (le cadeau est consommé pour cette année)
      setOuvert(false);
      setVisible(false);
    } catch (e) {
      console.error('Erreur récupération cadeau:', e);
    }
    setTelechargement(false);
  };

  if (hidden || !config?.actif || !visible) return null;

  return (
    <>
      <style>{`
        .cadeau-btn { animation: cadeau-scintille 1.4s ease-in-out infinite; cursor: pointer; }
        @keyframes cadeau-scintille {
          0%, 100% { filter: drop-shadow(0 0 6px #ffd250) drop-shadow(0 0 2px #fff); transform: translateX(-50%) scale(1); }
          50% { filter: drop-shadow(0 0 16px #ffd250) drop-shadow(0 0 8px #fff); transform: translateX(-50%) scale(1.06); }
        }
      `}</style>

      {/* Bouton flottant — en haut, centré, bien visible */}
      <img
        src={VISUEL_BOUTON_CADEAU}
        alt="Cadeau anniversaire"
        className="cadeau-btn"
        onClick={ouvrirEncart}
        style={{ position: 'fixed', top: '14px', left: '50%', transform: 'translateX(-50%)', width: `${TAILLE_BOUTON}px`, height: `${TAILLE_BOUTON}px`, objectFit: 'contain', zIndex: 1000, userSelect: 'none' }}
      />

      {/* Encart */}
      {ouvert && ReactDOM.createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setOuvert(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(8,16,20,0.97)', border: '1px solid rgba(255,210,80,0.4)', borderRadius: '18px', padding: '32px 28px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(255,210,80,0.2)' }}
          >
            {VISUEL_ENCART_CADEAU && (
              <img src={VISUEL_ENCART_CADEAU} alt="" style={{ width: '120px', height: '120px', objectFit: 'contain', margin: '0 auto 16px' }} />
            )}
            <p style={{ color: '#ffd250', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              🎉 Joyeux anniversaire !
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', whiteSpace: 'pre-line' }}>
              {config.message}
            </p>
            <button
              onClick={recupererCadeau}
              disabled={telechargement}
              style={{ background: 'linear-gradient(135deg, #ffd250, #c48a00)', border: 'none', borderRadius: '10px', padding: '13px 28px', color: '#000', fontWeight: 'bold', fontSize: '14px', cursor: telechargement ? 'wait' : 'pointer', opacity: telechargement ? 0.7 : 1 }}
            >
              {telechargement ? 'Téléchargement...' : '🎁 Récupérer mon cadeau'}
            </button>
            <p onClick={() => setOuvert(false)} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', marginTop: '16px' }}>
              Plus tard
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default BoutonCadeau;