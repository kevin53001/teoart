import React from 'react';
import { supabase } from './supabase';
import { estCompatibleNotifications, activerNotifications, aSouscriptionActive } from './pushNotifications';

const DELAI_AFFICHAGE = 18000; // 18s de visite avant la proposition

// Bannière affichée UNE SEULE FOIS dans la vie du compte, et uniquement sur
// Android navigateur classique (les iPhone n'y ont jamais accès, choix assumé).
// Si l'utilisateur quitte le site avant le délai, rien n'est enregistré :
// elle réapparaîtra donc normalement à la prochaine visite, jusqu'à ce
// qu'il accepte ou refuse une fois pour de bon.
export default function BanniereNotifications({ session }) {
  const [visible, setVisible] = React.useState(false);
  const [etape, setEtape] = React.useState('proposition'); // 'proposition' | 'merci' | 'refuse'
  const [pretAAfficher, setPretAAfficher] = React.useState(false);

  React.useEffect(() => {
    if (!session?.user?.id) return;
    if (!estCompatibleNotifications()) return;

    let annule = false;
    (async () => {
      const { data } = await supabase
        .from('profils')
        .select('notif_banniere_vue')
        .eq('id', session.user.id)
        .single();
      if (annule || data?.notif_banniere_vue) return;

      // Déjà abonné par un autre biais (ex: activé depuis Mon Compte avant
      // d'avoir vu la bannière) → on marque comme vu sans rien montrer.
      const dejaSouscrit = await aSouscriptionActive();
      if (dejaSouscrit) {
        await supabase.from('profils').update({ notif_banniere_vue: true }).eq('id', session.user.id);
        return;
      }
      if (!annule) setPretAAfficher(true);
    })();

    return () => { annule = true; };
  }, [session?.user?.id]);

  React.useEffect(() => {
    if (!pretAAfficher) return;
    const t = setTimeout(() => setVisible(true), DELAI_AFFICHAGE);
    return () => clearTimeout(t);
  }, [pretAAfficher]);

  const marquerVue = async () => {
    await supabase.from('profils').update({ notif_banniere_vue: true }).eq('id', session.user.id);
  };

  const handleAccepter = async () => {
    const resultat = await activerNotifications(session.user.id);
    if (resultat !== 'activé') await marquerVue(); // activerNotifications le fait déjà en cas de succès
    setEtape(resultat === 'activé' ? 'merci' : 'refuse');
    setTimeout(() => setVisible(false), 4000);
  };

  const handleRefuser = async () => {
    await marquerVue();
    setEtape('refuse');
    setTimeout(() => setVisible(false), 4000);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 1500, width: '92%', maxWidth: '380px',
      background: 'linear-gradient(135deg, rgba(0,25,20,0.97), rgba(0,12,10,0.97))',
      border: '1px solid rgba(29,214,160,0.4)', borderRadius: '14px',
      padding: '16px 18px', boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 16px rgba(29,214,160,0.15)',
      display: 'flex', flexDirection: 'column', gap: '10px',
      animation: 'slideUpBanniereNotif 0.4s ease-out',
    }}>
      <style>{`
        @keyframes slideUpBanniereNotif {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {etape === 'proposition' && (
        <>
          <p style={{ color: '#1dd6a0', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
            🔔 Activer les notifications ?
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
            Sois prévenu en direct des réponses, nouveautés et infos importantes de Kevin Teo'Art.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={handleRefuser} style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px', padding: '9px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer',
            }}>Non merci</button>
            <button onClick={handleAccepter} style={{
              flex: 1, background: 'linear-gradient(135deg, rgba(29,214,160,0.25), rgba(0,170,120,0.15))',
              border: '1px solid rgba(29,214,160,0.5)', borderRadius: '8px', padding: '9px',
              color: '#1dd6a0', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
            }}>Activer</button>
          </div>
        </>
      )}

      {etape === 'merci' && (
        <p style={{ color: '#1dd6a0', fontSize: '13px', textAlign: 'center', margin: 0 }}>
          ✓ Notifications activées, merci !
        </p>
      )}

      {etape === 'refuse' && (
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          Pas de souci. Tu pourras les activer plus tard dans<br />
          <span style={{ color: '#1dd6a0' }}>Mon Compte → Mes infos</span>.
        </p>
      )}
    </div>
  );
}
