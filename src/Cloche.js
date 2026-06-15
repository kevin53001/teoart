import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

// ── Libellés et couleurs par type ────────────────────────────────────────────
const CONFIG_TYPE = {
  nouvelle_illustration:  { couleur: '#00d4d4', icone: '🖼',  label: 'Nouvelles illustrations' },
  nouveau_livre_pdf:      { couleur: '#a78bfa', icone: '📚', label: 'Nouveau livre PDF' },
  nouveau_livre_relie:    { couleur: '#a78bfa', icone: '📖', label: 'Nouveau livre relié' },
  like_coloriage:         { couleur: '#ff3eb5', icone: '❤️',  label: "J'aime sur ton coloriage" },
  commentaire_coloriage:  { couleur: '#ffd250', icone: '💬', label: 'Commentaire sur ton coloriage' },
  like_pensee:            { couleur: '#ff3eb5', icone: '❤️',  label: "J'aime sur une pensée" },
  commentaire_pensee:     { couleur: '#ffd250', icone: '💬', label: 'Commentaire sur une pensée' },
  badge_obtenu:           { couleur: '#00cc66', icone: '🏆', label: 'Badge obtenu !' },
  nouvelle_pensee:        { couleur: '#a78bfa', icone: '✨',  label: 'Nouvelle pensée' },
  nouvelle_presentation:  { couleur: '#00d4d4', icone: '🌟', label: 'Nouvelle présentation' },
};

// ── Formater une date relative ───────────────────────────────────────────────
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

// ── Grouper les notifs coloriages/pensées/illustrations par item ─────────────
function grouperNotifs(notifs) {
  const groupes = {};
  const ordre   = [];

  notifs.forEach(n => {
    const cle_coloriage = ['like_coloriage', 'commentaire_coloriage'].includes(n.type) && n.contenu?.coloriage_id
      ? `coloriage_${n.contenu.coloriage_id}` : null;
    const cle_pensee    = ['like_pensee', 'commentaire_pensee'].includes(n.type) && n.contenu?.pensee_id
      ? `pensee_${n.contenu.pensee_id}` : null;
    const cle_illus     = n.type === 'nouvelle_illustration' ? 'groupe_illus' : null;
    const cle_pres_pen  = ['nouvelle_pensee', 'nouvelle_presentation'].includes(n.type) ? 'groupe_pres_pen' : null;

    const cle = cle_coloriage || cle_pensee || cle_illus || cle_pres_pen || n.id;

    if (!groupes[cle]) {
      groupes[cle] = {
        cle,
        items: [],
        type_groupe: cle_coloriage ? 'coloriage' : cle_pensee ? 'pensee' : cle_illus ? 'illustrations' : cle_pres_pen ? 'pres_pen' : 'single',
      };
      ordre.push(cle);
    }
    groupes[cle].items.push(n);
  });

  return ordre.map(cle => groupes[cle]);
}

