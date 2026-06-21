const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

// Variables d'env à ajouter dans Vercel (Settings → Environment Variables) :
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ex: mailto:contact@kevinteoart.fr)
// SUPABASE_URL, SUPABASE_SERVICE_KEY (déjà en place, mêmes noms que delete.js)
// SUPABASE_WEBHOOK_SECRET (nouveau — clé partagée pour vérifier que l'appel
// vient bien du webhook Supabase et pas de n'importe où sur internet)

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Les 5 seuls types qui déclenchent une notif push (choix de Kevin) ──
// Les autres types présents dans la table `notifications` (likes, commentaires,
// badges...) continuent de fonctionner normalement pour la cloche in-app,
// mais ne déclenchent jamais de push.
function traduireNotif(record) {
  const c = record.contenu || {};
  const nb = c.count || 1;

  switch (record.type) {
    case 'nouvelle_illustration':
      return {
        titre: 'Nouvelle illustration',
        message: nb === 1 ? 'Kevin a encore passé une nuit blanche' : `${nb} illustrations ont envahi le catalogue`,
        url: '/catalogue',
      };
    case 'nouveau_livre_pdf':
    case 'nouveau_livre_relie':
      return {
        titre: 'Nouveau livre disponible',
        message: `Un nouveau livre est sorti du four : ${c.nom || '...'}`,
        url: '/livres',
      };
    case 'nouveau_recueil_pdf':
    case 'nouveau_recueil_relie':
      return {
        titre: 'Nouveau recueil disponible',
        message: `Un nouveau recueil est sorti du four : ${c.nom || '...'}`,
        url: '/livres',
      };
    case 'nouvelle_pensee':
      return {
        titre: 'Nouvelle pensée',
        message: nb === 1 ? 'Nouvelle pensée dans la nature' : `${nb} nouvelles pensées à découvrir`,
        url: '/pensees',
      };
    case 'notif_admin':
      return {
        titre: "Kevin Teo'Art",
        message: c.texte || "Message de Kevin Teo'Art",
        url: c.url || '/accueil',
      };
    default:
      return null; // tous les autres types : pas de push
  }
}

async function envoyerPush(cibles, titre, message, url, tag) {
  const { data: subscriptions, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .in('user_id', cibles);

  if (error) throw error;
  if (!subscriptions || subscriptions.length === 0) {
    return { envoyés: 0, total: 0, endpointsSupprimés: 0 };
  }

  const payload = JSON.stringify({ titre, message, url: url || '/accueil', tag });

  const resultats = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
        payload
      )
    )
  );

  const morts = [];
  resultats.forEach((r, i) => {
    if (r.status === 'rejected' && (r.reason?.statusCode === 410 || r.reason?.statusCode === 404)) {
      morts.push(subscriptions[i].endpoint);
    }
  });
  if (morts.length > 0) {
    await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', morts);
  }

  const envoyés = resultats.filter(r => r.status === 'fulfilled').length;
  return { envoyés, total: subscriptions.length, endpointsSupprimés: morts.length };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const body = req.body || {};

    // ── Cas 1 : appel webhook Supabase (insert dans la table notifications) ──
    // Format envoyé par Supabase : { type: 'INSERT', table: 'notifications', record: {...}, old_record: null }
    if (body.table === 'notifications' && body.record) {
      const secretAttendu = process.env.SUPABASE_WEBHOOK_SECRET;
      const secretRecu = req.headers['x-webhook-secret'];
      if (secretAttendu && secretRecu !== secretAttendu) {
        return res.status(401).json({ error: 'Secret webhook invalide' });
      }

      const record = body.record;
      const traduit = traduireNotif(record);
      if (!traduit) {
        // Type non poussé en notif (like, commentaire, badge...) — on ignore silencieusement
        return res.status(200).json({ ignoré: true, type: record.type });
      }
      if (!record.user_id) {
        return res.status(200).json({ ignoré: true, raison: 'pas de user_id sur la ligne' });
      }

      // Cas particulier "nouvelle_pensee" : ne pousser que si c'est une pensée
      // de Kevin (table pensees, colonne source = 'kevin'), pas celles des autres
      // utilisateurs. On va vérifier via l'id de la pensée présent dans contenu.derniere_id.
      if (record.type === 'nouvelle_pensee') {
        const derniereId = record.contenu?.derniere_id;
        if (!derniereId) {
          return res.status(200).json({ ignoré: true, raison: 'derniere_id manquant dans contenu' });
        }
        const { data: pensee, error: erreurPensee } = await supabaseAdmin
          .from('pensees')
          .select('source')
          .eq('id', derniereId)
          .single();
        if (erreurPensee || !pensee || pensee.source !== 'kevin') {
          return res.status(200).json({ ignoré: true, raison: 'pensee non publiée par kevin' });
        }
      }

      const resultat = await envoyerPush([record.user_id], traduit.titre, traduit.message, traduit.url, record.type);
      return res.status(200).json(resultat);
    }

    // ── Cas 2 : appel manuel direct (test, ou futur usage ponctuel) ──
    const { userId, userIds, titre, message, url, tag } = body;
    const cibles = userIds && Array.isArray(userIds) ? userIds : (userId ? [userId] : null);

    if (!cibles || cibles.length === 0) {
      return res.status(400).json({ error: 'userId ou userIds requis' });
    }
    if (!titre || !message) {
      return res.status(400).json({ error: 'titre et message requis' });
    }

    const resultat = await envoyerPush(cibles, titre, message, url, tag);
    return res.status(200).json(resultat);
  } catch (e) {
    console.error('Erreur send-notification:', e);
    return res.status(500).json({ error: e.message });
  }
};