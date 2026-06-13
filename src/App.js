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

function App() {
  const [session, setSession] = React.useState(undefined);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!session ? <Connexion /> : <Navigate to="/catalogue" />} />
        <Route path="/inscription" element={!session ? <Inscription /> : <Navigate to="/catalogue" />} />
        <Route path="/selection" element={session ? <Selection /> : <Navigate to="/" />} />
        <Route path="/catalogue" element={session ? <Catalogue /> : <Navigate to="/" />} />
        <Route path="/livres" element={session ? <Livres /> : <Navigate to="/" />} />
        <Route path="/livres/:id" element={session ? <Livres /> : <Navigate to="/" />} />
        <Route path="/mon-compte" element={session ? <MonCompte /> : <Navigate to="/" />} />
        <Route path="/presentation" element={session ? <Presentation /> : <Navigate to="/" />} />
        <Route path="/pensees" element={session ? <Pensees /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
