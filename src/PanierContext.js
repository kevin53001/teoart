import React from 'react';

export const PanierContext = React.createContext();

// ─── Calcul des réductions ────────────────────────────────────────────────────

function calcReductions(articles) {
  // Séparer par catégorie
  const illus = articles.filter(a => a.type === 'illustration');
  const livres = articles.filter(a => a.type === 'livre_pdf');
  const recueils = articles.filter(a => a.type === 'recueil');
  const relies = articles.filter(a => a.type === 'relie');

  // Quantités totales par catégorie
  const nbIllus = illus.reduce((s, a) => s + a.quantite, 0);
  const nbLivres = livres.reduce((s, a) => s + a.quantite, 0);
  const nbRecueils = recueils.reduce((s, a) => s + a.quantite, 0);

  // Taux de réduction illustrations
  let tauxIllus = 0;
  if (nbIllus >= 10) tauxIllus = 0.35;
  else if (nbIllus >= 6) tauxIllus = 0.25;
  else if (nbIllus >= 3) tauxIllus = 0.15;

  // Taux de réduction livres PDF
  const tauxLivres = nbLivres >= 2 ? 0.15 : 0;

  // Taux de réduction recueils
  const tauxRecueils = nbRecueils >= 2 ? 0.20 : 0;

  // Totaux bruts
  const totalIllusBrut = illus.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalLivresBrut = livres.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalRecueilsBrut = recueils.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalReliesBrut = relies.reduce((s, a) => s + (a.prixRelie || 0) * a.quantite, 0);

  // Totaux après réduction
  const totalIllus = totalIllusBrut * (1 - tauxIllus);
  const totalLivres = totalLivresBrut * (1 - tauxLivres);
  const totalRecueils = totalRecueilsBrut * (1 - tauxRecueils);
  const totalRelies = totalReliesBrut; // pas de réduction sur les reliées

  const totalGeneral = totalIllus + totalLivres + totalRecueils + totalRelies;

  // Message incitatif illustrations
  let messageIllus = null;
  if (nbIllus === 1) messageIllus = 'Plus que 2 illustrations pour obtenir −15% !';
  else if (nbIllus === 2) messageIllus = 'Plus que 1 illustration pour obtenir −15% !';
  else if (nbIllus >= 3 && nbIllus < 6) messageIllus = `Plus que ${6 - nbIllus} illustration${6 - nbIllus > 1 ? 's' : ''} pour obtenir −25% !`;
  else if (nbIllus >= 6 && nbIllus < 10) messageIllus = `Plus que ${10 - nbIllus} illustration${10 - nbIllus > 1 ? 's' : ''} pour obtenir −35% !`;

  // Message incitatif livres
  let messageLivres = null;
  if (nbLivres === 1) messageLivres = 'Plus qu\'un livre PDF pour obtenir −15% sur tous vos livres !';

  // Message incitatif recueils
  let messageRecueils = null;
  if (nbRecueils === 1) messageRecueils = 'Plus qu\'un recueil pour obtenir −20% sur tous vos recueils !';

  return {
    tauxIllus, tauxLivres, tauxRecueils,
    totalIllusBrut, totalLivresBrut, totalRecueilsBrut, totalReliesBrut,
    totalIllus, totalLivres, totalRecueils, totalRelies,
    totalGeneral,
    nbIllus, nbLivres, nbRecueils,
    messageIllus, messageLivres, messageRecueils,
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

  // Sauvegarde automatique dans localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('panier_kevinteoart', JSON.stringify(articles));
    } catch {}
  }, [articles]);

  // Ajouter une illustration
  const ajouterIllustration = (illu) => {
    setArticles(prev => {
      const existe = prev.find(a => a.type === 'illustration' && a.id === illu.id);
      if (existe) return prev; // déjà dans le panier
      return [...prev, {
        type: 'illustration',
        id: illu.id,
        nom: illu.nom,
        prix: parseFloat(illu.prix) || 2.50,
        image: illu.image || null,
        quantite: 1,
      }];
    });
  };

  // Ajouter un livre PDF
  const ajouterLivrePdf = (livre) => {
    setArticles(prev => {
      const existe = prev.find(a => a.type === 'livre_pdf' && a.id === livre.id);
      if (existe) return prev;
      return [...prev, {
        type: 'livre_pdf',
        id: livre.id,
        nom: livre.nom,
        prix: parseFloat(livre.prix) || 0,
        image: livre.image || null,
        quantite: 1,
      }];
    });
  };

  // Ajouter un recueil PDF
  const ajouterRecueil = (recueil) => {
    setArticles(prev => {
      const existe = prev.find(a => a.type === 'recueil' && a.id === recueil.id);
      if (existe) return prev;
      return [...prev, {
        type: 'recueil',
        id: recueil.id,
        nom: recueil.nom,
        prix: parseFloat(recueil.prix) || 0,
        image: recueil.image || null,
        quantite: 1,
      }];
    });
  };

  // Ajouter une version reliée
  const ajouterRelie = (livre, pays, prixRelie, delai) => {
    setArticles(prev => {
      const existe = prev.find(a => a.type === 'relie' && a.id === livre.id);
      if (existe) return prev;
      return [...prev, {
        type: 'relie',
        id: livre.id,
        nom: livre.nom,
        image: livre.image || null,
        pays,
        prixRelie: parseFloat(prixRelie) || 0,
        delai,
        quantite: 1,
      }];
    });
  };

  // Supprimer un article
  const supprimerArticle = (type, id) => {
    setArticles(prev => prev.filter(a => !(a.type === type && a.id === id)));
  };

  // Vider le panier
  const viderPanier = () => setArticles([]);

  // Vérifier si un article est dans le panier
  const estDansPanier = (type, id) => articles.some(a => a.type === type && a.id === id);

  // Nombre total d'articles (pour la pastille nav)
  const nbArticles = articles.reduce((s, a) => s + a.quantite, 0);

  const reductions = calcReductions(articles);

  return (
    <PanierContext.Provider value={{
      articles,
      nbArticles,
      reductions,
      ajouterIllustration,
      ajouterLivrePdf,
      ajouterRecueil,
      ajouterRelie,
      supprimerArticle,
      viderPanier,
      estDansPanier,
    }}>
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier() {
  return React.useContext(PanierContext);
}
