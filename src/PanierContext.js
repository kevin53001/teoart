import React from 'react';

export const PanierContext = React.createContext();

// ─── Calcul des réductions ────────────────────────────────────────────────────

function calcReductions(articles, badgesFans = {}) {
  const illus    = articles.filter(a => a.type === 'illustration');
  const livres   = articles.filter(a => a.type === 'livre_pdf');
  const recueils = articles.filter(a => a.type === 'recueil');
  const relies   = articles.filter(a => a.type === 'relie');

  const nbIllus    = illus.reduce((s, a) => s + a.quantite, 0);
  const nbLivres   = livres.reduce((s, a) => s + a.quantite, 0);
  const nbRecueils = recueils.reduce((s, a) => s + a.quantite, 0);

  // Taux paliers
  let tauxIllus = 0;
  if (nbIllus >= 10) tauxIllus = 0.35;
  else if (nbIllus >= 6) tauxIllus = 0.25;
  else if (nbIllus >= 3) tauxIllus = 0.15;

  const tauxLivres   = nbLivres >= 2 ? 0.15 : 0;
  const tauxRecueils = nbRecueils >= 2 ? 0.20 : 0;

  // Totaux bruts
  const totalIllusBrut    = illus.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalLivresBrut   = livres.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalRecueilsBrut = recueils.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalReliesBrut   = relies.reduce((s, a) => s + (a.prixRelie || 0) * a.quantite, 0);

  // Totaux après réduction paliers
  const totalIllus    = totalIllusBrut * (1 - tauxIllus);
  const totalLivres   = totalLivresBrut * (1 - tauxLivres);
  const totalRecueils = totalRecueilsBrut * (1 - tauxRecueils);
  const totalRelies   = totalReliesBrut;

  // ── Badges fans ──
  // badgesFans = { illustrations: { nomBadge: 'Fan Bronze', taux: 0.05 }, livres: {...}, recueils: {...} }
  const badgeIllus    = badgesFans.illustrations || null;
  const badgeLivres   = badgesFans.livres || null;
  const badgeRecueils = badgesFans.recueils || null;

  // Appliquer le badge seulement si aucune réduction palier n'est déjà active sur la catégorie
  const tauxBadgeIllus    = (badgeIllus && tauxIllus === 0)    ? badgeIllus.taux    : 0;
  const tauxBadgeLivres   = (badgeLivres && tauxLivres === 0)   ? badgeLivres.taux   : 0;
  const tauxBadgeRecueils = (badgeRecueils && tauxRecueils === 0) ? badgeRecueils.taux : 0;

  const totalIllus2    = totalIllus    * (1 - tauxBadgeIllus);
  const totalLivres2   = totalLivres   * (1 - tauxBadgeLivres);
  const totalRecueils2 = totalRecueils * (1 - tauxBadgeRecueils);

  const totalGeneral = totalIllus2 + totalLivres2 + totalRecueils2 + totalRelies;

  // Messages incitatifs paliers
  let messageIllus = null;
  if (nbIllus === 1) messageIllus = 'Plus que 2 illustrations pour obtenir −15% !';
  else if (nbIllus === 2) messageIllus = 'Plus que 1 illustration pour obtenir −15% !';
  else if (nbIllus >= 3 && nbIllus < 6) messageIllus = `Plus que ${6 - nbIllus} illustration${6 - nbIllus > 1 ? 's' : ''} pour obtenir −25% !`;
  else if (nbIllus >= 6 && nbIllus < 10) messageIllus = `Plus que ${10 - nbIllus} illustration${10 - nbIllus > 1 ? 's' : ''} pour obtenir −35% !`;

  let messageLivres   = nbLivres === 1 ? 'Plus qu\'un livre PDF pour obtenir −15% sur tous vos livres !' : null;
  let messageRecueils = nbRecueils === 1 ? 'Plus qu\'un recueil pour obtenir −20% sur tous vos recueils !' : null;

  // Explications réductions actives (pourquoi ce %)
  let explicationIllus = null;
  if (tauxIllus > 0) {
    const palier = tauxIllus === 0.35 ? 10 : tauxIllus === 0.25 ? 6 : 3;
    explicationIllus = `Vous avez ajouté ${nbIllus} illustration${nbIllus > 1 ? 's' : ''} : vous bénéficiez de −${Math.round(tauxIllus * 100)}% (palier ${palier}+)`;
  }
  let explicationLivres = null;
  if (tauxLivres > 0) explicationLivres = `Vous avez ajouté ${nbLivres} livres PDF : vous bénéficiez de −15% sur tous vos livres`;
  let explicationRecueils = null;
  if (tauxRecueils > 0) explicationRecueils = `Vous avez ajouté ${nbRecueils} recueils : vous bénéficiez de −20% sur tous vos recueils`;

  // Explications badges fans
  let explicationBadgeIllus    = null;
  let explicationBadgeLivres   = null;
  let explicationBadgeRecueils = null;
  if (tauxBadgeIllus > 0 && badgeIllus)
    explicationBadgeIllus = `Vous avez obtenu le badge "${badgeIllus.nomBadge}" : vous bénéficiez de −${Math.round(tauxBadgeIllus * 100)}% de réduction sur votre première commande d'illustrations`;
  if (tauxBadgeLivres > 0 && badgeLivres)
    explicationBadgeLivres = `Vous avez obtenu le badge "${badgeLivres.nomBadge}" : vous bénéficiez de −${Math.round(tauxBadgeLivres * 100)}% de réduction sur votre première commande de livres`;
  if (tauxBadgeRecueils > 0 && badgeRecueils)
    explicationBadgeRecueils = `Vous avez obtenu le badge "${badgeRecueils.nomBadge}" : vous bénéficiez de −${Math.round(tauxBadgeRecueils * 100)}% de réduction sur votre première commande de recueils`;

  return {
    tauxIllus, tauxLivres, tauxRecueils,
    tauxBadgeIllus, tauxBadgeLivres, tauxBadgeRecueils,
    totalIllusBrut, totalLivresBrut, totalRecueilsBrut, totalReliesBrut,
    totalIllus: totalIllus2, totalLivres: totalLivres2, totalRecueils: totalRecueils2, totalRelies,
    totalGeneral,
    nbIllus, nbLivres, nbRecueils,
    messageIllus, messageLivres, messageRecueils,
    explicationIllus, explicationLivres, explicationRecueils,
    explicationBadgeIllus, explicationBadgeLivres, explicationBadgeRecueils,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function PanierProvider({ children }) {
  const [articles, setArticles] = React.useState(() => {
    try {
      const saved = localStorage.getItem('panier_kevinteoart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Badges fans alimentés depuis Panier.js via setBadgesFans()
  const [badgesFans, setBadgesFans] = React.useState({});

  React.useEffect(() => {
    try {
      localStorage.setItem('panier_kevinteoart', JSON.stringify(articles));
    } catch {}
  }, [articles]);

  const ajouterIllustration = (illu) => {
    setArticles(prev => {
      if (prev.find(a => a.type === 'illustration' && a.id === illu.id)) return prev;
      return [...prev, { type: 'illustration', id: illu.id, nom: illu.nom, prix: parseFloat(illu.prix) || 2.50, image: illu.image || null, quantite: 1 }];
    });
  };

  const ajouterLivrePdf = (livre) => {
    setArticles(prev => {
      if (prev.find(a => a.type === 'livre_pdf' && a.id === livre.id)) return prev;
      return [...prev, { type: 'livre_pdf', id: livre.id, nom: livre.nom, prix: parseFloat(livre.prix) || 0, image: livre.image || null, quantite: 1 }];
    });
  };

  const ajouterRecueil = (recueil) => {
    setArticles(prev => {
      if (prev.find(a => a.type === 'recueil' && a.id === recueil.id)) return prev;
      return [...prev, { type: 'recueil', id: recueil.id, nom: recueil.nom, prix: parseFloat(recueil.prix) || 0, image: recueil.image || null, quantite: 1 }];
    });
  };

  const ajouterRelie = (livre, pays, prixRelie, delai) => {
    setArticles(prev => {
      if (prev.find(a => a.type === 'relie' && a.id === livre.id)) return prev;
      return [...prev, { type: 'relie', id: livre.id, nom: livre.nom, image: livre.image || null, pays, prixRelie: parseFloat(prixRelie) || 0, delai, quantite: 1 }];
    });
  };

  const supprimerArticle = (type, id) => setArticles(prev => prev.filter(a => !(a.type === type && a.id === id)));
  const viderPanier = () => setArticles([]);
  const estDansPanier = (type, id) => articles.some(a => a.type === type && a.id === id);
  const nbArticles = articles.reduce((s, a) => s + a.quantite, 0);
  const reductions = calcReductions(articles, badgesFans);

  return (
    <PanierContext.Provider value={{
      articles, nbArticles, reductions, badgesFans,
      setBadgesFans,
      ajouterIllustration, ajouterLivrePdf, ajouterRecueil, ajouterRelie,
      supprimerArticle, viderPanier, estDansPanier,
    }}>
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier() {
  return React.useContext(PanierContext);
}
