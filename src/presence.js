import { supabase } from './supabase'

// Canal de présence unique pour tout l'onglet/client — évite qu'App.js (track)
// et Admin.js (écoute) ne rejoignent deux fois le même topic Realtime en parallèle.
// IMPORTANT : channel.on('presence', ...) doit être enregistré AVANT channel.subscribe(),
// donc tout le câblage des écouteurs se fait une seule fois ici, à la création.
let channel = null
let subscribed = false
let onSubscribedCbs = []
let onSyncCbs = []

function ensureChannel(presenceKey) {
  if (!channel) {
    console.log('[presence] création canal, key=', presenceKey)
    channel = presenceKey
      ? supabase.channel('online-users', { config: { presence: { key: presenceKey } } })
      : supabase.channel('online-users')

    channel.on('presence', { event: 'sync' }, () => {
      console.log('[presence] sync interne reçu, state =', channel.presenceState())
      onSyncCbs.forEach(cb => cb())
    })

    channel.subscribe((status) => {
      console.log('[presence] statut canal online-users:', status)
      if (status === 'SUBSCRIBED') {
        subscribed = true
        onSubscribedCbs.forEach(cb => cb())
        onSubscribedCbs = []
      }
    })
  } else if (presenceKey) {
    console.log('[presence] canal déjà existant, réutilisation (key demandée ignorée)=', presenceKey)
  }
  return channel
}

// Retourne le canal partagé (le crée si besoin). Le presenceKey n'est pris en compte
// que lors de la toute première création du canal dans cet onglet.
export function getPresenceChannel(presenceKey) {
  return ensureChannel(presenceKey)
}

// Exécute cb dès que le canal est abonné (immédiatement si déjà abonné)
export function onPresenceSubscribed(cb) {
  ensureChannel()
  if (subscribed) cb()
  else onSubscribedCbs.push(cb)
}

// Exécute cb à chaque sync (et immédiatement si le canal est déjà synchronisé une 1ère fois)
export function onPresenceSync(cb) {
  ensureChannel()
  onSyncCbs.push(cb)
  if (subscribed) cb()
}