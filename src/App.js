import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Connexion from './Connexion';
import Inscription from './Inscription';
import Selection from './Selection';
import Catalogue from './Catalogue';
import Livres from './Livres';
import MonCompte from './MonCompte';
import Presentation from './Presentation';
import Pensees from './Pensees';
import ResetPassword from './ResetPassword';
import Accueil from './Accueil';
import BannerePWA from './BannerePWA';

function App() {
  const [session, setSession] = React.useState(undefined);

  React.useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        await supabase.auth.signOut();
        setSession(null);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(0,212,212,0.2)', borderTop: '3px solid #00d4d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!session ? <Connexion /> : <Navigate to="/accueil" />} />
        <Route path="/inscription" element={!session ? <Inscription /> : <Navigate to="/accueil" />} />
        <Route path="/selection" element={session ? <Selection /> : <Navigate to="/" />} />
        <Route path="/catalogue" element={session ? <Catalogue /> : <Navigate to="/" />} />
        <Route path="/livres" element={session ? <Livres /> : <Navigate to="/" />} />
        <Route path="/livres/:id" element={session ? <Livres /> : <Navigate to="/" />} />
        <Route path="/mon-compte" element={session ? <MonCompte /> : <Navigate to="/" />} />
        <Route path="/presentation" element={session ? <Presentation /> : <Navigate to="/" />} />
        <Route path="/pensees" element={session ? <Pensees /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accueil" element={session ? <Accueil /> : <Navigate to="/" />} />
      </Routes>
      <BannerePWA />
    </BrowserRouter>
  );
}

export default App;
