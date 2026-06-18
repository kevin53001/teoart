import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import { usePanier } from './PanierContext';
import BoutonsFlottants from './BoutonsFlottants';
import Cloche from './Cloche';
import BandeLegale from './BandeLegale';
import OngletsLateraux from './OngletsLateraux';
import PopupFicheIllu from './PopupFicheIllu';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const R2 = 'https://images.kevinteoart.fr';
const BANNER_MAX = '1200px';
const SPEED = '80s';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const STRIPE_PUBLIC_KEY = 'pk_live_51TjEyXG38aMcCAX1oGQ4dVo2vnnUHrLsFWvG05oyKD0YSp9CyJxPjNNU6geSVMJZy1r6GcujRSXQ6SeC7rRCcNVO00yQFnSeQj'; // TODO: remplacer par pk_live_...
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
function EtapePanier({ onContinuer, isMobile, onOuvrirIllu }) {
  const { articles, reductions, supprimerArticle, setPromoBadge } = usePanier();
  // Chargement de la promo badge active depuis Supabase
  React.useEffect(() => {
    const chargerPromo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profil } = await supabase.from('profils')
        .select('promo_badge_active')
        .eq('id', user.id).single();
      if (profil?.promo_badge_active && Object.keys(profil.promo_badge_active).length > 0) {
        setPromoBadge(profil.promo_badge_active);
      }
    };
    chargerPromo();
  }, [setPromoBadge]);

  const labelType = (type) => {
    if (type === 'illustration') return { label: 'Illustration', couleur: '#ff3eb5' };
    if (type === 'livre_pdf') return { label: 'Livre — Version PDF', couleur: '#00d4d4' };
    if (type === 'recueil') return { label: 'Recueil — Version PDF', couleur: '#00d4d4' };
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

  // ── Helpers affichage article ──
  const ArticleLigne = ({ article, decale = false, prixOverride = null, tauxPromo = null, onClickMiniature = null }) => {
    const { label, couleur } = labelType(article.type);
    const prixBrut = article.type === 'relie' ? (article.prixRelie || 0) : (article.prix || 0);
    const prixFinal = prixOverride !== null ? prixOverride : prixBrut;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: decale ? 'rgba(255,62,181,0.04)' : 'rgba(255,255,255,0.05)', border: `1px solid ${decale ? 'rgba(255,62,181,0.15)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '10px 12px', marginLeft: decale ? '20px' : '0' }}>
        {article.image && (
          <img src={article.image} alt={article.nom}
            onClick={onClickMiniature || undefined}
            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, cursor: onClickMiniature ? 'pointer' : 'default', transition: onClickMiniature ? 'opacity .2s' : 'none' }}
            onMouseEnter={e => { if (onClickMiniature) e.currentTarget.style.opacity = '0.75'; }}
            onMouseLeave={e => { if (onClickMiniature) e.currentTarget.style.opacity = '1'; }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: decale ? 'rgba(255,255,255,0.75)' : '#fff', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.nom}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
            <span style={{ background: `${couleur}22`, border: `1px solid ${couleur}44`, borderRadius: '10px', padding: '1px 7px', color: couleur, fontSize: '10px' }}>{label}</span>
            {article.type === 'relie' && article.pays && <span style={{ color: 'rgba(255,210,80,0.6)', fontSize: '10px' }}>📦 {article.pays} · {article.delai}</span>}
            {tauxPromo && <span style={{ background: 'rgba(255,62,181,0.15)', border: '1px solid rgba(255,62,181,0.3)', borderRadius: '10px', padding: '1px 6px', color: '#ff3eb5', fontSize: '10px', fontWeight: 'bold' }}>−{Math.round(tauxPromo * 100)}% relié</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {tauxPromo && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textDecoration: 'line-through' }}>{prixBrut.toFixed(2)} €</span>}
          <span style={{ color: tauxPromo ? '#ff3eb5' : '#fff', fontSize: '14px', fontWeight: 'bold' }}>{prixFinal.toFixed(2)} €</span>
          <button onClick={() => supprimerArticle(article.type, article.id)}
            style={{ background: 'transparent', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '6px', padding: '3px 7px', color: 'rgba(255,100,100,0.6)', fontSize: '13px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
      </div>
    );
  };

  // ── Regroupements ──
  const illus            = articles.filter(a => a.type === 'illustration');
  const reliesLivres     = articles.filter(a => a.type === 'relie' && a.sousType === 'livre');
  const reliesRecueils   = articles.filter(a => a.type === 'relie' && a.sousType === 'recueil');
  const reliesLegacy     = articles.filter(a => a.type === 'relie' && !a.sousType);
  const livresPdf        = articles.filter(a => a.type === 'livre_pdf');
  const recueilsPdf      = articles.filter(a => a.type === 'recueil');
  const { idsReliesLivres, idsReliesRecueils } = reductions;

  const lignesLivres = [];
  reliesLivres.forEach(relie => {
    lignesLivres.push({ article: relie, decale: false, tauxPromo: null });
    const pdfAssoc = livresPdf.find(l => l.id === relie.id);
    if (pdfAssoc) lignesLivres.push({ article: pdfAssoc, decale: true, prixOverride: pdfAssoc.prix * 0.25, tauxPromo: 0.75 });
  });
  livresPdf.filter(l => !idsReliesLivres.has(l.id)).forEach(l => lignesLivres.push({ article: l, decale: false, tauxPromo: null }));

  const lignesRecueils = [];
  reliesRecueils.forEach(relie => {
    lignesRecueils.push({ article: relie, decale: false, tauxPromo: null });
    const pdfAssoc = recueilsPdf.find(r => r.id === relie.id);
    if (pdfAssoc) lignesRecueils.push({ article: pdfAssoc, decale: true, prixOverride: pdfAssoc.prix * 0.25, tauxPromo: 0.75 });
  });
  recueilsPdf.filter(r => !idsReliesRecueils.has(r.id)).forEach(r => lignesRecueils.push({ article: r, decale: false, tauxPromo: null }));

  const totalLivresAffiche       = reductions.totalLivres + reductions.totalReliesLivres;
  const totalLivresBrutAffiche   = reductions.totalLivresBrut + reductions.totalReliesLivresBrut;
  const totalRecueilsAffiche     = reductions.totalRecueils + reductions.totalReliesRecueils;
  const totalRecueilsBrutAffiche = reductions.totalRecueilsBrut + reductions.totalReliesRecueilsBrut;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Encart TVA */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.6 }}>
          TVA non applicable — article 293 B du Code général des impôts.<br />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Paiement sécurisé par Stripe · CB, Apple Pay, Google Pay, PayPal</span>
        </p>
      </div>

      {/* ── Illustrations ── */}
      {illus.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Illustrations</h3>
            {reductions.tauxIllus > 0 && <span style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', padding: '2px 10px', color: '#00d4d4', fontSize: '12px', fontWeight: 'bold' }}>−{Math.round(reductions.tauxIllus * 100)}% appliqué</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {illus.map(a => <ArticleLigne key={`${a.type}-${a.id}`} article={a} onClickMiniature={() => onOuvrirIllu(a.id)} />)}
          </div>
          {reductions.tauxIllus > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'line-through' }}>{reductions.totalIllusBrut.toFixed(2)} €</span>
              <span style={{ color: '#00d4d4', fontSize: '13px', fontWeight: 'bold' }}>{reductions.totalIllus.toFixed(2)} €</span>
            </div>
          )}
          {reductions.explicationIllus && <div style={{ background: 'rgba(0,212,212,0.07)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}><p style={{ color: '#00d4d4', fontSize: '11px' }}>✨ {reductions.explicationIllus}</p></div>}
          {reductions.messageIllus && <div style={{ background: 'rgba(255,210,80,0.06)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}><p style={{ color: 'rgba(255,210,80,0.85)', fontSize: '11px' }}>💡 {reductions.messageIllus}</p></div>}
        </div>
      )}

      {/* ── Livres ── */}
      {lignesLivres.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Livres</h3>
            {reductions.tauxLivres > 0 && <span style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', padding: '2px 10px', color: '#00d4d4', fontSize: '12px', fontWeight: 'bold' }}>−{Math.round(reductions.tauxLivres * 100)}% appliqué</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {lignesLivres.map((l, i) => <ArticleLigne key={`livres-${i}`} article={l.article} decale={l.decale} prixOverride={l.prixOverride} tauxPromo={l.tauxPromo} />)}
          </div>
          {totalLivresBrutAffiche !== totalLivresAffiche && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'line-through' }}>{totalLivresBrutAffiche.toFixed(2)} €</span>
              <span style={{ color: '#00d4d4', fontSize: '13px', fontWeight: 'bold' }}>{totalLivresAffiche.toFixed(2)} €</span>
            </div>
          )}
          {reductions.explicationLivres && <div style={{ background: 'rgba(0,212,212,0.07)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}><p style={{ color: '#00d4d4', fontSize: '11px' }}>✨ {reductions.explicationLivres}</p></div>}
          {reductions.messageLivres && <div style={{ background: 'rgba(255,210,80,0.06)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}><p style={{ color: 'rgba(255,210,80,0.85)', fontSize: '11px' }}>💡 {reductions.messageLivres}</p></div>}
        </div>
      )}

      {/* ── Recueils ── */}
      {lignesRecueils.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recueils</h3>
            {reductions.tauxRecueils > 0 && <span style={{ background: 'rgba(0,212,212,0.15)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', padding: '2px 10px', color: '#00d4d4', fontSize: '12px', fontWeight: 'bold' }}>−{Math.round(reductions.tauxRecueils * 100)}% appliqué</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {lignesRecueils.map((l, i) => <ArticleLigne key={`recueils-${i}`} article={l.article} decale={l.decale} prixOverride={l.prixOverride} tauxPromo={l.tauxPromo} />)}
          </div>
          {totalRecueilsBrutAffiche !== totalRecueilsAffiche && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'line-through' }}>{totalRecueilsBrutAffiche.toFixed(2)} €</span>
              <span style={{ color: '#00d4d4', fontSize: '13px', fontWeight: 'bold' }}>{totalRecueilsAffiche.toFixed(2)} €</span>
            </div>
          )}
          {reductions.explicationRecueils && <div style={{ background: 'rgba(0,212,212,0.07)', border: '1px solid rgba(0,212,212,0.25)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}><p style={{ color: '#00d4d4', fontSize: '11px' }}>✨ {reductions.explicationRecueils}</p></div>}
          {reductions.messageRecueils && <div style={{ background: 'rgba(255,210,80,0.06)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}><p style={{ color: 'rgba(255,210,80,0.85)', fontSize: '11px' }}>💡 {reductions.messageRecueils}</p></div>}
        </div>
      )}

      {/* ── Reliés legacy ── */}
      {reliesLegacy.length > 0 && (
        <div>
          <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Versions Reliées</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reliesLegacy.map(a => <ArticleLigne key={`relie-${a.id}`} article={a} />)}
          </div>
        </div>
      )}

      {/* Sous-total si badge */}
      {reductions.tauxBadgeTotal > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Sous-total après réductions</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{reductions.totalApresPaliers.toFixed(2)} €</span>
        </div>
      )}

      {/* Bloc badge */}
      {reductions.explicationBadge && (
        <div style={{ background: 'linear-gradient(135deg, rgba(255,210,80,0.08), rgba(255,62,181,0.06))', border: '1px solid rgba(255,210,80,0.35)', borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,210,80,0.95)', fontSize: '12px', fontWeight: 'bold' }}>Réduction badge</span>
            <span style={{ color: '#ff3eb5', fontSize: '14px', fontWeight: 'bold' }}>−{Math.round(reductions.tauxBadgeTotal * 100)}%</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', lineHeight: 1.5 }}>{reductions.explicationBadge.texte}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '2px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'line-through' }}>{reductions.totalApresPaliers.toFixed(2)} €</span>
            <span style={{ color: '#ff3eb5', fontSize: '13px', fontWeight: 'bold' }}>−{reductions.remiseBadge.toFixed(2)} €</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontStyle: 'italic' }}>Valable une seule fois — sera consommée à la validation du paiement.</p>
        </div>
      )}

      {/* Total */}
      <div style={{ background: 'rgba(255,62,181,0.08)', border: '1px solid rgba(255,62,181,0.25)', borderRadius: '14px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>Total</span>
        <span style={{ color: '#ff3eb5', fontSize: '24px', fontWeight: 'bold' }}>{reductions.totalGeneral.toFixed(2)} €</span>
      </div>

      <button onClick={onContinuer} style={{ width: '100%', background: 'linear-gradient(135deg, #ff3eb5, #cc2090)', border: 'none', borderRadius: '12px', padding: '16px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,62,181,0.3)' }}>
        Continuer →
      </button>


    </div>
  );
}

// ─── Champ formulaire (hors composant pour éviter le bug de focus) ────────────
function ChampInput({ label, obligatoire, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ color: obligatoire ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: obligatoire ? '600' : 'normal' }}>
          {label}
        </label>
        {obligatoire && (
          <span style={{ color: '#ff3eb5', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
            * <span style={{ fontSize: '10px' }}>champ obligatoire</span>
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${(value || '').trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none',
          transition: 'border-color .2s', width: '100%', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// ─── Étape 2 : Coordonnées ────────────────────────────────────────────────────
function EtapeInfos({ onContinuer, onRetour, isMobile, infos, setInfos, infosFacturation, setInfosFacturation, facturationDifferente, setFacturationDifferente }) {
  const { articles } = usePanier();
  const aRelie = articles.some(a => a.type === 'relie');
  const [chargement, setChargement] = React.useState(false);
  const [sauvegarde, setSauvegarde] = React.useState(false);

  // Pré-remplissage depuis Supabase
  React.useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profil } = await supabase.from('profils')
        .select('email, prenom, nom, adresse, complement, code_postal, ville, etat, pays')
        .eq('id', user.id).single();
      if (!profil) return;
      setInfos(prev => ({
        ...prev,
        email:       prev.email || user.email || '',
        prenom:      prev.prenom || profil.prenom || '',
        nom:         prev.nom || profil.nom || '',
        adresse:     prev.adresse || profil.adresse || '',
        complement:  prev.complement || profil.complement || '',
        code_postal: prev.code_postal || profil.code_postal || '',
        ville:       prev.ville || profil.ville || '',
        etat:        prev.etat || profil.etat || '',
        pays:        prev.pays || profil.pays || '',
      }));
    };
    charger();
  }, []); // eslint-disable-line

  const champObligatoires = ['email', 'prenom', 'nom', 'adresse', 'code_postal', 'ville', 'pays'];
  const peutContinuer = champObligatoires.every(c => (infos[c] || '').trim() !== '') &&
    (!facturationDifferente || ['prenom', 'nom', 'adresse', 'code_postal', 'ville', 'pays'].every(c => (infosFacturation[c] || '').trim() !== ''));

  const setChamp = (champ) => (val) => setInfos(prev => ({ ...prev, [champ]: val }));
  const setChampFact = (champ) => (val) => setInfosFacturation(prev => ({ ...prev, [champ]: val }));

  const valider = async () => {
    if (!peutContinuer) return;
    setChargement(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profils').update({
          prenom: infos.prenom, nom: infos.nom,
          adresse: infos.adresse, complement: infos.complement || null,
          code_postal: infos.code_postal, ville: infos.ville,
          etat: infos.etat || null, pays: infos.pays,
        }).eq('id', user.id);
      }
    } catch {}
    setSauvegarde(true);
    setTimeout(() => { setSauvegarde(false); setChargement(false); onContinuer(); }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Vos coordonnées</h2>

      {/* Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: '600' }}>Adresse email</label>
          <span style={{ color: '#ff3eb5', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>* <span style={{ fontSize: '10px' }}>champ obligatoire</span></span>
        </div>
        <input type="email" value={infos.email || ''} onChange={e => setChamp('email')(e.target.value)}
          placeholder="votre@email.com" autoComplete="email"
          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${(infos.email || '').trim() ? 'rgba(0,212,212,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border-color .2s', width: '100%', boxSizing: 'border-box' }} />
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>Votre confirmation de commande sera envoyée à cette adresse.</p>
      </div>

      {/* Identité */}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Identité</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <ChampInput label="Prénom" obligatoire value={infos.prenom || ''} onChange={setChamp('prenom')} placeholder="Votre prénom" autoComplete="given-name" />
          <ChampInput label="Nom" obligatoire value={infos.nom || ''} onChange={setChamp('nom')} placeholder="Votre nom" autoComplete="family-name" />
        </div>
      </div>

      {/* Adresse de livraison */}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          {aRelie ? 'Adresse de livraison' : 'Adresse'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ChampInput label="Adresse" obligatoire value={infos.adresse || ''} onChange={setChamp('adresse')} placeholder="Numéro et nom de rue" autoComplete="address-line1" />
          <ChampInput label="Complément d'adresse" value={infos.complement || ''} onChange={setChamp('complement')} placeholder="Appartement, bâtiment, étage..." autoComplete="address-line2" />
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
            <ChampInput label="Code postal" obligatoire value={infos.code_postal || ''} onChange={setChamp('code_postal')} placeholder="75001" autoComplete="postal-code" />
            <ChampInput label="Ville" obligatoire value={infos.ville || ''} onChange={setChamp('ville')} placeholder="Paris" autoComplete="address-level2" />
          </div>
          <ChampInput label="État / Province" value={infos.etat || ''} onChange={setChamp('etat')} placeholder="Facultatif" autoComplete="address-level1" />
          <ChampInput label="Pays" obligatoire value={infos.pays || ''} onChange={setChamp('pays')} placeholder="France" autoComplete="country-name" />
        </div>
      </div>

      {/* Adresse facturation */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}
        onClick={() => setFacturationDifferente(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${facturationDifferente ? '#00d4d4' : 'rgba(255,255,255,0.3)'}`, background: facturationDifferente ? '#00d4d4' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s', boxShadow: facturationDifferente ? '0 0 8px rgba(0,212,212,0.4)' : 'none' }}>
            {facturationDifferente && <span style={{ color: '#000', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>Mon adresse de facturation est différente</p>
        </div>
      </div>

      {facturationDifferente && (
        <div style={{ borderLeft: '2px solid rgba(0,212,212,0.2)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Adresse de facturation</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <ChampInput label="Prénom" obligatoire value={infosFacturation.prenom || ''} onChange={setChampFact('prenom')} placeholder="Prénom" autoComplete="billing given-name" />
            <ChampInput label="Nom" obligatoire value={infosFacturation.nom || ''} onChange={setChampFact('nom')} placeholder="Nom" autoComplete="billing family-name" />
          </div>
          <ChampInput label="Adresse" obligatoire value={infosFacturation.adresse || ''} onChange={setChampFact('adresse')} placeholder="Numéro et nom de rue" autoComplete="billing address-line1" />
          <ChampInput label="Complément" value={infosFacturation.complement || ''} onChange={setChampFact('complement')} placeholder="Appartement, bâtiment..." autoComplete="billing address-line2" />
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
            <ChampInput label="Code postal" obligatoire value={infosFacturation.code_postal || ''} onChange={setChampFact('code_postal')} placeholder="75001" autoComplete="billing postal-code" />
            <ChampInput label="Ville" obligatoire value={infosFacturation.ville || ''} onChange={setChampFact('ville')} placeholder="Paris" autoComplete="billing address-level2" />
          </div>
          <ChampInput label="Pays" obligatoire value={infosFacturation.pays || ''} onChange={setChampFact('pays')} placeholder="France" autoComplete="billing country-name" />
        </div>
      )}

      {/* Note reliés */}
      {aRelie && (
        <div style={{ background: 'rgba(255,210,80,0.06)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '12px', padding: '14px' }}>
          <p style={{ color: 'rgba(255,210,80,0.9)', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Version(s) reliée(s) dans votre commande</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', lineHeight: 1.6 }}>Le pays de livraison a été renseigné lors de l'ajout au panier. Vous pouvez le vérifier au récapitulatif.</p>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        <button onClick={onRetour} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer' }}>
          ← Retour
        </button>
        <button onClick={valider} disabled={!peutContinuer || chargement}
          style={{ flex: 2, background: peutContinuer && !chargement ? 'linear-gradient(135deg, #ff3eb5, #cc2090)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', padding: '14px', color: peutContinuer && !chargement ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '14px', cursor: peutContinuer && !chargement ? 'pointer' : 'default', boxShadow: peutContinuer && !chargement ? '0 4px 20px rgba(255,62,181,0.3)' : 'none', transition: 'all .2s' }}>
          {sauvegarde ? '✓ Enregistré' : chargement ? 'Enregistrement...' : 'Continuer →'}
        </button>
      </div>
      {!peutContinuer && <p style={{ color: 'rgba(255,100,100,0.6)', fontSize: '11px', textAlign: 'center', marginTop: '-8px' }}>Veuillez remplir tous les champs obligatoires (marqués d'un *).</p>}
    </div>
  );
}

// ─── Étape 3 : Récapitulatif final ───────────────────────────────────────────
function EtapeRecap({ onContinuer, onRetour, isMobile, infos, infosFacturation, retractation, setRetractation, cgvAcceptees, setCgvAcceptees }) {
  const { articles, reductions } = usePanier();
  const aPdf = articles.some(a => a.type !== 'relie');
  const aRelie = articles.some(a => a.type === 'relie');
  const peutContinuer = cgvAcceptees && (!aPdf || retractation);

  const labelType = (type) => {
    if (type === 'illustration') return 'Illustration';
    if (type === 'livre_pdf') return 'Livre — Version PDF';
    if (type === 'recueil') return 'Recueil — Version PDF';
    if (type === 'relie') return 'Version Reliée';
    return type;
  };

  // Calcul prix final par article (pour affichage cohérent avec le total)
  const { idsReliesLivres, idsReliesRecueils } = reductions;

  const prixAffiche = (article) => {
    const brut = article.type === 'relie' ? (article.prixRelie || 0) : (article.prix || 0);
    // PDF avec relié correspondant → −75%
    if (article.type === 'livre_pdf' && idsReliesLivres.has(article.id)) return { brut, final: brut * 0.25, promo: true };
    if (article.type === 'recueil' && idsReliesRecueils.has(article.id)) return { brut, final: brut * 0.25, promo: true };
    return { brut, final: brut, promo: false };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Récapitulatif final</h2>

      {/* Articles — même ordre et regroupement que l'étape 1 */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Articles</p>
        {(() => {
          // Même regroupement que l'étape 1
          const illus          = articles.filter(a => a.type === 'illustration');
          const reliesLivres   = articles.filter(a => a.type === 'relie' && a.sousType === 'livre');
          const reliesRecueils = articles.filter(a => a.type === 'relie' && a.sousType === 'recueil');
          const reliesLegacy   = articles.filter(a => a.type === 'relie' && !a.sousType);
          const livresPdf      = articles.filter(a => a.type === 'livre_pdf');
          const recueilsPdf    = articles.filter(a => a.type === 'recueil');

          // Construire la liste ordonnée : illus, puis livres (relié + pdf associé, puis pdf seuls), puis recueils, puis legacy
          const lignes = [];
          illus.forEach(a => lignes.push(a));
          reliesLivres.forEach(relie => {
            lignes.push(relie);
            const pdf = livresPdf.find(l => l.id === relie.id);
            if (pdf) lignes.push(pdf);
          });
          livresPdf.filter(l => !idsReliesLivres.has(l.id)).forEach(a => lignes.push(a));
          reliesRecueils.forEach(relie => {
            lignes.push(relie);
            const pdf = recueilsPdf.find(r => r.id === relie.id);
            if (pdf) lignes.push(pdf);
          });
          recueilsPdf.filter(r => !idsReliesRecueils.has(r.id)).forEach(a => lignes.push(a));
          reliesLegacy.forEach(a => lignes.push(a));

          return lignes.map(article => {
            const { brut, final, promo } = prixAffiche(article);
            const estPdfAssocie = (article.type === 'livre_pdf' && idsReliesLivres.has(article.id)) || (article.type === 'recueil' && idsReliesRecueils.has(article.id));
            return (
              <div key={`${article.type}-${article.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginLeft: estPdfAssocie ? '16px' : '0', borderLeft: estPdfAssocie ? '2px solid rgba(255,62,181,0.2)' : 'none', paddingLeft: estPdfAssocie ? '10px' : '0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: estPdfAssocie ? 'rgba(255,255,255,0.75)' : '#fff', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>{article.nom}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '1px' }}>
                    {labelType(article.type)}
                    {article.type === 'relie' && article.pays ? ` · ${article.pays}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                  {promo && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textDecoration: 'line-through' }}>{brut.toFixed(2)} €</span>}
                  <span style={{ color: promo ? '#ff3eb5' : 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: promo ? 'bold' : 'normal' }}>{final.toFixed(2)} €</span>
                </div>
              </div>
            );
          });
        })()}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

        {/* Réductions paliers */}
        {(reductions.tauxIllus > 0 || reductions.tauxLivres > 0 || reductions.tauxRecueils > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {reductions.tauxIllus > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(0,212,212,0.8)', fontSize: '12px' }}>Réduction illustrations (−{Math.round(reductions.tauxIllus * 100)}%)</span>
                <span style={{ color: '#00d4d4', fontSize: '12px', fontWeight: 'bold' }}>−{(reductions.totalIllusBrut - reductions.totalIllus).toFixed(2)} €</span>
              </div>
            )}
            {reductions.tauxLivres > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(0,212,212,0.8)', fontSize: '12px' }}>Réduction livres PDF + reliés (−{Math.round(reductions.tauxLivres * 100)}%)</span>
                <span style={{ color: '#00d4d4', fontSize: '12px', fontWeight: 'bold' }}>−{(reductions.totalLivresBrut + reductions.totalReliesLivresBrut - reductions.totalLivres - reductions.totalReliesLivres).toFixed(2)} €</span>
              </div>
            )}
            {reductions.tauxRecueils > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(0,212,212,0.8)', fontSize: '12px' }}>Réduction recueils PDF + reliés (−{Math.round(reductions.tauxRecueils * 100)}%)</span>
                <span style={{ color: '#00d4d4', fontSize: '12px', fontWeight: 'bold' }}>−{(reductions.totalRecueilsBrut + reductions.totalReliesRecueilsBrut - reductions.totalRecueils - reductions.totalReliesRecueils).toFixed(2)} €</span>
              </div>
            )}
          </div>
        )}

        {/* Badge */}
        {reductions.tauxBadgeTotal > 0 && reductions.explicationBadge && (
          <>
            <div style={{ height: '1px', background: 'rgba(255,210,80,0.15)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: 'rgba(255,210,80,0.85)', fontSize: '12px', flex: 1 }}>{reductions.explicationBadge.detail} (−{Math.round(reductions.tauxBadgeTotal * 100)}%)</span>
              <span style={{ color: '#ff3eb5', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>−{reductions.remiseBadge.toFixed(2)} €</span>
            </div>
          </>
        )}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>Total</span>
          <span style={{ color: '#ff3eb5', fontSize: '22px', fontWeight: 'bold' }}>{reductions.totalGeneral.toFixed(2)} €</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'right' }}>TVA non applicable · art. 293 B du CGI</p>
      </div>

      {/* Coordonnées */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vos coordonnées</p>
          {!infosFacturation || !infosFacturation.prenom ? (
            <span style={{ color: 'rgba(0,212,212,0.6)', fontSize: '10px', fontStyle: 'italic' }}>Coordonnées de facturation identiques</span>
          ) : null}
        </div>
        <p style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{[infos.prenom, infos.nom].filter(Boolean).join(' ')}</p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{infos.email}</p>
        {infos.adresse && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: 1.6 }}>
          {infos.adresse}{infos.complement ? `, ${infos.complement}` : ''}<br />
          {[infos.code_postal, infos.ville].filter(Boolean).join(' ')}{infos.etat ? `, ${infos.etat}` : ''}<br />
          {infos.pays}
        </p>}
      </div>

      {/* Coordonnées facturation si différentes */}
      {infosFacturation && infosFacturation.prenom && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,212,0.15)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Vos coordonnées de facturation</p>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{[infosFacturation.prenom, infosFacturation.nom].filter(Boolean).join(' ')}</p>
          {infosFacturation.adresse && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: 1.6 }}>
            {infosFacturation.adresse}{infosFacturation.complement ? `, ${infosFacturation.complement}` : ''}<br />
            {[infosFacturation.code_postal, infosFacturation.ville].filter(Boolean).join(' ')}<br />
            {infosFacturation.pays}
          </p>}
        </div>
      )}

      {/* Reliés dans la commande */}
      {aRelie && (
        <div style={{ background: 'rgba(255,210,80,0.05)', border: '1px solid rgba(255,210,80,0.2)', borderRadius: '12px', padding: '14px' }}>
          <p style={{ color: 'rgba(255,210,80,0.9)', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Version(s) reliée(s)</p>
          {articles.filter(a => a.type === 'relie').map(a => (
            <p key={a.id} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.7 }}>
              {a.nom} · <span style={{ color: 'rgba(255,210,80,0.7)' }}>{a.pays}</span> · {a.delai} · {(a.prixRelie || 0).toFixed(2)} € (frais de port inclus)
            </p>
          ))}
        </div>
      )}

      {/* Case CGV */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cgvAcceptees ? 'rgba(0,212,212,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'border-color .2s' }}
        onClick={() => setCgvAcceptees(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${cgvAcceptees ? '#00d4d4' : 'rgba(255,255,255,0.3)'}`, background: cgvAcceptees ? '#00d4d4' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all .2s', boxShadow: cgvAcceptees ? '0 0 8px rgba(0,212,212,0.4)' : 'none' }}>
            {cgvAcceptees && <span style={{ color: '#000', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', lineHeight: '1.6' }}>
            J'ai lu et j'accepte les <strong style={{ color: '#fff' }}>Conditions Générales de Vente</strong>.{' '}
            <strong style={{ color: '#00d4d4' }}>Obligatoire pour finaliser la commande.</strong>
          </p>
        </div>
      </div>

      {/* Case rétractation — uniquement si produits numériques */}
      {aPdf && (
        <div style={{ background: 'rgba(0,212,212,0.04)', border: `1px solid ${retractation ? 'rgba(0,212,212,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'border-color .2s' }}
          onClick={() => setRetractation(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${retractation ? '#00d4d4' : 'rgba(255,255,255,0.3)'}`, background: retractation ? '#00d4d4' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all .2s', boxShadow: retractation ? '0 0 8px rgba(0,212,212,0.4)' : 'none' }}>
              {retractation && <span style={{ color: '#000', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', lineHeight: '1.6' }}>
              Je reconnais que mon droit de rétractation de 14 jours ne s'applique pas aux fichiers numériques (illustrations, livres et recueils en PDF) dès lors que le téléchargement a été initié, conformément à l'article L221-28 du Code de la consommation. Cette renonciation ne concerne pas les versions reliées, pour lesquelles le droit de rétractation légal reste pleinement applicable.{' '}
              <strong style={{ color: '#00d4d4' }}>Obligatoire pour finaliser la commande.</strong>
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onRetour} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer' }}>
          ← Retour
        </button>
        <button onClick={onContinuer} disabled={!peutContinuer}
          style={{ flex: 2, background: peutContinuer ? 'linear-gradient(135deg, #ff3eb5, #cc2090)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', padding: '14px', color: peutContinuer ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '14px', cursor: peutContinuer ? 'pointer' : 'default', boxShadow: peutContinuer ? '0 4px 20px rgba(255,62,181,0.3)' : 'none', transition: 'all .2s' }}>
          Procéder au paiement →
        </button>
      </div>
      {!peutContinuer && <p style={{ color: 'rgba(255,100,100,0.6)', fontSize: '11px', textAlign: 'center', marginTop: '-8px' }}>Veuillez cocher les cases obligatoires ci-dessus.</p>}
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
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/panier',
          payment_method_data: {
            billing_details: { email: infos.email, name: [infos.prenom, infos.nom].filter(Boolean).join(' ') || undefined },
          },
        },
        redirect: 'if_required',
      });
      if (error) throw new Error(error.message);
      if (paymentIntent?.status === 'succeeded') onSucces(paymentIntent.id);
    } catch (e) {
      setErreur(e.message);
    }
    setChargement(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Paiement sécurisé</h2>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Choisissez votre moyen de paiement</p>
        <PaymentElement options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'paypal'],
          defaultValues: { billingDetails: { email: infos.email, name: [infos.prenom, infos.nom].filter(Boolean).join(' ') || '' } },
        }} />
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', marginTop: '12px' }}>Paiement sécurisé par Stripe · CB, Apple Pay, Google Pay acceptés</p>
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
        <button onClick={handlePayer} disabled={!stripe || chargement}
          style={{ flex: 2, background: stripe && !chargement ? 'linear-gradient(135deg, #ff3eb5, #cc2090)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', padding: '14px', color: stripe && !chargement ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '14px', cursor: stripe && !chargement ? 'pointer' : 'default', boxShadow: stripe && !chargement ? '0 4px 20px rgba(255,62,181,0.3)' : 'none', transition: 'all .2s' }}>
          {chargement ? 'Traitement en cours...' : `Payer ${(montantCentimes / 100).toFixed(2)} €`}
        </button>
      </div>
    </div>
  );
}

// ─── Étape 4 : Paiement ──────────────────────────────────────────────────────
function EtapePaiement({ onSucces, onRetour, isMobile, infos }) {
  const { reductions } = usePanier();
  const montantCentimes = Math.round(reductions.totalGeneral * 100);
  const [clientSecret, setClientSecret] = React.useState(null);
  const [erreurInit, setErreurInit] = React.useState(null);

  React.useEffect(() => {
    const init = async () => {
      try {
        const resp = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ montant: montantCentimes, email: infos.email }),
        });
        const { clientSecret: cs, error } = await resp.json();
        if (error) throw new Error(error);
        setClientSecret(cs);
      } catch (e) {
        setErreurInit(e.message);
      }
    };
    init();
  }, [montantCentimes, infos.email]);

  if (erreurInit) return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '16px' }}>Erreur lors de l'initialisation du paiement : {erreurInit}</p>
      <button onClick={onRetour} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '10px 20px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>← Retour</button>
    </div>
  );

  if (!clientSecret) return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Initialisation du paiement...</p>
    </div>
  );

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#ff3eb5', colorBackground: '#111', colorText: '#ffffff', colorDanger: '#ff4d4d', borderRadius: '8px' } } }}>
      <FormulaireStripe montantCentimes={montantCentimes} infos={infos} onSucces={onSucces} onRetour={onRetour} />
    </Elements>
  );
}

// ─── Étape 5 : Confirmation ───────────────────────────────────────────────────
function EtapeConfirmation({ infos, isMobile }) {
  const navigate = useNavigate();
  const { articles } = usePanier();
  const [liensTelechargement, setLiensTelechargement] = React.useState([]);
  const [liensCharges, setLiensCharges] = React.useState(false);
  const [telechargements, setTelechargements] = React.useState({});

  const aRelie = articles.some(a => a.type === 'relie');
  const articlesPdf = articles.filter(a => a.type === 'illustration' || a.type === 'livre_pdf' || a.type === 'recueil');

  React.useEffect(() => {
    const chargerLiens = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('commandes_articles')
          .select('id, nom, type, lien_telechargement')
          .eq('user_id', user.id)
          .in('type', ['illustration', 'livre_pdf', 'recueil'])
          .eq('commande_recente', true)
          .order('created_at', { ascending: false });
        setLiensTelechargement(data || []);
      } catch {}
      setLiensCharges(true);
    };
    chargerLiens();
  }, []);

  const handleTelecharger = (id, url) => {
    if (telechargements[id]) return;
    setTelechargements(prev => ({ ...prev, [id]: true }));
    window.open(url, '_blank');
  };

  const prenom = infos.prenom || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', padding: '40px 20px' }}>

      {/* Icône succès */}
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,212,212,0.12)', border: '3px solid #00d4d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>✓</div>

      {/* Message de remerciement */}
      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <h2 style={{ color: '#00d4d4', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Merci {prenom} !
        </h2>
        <div style={{ background: 'rgba(0,212,212,0.05)', border: '1px solid rgba(0,212,212,0.18)', borderRadius: '16px', padding: '20px 24px' }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: '1.95' }}>
            Ta commande vient d'arriver dans mon atelier.<br />
            Un ou plusieurs coloriages viennent de trouver un nouveau foyer, et commencent déjà à s'imaginer entre tes mains, prêts à rencontrer tes couleurs.<br />
            <br />
            Merci pour ta confiance et ton soutien. Chaque commande me permet de continuer à créer de nouveaux univers et de nouvelles histoires à colorier.<br />
            J'espère qu'ils t'accompagneront dans de beaux moments de création.<br />
            <br />
            À très vite.<br />
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontStyle: 'italic' }}>Kevin Teo'Art</span>
          </p>
        </div>
      </div>

      {/* Liens de téléchargement PDF */}
      {articlesPdf.length > 0 && (
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Vos téléchargements</p>
          {!liensCharges ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Préparation de vos fichiers...</p>
            </div>
          ) : liensTelechargement.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {liensTelechargement.map(article => {
                const deja = telechargements[article.id];
                return (
                  <div key={article.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '10px 14px' }}>
                    <p style={{ color: deja ? 'rgba(255,255,255,0.35)' : '#fff', fontSize: '13px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.nom}</p>
                    <button
                      onClick={() => handleTelecharger(article.id, article.lien_telechargement)}
                      disabled={deja}
                      style={{ background: deja ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #ff3eb5, #c9007a)', border: 'none', borderRadius: '8px', padding: '7px 14px', color: deja ? 'rgba(255,255,255,0.3)' : '#fff', fontWeight: 'bold', fontSize: '12px', cursor: deja ? 'default' : 'pointer', flexShrink: 0, boxShadow: deja ? 'none' : '0 3px 10px rgba(255,62,181,0.35)', whiteSpace: 'nowrap', transition: 'all .2s' }}>
                      {deja ? '✓ Téléchargé' : 'Télécharger'}
                    </button>
                  </div>
                );
              })}
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '6px', textAlign: 'center', lineHeight: 1.7 }}>
                Ces liens sont utilisables une seule fois depuis cette page.<br />
                Retrouvez vos téléchargements dans <strong style={{ color: '#00d4d4' }}>Mon Compte → Mes Commandes</strong>.
              </p>
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', lineHeight: 1.7 }}>
              Vos liens de téléchargement sont disponibles dans <strong style={{ color: '#00d4d4' }}>Mon Compte → Mes Commandes</strong>.
            </p>
          )}
        </div>
      )}

      {/* Message livres reliés */}
      {aRelie && (
        <div style={{ width: '100%', maxWidth: '460px', background: 'rgba(255,210,80,0.07)', border: '1px solid rgba(255,210,80,0.25)', borderRadius: '14px', padding: '18px' }}>
          <p style={{ color: 'rgba(255,210,80,0.95)', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Version(s) reliée(s) — en cours de traitement</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: '1.8' }}>
            Ta commande reliée a bien été reçue et est en cours de traitement.<br />
            Tu seras notifié à chaque étape : validation, expédition et livraison estimée.<br />
            Pour toute question ou problème, contacte-moi directement à{' '}
            <strong style={{ color: 'rgba(255,210,80,0.8)' }}>kevinteoart@outlook.fr</strong>.
          </p>
        </div>
      )}

      {/* Boutons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate('/accueil')}
          style={{ background: 'linear-gradient(135deg, #ff3eb5, #cc2090)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,62,181,0.35)' }}>
          Accueil
        </button>
        <button onClick={() => navigate('/mon-compte')}
          style={{ background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: '#000', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,212,212,0.35)' }}>
          Mon Compte
        </button>
        <button onClick={() => navigate('/catalogue')}
          style={{ background: 'linear-gradient(135deg, #ffd250, #c89a00)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: '#000', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,210,80,0.35)' }}>
          Continuer mes achats
        </button>
      </div>

    </div>
  );
}

// ─── Page principale Panier ───────────────────────────────────────────────────
export default function Panier() {
  const navigate = useNavigate();
  const { nbArticles, viderPanier } = usePanier();
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 600);
  const [showCategories, setShowCategories] = React.useState(false);
  const [showPatreonMenu, setShowPatreonMenu] = React.useState(false);
  const [showKawaiiMenu, setShowKawaiiMenu] = React.useState(false);
  const [userId, setUserId] = React.useState(null);
  const [userPseudo, setUserPseudo] = React.useState('');
  const [etape, setEtape] = React.useState(1);
  const [infos, setInfos] = React.useState({ email: '', prenom: '', nom: '', adresse: '', complement: '', code_postal: '', ville: '', etat: '', pays: '' });
  const [infosFacturation, setInfosFacturation] = React.useState({ prenom: '', nom: '', adresse: '', complement: '', code_postal: '', ville: '', etat: '', pays: '' });
  const [facturationDifferente, setFacturationDifferente] = React.useState(false);
  const [popupIllu, setPopupIllu] = React.useState(null);
  const [popupIlluIndex, setPopupIlluIndex] = React.useState(null);
  const [popupIlluChargement, setPopupIlluChargement] = React.useState(false);
  const [popupCollection, setPopupCollection] = React.useState({});
  const [popupColoriages, setPopupColoriages] = React.useState({});
  const { articles } = usePanier();
  const illusIds = articles.filter(a => a.type === 'illustration').map(a => a.id);

  React.useEffect(() => {
    const chargerCollectionPopup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: coll } = await supabase.from('collection').select('illustration_id, j_ai, je_veux, j_ai_auto').eq('user_id', user.id);
      const { data: colos } = await supabase.from('coloriages').select('illustration_id').eq('user_id', user.id);
      if (coll) { const m = {}; coll.forEach(c => { m[c.illustration_id] = c; }); setPopupCollection(m); }
      if (colos) { const m = {}; colos.forEach(c => { m[c.illustration_id] = true; }); setPopupColoriages(m); }
    };
    chargerCollectionPopup();
  }, []);

  const ouvrirPopupIllu = async (illuId) => {
    setPopupIlluChargement(true);
    try {
      const { data } = await supabase.from('illustrations').select('*').eq('id', illuId).single();
      if (data) { setPopupIllu(data); setPopupIlluIndex(illusIds.indexOf(illuId)); }
    } catch {}
    setPopupIlluChargement(false);
  };

  const handleToggleJAiPopup = async (illuId) => {
    if (!userId) return;
    const nouveau = !(popupCollection[illuId]?.j_ai || false);
    setPopupCollection(prev => ({ ...prev, [illuId]: { ...prev[illuId], j_ai: nouveau } }));
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, j_ai: nouveau, j_ai_auto: false, je_veux: popupCollection[illuId]?.je_veux || false }, { onConflict: 'user_id,illustration_id' });
  };

  const handleToggleJeVeuxPopup = async (illuId) => {
    if (!userId) return;
    const nouveau = !(popupCollection[illuId]?.je_veux || false);
    setPopupCollection(prev => ({ ...prev, [illuId]: { ...prev[illuId], je_veux: nouveau } }));
    await supabase.from('collection').upsert({ user_id: userId, illustration_id: illuId, je_veux: nouveau, j_ai: popupCollection[illuId]?.j_ai || false, j_ai_auto: popupCollection[illuId]?.j_ai_auto || false }, { onConflict: 'user_id,illustration_id' });
  };

  const popupSuivant = async () => {
    if (illusIds.length <= 1) return;
    const next = (popupIlluIndex + 1) % illusIds.length;
    setPopupIlluIndex(next);
    const { data } = await supabase.from('illustrations').select('*').eq('id', illusIds[next]).single();
    if (data) setPopupIllu(data);
  };

  const popupPrecedent = async () => {
    if (illusIds.length <= 1) return;
    const prev = (popupIlluIndex - 1 + illusIds.length) % illusIds.length;
    setPopupIlluIndex(prev);
    const { data } = await supabase.from('illustrations').select('*').eq('id', illusIds[prev]).single();
    if (data) setPopupIllu(data);
  };
  const [retractation, setRetractation] = React.useState(false);
  const [cgvAcceptees, setCgvAcceptees] = React.useState(false);
  const encartRef = React.useRef(null);
  const moisPatreon = getMoisPatreonDisponibles();

  const allerEtape = (n) => {
    setEtape(n);
    setTimeout(() => { encartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
  };

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
        const { data: profil } = await supabase.from('profils').select('pseudo, email, prenom, nom, adresse, complement, code_postal, ville, etat, pays').eq('id', user.id).single();
        if (profil) {
          if (profil.pseudo) setUserPseudo(profil.pseudo);
          setInfos(prev => ({
            ...prev,
            email:       profil.email || user.email || '',
            prenom:      profil.prenom || profil.pseudo || '',
            nom:         profil.nom || '',
            adresse:     profil.adresse || '',
            complement:  profil.complement || '',
            code_postal: profil.code_postal || '',
            ville:       profil.ville || '',
            etat:        profil.etat || '',
            pays:        profil.pays || '',
          }));
        } else if (user.email) {
          setInfos(prev => ({ ...prev, email: user.email }));
        }
      }
    };
    charger();
  }, []);

  const handleSuccesPaiement = async (paymentIntentId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profil } = await supabase.from('profils').select('promo_badge_active').eq('id', user.id).single();
        if (profil?.promo_badge_active && Object.keys(profil.promo_badge_active).length > 0) {
          await supabase.from('profils').update({ promo_badge_active: {} }).eq('id', user.id);
        }
      }
    } catch {}
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
        input:focus { border-color: rgba(0,212,212,0.6) !important; box-shadow: 0 0 0 2px rgba(0,212,212,0.1); }
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
                    <span>Patreon 2026</span><span style={{ fontSize: '11px', transition: 'transform .2s', transform: showPatreonMenu ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
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
          <div style={{ maxWidth: etape === 4 ? '820px' : '600px', margin: '0 auto', transition: 'max-width 0.3s ease' }}>

            {/* Encart titre */}
            <div style={{ background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', padding: isMobile ? '16px 20px' : '20px 32px', textAlign: 'center', marginBottom: '20px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
              <h1 style={{ color: '#fff', fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', marginBottom: '6px' }}>
                Mon Panier
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Paiement sécurisé · TVA non applicable (art. 293 B du CGI)</p>
            </div>

            {/* Indicateur d'étapes */}
            {etape < 5 && <div style={{ marginTop: '20px' }}><IndicateurEtapes etape={etape} isMobile={isMobile} /></div>}

            {/* Tunnel */}
            <div ref={encartRef} style={{ background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(0,212,212,0.3)', borderRadius: '20px', padding: isMobile ? '20px 16px' : '36px 40px' }}>
              {etape === 1 && <EtapePanier onContinuer={() => allerEtape(2)} isMobile={isMobile} onOuvrirIllu={ouvrirPopupIllu} />}
              {etape === 2 && <EtapeInfos onContinuer={() => allerEtape(3)} onRetour={() => allerEtape(1)} isMobile={isMobile} infos={infos} setInfos={setInfos} infosFacturation={infosFacturation} setInfosFacturation={setInfosFacturation} facturationDifferente={facturationDifferente} setFacturationDifferente={setFacturationDifferente} />}
              {etape === 3 && <EtapeRecap onContinuer={() => allerEtape(4)} onRetour={() => allerEtape(2)} isMobile={isMobile} infos={infos} infosFacturation={facturationDifferente ? infosFacturation : null} retractation={retractation} setRetractation={setRetractation} cgvAcceptees={cgvAcceptees} setCgvAcceptees={setCgvAcceptees} />}
              {etape === 4 && <EtapePaiement onSucces={handleSuccesPaiement} onRetour={() => allerEtape(3)} isMobile={isMobile} infos={infos} />}
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

      {/* PopupFicheIllu — rendu à la racine pour éviter le piège backdropFilter */}
      {popupIlluChargement && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Chargement...</p>
        </div>
      )}
      {popupIllu && (
        <PopupFicheIllu
          illu={popupIllu}
          illustrations={articles.filter(a => a.type === 'illustration')}
          jAi={popupCollection[popupIllu.id]?.j_ai || false}
          jeVeux={popupCollection[popupIllu.id]?.je_veux || false}
          aColorié={popupColoriages[popupIllu.id] || false}
          onToggleJAi={() => handleToggleJAiPopup(popupIllu.id)}
          onToggleJeVeux={() => handleToggleJeVeuxPopup(popupIllu.id)}
          onClose={() => setPopupIllu(null)}
          onOpenSimilaire={(illu) => setPopupIllu(illu)}
          onSuivant={popupSuivant}
          onPrecedent={popupPrecedent}
          userPseudo={userPseudo}
          userId={userId}
          onColoUploaded={() => setPopupColoriages(prev => ({ ...prev, [popupIllu.id]: true }))}
        />
      )}
    </div>
  );
}