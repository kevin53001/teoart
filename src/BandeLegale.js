import React from 'react';

const ITEMS = [
  { id: 'mentions',        label: 'Mentions légales',            couleur: '#FFD700' },
  { id: 'confidentialite', label: 'Politique de confidentialité', couleur: '#FF6EB4' },
  { id: 'cgv',             label: 'CGV',                          couleur: '#00D4D4' },
  { id: 'droits',          label: "Droits d'utilisation",         couleur: '#FF6EB4' },
  { id: 'contact',         label: 'Contact',                      couleur: '#FFD700' },
];

const CONTENUS = {
  mentions: {
    titre: 'Mentions légales',
    texte: `ÉDITEUR DU SITE

Le présent site est édité par :

Nom et prénom : Kevin Guerin
Statut : Auto-entrepreneur
Nom commercial : Kevin Teo'Art
Numéro SIREN : 907886428
Numéro SIRET : 90788642800016
Adresse : 3 rue des Plantes, 78930 Guerville, France
Adresse e-mail : kevinteoart@outlook.fr
Site internet : https://kevinteoart.fr


HÉBERGEMENT

Le site est hébergé par :
Vercel Inc.
440 N Barranca Avenue #4133
Covina, CA 91723 — États-Unis
https://vercel.com


NOM DE DOMAINE

Le nom de domaine kevinteoart.fr est enregistré auprès de :
OVH SAS — 2 rue Kellermann, 59100 Roubaix, France
https://www.ovhcloud.com


PROPRIÉTÉ INTELLECTUELLE

L'ensemble des contenus présents sur le site KevinTeoArt.fr, notamment les illustrations, dessins, textes, photographies, éléments graphiques, logos, fichiers numériques, livres, recueils, mises en page et éléments visuels, sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.

Toute reproduction, diffusion, modification, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation écrite préalable de Kevin Teo'Art est strictement interdite.


RESPONSABILITÉ

L'éditeur du site met tout en œuvre pour assurer l'exactitude et la mise à jour des informations diffusées sur le site. Toutefois, il ne peut garantir l'absence d'erreurs, d'omissions ou d'interruptions temporaires du service. L'utilisateur reconnaît utiliser les informations présentes sur le site sous sa responsabilité exclusive.


CONTACT

kevinteoart@outlook.fr`,
  },

  confidentialite: {
    titre: 'Politique de confidentialité',
    texte: `Dernière mise à jour : Juin 2026

Le site KevinTeoArt.fr respecte la vie privée de ses utilisateurs et s'engage à protéger leurs données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).


DONNÉES COLLECTÉES

Lors de l'utilisation du site, les informations suivantes peuvent être collectées :
• Adresse e-mail
• Nom et prénom
• Pseudo
• Date de naissance
• Adresse postale
• Numéro de téléphone
• Photographie de profil
• Informations relatives à votre collection
• Coloriages partagés
• Commentaires et interactions publiés sur le site


FINALITÉS ET BASES LÉGALES

Chaque traitement repose sur une base légale conforme au RGPD :

• Création et gestion du compte utilisateur → Exécution du contrat
• Gestion de votre collection personnelle → Exécution du contrat
• Téléchargements et commandes → Exécution du contrat
• Affichage de vos coloriages partagés → Consentement
• Gestion des commentaires et interactions → Intérêt légitime
• Réponses aux demandes de contact → Intérêt légitime
• Sécurité du site → Obligation légale / Intérêt légitime


DURÉE DE CONSERVATION

Les données sont conservées aussi longtemps que votre compte reste actif ou aussi longtemps que nécessaire pour répondre aux obligations légales applicables. En cas de suppression de compte, les données sont effacées dans un délai raisonnable, sauf obligation légale de conservation.


SOUS-TRAITANTS ET PRESTATAIRES TECHNIQUES

Vos données peuvent être traitées par les prestataires suivants, nécessaires au fonctionnement du site :

• Supabase (Supabase Inc.) — Hébergement de la base de données et authentification
• Vercel Inc. — Hébergement du site web
• Cloudflare Inc. (R2) — Stockage des images et fichiers
• Brevo (ex-Sendinblue) — Envoi des e-mails transactionnels (confirmation d'inscription, réinitialisation de mot de passe)
• Google Fonts (Google LLC) — Chargement des polices d'écriture

Ces prestataires agissent en qualité de sous-traitants et s'engagent à assurer la protection des données conformément à la réglementation en vigueur.


COOKIES ET DONNÉES DE SESSION

Le site KevinTeoArt.fr n'utilise pas de cookies publicitaires ni de traceurs de navigation.

Les seules données stockées dans votre navigateur sont des données de session techniques (token d'authentification) nécessaires à votre connexion, via le service Supabase. Ces données sont strictement fonctionnelles et ne sont pas utilisées à des fins de profilage ou de publicité.

Google Fonts est utilisé pour l'affichage des polices du site. Ce service effectue des requêtes vers les serveurs de Google mais ne dépose pas de cookies persistants.

Aucun consentement n'est requis pour ces traitements purement techniques et fonctionnels, conformément aux lignes directrices de la CNIL.


PARTAGE DES DONNÉES

Les données ne sont ni vendues ni louées à des tiers en dehors des sous-traitants listés ci-dessus.


VOS DROITS

Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données.

Pour exercer ces droits : kevinteoart@outlook.fr

En cas de réponse insatisfaisante, vous pouvez introduire une réclamation auprès de la CNIL : https://www.cnil.fr


SÉCURITÉ

Des mesures techniques et organisationnelles sont mises en œuvre afin de protéger les données personnelles contre toute perte, divulgation ou accès non autorisé.`,
  },

  cgv: {
    titre: 'Conditions Générales de Vente',
    texte: `Dernière mise à jour : Juin 2026


OBJET

Les présentes Conditions Générales de Vente régissent les ventes réalisées sur le site KevinTeoArt.fr. Toute commande passée sur le site implique l'acceptation pleine et entière des présentes conditions.


PRODUITS PROPOSÉS

• Illustrations numériques à colorier
• Livres numériques
• Recueils numériques
• Livres reliés imprimés à la demande
• Recueils reliés imprimés à la demande


PRIX

Les prix sont indiqués en euros (€), toutes taxes comprises. Pour les produits numériques, le prix affiché correspond au montant total à payer. Pour les livres et recueils reliés, les frais de livraison sont inclus dans le prix affiché.

Kevin Teo'Art se réserve le droit de modifier ses tarifs à tout moment. Les produits sont facturés au tarif en vigueur au moment de la validation de la commande.


PROMOTIONS ET RÉDUCTIONS

Des réductions peuvent s'appliquer selon la quantité d'illustrations achetées. Les conditions exactes sont affichées sur le site au moment de l'achat. Ces réductions s'appliquent uniquement aux illustrations numériques, sauf mention contraire.


CRÉATION D'UN COMPTE UTILISATEUR

Certaines fonctionnalités du site nécessitent la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à jour lors de son inscription. L'utilisateur est responsable de la confidentialité de ses identifiants.

Kevin Teo'Art se réserve le droit de suspendre ou supprimer tout compte en cas d'utilisation frauduleuse ou contraire aux présentes conditions.


PAIEMENT

Le paiement s'effectue via les moyens de paiement suivants :
• Carte bancaire (Visa, Mastercard) via Stripe
• PayPal

La commande est définitive après validation du paiement. Une confirmation de commande est envoyée à l'adresse e-mail renseignée par l'utilisateur.


LIVRAISON DES PRODUITS NUMÉRIQUES

Les produits numériques sont disponibles immédiatement après validation du paiement. Les liens de téléchargement sont accessibles depuis le compte utilisateur. L'utilisateur est responsable de la conservation des fichiers téléchargés.


LIVRES ET RECUEILS RELIÉS

Les livres et recueils reliés sont imprimés à la demande par Amazon KDP. Kevin Teo'Art prend en charge l'ensemble de la commande de A à Z : passation de la commande auprès d'Amazon, suivi de fabrication, transmission des informations de livraison et service après-vente. Kevin Teo'Art est l'interlocuteur unique du client pour toute la durée de la commande.

Les commandes sont actuellement limitées aux pays européens desservis par Amazon KDP, à l'exclusion de la Suisse, de Monaco et d'Andorre.


DÉLAIS DE FABRICATION ET LIVRAISON

Les délais indiqués sont donnés à titre indicatif et peuvent varier selon les contraintes de fabrication, de transport ou les périodes de forte activité. Kevin Teo'Art ne peut être tenu responsable de retards imputables au transporteur ou au prestataire d'impression.


COLIS PERDU, ENDOMMAGÉ OU NON CONFORME

En cas de problème à réception, le client doit contacter Kevin Teo'Art dans les meilleurs délais. Des justificatifs (photographies) pourront être demandés. Après étude du dossier, Kevin Teo'Art pourra procéder au remboursement, à la réimpression ou proposer toute autre solution adaptée.


DROIT DE RÉTRACTATION

Pour les produits numériques :
Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques dès lors que l'utilisateur a expressément consenti à l'exécution immédiate du contrat et renoncé à son droit de rétractation avant le téléchargement. Cette renonciation est recueillie explicitement lors de la validation de la commande (case à cocher obligatoire). Aucun remboursement ne pourra être accordé après téléchargement.

Pour les livres et recueils reliés :
Le client dispose d'un délai de 14 jours à compter de la réception pour exercer son droit de rétractation. Toute demande doit être adressée à Kevin Teo'Art via les coordonnées figurant sur le site. Après validation, un remboursement sera effectué conformément à la réglementation applicable.


UTILISATION DES ILLUSTRATIONS ET FICHIERS NUMÉRIQUES

Les illustrations, livres et recueils numériques sont destinés exclusivement à un usage personnel. Sont notamment interdits : la revente des fichiers, le partage avec des tiers, la diffusion publique, l'utilisation commerciale et la redistribution même partielle.

Toute utilisation commerciale nécessite une autorisation écrite préalable de Kevin Teo'Art.


CONTENUS PUBLIÉS PAR LES UTILISATEURS

En publiant un contenu (coloriage, commentaire...), l'utilisateur autorise Kevin Teo'Art à l'afficher et le diffuser dans le cadre du fonctionnement du site. L'utilisateur conserve la propriété de ses créations.


MODÉRATION

Kevin Teo'Art se réserve le droit de supprimer sans préavis tout contenu illégal, injurieux, diffamatoire, discriminatoire, haineux, publicitaire, trompeur ou contraire à l'esprit du site.


PROPRIÉTÉ INTELLECTUELLE

L'ensemble des contenus du site est protégé par le droit d'auteur. Toute reproduction ou exploitation sans autorisation écrite préalable est interdite.


RESPONSABILITÉ

Kevin Teo'Art ne pourra être tenu responsable en cas d'interruption temporaire du service, de dysfonctionnement indépendant de sa volonté, d'incident technique lié à un prestataire tiers ou de force majeure.


MÉDIATION

En cas de litige non résolu à l'amiable, le client peut recourir gratuitement à la plateforme européenne de règlement en ligne des litiges :
https://ec.europa.eu/consumers/odr


DROIT APPLICABLE

Les présentes CGV sont soumises au droit français. Tout litige relève des juridictions françaises compétentes.`,
  },

  droits: {
    titre: "Droits d'utilisation des illustrations",
    texte: `Merci d'avoir choisi une création Kevin Teo'Art.

Les illustrations proposées sur ce site sont protégées par le droit d'auteur.


CE QUE VOUS POUVEZ FAIRE

• Télécharger les illustrations que vous avez achetées
• Imprimer les illustrations pour votre usage personnel
• Réimprimer vos illustrations autant de fois que vous le souhaitez pour votre usage personnel
• Colorier les illustrations avec le matériel de votre choix
• Partager vos coloriages terminés sur les réseaux sociaux, groupes de coloriage, blogs ou galeries personnelles

Lors du partage de vos coloriages, une mention ou un lien vers Kevin Teo'Art est toujours appréciée.


CE QUE VOUS NE POUVEZ PAS FAIRE

• Revendre les fichiers numériques
• Distribuer les fichiers à d'autres personnes
• Publier les fichiers en téléchargement libre
• Modifier les illustrations puis les redistribuer
• Utiliser les illustrations dans un cadre commercial sans autorisation écrite
• Intégrer les illustrations dans des produits destinés à la vente
• Revendre des impressions des illustrations, coloriées ou non


DROIT DE RÉTRACTATION

Les illustrations numériques sont soumises à l'article L221-28 du Code de la consommation. En acceptant l'exécution immédiate du téléchargement lors de votre commande, vous renoncez expressément à votre droit de rétractation. Aucun remboursement ne pourra être accordé après téléchargement.


PARTAGE DES COLORIAGES

Les coloriages réalisés à partir des illustrations Kevin Teo'Art restent la propriété artistique de leur auteur, tout en respectant les droits d'auteur attachés au dessin original. L'auteur de l'illustration conserve l'ensemble de ses droits sur le dessin d'origine.


UTILISATION COMMERCIALE

Toute utilisation commerciale doit faire l'objet d'une autorisation écrite préalable.

Pour toute demande : kevinteoart@outlook.fr

Merci de respecter le travail des artistes et de contribuer à faire vivre la création indépendante.`,
  },

  contact: {
    titre: 'Contact',
    texte: `Une question ?

Besoin d'aide concernant une commande, un téléchargement ou votre compte utilisateur ?

Vous pouvez me contacter à l'adresse suivante :

kevinteoart@outlook.fr

Je m'efforce de répondre à chaque message dans les meilleurs délais.

Merci pour votre visite dans l'univers Kevin Teo'Art.`,
  },
};

