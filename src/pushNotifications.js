import { supabase } from './supabase';

// Clé publique VAPID — doit correspondre EXACTEMENT à la clé privée utilisée
// côté serveur dans api/send-notification.js. Voir push_subscriptions.sql
// et les instructions de déploiement pour la configuration des variables d'env.
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

// Détecte les appareils compatibles : Android, navigateur classique, avec
// support de la Push API. Choix assumé : iOS est exclu entièrement (Apple
// n'autorise les notifs web que pour les PWA installées) — on ne montre
// donc jamais ni bannière ni bouton sur iOS, par souci de cohérence avec
// l'engagement "tant pis pour les iPhone qui n'installent pas".
export function estCompatibleNotifications() {
  const ua = navigator.userAgent;
  const estAndroid = /Android/i.test(ua);
  const supportePush = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  return estAndroid && supportePush;
}

export function permissionBloquee() {
  return 'Notification' in window && Notification.permission === 'denied';
}

export function permissionAccordee() {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Vérifie si cet appareil a déjà une subscription push active.
export async function aSouscriptionActive() {
  if (!estCompatibleNotifications()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

// Demande la permission navigateur, crée la subscription push et la
// sauvegarde en base. Retourne 'activé' | 'refusé' | 'incompatible' | 'erreur'.
export async function activerNotifications(userId) {
  if (!estCompatibleNotifications()) return 'incompatible';
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'refusé';

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const { endpoint, keys } = subscription.toJSON();
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint,
      keys_p256dh: keys.p256dh,
      keys_auth: keys.auth,
    }, { onConflict: 'endpoint' });

    if (error) { console.error('Erreur sauvegarde subscription push:', error); return 'erreur'; }

    // Marque la bannière comme vue dans tous les cas dès qu'une activation
    // réussit, qu'elle vienne de la bannière ou directement de Mon Compte.
    await supabase.from('profils').update({ notif_banniere_vue: true }).eq('id', userId);

    return 'activé';
  } catch (e) {
    console.error('Erreur activation notifications:', e);
    return 'erreur';
  }
}
