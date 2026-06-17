import React from 'react';

export const PanierContext = React.createContext();

const TAUX_PDF_RELIE = 0.75; // -75% sur le PDF si le relié du même titre est dans le panier

// ─── Calcul des réductions ────────────────────────────────────────────────────

function calcReductions(articles, promoBadge = {}) {
  const illus    = articles.filter(a => a.type === 'illustration');
  const livres   = articles.filter(a => a.type === 'livre_pdf');
  const recueils = articles.filter(a => a.type === 'recueil');
  const relies   = articles.filter(a => a.type === 'relie');

  // sousType explicite uniquement — évite les doublons sur articles legacy sans sousType
  const reliesLivres   = relies.filter(a => a.sousType === 'livre');
  const reliesRecueils = relies.filter(a => a.sousType === 'recueil');

  // IDs des reliés présents (pour détecter les PDFs éligibles à -75%)
  const idsReliesLivres   = new Set(reliesLivres.map(a => a.id));
  const idsReliesRecueils = new Set(reliesRecueils.map(a => a.id));

  // PDFs éligibles à -75% : même id qu'un relié dans le panier
  // Ces PDFs sont EXCLUS du palier (ne comptent pas pour déclencher -15%/-20%)
  const livresPdfAvecRelie   = livres.filter(a => idsReliesLivres.has(a.id));
  const livresPdfSansRelie   = livres.filter(a => !idsReliesLivres.has(a.id));
  const recueilsPdfAvecRelie = recueils.filter(a => idsReliesRecueils.has(a.id));
  const recueilsPdfSansRelie = recueils.filter(a => !idsReliesRecueils.has(a.id));

  const nbIllus = illus.reduce((s, a) => s + a.quantite, 0);

  // Palier livres : PDF sans relié correspondant + reliés livres
  const nbLivresTotal   = livresPdfSansRelie.reduce((s, a) => s + a.quantite, 0)
                        + reliesLivres.reduce((s, a) => s + a.quantite, 0);
  // Palier recueils : PDF sans relié correspondant + reliés recueils
  const nbRecueilsTotal = recueilsPdfSansRelie.reduce((s, a) => s + a.quantite, 0)
                        + reliesRecueils.reduce((s, a) => s + a.quantite, 0);

  // ── Paliers ──
  let tauxIllus = 0;
  if (nbIllus >= 10) tauxIllus = 0.35;
  else if (nbIllus >= 6) tauxIllus = 0.25;
  else if (nbIllus >= 3) tauxIllus = 0.15;
  const tauxLivres   = nbLivresTotal >= 2 ? 0.15 : 0;
  const tauxRecueils = nbRecueilsTotal >= 2 ? 0.20 : 0;

  // ── Totaux bruts ──
  const totalIllusBrut = illus.reduce((s, a) => s + a.prix * a.quantite, 0);

  // PDFs sans relié → soumis au palier
  const totalLivresSansRelieBrut   = livresPdfSansRelie.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalRecueilsSansRelieBrut = recueilsPdfSansRelie.reduce((s, a) => s + a.prix * a.quantite, 0);

  // PDFs avec relié → -75%, pas de palier
  const totalLivresAvecRelieBrut   = livresPdfAvecRelie.reduce((s, a) => s + a.prix * a.quantite, 0);
  const totalRecueilsAvecRelieBrut = recueilsPdfAvecRelie.reduce((s, a) => s + a.prix * a.quantite, 0);

  const totalReliesLivresBrut   = reliesLivres.reduce((s, a) => s + (a.prixRelie || 0) * a.quantite, 0);
  const totalReliesRecueilsBrut = reliesRecueils.reduce((s, a) => s + (a.prixRelie || 0) * a.quantite, 0);
  const totalReliesBrut         = totalReliesLivresBrut + totalReliesRecueilsBrut;

  // Pour compatibilité affichage (totalBrut affiché dans sections)
  const totalLivresBrut   = totalLivresSansRelieBrut + totalLivresAvecRelieBrut;
  const totalRecueilsBrut = totalRecueilsSansRelieBrut + totalRecueilsAvecRelieBrut;

  // ── Après paliers et promos PDF ──
  const totalIllus = totalIllusBrut * (1 - tauxIllus);

  // Livres : PDFs sans relié → palier ; PDFs avec relié → -75% ; reliés → palier
  const totalLivresSansRelie   = totalLivresSansRelieBrut * (1 - tauxLivres);
  const totalLivresAvecRelie   = totalLivresAvecRelieBrut * (1 - TAUX_PDF_RELIE);
  const totalReliesLivres      = totalReliesLivresBrut * (1 - tauxLivres);
  const totalLivres            = totalLivresSansRelie + totalLivresAvecRelie;

  // Recueils : même logique
  const totalRecueilsSansRelie   = totalRecueilsSansRelieBrut * (1 - tauxRecueils);
  const totalRecueilsAvecRelie   = totalRecueilsAvecRelieBrut * (1 - TAUX_PDF_RELIE);
  const totalReliesRecueils      = totalReliesRecueilsBrut * (1 - tauxRecueils);
  const totalRecueils            = totalRecueilsSansRelie + totalRecueilsAvecRelie;

  const totalRelies = totalReliesLivres + totalReliesRecueils;
  const totalApresPaliers = totalIllus + totalLivres + totalRecueils + totalRelies;

  // ── Badges (cumul direct fan + colo) ──
  const tauxFan        = promoBadge.fan?.taux  || 0;
  const tauxColo       = promoBadge.colo?.taux || 0;
  const tauxBadgeTotal = tauxFan + tauxColo;
  const remiseBadge    = totalApresPaliers * tauxBadgeTotal;
  const totalGeneral   = Math.max(0, totalApresPaliers - remiseBadge);

  // ── Messages incitatifs ──
  let messageIllus = null;
  if (nbIllus === 1) messageIllus = 'Plus que 2 illustrations pour obtenir −15% !';
  else if (nbIllus === 2) messageIllus = 'Plus que 1 illustration pour obtenir −15% !';
  else if (nbIllus >= 3 && nbIllus < 6) messageIllus = `Plus que ${6 - nbIllus} illustration${6 - nbIllus > 1 ? 's' : ''} pour obtenir −25% !`;
  else if (nbIllus >= 6 && nbIllus < 10) messageIllus = `Plus que ${10 - nbIllus} illustration${10 - nbIllus > 1 ? 's' : ''} pour obtenir −35% !`;
  const messageLivres   = nbLivresTotal === 1 ? "Ajoutez un autre livre (PDF ou relié) pour obtenir −15% !" : null;
  const messageRecueils = nbRecueilsTotal === 1 ? "Ajoutez un autre recueil (PDF ou relié) pour obtenir −20% !" : null;

  // ── Explications paliers ──
  let explicationIllus = null;
  if (tauxIllus > 0) {
    const palier = tauxIllus === 0.35 ? 10 : tauxIllus === 0.25 ? 6 : 3;
    explicationIllus = `${nbIllus} illustration${nbIllus > 1 ? 's' : ''} : −${Math.round(tauxIllus * 100)}% appliqué (palier ${palier}+)`;
  }
  const explicationLivres   = tauxLivres > 0   ? `${nbLivresTotal} livre${nbLivresTotal > 1 ? 's' : ''} (PDF + reliés) : −15% appliqué` : null;
  const explicationRecueils = tauxRecueils > 0 ? `${nbRecueilsTotal} recueil${nbRecueilsTotal > 1 ? 's' : ''} (PDF + reliés) : −20% appliqué` : null;

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
        ? `${parties.join(' + ')} = −${Math.round(tauxBadgeTotal * 100)}% cumulés appliqués sur le sous-total`
        : `${parties[0]} appliqué sur le sous-total`,
    };
  }

  return {
    tauxIllus, tauxLivres, tauxRecueils, tauxBadgeTotal,
    totalIllusBrut, totalLivresBrut, totalRecueilsBrut, totalReliesBrut,
    totalReliesLivresBrut, totalReliesRecueilsBrut,
    totalLivresAvecRelieBrut, totalRecueilsAvecRelieBrut,
    totalIllus, totalLivres, totalRecueils, totalRelies,
    totalReliesLivres, totalReliesRecueils,
    totalLivresAvecRelie, totalRecueilsAvecRelie,
    totalApresPaliers, remiseBadge, totalGeneral,
    nbIllus, nbLivresTotal, nbRecueilsTotal,
    idsReliesLivres, idsReliesRecueils,
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

  const ajouterRelie = (livre, pays, prixRelie, delai, sousType = 'livre') => {
    setArticles(prev => {
      if (prev.find(a => a.type === 'relie' && a.id === livre.id)) return prev;
      return [...prev, { type: 'relie', id: livre.id, nom: livre.nom, image: livre.image || null, pays, prixRelie: parseFloat(prixRelie) || 0, delai, sousType, quantite: 1 }];
    });
  };

  // Ajouter relié + PDF du même titre en une fois
  const ajouterRelieEtPdf = (item, pays, prixRelie, delai, sousType, prixPdf, imagePdf) => {
    setArticles(prev => {
      let next = [...prev];
      if (!next.find(a => a.type === 'relie' && a.id === item.id)) {
        next.push({ type: 'relie', id: item.id, nom: item.nom, image: item.image || imagePdf || null, pays, prixRelie: parseFloat(prixRelie) || 0, delai, sousType, quantite: 1 });
      }
      const typePdf = sousType === 'recueil' ? 'recueil' : 'livre_pdf';
      if (!next.find(a => a.type === typePdf && a.id === item.id)) {
        next.push({ type: typePdf, id: item.id, nom: item.nom, prix: parseFloat(prixPdf) || 0, image: item.image || imagePdf || null, quantite: 1 });
      }
      return next;
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
      ajouterIllustration, ajouterLivrePdf, ajouterRecueil, ajouterRelie, ajouterRelieEtPdf,
      supprimerArticle, viderPanier, estDansPanier,
    }}>
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier() {
  return React.useContext(PanierContext);
}
