// api/backfill-prix.js
// ⚠️ ENDPOINT TEMPORAIRE À USAGE UNIQUE — à supprimer après exécution.
// Récupère le montant réellement payé sur Stripe pour chaque commande déjà
// passée (avant l'ajout de la colonne prix), et le répartit proportionnellement
// sur les lignes commandes_articles correspondantes (poids = prix catalogue
// actuel de l'article, retrouvé par son nom — approximation si le prix a
// changé depuis la commande).
// Déclenchement : simple GET sur /api/backfill-prix depuis le navigateur.

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  try {
    // 1. Lignes sans prix
    const { data: lignes, error } = await supabase
      .from('commandes_articles')
      .select('id, commande_id, nom, type')
      .is('prix', null);
    if (error) throw error;
    if (!lignes?.length) return res.status(200).json({ ok: true, message: 'Rien à rattraper.' });

    // 2. Charger les catalogues pour retrouver un prix actuel par nom
    const [{ data: illus }, { data: livres }, { data: recueils }] = await Promise.all([
      supabase.from('illustrations').select('nom, prix'),
      supabase.from('livres').select('nom, prix, prix_relie'),
      supabase.from('recueils').select('nom, prix, prix_relie'),
    ]);
    const prixParNom = (type) => {
      if (type === 'illustration') return Object.fromEntries((illus || []).map(i => [i.nom, i.prix || 0]));
      if (type === 'livre_pdf')    return Object.fromEntries((livres || []).map(l => [l.nom, l.prix || 0]));
      if (type === 'recueil')      return Object.fromEntries((recueils || []).map(r => [r.nom, r.prix || 0]));
      return {};
    };

    // 3. Regrouper les lignes par commande_id (= paymentIntentId Stripe)
    const parCommande = {};
    for (const l of lignes) {
      if (!parCommande[l.commande_id]) parCommande[l.commande_id] = [];
      parCommande[l.commande_id].push(l);
    }

    const resultats = { traitees: 0, erreurs: [] };

    for (const [commandeId, items] of Object.entries(parCommande)) {
      try {
        const pi = await stripe.paymentIntents.retrieve(commandeId);
        const montantCentimes = pi.amount_received || pi.amount || 0;

        // Poids = prix catalogue actuel (par nom), fallback poids égal si introuvable
        const poids = items.map(it => {
          if (it.type === 'relie') return 25; // poids forfaitaire faute de pays connu pour reconstituer le prix relié exact
          const table = prixParNom(it.type);
          return table[it.nom] || 0;
        });
        const totalPoids = poids.reduce((s, p) => s + p, 0);

        const prixCentimes = items.map((_, i) => {
          if (totalPoids <= 0) return Math.round(montantCentimes / items.length);
          return Math.round((poids[i] / totalPoids) * montantCentimes);
        });
        // Ajustement d'arrondi sur la dernière ligne
        const somme = prixCentimes.reduce((s, p) => s + p, 0);
        const ecart = montantCentimes - somme;
        if (ecart !== 0) prixCentimes[prixCentimes.length - 1] += ecart;

        for (let i = 0; i < items.length; i++) {
          const { error: updErr } = await supabase
            .from('commandes_articles')
            .update({ prix: prixCentimes[i] / 100 })
            .eq('id', items[i].id);
          if (updErr) throw updErr;
        }
        resultats.traitees += items.length;
      } catch (e) {
        resultats.erreurs.push({ commandeId, message: e.message });
      }
    }

    return res.status(200).json(resultats);
  } catch (err) {
    console.error('backfill-prix error:', err);
    return res.status(500).json({ error: err.message });
  }
};