const COULEUR_RGB = {
  '#FFD700': '255,215,0',
  '#FF6EB4': '255,110,180',
  '#00D4D4': '0,212,212',
};

export default function BandeLegale() {
  const [actif, setActif] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const panneauRef = React.useRef(null);

  // Détection scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      setVisible(scrollTop + windowHeight >= docHeight - 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Resize
  React.useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Reset scroll du panneau quand on change de bouton
  const toggleItem = (id) => {
    setActif(prev => {
      if (prev !== id && panneauRef.current) {
        panneauRef.current.scrollTop = 0;
      }
      return prev === id ? null : id;
    });
  };

  const contenu = actif ? CONTENUS[actif] : null;
  const couleurActif = actif ? ITEMS.find(i => i.id === actif)?.couleur : null;
  const rgbActif = couleurActif ? COULEUR_RGB[couleurActif] : null;

  // Largeur commune bande + panneau (~2-3cm de marge de chaque côté)
  const LARGEUR = 'calc(100% - 56px)';
  const LARGEUR_MAX = '1100px';

  // Lignes mobile : [3 premiers] [2 derniers]
  const ligne1 = ITEMS.slice(0, 3);
  const ligne2 = ITEMS.slice(3);

  const renderBouton = (item) => {
    const rgb = COULEUR_RGB[item.couleur];
    const isActif = actif === item.id;
    return (
      <button
        key={item.id}
        onClick={e => { e.stopPropagation(); toggleItem(item.id); }}
        style={{
          cursor: 'pointer',
          padding: isMobile ? '4px 10px' : '5px 14px',
          borderRadius: '20px',
          fontFamily: 'var(--font-bouton)',
          fontSize: isMobile ? '10px' : '11px',
          color: isActif ? '#000' : item.couleur,
          transition: 'all 0.25s ease',
          whiteSpace: 'nowrap',
          border: `1px solid rgba(${rgb}, ${isActif ? '1' : '0.5'})`,
          // Effet carte premium coloré quand actif, sinon semi-transparent
          background: isActif
            ? `linear-gradient(135deg, ${item.couleur} 0%, rgba(${rgb},0.7) 50%, ${item.couleur} 100%)`
            : `linear-gradient(135deg, rgba(${rgb},0.15) 0%, rgba(${rgb},0.05) 50%, rgba(${rgb},0.12) 100%)`,
          boxShadow: isActif
            ? `0 0 12px rgba(${rgb},0.6), inset 0 1px 0 rgba(255,255,255,0.3)`
            : `0 0 6px rgba(${rgb},0.15), inset 0 1px 0 rgba(255,255,255,0.06)`,
          textShadow: isActif ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
          fontWeight: isActif ? '700' : '400',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Reflet carte premium */}
        <span style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
          borderRadius: '20px 20px 0 0',
          pointerEvents: 'none',
        }} />
        {item.label}
      </button>
    );
  };

  return (
    <>
      {/* Panneau texte légal — même largeur que la bande */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? '64px' : '48px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: LARGEUR,
        maxWidth: LARGEUR_MAX,
        zIndex: 998,
        overflow: 'hidden',
        maxHeight: actif ? '65vh' : '0',
        transition: 'max-height 0.4s ease',
        borderRadius: '16px',
      }}>
        <div
          ref={panneauRef}
          style={{
            background: 'rgba(8,8,8,0.98)',
            border: couleurActif ? `1px solid rgba(${rgbActif},0.3)` : '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            borderRadius: '16px',
            overflowY: 'auto',
            maxHeight: '65vh',
          }}
          onClick={e => e.stopPropagation()}
        >
          {contenu && (
            <>
              {/* Titre sticky avec effet carte premium coloré */}
              <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: `linear-gradient(135deg, rgba(${rgbActif},0.35) 0%, rgba(10,10,10,0.98) 60%, rgba(${rgbActif},0.15) 100%)`,
                boxShadow: `0 2px 16px rgba(${rgbActif},0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
                borderBottom: `1px solid rgba(${rgbActif},0.3)`,
                padding: '14px 20px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                {/* Reflet carte premium */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                }} />
                <span style={{
                  fontFamily: 'var(--font-titre)',
                  fontSize: isMobile ? '16px' : '20px',
                  color: couleurActif,
                  textShadow: `0 0 12px rgba(${rgbActif},0.5)`,
                }}>
                  {contenu.titre}
                </span>
                <button
                  onClick={() => setActif(null)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '18px', cursor: 'pointer',
                    lineHeight: 1, padding: '2px 6px',
                    fontFamily: 'var(--font-bouton)',
                  }}
                >✕</button>
              </div>

              {/* Texte */}
              <div style={{
                padding: '20px 24px 28px',
                color: 'rgba(255,255,255,0.82)',
                fontFamily: 'var(--font-texte)',
                fontSize: '15px',
                lineHeight: '1.75',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}>
                {contenu.texte}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bande légale — noire, effet carte premium, bords arrondis */}
      <div style={{
        position: 'fixed',
        bottom: '4px',
        left: '50%',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(120%)',
        transition: 'transform 0.4s ease',
        width: LARGEUR,
        maxWidth: LARGEUR_MAX,
        height: isMobile ? '56px' : '44px',
        zIndex: 999,
        borderRadius: '22px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000 50%, #1a1a1a 100%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
        onClick={() => { if (actif) setActif(null); }}
      >
        {/* Reflet carte premium */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          pointerEvents: 'none',
        }} />

        {isMobile ? (
          // Mobile : 3 + 2
          <>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '2px' }}>
              {ligne1.map(renderBouton)}
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              {ligne2.map(renderBouton)}
            </div>
          </>
        ) : (
          // Desktop : 5 boutons en ligne
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-evenly', width: '100%', padding: '0 16px' }}>
            {ITEMS.map(renderBouton)}
          </div>
        )}
      </div>

      {/* Espace réservé */}
      <div style={{ height: visible ? (isMobile ? '68px' : '56px') : '0', transition: 'height 0.4s ease' }} />
    </>
  );
}