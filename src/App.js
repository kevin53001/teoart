import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import { PanierProvider } from './PanierContext';
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
import SplashScreen from './SplashScreen';
import Panier from './Panier';
import Admin from './Admin';
import BoutonCadeau from './BoutonCadeau';
import BanniereNotifications from './BanniereNotifications';

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Gardien pour la route /selection :
// - non connecté → page de connexion
// - connecté + selection_faite déjà true → accueil
// - connecté + selection_faite false → page Selection
function RouteSelection({ session }) {
  const [etat, setEtat] = React.useState('chargement'); // 'chargement' | 'ok' | 'deja_fait'

  React.useEffect(() => {
    if (!session) return;
    supabase
      .from('profils')
      .select('selection_faite')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setEtat(data?.selection_faite ? 'deja_fait' : 'ok');
      });
  }, [session]);

  if (!session) return <Navigate to="/" />;
  if (etat === 'chargement') return <div style={{ background: '#000', minHeight: '100vh' }} />;
  if (etat === 'deja_fait') return <Navigate to="/accueil" />;
  return <Selection />;
}

// Affiche le bouton Cadeau anniversaire sur tout le site sauf l'admin.
// Le composant BoutonCadeau gère lui-même toute la logique (date de naissance,
// verrouillage, config active ou non) — ici on ne fait que le cacher sur /admin-kt2024.
function ZoneCadeauAnniversaire({ session }) {
  const location = useLocation();
  if (!session) return null;
  const surAdmin = location.pathname.startsWith('/admin-kt2024');
  return <BoutonCadeau hidden={surAdmin} />;
}

// Bannière notifications : même logique de masquage que le bouton Cadeau —
// cachée sur /admin-kt2024, sinon affichée (le composant gère lui-même
// la compatibilité Android, le délai et le flag "déjà vue").
function ZoneNotifications({ session }) {
  const location = useLocation();
  if (!session) return null;
  if (location.pathname.startsWith('/admin-kt2024')) return null;
  return <BanniereNotifications session={session} />;
}

function App() {
  const [session, setSession] = React.useState(undefined);
  const [splashTermine, setSplashTermine] = React.useState(!isMobile);

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

  // Tracking présence : enregistre le jour courant (1 ligne max par jour par usager, RLS limite à sa propre ligne)
  React.useEffect(() => {
    if (!session?.user?.id) return;
    const aujourdHui = new Date().toISOString().split('T')[0];
    supabase
      .from('presence_jours')
      .upsert({ user_id: session.user.id, date: aujourdHui }, { onConflict: 'user_id,date', ignoreDuplicates: true })
      .then(() => {});
  }, [session?.user?.id]);

  // Présence "en ligne" : heartbeat périodique dans la table `en_ligne`, lu par Admin
  // pour le compteur live. Remplace l'ancienne approche Supabase Realtime Presence
  // (abandonnée — track() fonctionnait mais presenceState() restait vide côté lecture).
  React.useEffect(() => {
    if (!session?.user?.id) return;
    const envoyerHeartbeat = () => {
      supabase
        .from('en_ligne')
        .upsert({ user_id: session.user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .then(() => {});
    };
    envoyerHeartbeat(); // immédiat à la connexion
    const interval = setInterval(envoyerHeartbeat, 20000); // toutes les 20s — sous le seuil de 60s utilisé côté Admin
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Mobile : splash screen pendant le chargement
  if (isMobile && !splashTermine) return (
    <SplashScreen onTermine={() => setSplashTermine(true)} />
  );

  // Desktop : fond noir simple pendant le chargement Supabase
  if (session === undefined) return (
    <div style={{ background: '#000', minHeight: '100vh' }} />
  );

  return (
    <PanierProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!session ? <Connexion /> : <Navigate to="/accueil" />} />
          <Route path="/inscription" element={!session ? <Inscription /> : <Navigate to="/accueil" />} />
          <Route path="/selection" element={<RouteSelection session={session} />} />
          <Route path="/catalogue" element={session ? <Catalogue /> : <Navigate to="/" />} />
          <Route path="/livres" element={session ? <Livres /> : <Navigate to="/" />} />
          <Route path="/livres/:id" element={session ? <Livres /> : <Navigate to="/" />} />
          <Route path="/mon-compte" element={session ? <MonCompte /> : <Navigate to="/" />} />
          <Route path="/presentation" element={session ? <Presentation /> : <Navigate to="/" />} />
          <Route path="/pensees" element={session ? <Pensees /> : <Navigate to="/" />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/accueil" element={session ? <Accueil /> : <Navigate to="/" />} />
          <Route path="/panier" element={session ? <Panier /> : <Navigate to="/" />} />
          <Route path="/admin-kt2024" element={<Admin />} />
        </Routes>
        <ZoneCadeauAnniversaire session={session} />
        <ZoneNotifications session={session} />
        <BannerePWA />
      </BrowserRouter>
    </PanierProvider>
  );
}

export default App;