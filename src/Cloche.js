import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import PopupColoriages from './PopupColoriages';
const R2 = 'https://images.kevinteoart.fr';

const CONFIG_TYPE = {
  nouvelle_illustration:    { couleur: '#1D9E75', icone: `${R2}/site/pastille_categories.png` },
  nouveau_livre_pdf:        { couleur: '#7F77DD', icone: `${R2}/site/pastille_livres.png`     },
  nouveau_livre_relie:      { couleur: '#7F77DD', icone: `${R2}/site/pastille_livres.png`     },
  nouveau_recueil_pdf:      { couleur: '#D85A30', icone: `${R2}/site/pastille_livres.png`     },
  nouveau_recueil_relie:    { couleur: '#D85A30', icone: `${R2}/site/pastille_livres.png`     },
  like_coloriage:           { couleur: '#D4537E', icone: `${R2}/site/pastille_colos.png`      },
  commentaire_coloriage:    { couleur: '#D4537E', icone: `${R2}/site/pastille_colos.png`      },
  nouveau_coloriage_partage:{ couleur: '#D4537E', icone: `${R2}/site/pastille_colos.png`      },
  badge_obtenu:             { couleur: '#639922', icone: `${R2}/site/pastille_mon_compte.png` },
  nouvelle_pensee:          { couleur: '#BA7517', icone: `${R2}/site/pastille_pensees.png`    },
  like_pensee:              { couleur: '#BA7517', icone: `${R2}/site/pastille_pensees.png`    },
  commentaire_pensee:       { couleur: '#BA7517', icone: `${R2}/site/pastille_pensees.png`    },
  nouvelle_presentation:    { couleur: '#378ADD', icone: `${R2}/site/pastille_logomini.png`   },
  notif_admin:              { couleur: '#F5C84C', icone: `${R2}/site/Logo.png`                },
};

function dateRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const j    = Math.floor(diff / 86400000);
  if (min < 2)  return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  if (h < 24)   return `il y a ${h}h`;
  if (j < 7)    return `il y a ${j}j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function texteNotif(n) {
  const c = n.contenu || {};
  const nb = c.count || 1;
  switch (n.type) {
    case 'nouvelle_illustration':
      return nb === 1
        ? `Kevin a encore passé une nuit blanche`
        : `${nb} illustrations ont envahi le catalogue`;
    case 'nouveau_livre_pdf':
      return `Un nouveau livre PDF est sorti du four : ${c.nom || '...'}`;
    case 'nouveau_livre_relie':
      return `Amazon est prêt à te livrer le nouveau livre ${c.nom || '...'}, à un prix défiant toute concurrence. Ça te tente ?`;
    case 'nouveau_recueil_pdf':
      return `Un nouveau recueil PDF est sorti du four : ${c.nom || '...'}`;
    case 'nouveau_recueil_relie':
      return `Amazon est prêt à te livrer le nouveau recueil ${c.nom || '...'}, à un prix défiant toute concurrence. Ça te tente ?`;
    case 'like_coloriage':
      return nb === 1
        ? `${c.pseudo || 'Quelqu\u2019un'} a craqué pour ton coloriage`
        : `Tes coloriages font un carton dans la communauté`;
    case 'commentaire_coloriage':
      return nb === 1
        ? `${c.pseudo || 'Quelqu\u2019un'} a commenté ton coloriage`
        : `Tes coloriages font un carton dans la communauté`;
    case 'badge_obtenu':
      return `Badge ${c.niveau} dans la poche !${c.remise ? ` -${c.remise}% en cadeau (sur ta prochaine commande)` : ''}`;
    case 'nouvelle_pensee':
      return nb === 1
        ? `Nouvelle pensée dans la nature`
        : `${nb} nouvelles pensées à découvrir`;
    case 'like_pensee':
      return nb === 1
        ? `${c.pseudo || 'Quelqu\u2019un'} a aimé ta pensée`
        : `Tes pensées font un carton dans la communauté`;
    case 'commentaire_pensee':
      return nb === 1
        ? `${c.pseudo || 'Quelqu\u2019un'} a commenté ta pensée`
        : `Tes pensées font un carton dans la communauté`;
    case 'nouvelle_presentation':
      return `Kevin a retouché sa vitrine : ${c.derniere_titre || '...'}`;
    case 'notif_admin':
      return c.texte || 'Message de Kevin Teo\u2019Art';
    case 'nouveau_coloriage_partage':
      return nb === 1
        ? `Les crayons ont chauffé dans la communauté`
        : `${nb} coloristes ont sorti leurs meilleures couleurs`;
    default:
      return 'Nouvelle notification';
  }
}

// ── Ligne notif ──────────────────────────────────────────────────────────────
function LigneNotif({ notif, onClic }) {
  const cfg = CONFIG_TYPE[notif.type] || { couleur: '#fff', icone: '•' };
  return (
    <div
      onClick={() => onClic(notif)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <img src={cfg.icone} alt="" style={{ width: '22px', height: '22px', flexShrink: 0, marginTop: '1px', objectFit: 'contain' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.5', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {texteNotif(notif)}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '3px 0 0' }}>{dateRelative(notif.created_at)}</p>
      </div>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.couleur, flexShrink: 0, marginTop: '5px', boxShadow: `0 0 6px ${cfg.couleur}` }} />
    </div>
  );
}

// ── Composant principal Cloche ───────────────────────────────────────────────
function Cloche({ hidden = false }) {
  const navigate = useNavigate();
  const [notifs, setNotifs]           = useState([]);
  const [ouvert, setOuvert]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [userId, setUserId]           = useState(null);
  const [userPseudo, setUserPseudo]   = useState('');
  const [popupColos, setPopupColos]   = useState(null); // null | { ids: [], idxDepart: 0 }
  const dropdownRef = useRef(null);
  const clocheRef   = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
      const { data: p } = await supabase.from('profils').select('pseudo, created_at, dernier_vu_coloriages_partages').eq('id', data.user.id).single();
      if (p) {
        setUserPseudo(p.pseudo || '');
        // Détecter nouveaux coloriages partagés par la communauté
        const refC = p.dernier_vu_coloriages_partages || p.created_at;
        if (refC) {
          const { data: nouveauxColos } = await supabase
            .from('coloriages')
            .select('id')
            .not('image_url', 'is', null)
            .neq('user_id', data.user.id)
            .gt('created_at', refC);
          if (nouveauxColos && nouveauxColos.length > 0) {
            await supabase.from('notifications').delete()
              .eq('user_id', data.user.id)
              .eq('type', 'nouveau_coloriage_partage')
              .eq('lu', false);
            await supabase.from('notifications').insert({
              user_id: data.user.id,
              type: 'nouveau_coloriage_partage',
              contenu: { count: nouveauxColos.length },
              lu: false,
            });
          }
        }
      }
    });
  }, []);

  const chargerNotifs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('lu', false)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifs(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { chargerNotifs(); }, [chargerNotifs]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(chargerNotifs, 60000);
    return () => clearInterval(interval);
  }, [userId, chargerNotifs]);

  useEffect(() => {
    if (!ouvert) return;
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        clocheRef.current   && !clocheRef.current.contains(e.target)
      ) setOuvert(false);
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [ouvert]);

  const supprimerNotif = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const toutSupprimer = async () => {
    if (!userId) return;
    await supabase.from('notifications').delete().eq('user_id', userId).eq('lu', false);
    setNotifs([]);
  };

  const handleClicNotif = async (notif) => {
    await supprimerNotif(notif.id);
    setOuvert(false);

    const maintenant = new Date().toISOString();

    switch (notif.type) {
      case 'nouvelle_illustration':
        navigate('/catalogue', { state: { filtreNouveautes: true } });
        break;
      case 'nouveau_livre_pdf':
      case 'nouveau_livre_relie':
      case 'nouveau_recueil_pdf':
      case 'nouveau_recueil_relie':
        navigate('/livres', { state: { ouvrirItem: notif.contenu?.item_id, itemType: notif.contenu?.item_type } });
        break;
      case 'like_coloriage':
      case 'commentaire_coloriage': {
        // Ouvre PopupColoriages filtrée sur les coloriages notifiés
        const ids = notif.contenu?.coloriage_ids || (notif.contenu?.coloriage_id ? [notif.contenu.coloriage_id] : []);
        const dernierIdx = ids.length > 0 ? ids.length - 1 : 0;
        setOuvert(false);
        setPopupColos({ ids, idxDepart: dernierIdx });
        break;
      }
      case 'badge_obtenu':
        navigate('/mon-compte', { state: { onglet: 'collection' } });
        break;
      case 'nouvelle_pensee':
        if (userId) {
          await supabase.from('profils').update({ dernier_vu_pensees: maintenant }).eq('id', userId);
        }
        navigate('/pensees');
        break;
      case 'like_pensee':
      case 'commentaire_pensee':
        navigate('/pensees', { state: { penseeId: notif.contenu?.pensee_id } });
        break;
      case 'nouvelle_presentation':
        if (userId) {
          await supabase.from('profils').update({ dernier_vu_presentation: maintenant }).eq('id', userId);
        }
        navigate('/presentation');
        break;
      case 'nouveau_coloriage_partage':
        if (userId) {
          await supabase.from('profils').update({ dernier_vu_coloriages_partages: maintenant }).eq('id', userId);
        }
        setPopupColos({ ids: [], idxDepart: 0 }); // ids vide = tous les coloriages
        break;
      case 'notif_admin':
        // Pas de navigation associée — la notif est juste lue puis supprimée (déjà fait en amont)
        break;
      default:
        break;
    }
  };

  const nbNonLues = notifs.length;

  if (hidden) return null;

  return (
    <>
      <style>{`
        @keyframes cloche-swing {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(18deg); }
          30%      { transform: rotate(-14deg); }
          45%      { transform: rotate(10deg); }
          60%      { transform: rotate(-6deg); }
          75%      { transform: rotate(3deg); }
        }
        .cloche-active { animation: cloche-swing 1.2s ease-in-out infinite; transform-origin: top center; }
        .cloche-btn:hover { opacity: 0.8; }
        .notif-dropdown::-webkit-scrollbar { width: 4px; }
        .notif-dropdown::-webkit-scrollbar-track { background: transparent; }
        .notif-dropdown::-webkit-scrollbar-thumb { background: rgba(0,212,212,0.3); border-radius: 4px; }
      `}</style>

      {/* Bouton cloche */}
      <div
        ref={clocheRef}
        className="cloche-btn"
        onClick={() => { setOuvert(v => !v); if (!ouvert) chargerNotifs(); }}
        style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 1000, cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span className={nbNonLues > 0 ? 'cloche-active' : ''} style={{ fontSize: '22px', display: 'inline-block' }}>🔔</span>
        {nbNonLues > 0 && (
          <div style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#ff3eb5', borderRadius: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#fff', padding: '0 4px', boxShadow: '0 0 8px #ff3eb580', border: '1.5px solid #000' }}>
            {nbNonLues > 99 ? '99+' : nbNonLues}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {ouvert && ReactDOM.createPortal(
        <div ref={dropdownRef} style={{ position: 'fixed', top: '44px', right: '12px', width: '300px', maxHeight: '420px', zIndex: 9999, background: 'rgba(8,16,20,0.97)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* En-tête */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(0,212,212,0.08), rgba(0,212,212,0.03))', flexShrink: 0 }}>
            <span style={{ color: '#00d4d4', fontSize: '13px', fontWeight: 700 }}>
              Notifications{nbNonLues > 0 ? ` (${nbNonLues})` : ''}
            </span>
            {nbNonLues > 0 && (
              <button onClick={toutSupprimer}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
                onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
                Tout effacer
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="notif-dropdown" style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>Chargement…</div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '10px' }}>🔕</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Aucune notification</p>
              </div>
            ) : (
              notifs.map(n => <LigneNotif key={n.id} notif={n} onClic={handleClicNotif} />)
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Popup coloriages partagés */}
      {popupColos && (
        <PopupColoriages
          userId={userId}
          userPseudo={userPseudo}
          filtreIds={popupColos.ids && popupColos.ids.length > 0 ? popupColos.ids : null}
          idxDepart={popupColos.idxDepart || 0}
          onClose={() => setPopupColos(null)}
        />
      )}
    </>
  );
}

