const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { montant, email, userId, articles, remisesDetail } = req.body;

    if (!montant || montant <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    // 1. Créer le payment intent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: montant,
      currency: 'eur',
      receipt_email: email || undefined,
      metadata: { source: 'kevinteoart.fr' },
      automatic_payment_methods: { enabled: true },
    });

    // 2. Sauvegarder le snapshot panier — filet de sécurité pour le webhook.
    // Non bloquant : si ça échoue, le paiement continue quand même (confirm-payment
    // prendra le relais côté client comme avant).
    if (userId && articles?.length) {
      try {
        await supabase.from('paniers_en_attente').upsert({
          payment_intent_id: paymentIntent.id,
          user_id: userId,
          articles,
          remises_detail: remisesDetail || null,
        }, { onConflict: 'payment_intent_id' });
      } catch (e) {
        console.error('paniers_en_attente insert error (non bloquant):', e);
      }
    }

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};
