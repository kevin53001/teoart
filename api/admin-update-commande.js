import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Envoi email Brevo
async function envoyerEmailBrevo(destinataire, sujet, contenuHtml) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: { name: "Kevin Teo'Art", email: 'kevinteoart@outlook.fr' },
      to: [{ email: destinataire }],
      subject: sujet,
      htmlContent: contenuHtml
    })
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Brevo error: ${err}`)
  }
}

function emailExpedition({ prenom, nom, titre, livreur, numero_suivi, lien_suivi, date_livraison_estimee, note_client }) {
  const ligneTransporteur = livreur ? `<p><strong>Transporteur :</strong> ${livreur}</p>` : ''
  const ligneNumero = numero_suivi ? `<p><strong>Numéro de suivi :</strong> ${numero_suivi}</p>` : ''
  const ligneLien = lien_suivi ? `<p><a href="${lien_suivi}" style="color:#0066cc">Suivre ma commande</a></p>` : ''
  const ligneDate = date_livraison_estimee ? `<p><strong>Livraison estimée :</strong> ${date_livraison_estimee}</p>` : ''
  const ligneNote = note_client ? `<p><em>${note_client}</em></p>` : ''

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222">
      <h2 style="color:#333">Votre commande est en route !</h2>
      <p>Bonjour ${prenom} ${nom},</p>
      <p>Votre exemplaire de <strong>${titre}</strong> a été expédié.</p>
      ${ligneTransporteur}
      ${ligneNumero}
      ${ligneLien}
      ${ligneDate}
      ${ligneNote}
      <p>Pour toute question, contactez-moi à <a href="mailto:kevinteoart@outlook.fr">kevinteoart@outlook.fr</a></p>
      <p>Merci pour votre confiance,<br><strong>Kevin Teo'Art</strong></p>
    </div>
  `
}

function emailLivraison({ prenom, nom, titre, note_client }) {
  const ligneNote = note_client ? `<p><em>${note_client}</em></p>` : ''
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222">
      <h2 style="color:#333">Votre commande est livrée !</h2>
      <p>Bonjour ${prenom} ${nom},</p>
      <p>Votre exemplaire de <strong>${titre}</strong> a bien été livré.</p>
      ${ligneNote}
      <p>J'espère qu'il vous plaira ! Pour toute question, contactez-moi à <a href="mailto:kevinteoart@outlook.fr">kevinteoart@outlook.fr</a></p>
      <p>Bonne lecture,<br><strong>Kevin Teo'Art</strong></p>
    </div>
  `
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const adminId = process.env.ADMIN_USER_ID
  const {
    userId,
    commande_article_id,
    statut,
    livreur,
    numero_suivi,
    lien_suivi,
    date_livraison_estimee,
    note_client
  } = req.body

  if (userId !== adminId) return res.status(403).json({ error: 'Accès refusé' })

  try {
    // Récupère l'article + infos client
    const { data: article, error: artErr } = await supabase
      .from('commandes_articles')
      .select('*, commandes(user_id, montant_total)')
      .eq('id', commande_article_id)
      .single()

    if (artErr || !article) return res.status(404).json({ error: 'Article introuvable' })

    const clientUserId = article.commandes?.user_id
    if (!clientUserId) return res.status(400).json({ error: 'user_id client introuvable' })

    // Récupère profil client
    const { data: profil } = await supabase
      .from('profils')
      .select('prenom, nom, email')
      .eq('id', clientUserId)
      .single()

    // Récupère email auth client
    const { data: authData } = await supabase.auth.admin.getUserById(clientUserId)
    const emailClient = profil?.email || authData?.user?.email

    // Mise à jour de l'article
    const updateData = { statut }
    if (livreur !== undefined) updateData.livreur = livreur
    if (numero_suivi !== undefined) updateData.numero_suivi = numero_suivi
    if (lien_suivi !== undefined) updateData.lien_suivi = lien_suivi
    if (date_livraison_estimee !== undefined) updateData.date_livraison_estimee = date_livraison_estimee
    if (note_client !== undefined) updateData.note_client = note_client

    if (statut === 'expediee') updateData.notif_envoyee_expedition = true
    if (statut === 'livree') updateData.notif_envoyee_livraison = true

    const { error: updateErr } = await supabase
      .from('commandes_articles')
      .update(updateData)
      .eq('id', commande_article_id)

    if (updateErr) throw updateErr

    const prenom = profil?.prenom || ''
    const nom = profil?.nom || ''
    const titre = article.nom || 'votre livre'

    // Notif in-app
    const contenuNotif = statut === 'expediee'
      ? { titre, livreur, numero_suivi, lien_suivi, date_livraison_estimee, note_client }
      : { titre, note_client }

    await supabase.from('notifications').insert({
      user_id: clientUserId,
      type: statut === 'expediee' ? 'commande_expediee' : 'commande_livree',
      contenu: contenuNotif,
      lu: false
    })

    // Email Brevo
    if (emailClient) {
      if (statut === 'expediee') {
        await envoyerEmailBrevo(
          emailClient,
          `Votre commande "${titre}" est en route !`,
          emailExpedition({ prenom, nom, titre, livreur, numero_suivi, lien_suivi, date_livraison_estimee, note_client })
        )
      } else if (statut === 'livree') {
        await envoyerEmailBrevo(
          emailClient,
          `Votre commande "${titre}" a été livrée !`,
          emailLivraison({ prenom, nom, titre, note_client })
        )
      }
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('admin-update-commande error:', err)
    res.status(500).json({ error: err.message })
  }
}
