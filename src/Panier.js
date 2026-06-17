import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import { usePanier } from './PanierContext';
import BoutonsFlottants from './BoutonsFlottants';
import Cloche from './Cloche';
import BandeLegale from './BandeLegale';
import OngletsLateraux from './OngletsLateraux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const R2 = 'https://images.kevinteoart.fr';
const BANNER_MAX = '1200px';
const SPEED = '80s';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const STRIPE_PUBLIC_KEY = 'pk_test_51TjEyo57G7nd8gWxQzKDp4eMEahmHKzEvC2Ie9Kmn12u9XsjxGjVnTc1l4x6Kx5CgzHKbz90rzJA7ov4VFN0rsAC00AURgb7Mn';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const BARRES = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.40 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`), opacite: 0.30 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`), opacite: 0.20 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`), opacite: 0.15 },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`), opacite: 0.10 },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`),  opacite: 0.05 },
];

const CATEGORIES = ['Tout', 'Animaux', 'Cartes Postales et Marques Page', 'Contes et Princesses', 'Halloween', 'Kawaii/Chibi', 'Manga', 'Noël', 'Portrait'];
const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
function getMoisPatreonDisponibles() {
  const maintenant = new Date();
  const moisCourant = maintenant.getMonth();
  const anneeCourante = maintenant.getFullYear();
  if (anneeCourante < 2026) return [];
  if (anneeCourante > 2026) return MOIS_FR.map(m => `Patreon - ${m} 2026`);
  return MOIS_FR.slice(0, moisCourant + 1).map(m => `Patreon - ${m} 2026`);
}

function LogoPremium({ onClick, isMobile, L }) {
  const ref = React.useRef(null);
  const wrapRef = React.useRef(null);
  const handleMouseMove = (e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    el.style.transform = `rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.08)`;
    if (wrapRef.current) wrapRef.current.style.transform = 'perspective(600px)';
  };
  const handleMouseLeave = () => {
    if (ref.current) { ref.current.style.transform = ''; ref.current.classList.remove('shining-logo'); }
    if (wrapRef.current) wrapRef.current.style.transform = '';
  };
  const handleMouseEnter = () => {
    const el = ref.current; if (!el) return;
    el.classList.remove('shining-logo'); void el.offsetWidth; el.classList.add('shining-logo');
  };
  return (
    <div ref={wrapRef} style={{ perspective: '600px', flexShrink: 0, zIndex: 10 }}>
      <img ref={ref} src={`${R2}/site/Logo.png`} alt="logo"
        onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}
        style={{ width: `${L}px`, height: `${L}px`, borderRadius: '50%', border: `${isMobile ? 3 : 4}px solid #000`, boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover', cursor: 'pointer', transformStyle: 'preserve-3d', transition: 'transform 0.1s ease, box-shadow 0.3s', willChange: 'transform', position: 'relative' }} />
    </div>
  );
}

