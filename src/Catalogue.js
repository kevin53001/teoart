import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

function Catalogue() {
  const navigate = useNavigate();

  const handleDeconnexion = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" }}>
      <p style={{ color: '#00d4d4', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Catalogue 🎨
      </p>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '32px', textAlign: 'center', maxWidth: '400px' }}>
        Le catalogue arrive bientôt !
      </p>
      <button onClick={handleDeconnexion}
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '13px 32px', color: 'rgba(255,255,255,0.7)', fontSize: '15px', cursor: 'pointer' }}>
        Se déconnecter
      </button>
    </div>
  );
}

export default Catalogue;