// ── Ligne notif simple ───────────────────────────────────────────────────────
function LigneNotif({ notif, onClic }) {
  const cfg = CONFIG_TYPE[notif.type] || { couleur: '#fff', icone: '•' };
  let texte = '';

  if (notif.type === 'nouvelle_illustration')    texte = notif.contenu?.nom || 'Nouvelle illustration publiée';
  else if (notif.type === 'nouveau_livre_pdf')   texte = `"${notif.contenu?.nom || 'Livre'}" disponible en PDF`;
  else if (notif.type === 'nouveau_livre_relie') texte = `"${notif.contenu?.nom || 'Livre'}" disponible en version reliée`;
  else if (notif.type === 'like_coloriage')      texte = `${notif.contenu?.from_user || 'Quelqu\'un'} a aimé ton coloriage`;
  else if (notif.type === 'commentaire_coloriage') {
    texte = `${notif.contenu?.from_user || 'Quelqu\'un'} a commenté ton coloriage`;
    if (notif.contenu?.texte) texte += ` : "${notif.contenu.texte}"`;
  }
  else if (notif.type === 'like_pensee')         texte = `${notif.contenu?.from_user || 'Quelqu\'un'} a aimé "${notif.contenu?.titre || 'une pensée'}"`;
  else if (notif.type === 'commentaire_pensee') {
    texte = `${notif.contenu?.from_user || 'Quelqu\'un'} a commenté "${notif.contenu?.titre || 'une pensée'}"`;
    if (notif.contenu?.texte) texte += ` : "${notif.contenu.texte}"`;
  }
  else if (notif.type === 'badge_obtenu') {
    texte = `Badge ${notif.contenu?.badge_type === 'fan' ? 'Fan' : 'Coloriste'} ${notif.contenu?.niveau} obtenu !`;
    if (notif.contenu?.remise) texte += ` -${notif.contenu.remise}% sur ta prochaine commande`;
  }
  else if (notif.type === 'nouvelle_pensee')        texte = `Nouvelle pensée : "${notif.contenu?.titre || '...'}"`;
  else if (notif.type === 'nouvelle_presentation')  texte = `Nouvelle présentation : "${notif.contenu?.titre || '...'}"`;
  else texte = 'Nouvelle notification';

  return (
    <div
      onClick={() => onClic(notif)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{cfg.icone}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.5', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{texte}</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '3px 0 0' }}>{dateRelative(notif.created_at)}</p>
      </div>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.couleur, flexShrink: 0, marginTop: '5px', boxShadow: `0 0 6px ${cfg.couleur}` }} />
    </div>
  );
}

