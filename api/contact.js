// api/contact.js
// Envoie un email de contact via Brevo (API transactionnelle)
// Reply-To = email de l'utilisateur → Kevin peut répondre directement

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { sujet, message, userEmail, userPseudo } = req.body;

  if (!sujet || !message || !userEmail) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'Clé API Brevo manquante' });
  }

  const payload = {
    sender: {
      name: `Kevin Teo'Art — Contact`,
      email: 'noreply@kevinteoart.fr',
    },
    to: [
      { email: 'kevinteoart@outlook.fr', name: 'Kevin' }
    ],
    replyTo: {
      email: userEmail,
      name: userPseudo || userEmail,
    },
    subject: `[Contact] ${sujet}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #00d4d4; margin-bottom: 4px;">Nouveau message de contact</h2>
        <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 24px;">kevinteoart.fr</p>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0 0 6px; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">De</p>
          <p style="margin: 0; color: #fff; font-size: 14px;"><strong>${userPseudo || 'Utilisateur'}</strong> — ${userEmail}</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0 0 6px; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Sujet</p>
          <p style="margin: 0; color: #fff; font-size: 14px;">${sujet}</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px;">
          <p style="margin: 0 0 10px; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
          <p style="margin: 0; color: #fff; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: rgba(255,255,255,0.25); font-size: 11px; margin-top: 24px; text-align: center;">
          Réponds directement à cet email pour contacter ${userPseudo || 'l\'utilisateur'}.
        </p>
      </div>
    `,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Brevo error:', err);
      return res.status(500).json({ error: 'Erreur envoi email' });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Contact API error:', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}