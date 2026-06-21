const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

// Variables d'env à ajouter dans Vercel (Settings → Environment Variables) :
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ex: mailto:contact@kevinteoart.fr)
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (probablement déjà présentes,
// vérifier les noms exacts utilisés dans tes autres fonctions api/*.js)

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { userId, userIds, titre, message, url, tag } = req.body || {};
    const cibles = userIds && Array.isArray(userIds) ? userIds : (userId ? [userId] : null);

    if (!cibles || cibles.length === 0) {
      return res.status(400).json({ error: 'userId ou userIds requis' });
    }
    if (!titre || !message) {
      return res.status(400).json({ error: 'titre et message requis' });
    }

    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .in('user_id', cibles);

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ envoyés: 0, message: 'Aucun abonnement actif pour ces utilisateurs' });
    }

    const payload = JSON.stringify({ titre, message, url: url || '/accueil', tag });

    const resultats = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
          },
          payload
        )
      )
    );

    // Nettoyage : si un endpoint est mort (410/404), on le retire de la base
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
    return res.status(200).json({ envoyés, total: subscriptions.length, endpointsSupprimés: morts.length });
  } catch (e) {
    console.error('Erreur send-notification:', e);
    return res.status(500).json({ error: e.message });
  }
};