// ─── Indicateur d'étapes ─────────────────────────────────────────────────────
function IndicateurEtapes({ etape, isMobile }) {
  const etapes = ['Panier', 'Infos', 'Récap', 'Paiement', 'Confirmation'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '4px' : '8px', marginBottom: '32px' }}>
      {etapes.map((nom, i) => {
        const num = i + 1;
        const actif = num === etape;
        const fait = num < etape;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', borderRadius: '50%',
                background: fait ? '#00d4d4' : actif ? '#ff3eb5' : 'rgba(255,255,255,0.08)',
                border: `2px solid ${fait ? '#00d4d4' : actif ? '#ff3eb5' : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: fait || actif ? '#000' : 'rgba(255,255,255,0.3)',
                fontSize: isMobile ? '11px' : '13px', fontWeight: 'bold',
                transition: 'all .3s',
              }}>
                {fait ? '✓' : num}
              </div>
              {!isMobile && <span style={{ fontSize: '10px', color: actif ? '#ff3eb5' : fait ? '#00d4d4' : 'rgba(255,255,255,0.3)', fontWeight: actif ? 'bold' : 'normal' }}>{nom}</span>}
            </div>
            {i < etapes.length - 1 && (
              <div style={{ width: isMobile ? '16px' : '32px', height: '2px', background: fait ? '#00d4d4' : 'rgba(255,255,255,0.1)', transition: 'background .3s', marginBottom: isMobile ? '0' : '18px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Étape 1 : Panier ────────────────────────────────────────────────────────
function EtapePanier({ onContinuer, isMobile }) {
  const { articles, reductions, supprimerArticle } = usePanier();

  const labelType = (type) => {
    if (type === 'illustration') return { label: 'Illustration', couleur: '#ff3eb5' };
    if (type === 'livre_pdf') return { label: 'Livre PDF', couleur: '#00d4d4' };
    if (type === 'recueil') return { label: 'Recueil PDF', couleur: '#00d4d4' };
    if (type === 'relie') return { label: 'Version Reliée', couleur: '#ffd250' };
    return { label: type, couleur: '#fff' };
  };

  if (articles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '8px' }}>Votre panier est vide</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Parcourez le catalogue pour ajouter des illustrations !</p>
      </div>
    );
  }

  const sections = [
    { type: 'illustration', titre: 'Illustrations', taux: reductions.tauxIllus, total: reductions.totalIllus, totalBrut: reductions.totalIllusBrut, message: reductions.messageIllus },
    { type: 'livre_pdf', titre: 'Livres PDF', taux: reductions.tauxLivres, total: reductions.totalLivres, totalBrut: reductions.totalLivresBrut, message: reductions.messageLivres },
    { type: 'recueil', titre: 'Recueils', taux: reductions.tauxRecueils, total: reductions.totalRecueils, totalBrut: reductions.totalRecueilsBrut, message: reductions.messageRecueils },
    { type: 'relie', titre: 'Versions Reliées', taux: 0, total: reductions.totalRelies, totalBrut: reductions.totalReliesBrut, message: null },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {sections.map(section => {
        const articlesSection = articles.filter(a => a.type === section.type);
        if (articlesSection.length === 0) return null;
        return (
          <div key={section.type}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>{section.titre}</h3>
              {section.taux > 0 && (
                <span style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', padding: '2px 10px', color: '#00d4d4', fontSize: '12px', fontWeight: 'bold' }}>
                  −{Math.round(section.taux * 100)}% appliqué
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {articlesSection.map(article => {
                const { label, couleur } = labelType(article.type);
                const prixAffiche = article.type === 'relie' ? article.prixRelie : article.prix;
                return (
                  <div key={`${article.type}-${article.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px' }}>
                    {article.image && (
                      <img src={article.image} alt={article.nom} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '7px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.nom}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ background: `${couleur}22`, border: `1px solid ${couleur}44`, borderRadius: '10px', padding: '1px 7px', color: couleur, fontSize: '10px' }}>{label}</span>
                        {article.type === 'relie' && article.pays && (
                          <span style={{ color: 'rgba(255,210,80,0.6)', fontSize: '10px' }}>📦 {article.pays} · {article.delai}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{parseFloat(prixAffiche).toFixed(2)} €</span>
                      <button onClick={() => supprimerArticle(article.type, article.id)}
                        style={{ background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '6px', padding: '4px 8px', color: 'rgba(255,100,100,0.6)', fontSize: '14px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {section.taux > 0 && section.totalBrut !== section.total && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingRight: '4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'line-through' }}>{section.totalBrut.toFixed(2)} €</span>
                <span style={{ color: '#00d4d4', fontSize: '13px', fontWeight: 'bold' }}>{section.total.toFixed(2)} €</span>
              </div>
            )}

            {section.message && (
              <div style={{ background: 'rgba(255,210,80,0.06)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}>
                <p style={{ color: 'rgba(255,210,80,0.85)', fontSize: '11px' }}>💡 {section.message}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Total général */}
      <div style={{ background: 'rgba(255,62,181,0.06)', border: '1px solid rgba(255,62,181,0.2)', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>Total</span>
        <span style={{ color: '#ff3eb5', fontSize: '22px', fontWeight: 'bold' }}>{reductions.totalGeneral.toFixed(2)} €</span>
      </div>

      <button onClick={onContinuer} style={{ width: '100%', background: 'linear-gradient(135deg, #ff3eb5, #cc2090)', border: 'none', borderRadius: '12px', padding: '16px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,62,181,0.3)' }}>
        Continuer →
      </button>
    </div>
  );
}

// ─── Étape 2 : Informations ───────────────────────────────────────────────────
function EtapeInfos({ onContinuer, onRetour, isMobile, infos, setInfos }) {
  const { articles } = usePanier();
  const aRelie = articles.some(a => a.type === 'relie');

  const valider = () => {
    if (!infos.email.trim()) return;
    onContinuer();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>Vos informations</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Adresse email *</label>
        <input
          type="email"
          value={infos.email}
          onChange={e => setInfos(prev => ({ ...prev, email: e.target.value }))}
          placeholder="votre@email.com"
          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${infos.email ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' }}
        />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>Votre confirmation de commande et lien de téléchargement seront envoyés à cette adresse.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Prénom (facultatif)</label>
        <input
          type="text"
          value={infos.prenom}
          onChange={e => setInfos(prev => ({ ...prev, prenom: e.target.value }))}
          placeholder="Votre prénom"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' }}
        />
      </div>

      {aRelie && (
        <div style={{ background: 'rgba(255,210,80,0.06)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '12px', padding: '14px' }}>
          <p style={{ color: 'rgba(255,210,80,0.9)', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>📚 Version reliée dans votre commande</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Le pays de livraison a déjà été renseigné dans la fiche du livre. Vous pourrez le vérifier à l'étape suivante.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button onClick={onRetour} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer' }}>
          ← Retour
        </button>
        <button onClick={valider} disabled={!infos.email.trim()} style={{ flex: 2, background: infos.email.trim() ? 'linear-gradient(135deg, #ff3eb5, #cc2090)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', padding: '14px', color: infos.email.trim() ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '14px', cursor: infos.email.trim() ? 'pointer' : 'default', boxShadow: infos.email.trim() ? '0 4px 20px rgba(255,62,181,0.3)' : 'none' }}>
          Continuer →
        </button>
      </div>
    </div>
  );
}

// ─── Étape 3 : Récapitulatif ──────────────────────────────────────────────────
function EtapeRecap({ onContinuer, onRetour, isMobile, infos, retractation, setRetractation }) {
  const { articles, reductions } = usePanier();
  const aPdf = articles.some(a => a.type !== 'relie');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Récapitulatif de votre commande</h2>

      {/* Articles */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {articles.map(article => {
          const prix = article.type === 'relie' ? article.prixRelie : article.prix;
          return (
            <div key={`${article.type}-${article.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.nom}</p>
                {article.type === 'relie' && <p style={{ color: 'rgba(255,210,80,0.7)', fontSize: '11px' }}>Version Reliée · {article.pays}</p>}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', flexShrink: 0 }}>{parseFloat(prix).toFixed(2)} €</span>
            </div>
          );
        })}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        {(reductions.tauxIllus > 0 || reductions.tauxLivres > 0 || reductions.tauxRecueils > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {reductions.tauxIllus > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(0,212,212,0.8)', fontSize: '12px' }}>Réduction illustrations (−{Math.round(reductions.tauxIllus * 100)}%)</span><span style={{ color: '#00d4d4', fontSize: '12px' }}>−{(reductions.totalIllusBrut - reductions.totalIllus).toFixed(2)} €</span></div>}
            {reductions.tauxLivres > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(0,212,212,0.8)', fontSize: '12px' }}>Réduction livres PDF (−{Math.round(reductions.tauxLivres * 100)}%)</span><span style={{ color: '#00d4d4', fontSize: '12px' }}>−{(reductions.totalLivresBrut - reductions.totalLivres).toFixed(2)} €</span></div>}
            {reductions.tauxRecueils > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(0,212,212,0.8)', fontSize: '12px' }}>Réduction recueils (−{Math.round(reductions.tauxRecueils * 100)}%)</span><span style={{ color: '#00d4d4', fontSize: '12px' }}>−{(reductions.totalRecueilsBrut - reductions.totalRecueils).toFixed(2)} €</span></div>}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>Total</span>
          <span style={{ color: '#ff3eb5', fontSize: '20px', fontWeight: 'bold' }}>{reductions.totalGeneral.toFixed(2)} €</span>
        </div>
      </div>

      {/* Infos client */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirmation envoyée à</p>
        <p style={{ color: '#fff', fontSize: '14px' }}>{infos.email}</p>
        {infos.prenom && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>{infos.prenom}</p>}
      </div>

      {/* Case rétractation — obligatoire si produits numériques */}
      {aPdf && (
        <div style={{ background: 'rgba(0,212,212,0.05)', border: `1px solid ${retractation ? 'rgba(0,212,212,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'border-color .2s' }}
          onClick={() => setRetractation(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${retractation ? '#00d4d4' : 'rgba(255,255,255,0.3)'}`, background: retractation ? '#00d4d4' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all .2s', boxShadow: retractation ? '0 0 8px rgba(0,212,212,0.4)' : 'none' }}>
              {retractation && <span style={{ color: '#000', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', lineHeight: '1.6' }}>
              Je reconnais que ma commande contient des <strong style={{ color: '#fff' }}>biens numériques à téléchargement immédiat</strong> et je renonce expressément à mon droit de rétractation de 14 jours conformément à l'article L.221-28 du Code de la consommation. <strong style={{ color: '#00d4d4' }}>Cette case est obligatoire pour finaliser votre commande.</strong>
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onRetour} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer' }}>
          ← Retour
        </button>
        <button onClick={onContinuer} disabled={aPdf && !retractation} style={{ flex: 2, background: (!aPdf || retractation) ? 'linear-gradient(135deg, #ff3eb5, #cc2090)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', padding: '14px', color: (!aPdf || retractation) ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '14px', cursor: (!aPdf || retractation) ? 'pointer' : 'default', boxShadow: (!aPdf || retractation) ? '0 4px 20px rgba(255,62,181,0.3)' : 'none' }}>
          Procéder au paiement →
        </button>
      </div>
    </div>
  );
}

// ─── Formulaire Stripe ────────────────────────────────────────────────────────
function FormulaireStripe({ montantCentimes, infos, onSucces, onRetour }) {
  const stripe = useStripe();
  const elements = useElements();
  const [chargement, setChargement] = React.useState(false);
  const [erreur, setErreur] = React.useState(null);

  const handlePayer = async () => {
    if (!stripe || !elements) return;
    setChargement(true);
    setErreur(null);
    try {
      // Créer le PaymentIntent côté serveur
      const resp = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montant: montantCentimes, email: infos.email }),
      });
      const { clientSecret, error: serverError } = await resp.json();
      if (serverError) throw new Error(serverError);

      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email: infos.email, name: infos.prenom || undefined },
        },
      });
      if (error) throw new Error(error.message);
      if (paymentIntent.status === 'succeeded') onSucces(paymentIntent.id);
    } catch (e) {
      setErreur(e.message);
    }
    setChargement(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Paiement sécurisé</h2>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Carte bancaire</p>
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '14px' }}>
          <CardElement options={{
            style: {
              base: { color: '#fff', fontSize: '15px', fontFamily: 'inherit', '::placeholder': { color: 'rgba(255,255,255,0.3)' } },
              invalid: { color: '#ff4d4d' },
            },
            hidePostalCode: true,
          }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '8px' }}>🔒 Paiement sécurisé par Stripe · Google Pay et Apple Pay acceptés</p>
      </div>

      {erreur && (
        <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ color: '#ff6b6b', fontSize: '13px' }}>⚠️ {erreur}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onRetour} disabled={chargement} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer' }}>
          ← Retour
        </button>
        <button onClick={handlePayer} disabled={!stripe || chargement} style={{ flex: 2, background: stripe && !chargement ? 'linear-gradient(135deg, #ff3eb5, #cc2090)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', padding: '14px', color: stripe && !chargement ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '14px', cursor: stripe && !chargement ? 'pointer' : 'default', boxShadow: stripe && !chargement ? '0 4px 20px rgba(255,62,181,0.3)' : 'none' }}>
          {chargement ? '⏳ Traitement...' : `Payer ${(montantCentimes / 100).toFixed(2)} €`}
        </button>
      </div>
    </div>
  );
}

// ─── Étape 4 : Paiement ──────────────────────────────────────────────────────
function EtapePaiement({ onSucces, onRetour, isMobile, infos }) {
  const { reductions } = usePanier();
  const montantCentimes = Math.round(reductions.totalGeneral * 100);

  return (
    <Elements stripe={stripePromise}>
      <FormulaireStripe montantCentimes={montantCentimes} infos={infos} onSucces={onSucces} onRetour={onRetour} />
    </Elements>
  );
}

// ─── Étape 5 : Confirmation ───────────────────────────────────────────────────
function EtapeConfirmation({ infos, isMobile }) {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,212,212,0.15)', border: '3px solid #00d4d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>✓</div>
      <div>
        <h2 style={{ color: '#00d4d4', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Commande confirmée !</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Merci {infos.prenom ? infos.prenom : ''} pour votre achat.</p>
      </div>
      <div style={{ background: 'rgba(0,212,212,0.06)', border: '1px solid rgba(0,212,212,0.2)', borderRadius: '12px', padding: '16px 24px', maxWidth: '400px', width: '100%' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.7' }}>
          Un email de confirmation avec vos liens de téléchargement a été envoyé à <strong style={{ color: '#fff' }}>{infos.email}</strong>.<br /><br />
          Vos fichiers sont également disponibles dans votre espace <strong style={{ color: '#00d4d4' }}>Mon Compte → Ma Collection</strong>.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate('/mon-compte')} style={{ background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: '#000', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
          Mon Compte
        </button>
        <button onClick={() => navigate('/catalogue')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px 24px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer' }}>
          Continuer mes achats
        </button>
      </div>
    </div>
  );
}

// ─── Page principale Panier ───────────────────────────────────────────────────
export default function Panier() {
  const navigate = useNavigate();
  const location = useLocation();
  const { nbArticles, viderPanier } = usePanier();
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const [showKawaiiMenu, setShowKawaiiMenu] = React.useState(false);
  const [userId, setUserId] = React.useState(null);
  const [etape, setEtape] = React.useState(1);
  const [infos, setInfos] = React.useState({ email: '', prenom: '' });
  const [retractation, setRetractation] = React.useState(false);
  const moisPatreon = getMoisPatreonDisponibles();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Pré-remplir email depuis profil
        const { data: profil } = await supabase.from('profils').select('pseudo, email').eq('id', user.id).single();
        if (profil?.email) setInfos(prev => ({ ...prev, email: profil.email }));
        else if (user.email) setInfos(prev => ({ ...prev, email: user.email }));
        if (profil?.pseudo) setInfos(prev => ({ ...prev, prenom: profil.pseudo }));
      }
    };
    charger();
  }, []);

  const handleSuccesPaiement = (paymentIntentId) => {
    viderPanier();
    setEtape(5);
  };

  const P = isMobile ? 44 : 80;
  const L = isMobile ? 70 : 120;
  const GAP_NAV = isMobile ? 0 : 8;
  const MARGIN_NAV = isMobile ? 2 : 12;
  const H_NAV = isMobile ? 80 : 120;

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: 'var(--font-texte)', overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .pastille { transition: transform .2s, filter .2s; cursor: pointer; }
        .pastille:hover { transform: scale(1.12); filter: brightness(1.2); }
        .dropdown-cat { position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.96); border: 1px solid rgba(0,212,212,0.3); border-radius: 12px; padding: 8px; z-index: 200; min-width: 220px; box-shadow: 0 8px 32px rgba(0,0,0,0.7); }
        .dropdown-item { display: block; width: 100%; padding: 8px 14px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; border-radius: 6px; background: none; border: none; text-align: left; font-family: inherit; }
        .dropdown-item:hover { background: rgba(0,212,212,0.15); color: #00d4d4; }
        .dropdown-item-patreon { display: block; width: 100%; padding: 6px 10px; color: rgba(255,210,80,0.75); font-size: 12px; cursor: pointer; border-radius: 6px; background: none; border: none; text-align: left; font-family: inherit; }
        .dropdown-item-patreon:hover { background: rgba(255,210,80,0.12); color: rgba(255,210,80,1); }
        .shining-logo::before { animation: shine-logo 1.0s ease-in-out forwards; }
        @keyframes shine-logo { 0% { left: -150%; } 100% { left: 220%; } }
        input { font-family: inherit; }
        img { -webkit-user-drag: none; user-drag: none; }
      `}</style>

      <BoutonsFlottants />
      <Cloche />

      {/* Bannière haute */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* Navigation sticky */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', justifyContent: 'center', marginTop: `-${Math.round(L * 0.5)}px`, overflow: 'visible' }}>
        <div style={{ maxWidth: BANNER_MAX, width: isMobile ? '100%' : '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: `${H_NAV}px`, overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginRight: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_accueil.png`} alt="Accueil" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/accueil')} />
            <img src={`${R2}/site/pastille_livres.png`} alt="Livres" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px' }} onClick={() => navigate('/livres')} />
            <div style={{ position: 'relative', width: `${P}px`, height: `${P}px`, flexShrink: 0, marginTop: isMobile ? '-8px' : '0', overflow: 'visible' }}>
              <img src={`${R2}/site/pastille_categories.png`} alt="Catégories" className="pastille" style={{ width: `${P}px`, height: `${P}px`, display: 'block' }} onClick={e => { e.stopPropagation(); setShowCategories(v => !v); setShowPatreonMenu(false); setShowKawaiiMenu(false); }} />
              {showCategories && (
                <div className="dropdown-cat" onClick={e => e.stopPropagation()}>
                  {CATEGORIES.map(cat => (
                    cat === 'Kawaii/Chibi' ? (
                      <div key={cat}>
                        <button className="dropdown-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', color: '#ff3eb5' }} onClick={() => setShowKawaiiMenu(v => !v)}>
                          <span>{cat}</span><span style={{ fontSize: '11px', transition: 'transform .2s', transform: showKawaiiMenu ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                        </button>
                        {showKawaiiMenu && (
                          <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,62,181,0.3)', marginLeft: '14px', marginTop: '4px' }}>
                            <button className="dropdown-item" style={{ color: '#ff3eb5' }} onClick={() => { navigate('/catalogue', { state: { categorie: 'Kawaii/Chibi' } }); setShowCategories(false); setShowKawaiiMenu(false); }}>Tout Kawaii/Chibi</button>
                            {['Astro', 'Creepy', 'Monsters', 'Princess', 'Divers'].map(sc => (
                              <button key={sc} className="dropdown-item" style={{ color: '#ff3eb5' }} onClick={() => { navigate('/catalogue', { state: { categorie: 'Kawaii/Chibi', sousCategorie: sc } }); setShowCategories(false); setShowKawaiiMenu(false); }}>{sc}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button key={cat} className="dropdown-item" style={cat === 'Tout' ? { fontWeight: 'bold', fontSize: '15px' } : {}} onClick={() => { navigate('/catalogue', { state: { categorie: cat } }); setShowCategories(false); }}>{cat}</button>
                    )
                  ))}
                  <div style={{ height: '1px', background: 'rgba(255,210,80,0.2)', margin: '6px 8px' }} />
                  <button className="dropdown-item" style={{ color: 'rgba(255,210,80,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }} onClick={() => setShowPatreonMenu(v => !v)}>
                    <span>⭐ Patreon 2026</span><span style={{ fontSize: '11px', transition: 'transform .2s', transform: showPatreonMenu ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                  </button>
                  {showPatreonMenu && (
                    <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,210,80,0.2)', marginLeft: '14px', marginTop: '4px' }}>
                      {moisPatreon.map(mois => (
                        <button key={mois} className="dropdown-item-patreon" onClick={() => { navigate('/catalogue', { state: { sousCategorie: mois } }); setShowCategories(false); setShowPatreonMenu(false); }}>{mois.replace('Patreon - ', '')}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <LogoPremium onClick={() => navigate('/presentation')} isMobile={isMobile} L={L} />
          <div style={{ display: 'flex', alignItems: 'center', gap: `${GAP_NAV}px`, marginLeft: `${MARGIN_NAV}px`, flexShrink: 0 }}>
            <img src={`${R2}/site/pastille_pensees.png`} alt="Pensées" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/pensees')} />
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={`${R2}/site/pastille_panier.png`} alt="Panier" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '18px' : '20px', filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255,62,181,0.5))' }} onClick={() => navigate('/panier')} />
              {nbArticles > 0 && (
                <div style={{ position: 'absolute', top: isMobile ? '12px' : '16px', right: '-4px', background: '#ff3eb5', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000', border: '2px solid #000', zIndex: 5 }}>{nbArticles}</div>
              )}
            </div>
            <img src={`${R2}/site/pastille_mon_compte.png`} alt="Mon Compte" className="pastille" style={{ width: `${P}px`, height: `${P}px`, marginTop: isMobile ? '-8px' : '0' }} onClick={() => navigate('/mon-compte')} />
          </div>
        </div>
      </div>

      {/* Bandes défilantes */}
      <div style={{ position: 'relative', width: '100%', marginTop: '16px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {BARRES.map((barre, i) => (
              <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content', opacity: barre.opacite }}>
                  {[...barre.images, ...barre.images].map((img, j) => (
                    <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', display: 'block' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: isMobile ? '32px 16px 60px' : '40px 20px 60px', minHeight: `${BARRES.length * (IMG_H + GAP) + 300}px` }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>

            {/* Titre */}
            <h1 style={{ color: '#fff', fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
              🛒 Mon Panier
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', marginBottom: '32px' }}>Paiement sécurisé · TVA non applicable (art. 293 B du CGI)</p>

            {/* Indicateur d'étapes */}
            {etape < 5 && <IndicateurEtapes etape={etape} isMobile={isMobile} />}

            {/* Tunnel */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: isMobile ? '20px 16px' : '32px' }}>
              {etape === 1 && <EtapePanier onContinuer={() => setEtape(2)} isMobile={isMobile} />}
              {etape === 2 && <EtapeInfos onContinuer={() => setEtape(3)} onRetour={() => setEtape(1)} isMobile={isMobile} infos={infos} setInfos={setInfos} />}
              {etape === 3 && <EtapeRecap onContinuer={() => setEtape(4)} onRetour={() => setEtape(2)} isMobile={isMobile} infos={infos} retractation={retractation} setRetractation={setRetractation} />}
              {etape === 4 && <EtapePaiement onSucces={handleSuccesPaiement} onRetour={() => setEtape(3)} isMobile={isMobile} infos={infos} />}
              {etape === 5 && <EtapeConfirmation infos={infos} isMobile={isMobile} />}
            </div>

          </div>
        </div>
      </div>

      {/* Bannière bas */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://patreon.com/u119601283', '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

      <BandeLegale />
      <OngletsLateraux userId={userId} />
    </div>
  );
}