// ── Groupe accordéon ─────────────────────────────────────────────────────────
function GroupeNotif({ groupe, onClicItem }) {
  const [ouvert, setOuvert] = useState(false);
  const { items, type_groupe } = groupe;
  const premier = items[0];
  const cfg = CONFIG_TYPE[premier.type] || { couleur: '#fff', icone: '•' };

  let titreGroupe = '';
  let iconeGroupe = cfg.icone;

  if (type_groupe === 'coloriage') {
    const nb_likes = items.filter(i => i.type === 'like_coloriage').length;
    const nb_comm  = items.filter(i => i.type === 'commentaire_coloriage').length;
    const parties  = [];
    if (nb_likes) parties.push(`${nb_likes} j'aime`);
    if (nb_comm)  parties.push(`${nb_comm} commentaire${nb_comm > 1 ? 's' : ''}`);
    titreGroupe = `${parties.join(' et ')} sur ton coloriage`;
    iconeGroupe = '🎨';
  } else if (type_groupe === 'pensee') {
    const nb_likes = items.filter(i => i.type === 'like_pensee').length;
    const nb_comm  = items.filter(i => i.type === 'commentaire_pensee').length;
    const parties  = [];
    if (nb_likes) parties.push(`${nb_likes} j'aime`);
    if (nb_comm)  parties.push(`${nb_comm} commentaire${nb_comm > 1 ? 's' : ''}`);
    titreGroupe = `${parties.join(' et ')} sur "${premier.contenu?.titre || 'une pensée'}"`;
    iconeGroupe = '✨';
  } else if (type_groupe === 'illustrations') {
    titreGroupe = `${items.length} nouvelle${items.length > 1 ? 's' : ''} illustration${items.length > 1 ? 's' : ''} publiée${items.length > 1 ? 's' : ''}`;
    iconeGroupe = '🖼';
  } else if (type_groupe === 'pres_pen') {
    titreGroupe = `${items.length} nouveau${items.length > 1 ? 'x' : ''} contenu${items.length > 1 ? 's' : ''} (pensées / présentations)`;
    iconeGroupe = '✨';
  }

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        onClick={() => items.length === 1 ? onClicItem(items[0]) : setOuvert(v => !v)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', cursor: 'pointer', transition: 'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{iconeGroupe}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>{titreGroupe}</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '3px 0 0' }}>{dateRelative(items[0].created_at)}</p>
        </div>
        {items.length > 1 && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', flexShrink: 0, marginTop: '2px', transition: 'transform .2s', transform: ouvert ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>›</span>
        )}
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.couleur, flexShrink: 0, marginTop: '5px', boxShadow: `0 0 6px ${cfg.couleur}` }} />
      </div>

      {ouvert && items.length > 1 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {items.map(notif => (
            <div
              key={notif.id}
              onClick={() => onClicItem(notif)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 14px 8px 30px', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '13px', flexShrink: 0 }}>{CONFIG_TYPE[notif.type]?.icone || '•'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
                  {(notif.type === 'like_coloriage' || notif.type === 'like_pensee')
                    ? `${notif.contenu?.from_user} a aimé`
                    : `${notif.contenu?.from_user} : "${notif.contenu?.texte || '...'}"`
                  }
                </p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', margin: '2px 0 0' }}>{dateRelative(notif.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────
function Cloche({ hidden = false }) {
  const navigate = useNavigate();
  const [notifs, setNotifs]   = useState([]);
  const [ouvert, setOuvert]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId]   = useState(null);
  const dropdownRef = useRef(null);
  const clocheRef   = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
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

  const supprimerPlusieurs = async (ids) => {
    await supabase.from('notifications').delete().in('id', ids);
    setNotifs(prev => prev.filter(n => !ids.includes(n.id)));
  };

  const toutSupprimer = async () => {
    if (!userId) return;
    await supabase.from('notifications').delete().eq('user_id', userId).eq('lu', false);
    setNotifs([]);
  };

  const handleClicNotif = async (notif) => {
    await supprimerNotif(notif.id);
    setOuvert(false);
    if (notif.type === 'nouvelle_illustration')
      navigate('/catalogue', { state: { filtreNouveautes: true } });
    else if (notif.type === 'nouveau_livre_pdf' || notif.type === 'nouveau_livre_relie')
      navigate('/livres', { state: { ouvrirItem: notif.contenu?.item_id, itemType: notif.contenu?.item_type } });
    else if (notif.type === 'like_coloriage' || notif.type === 'commentaire_coloriage')
      navigate('/mon-compte', { state: { onglet: 'coloriages', coloId: notif.contenu?.coloriage_id } });
    else if (notif.type === 'like_pensee' || notif.type === 'commentaire_pensee')
      navigate('/pensees', { state: { ouvrirPensee: notif.contenu?.pensee_id } });
    else if (notif.type === 'badge_obtenu')
      navigate('/mon-compte', { state: { onglet: 'collection' } });
    else if (notif.type === 'nouvelle_pensee')
      navigate('/pensees', { state: { ouvrirPensee: notif.contenu?.pensee_id } });
    else if (notif.type === 'nouvelle_presentation')
      navigate('/presentation');
  };

  const nbNonLues = notifs.length;
  const groupes   = grouperNotifs(notifs);

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
        <div ref={dropdownRef} style={{ position: 'fixed', top: '44px', right: '12px', width: '300px', maxHeight: '420px', zIndex: 9999, background: 'rgba(8,16,20,0.97)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,212,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* En-tête */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(0,212,212,0.08), rgba(0,212,212,0.03))', flexShrink: 0 }}>
            <span style={{ color: '#00d4d4', fontSize: '13px', fontWeight: 700 }}>
              Notifications{nbNonLues > 0 ? ` (${nbNonLues})` : ''}
            </span>
            {nbNonLues > 0 && (
              <button onClick={toutSupprimer} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
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
            ) : groupes.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '10px' }}>🔕</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Aucune notification</p>
              </div>
            ) : (
              groupes.map(groupe =>
                groupe.items.length === 1 && groupe.type_groupe === 'single'
                  ? <LigneNotif key={groupe.cle} notif={groupe.items[0]} onClic={handleClicNotif} />
                  : <GroupeNotif key={groupe.cle} groupe={groupe} onClicItem={handleClicNotif} />
              )
            )}
          </div>

        </div>,
        document.body
      )}
    </>
  );
}

export default Cloche;