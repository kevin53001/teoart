import { supabase } from './supabase'

// Canal de présence unique pour tout l'onglet/client — évite qu'App.js (track)
// et Admin.js (écoute) ne rejoignent deux fois le même topic Realtime en parallèle,
// ce qui provoque un conflit silencieux côté Supabase.
let channel = null
let subscribed = false
let callbacksEnAttente = []

export function getPresenceChannel(presenceKey) {
  if (!channel) {
    console.log('[presence] création canal, key=', presenceKey)
    channel = presenceKey
      ? supabase.channel('online-users', { config: { presence: { key: presenceKey } } })
      : supabase.channel('online-users')

    channel.subscribe((status) => {
      console.log('[presence] statut canal online-users:', status)
      if (status === 'SUBSCRIBED') {
        subscribed = true
        callbacksEnAttente.forEach(cb => cb())
        callbacksEnAttente = []
      }
    })
  } else {
    console.log('[presence] canal déjà existant, réutilisation (key demandée ignorée si déjà créé)=', presenceKey)
  }
  return channel
}

// Exécute cb dès que le canal est abonné (immédiatement si déjà abonné)
export function onPresenceSubscribed(cb) {
  if (subscribed) cb()
  else callbacksEnAttente.push(cb)
}
