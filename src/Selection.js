import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

function Selection() {
  const navigate = useNavigate();

  const handleTerminer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('profils')
      .update({ selection_faite: true })
      .eq('id', user.id);
    navigate('/catalogue');
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" }}>
      <p style={{ color: '#00d4d4', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Bienvenue ! 🎨
      </p>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '32px', textAlign: 'center', maxWidth: '400px' }}>
        Page de sélection initiale — à construire prochainement.
      </p>
      <button onClick={handleTerminer}
        style={{ background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '8px', padding: '13px 32px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
        Accéder au catalogue →
      </button>
    </div>
  );
}

export default Selection;