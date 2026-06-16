import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const R2 = 'https://images.kevinteoart.fr';

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder, onKeyDown, onFocus, onBlur }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 40px 10px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: visible ? '#00d4d4' : 'rgba(255,255,255,0.35)', padding: 0, display: 'flex', alignItems: 'center' }}
      >
        <EyeIcon visible={visible} />
      </button>
    </div>
  );
}

function ResetPassword() {
  const navigate = useNavigate();
  const [motDePasse, setMotDePasse] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [erreur, setErreur] = React.useState('');
  const [succes, setSucces] = React.useState(false);
  const [tokenValide, setTokenValide] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type = params.get('type');

    if (tokenHash && type === 'recovery') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error }) => {
          if (error) {
            setErreur('Lien invalide ou expiré. Demande un nouveau lien depuis Mes Infos.');
          } else {
            setTokenValide(true);
          }
        });
    } else {
      setErreur('Lien invalide ou expiré. Demande un nouveau lien depuis Mes Infos.');
    }
  }, []);

  const handleSubmit = async () => {
    setErreur('');
    if (!motDePasse || motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setLoading(false);
    if (error) {
      setErreur(error.message);
    } else {
      setSucces(true);
      setTimeout(async () => { await supabase.auth.signOut(); navigate('/'); }, 3000);
    }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "var(--font-texte)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      <img src={`${R2}/site/Logo.png`} alt="logo" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #000', boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', marginBottom: '32px' }} />

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '20px', padding: '36px 32px', maxWidth: '420px', width: '100%' }}>

        <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px' }}>Nouveau mot de passe</p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', marginBottom: '28px' }}>Kevin Teo'Art</p>

        {succes ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>✅</p>
            <p style={{ color: '#00d4d4', fontSize: '14px', marginBottom: '8px' }}>Mot de passe mis à jour !</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Redirection vers la connexion...</p>
          </div>
        ) : erreur && !tokenValide ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>❌</p>
            <p style={{ color: '#ff8080', fontSize: '13px', marginBottom: '16px' }}>{erreur}</p>
            <p onClick={() => navigate('/')} style={{ color: '#00d4d4', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Retour à la connexion</p>
          </div>
        ) : !tokenValide ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Vérification du lien en cours...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nouveau mot de passe</label>
              <PasswordInput
                value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                placeholder="6 caractères minimum"
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,212,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirmer le mot de passe</label>
              <PasswordInput
                value={confirmation}
                onChange={e => setConfirmation(e.target.value)}
                placeholder="Répète ton mot de passe"
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,212,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            {erreur && <p style={{ color: '#ff8080', fontSize: '12px' }}>{erreur}</p>}
            <button onClick={handleSubmit} disabled={loading}
              style={{ background: 'linear-gradient(135deg, rgba(0,212,212,0.25), rgba(0,150,150,0.25))', border: '1px solid rgba(0,212,212,0.5)', borderRadius: '12px', padding: '12px', color: '#fff', fontSize: '14px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer', transition: 'all .2s', marginTop: '4px' }}>
              {loading ? 'Mise à jour...' : '✓ Valider le nouveau mot de passe'}
            </button>
            <p onClick={() => navigate('/')} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline' }}>Annuler</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;