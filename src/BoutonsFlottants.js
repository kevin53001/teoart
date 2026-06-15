import React from 'react';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';

function BoutonsFlottants() {
  const [decoActif, setDecoActif] = React.useState(false);
  const [showScroll, setShowScroll] = React.useState(false);
  const [showContact, setShowContact] = React.useState(false);
  const [contactSujet, setContactSujet] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');
  const [contactEnvoi, setContactEnvoi] = React.useState(false);
  const [contactEnvoye, setContactEnvoye] = React.useState(false);
  const [contactErreur, setContactErreur] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [userPseudo, setUserPseudo] = React.useState('');

  // Charger les infos utilisateur pour le formulaire contact
  React.useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      const { data: p } = await supabase.from('profils').select('pseudo, email').eq('id', data.user.id).single();
      if (p) { setUserEmail(p.email || ''); setUserPseudo(p.pseudo || ''); }
    });
  }, []);

  // Afficher le bouton scroll-to-top après 300px de scroll
  React.useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDeco = async () => {
    if (decoActif) return;
    setDecoActif(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = '/';
    }, 1200);
  };

  const handleContact = async () => {
    if (!contactSujet.trim() || !contactMessage.trim()) { setContactErreur('Merci de remplir le sujet et le message.'); return; }
    setContactEnvoi(true); setContactErreur('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sujet: contactSujet.trim(), message: contactMessage.trim(), userEmail, userPseudo }),
      });
      const data = await res.json();
      if (data.success) {
        setContactEnvoye(true);
        setContactSujet('');
        setContactMessage('');
        setTimeout(() => { setContactEnvoye(false); setShowContact(false); }, 3000);
      } else { setContactErreur("Erreur lors de l'envoi. Réessaie."); }
    } catch (e) { setContactErreur('Erreur réseau. Réessaie.'); }
    setContactEnvoi(false);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* Bouton déconnexion — pastille power */}
      <div
        onClick={handleDeco}
        title={decoActif ? 'Déconnexion…' : 'Se déconnecter'}
        style={{
          position: 'fixed',
          top: '12px',
          left: '16px',
          zIndex: 1000,
          width: '38px',
          height: '38px',
          cursor: decoActif ? 'default' : 'pointer',
          transition: 'transform 0.15s, opacity 0.3s',
          opacity: decoActif ? 0.8 : 1,
        }}
      >
        <img
          src={decoActif
            ? `${R2}/site/pastille_powerred.png`
            : `${R2}/site/pastille_powergreen.png`}
          alt="Déconnexion"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onContextMenu={e => e.preventDefault()}
          draggable={false}
        />
      </div>

      {/* Bouton contact — bas gauche */}
      <div style={{ position: 'fixed', bottom: '24px', left: '16px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>

        {/* Formulaire déroulant vers le haut */}
        {showContact && (
          <div style={{
            background: 'rgba(8,16,20,0.97)',
            border: '1px solid rgba(255,210,80,0.3)',
            borderRadius: '12px',
            padding: '14px',
            width: '240px',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
              Si quelque chose cloche ou que tu as une question, la boîte à lettres est ouverte. Je réponds quand les crayons me laissent souffler.
            </p>
            {contactEnvoye ? (
              <p style={{ color: '#00cc66', fontSize: '12px', textAlign: 'center', margin: 0 }}>✓ Message envoyé !</p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Sujet"
                  value={contactSujet}
                  onChange={e => setContactSujet(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,210,80,0.25)', borderRadius: '7px', padding: '7px 10px', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,210,80,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,210,80,0.25)'}
                />
                <textarea
                  placeholder="Ton message…"
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  rows={4}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,210,80,0.25)', borderRadius: '7px', padding: '7px 10px', color: '#fff', fontSize: '11px', resize: 'none', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,210,80,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,210,80,0.25)'}
                />
                {contactErreur && <p style={{ color: '#ff6b6b', fontSize: '10px', margin: 0 }}>{contactErreur}</p>}
                <button
                  onClick={handleContact}
                  disabled={contactEnvoi || !contactSujet.trim() || !contactMessage.trim()}
                  style={{ background: (contactSujet.trim() && contactMessage.trim()) ? 'linear-gradient(135deg, rgba(255,210,80,0.25), rgba(255,160,40,0.15))' : 'rgba(255,255,255,0.04)', border: `1px solid ${(contactSujet.trim() && contactMessage.trim()) ? 'rgba(255,210,80,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '7px', padding: '7px', color: (contactSujet.trim() && contactMessage.trim()) ? '#ffd250' : 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: (contactSujet.trim() && contactMessage.trim()) ? 'pointer' : 'default', fontWeight: 'bold' }}>
                  {contactEnvoi ? 'Envoi...' : 'Envoyer'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Pastille contact */}
        <div
          onClick={() => { setShowContact(v => !v); setContactEnvoye(false); setContactErreur(''); }}
          title="Contacter Kevin"
          style={{ width: '38px', height: '38px', cursor: 'pointer', transition: 'transform 0.15s', transform: showContact ? 'scale(1.1)' : 'scale(1)' }}
        >
          <img
            src={`${R2}/site/pastille_contact.png`}
            alt="Contact"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            onContextMenu={e => e.preventDefault()}
            draggable={false}
          />
        </div>
      </div>

      {/* Bouton scroll-to-top — bas droite */}
      <div
        onClick={scrollTop}
        title="Remonter en haut"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          width: '42px',
          height: '42px',
          background: 'rgba(0,212,212,0.18)',
          border: '1.5px solid rgba(0,212,212,0.5)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 0 14px rgba(0,212,212,0.25)',
          opacity: showScroll ? 1 : 0,
          pointerEvents: showScroll ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 14V4M9 4L4 9M9 4L14 9" stroke="rgba(0,212,212,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </>
  );
}

export default BoutonsFlottants;