import React from 'react';

// Ordre gauche → droite : Mentions - Confidentialité - CGV - Droits - Contact
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
Adresse e-mail : kevin53001@gmail.com
Site internet : https://kevinteoart.fr


HÉBERGEMENT

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

kevin53001@gmail.com`,
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

Pour exercer ces droits : kevin53001@gmail.com

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

Pour toute demande : kevin53001@gmail.com

Merci de respecter le travail des artistes et de contribuer à faire vivre la création indépendante.`,
  },

  contact: {
    titre: 'Contact',
    texte: `Une question ?

Besoin d'aide concernant une commande, un téléchargement ou votre compte utilisateur ?

Vous pouvez me contacter à l'adresse suivante :

kevin53001@gmail.com

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
  const panneauRef = React.useRef(null);

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

  const toggleItem = (id) => setActif(prev => prev === id ? null : id);
  const contenu = actif ? CONTENUS[actif] : null;
  const couleurActif = actif ? ITEMS.find(i => i.id === actif)?.couleur : null;

  return (
    <>
      {/* Panneau contenu légal */}
      <div style={{
        position: 'fixed',
        bottom: '44px',
        left: 0,
        right: 0,
        zIndex: 998,
        overflow: 'hidden',
        maxHeight: actif ? '70vh' : '0',
        transition: 'max-height 0.4s ease',
      }}>
        <div
          ref={panneauRef}
          style={{
            background: 'rgba(8,8,8,0.98)',
            borderTop: `1px solid ${couleurActif || 'rgba(255,255,255,0.1)'}`,
            padding: '20px 28px 28px',
            overflowY: 'auto',
            maxHeight: '70vh',
          }}
          onClick={e => e.stopPropagation()}
        >
          {contenu && (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                position: 'sticky',
                top: 0,
                background: 'rgba(8,8,8,0.98)',
                paddingBottom: '12px',
                borderBottom: `1px solid rgba(${COULEUR_RGB[couleurActif]},0.2)`,
              }}>
                <span style={{ fontFamily: 'var(--font-titre)', fontSize: '20px', color: couleurActif }}>
                  {contenu.titre}
                </span>
                <button
                  onClick={() => setActif(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}
                >✕</button>
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.82)',
                fontFamily: 'var(--font-texte)',
                fontSize: '15px',
                lineHeight: '1.75',
                whiteSpace: 'pre-wrap',
              }}>
                {contenu.texte}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bande noire fixe */}
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: '44px',
          background: '#000',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s ease',
        }}
        onClick={() => { if (actif) setActif(null); }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          width: '100%',
          maxWidth: '750px',
          padding: '0 12px',
        }}>
          {ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={e => { e.stopPropagation(); toggleItem(item.id); }}
              style={{
                background: actif === item.id ? `rgba(${COULEUR_RGB[item.couleur]},0.13)` : 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '20px',
                fontFamily: 'var(--font-bouton)',
                fontSize: '11px',
                color: actif === item.id ? item.couleur : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s, background 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '7px', height: '7px',
                borderRadius: '50%',
                background: item.couleur,
                marginRight: '5px',
                verticalAlign: 'middle',
                boxShadow: `0 0 5px ${item.couleur}`,
                opacity: actif === item.id ? 1 : 0.6,
              }} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Espace réservé pour ne pas masquer le bas de page */}
      <div style={{ height: visible ? '44px' : '0', transition: 'height 0.4s ease' }} />
    </>
  );
}
