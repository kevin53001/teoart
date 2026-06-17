import React from 'react';

export const PanierContext = React.createContext();

// ─── Calcul des réductions ────────────────────────────────────────────────────

function calcReductions(articles, promoBadge = {}) {
  const illus    = articles.filter(a => a.type === 'illustration');
  const livres   = articles.filter(a => a.type === 'livre_pdf');
  const recueils = articles.filter(a => a.type === 'recueil');
  const relies   = articles.filter(a => a.type === 'relie');

  const nbIllus    = illus.reduce((s, a) => s + a.quantite, 0);
  const nbLivres   = livres.reduce((s, a) => s + a.quantite, 0);
  const nbRecueils = recueils.reduce((s, a) => s + a.quantite, 0);

  // ── Paliers ──
  let tauxIllus = 0;
  if (nbIllus >= 10) tauxIllus = 0.35;
  else if (nbIllus >= 6) tauxIllus = 0.25;
  else if (nbIllus >= 3) tauxIllus = 0.15;
  const tauxLivres   = nbLivres >= 2 ? 0.15 : 0;
  const tauxRecueils = nbRecueils >= 2 ? 0.20 : 0;

  // ── Totaux bruts ──
  const totalIllusBrut    = illus.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalLivresBrut   = livres.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalRecueilsBrut = recueils.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalReliesBrut   = relies.reduce((s, a) => s + (a.prixRelie || 0) * a.quantite, 0);

  // ── Après paliers ──
  const totalIllus    = totalIllusBrut * (1 - tauxIllus);
  const totalLivres   = totalLivresBrut * (1 - tauxLivres);
  const totalRecueils = totalRecueilsBrut * (1 - tauxRecueils);
  const totalRelies   = totalReliesBrut;
  const totalApresPaliers = totalIllus + totalLivres + totalRecueils + totalRelies;

  // ── Badges (cumul direct fan + colo, appliqué sur total après paliers) ──
  const tauxFan  = promoBadge.fan?.taux  || 0;
  const tauxColo = promoBadge.colo?.taux || 0;
  const tauxBadgeTotal = tauxFan + tauxColo; // cumul direct
  const remiseBadge = totalApresPaliers * tauxBadgeTotal;
  const totalGeneral = Math.max(0, totalApresPaliers - remiseBadge);

  // ── Messages incitatifs paliers ──
  let messageIllus = null;
  if (nbIllus === 1) messageIllus = 'Plus que 2 illustrations pour obtenir −15% !';
  else if (nbIllus === 2) messageIllus = 'Plus que 1 illustration pour obtenir −15% !';
  else if (nbIllus >= 3 && nbIllus < 6) messageIllus = `Plus que ${6 - nbIllus} illustration${6 - nbIllus > 1 ? 's' : ''} pour obtenir −25% !`;
  else if (nbIllus >= 6 && nbIllus < 10) messageIllus = `Plus que ${10 - nbIllus} illustration${10 - nbIllus > 1 ? 's' : ''} pour obtenir −35% !`;
  const messageLivres   = nbLivres === 1 ? "Plus qu'un livre PDF pour obtenir −15% sur tous vos livres !" : null;
  const messageRecueils = nbRecueils === 1 ? "Plus qu'un recueil pour obtenir −20% sur tous vos recueils !" : null;

  // ── Explications paliers ──
  let explicationIllus = null;
  if (tauxIllus > 0) {
    const palier = tauxIllus === 0.35 ? 10 : tauxIllus === 0.25 ? 6 : 3;
    explicationIllus = `Vous avez ajouté ${nbIllus} illustration${nbIllus > 1 ? 's' : ''} : vous bénéficiez de −${Math.round(tauxIllus * 100)}% (palier ${palier}+)`;
  }
  const explicationLivres   = tauxLivres > 0   ? `Vous avez ajouté ${nbLivres} livres PDF : vous bénéficiez de −15% sur tous vos livres` : null;
  const explicationRecueils = tauxRecueils > 0 ? `Vous avez ajouté ${nbRecueils} recueils : vous bénéficiez de −20% sur tous vos recueils` : null;

  // ── Explication badge ──
  let explicationBadge = null;
  if (tauxBadgeTotal > 0) {
    const parties = [];
    if (promoBadge.fan)  parties.push(`Badge ${promoBadge.fan.nomBadge} (−${Math.round(tauxFan * 100)}%)`);
    if (promoBadge.colo) parties.push(`Badge ${promoBadge.colo.nomBadge} (−${Math.round(tauxColo * 100)}%)`);
    explicationBadge = {
      detail: parties.join(' + '),
      tauxTotal: tauxBadgeTotal,
      montantRemise: remiseBadge,
      texte: parties.length > 1
        ? `${parties.join(' + ')} = −${Math.round(tauxBadgeTotal * 100)}% cumulés appliqués sur le sous-total après réductions`
        : `${parties[0]} appliqué sur le sous-total après réductions`,
    };
  }

  return {
    tauxIllus, tauxLivres, tauxRecueils, tauxBadgeTotal,
    totalIllusBrut, totalLivresBrut, totalRecueilsBrut, totalReliesBrut,
    totalIllus, totalLivres, totalRecueils, totalRelies,
    totalApresPaliers, remiseBadge, totalGeneral,
    nbIllus, nbLivres, nbRecueils,
    messageIllus, messageLivres, messageRecueils,
    explicationIllus, explicationLivres, explicationRecueils,
    explicationBadge,
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

  // Promo badge active — alimentée depuis Panier.js après lecture Supabase
  const [promoBadge, setPromoBadge] = React.useState({});

  React.useEffect(() => {
    try { localStorage.setItem('panier_kevinteoart', JSON.stringify(articles)); } catch {}
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
  const reductions = calcReductions(articles, promoBadge);

  return (
    <PanierContext.Provider value={{
      articles, nbArticles, reductions, promoBadge,
      setPromoBadge,
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
