import { supabase } from './supabase'

// Canal de présence unique pour tout l'onglet/client — évite qu'App.js (track)
// et Admin.js (écoute) ne rejoignent deux fois le même topic Realtime en parallèle.
let channel = null
let subscribed = false
let onSubscribedCbs = []
let onSyncCbs = []

function ensureChannel(presenceKey) {
  if (!channel) {
    channel = presenceKey
      ? supabase.channel('online-users', { config: { presence: { key: presenceKey } } })
      : supabase.channel('online-users')

    channel.on('presence', { event: 'sync' }, () => {
      onSyncCbs.forEach(cb => cb())
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        subscribed = true
        onSubscribedCbs.forEach(cb => cb())
        onSubscribedCbs = []
      }
    })
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

// Exécute cb à chaque sync (et immédiatement si déjà synchronisé une 1ère fois)
export function onPresenceSync(cb) {
  ensureChannel()
  onSyncCbs.push(cb)
  if (subscribed) cb()
}
