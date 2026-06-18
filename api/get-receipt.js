// api/get-receipt.js
// Récupère l'URL du reçu Stripe et le montant d'un PaymentIntent.
// Vérifie que le PaymentIntent appartient bien à l'utilisateur via Supabase.

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { paymentIntentId, userId } = req.body;

    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId manquant' });
    if (!userId)          return res.status(400).json({ error: 'userId manquant' });

    // 1. Vérifier que cette commande appartient bien à cet utilisateur
    const { data: commande, error: errCommande } = await supabase
      .from('commandes_articles')
      .select('id')
      .eq('commande_id', paymentIntentId)
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (errCommande || !commande) {
      return res.status(403).json({ error: 'Commande introuvable ou accès refusé' });
    }

    // 2. Récupérer le PaymentIntent depuis Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });

    const montantCents = pi.amount_received || pi.amount || 0;
    const montantEuros = (montantCents / 100).toFixed(2);
    const receiptUrl = pi.latest_charge?.receipt_url || null;

    return res.status(200).json({
      montant: montantEuros,
      receiptUrl,
    });

  } catch (err) {
    console.error('get-receipt error:', err);
    return res.status(500).json({ error: err.message });
  }
};
