import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Cropper from 'react-easy-crop';

const R2 = 'https://images.kevinteoart.fr';

const barres = [
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+25).padStart(3,'0')}.jpg`) },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+49).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 24}, (_, i) => `bg_${String(i+73).padStart(3,'0')}.jpg`) },
  { direction: 'left',  images: Array.from({length: 24}, (_, i) => `bg_${String(i+97).padStart(3,'0')}.jpg`) },
];

const BANNER_MAX = '1200px';
const IMG_W = 110;
const IMG_H = 150;
const GAP = 6;
const SPEED = '80s';

function getPasswordStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  return score;
}

async function getCroppedImg(imageSrc, croppedAreaPixels) {
  const image = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, 200, 200);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
}

function Inscription() {
  const navigate = useNavigate();

  // Étape 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Étape 2
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [photoSrc, setPhotoSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [photoCroppee, setPhotoCroppee] = useState(null);
  const fileRef = useRef();

  // Étape 3
  const [pays, setPays] = useState('');
  const [adresse, setAdresse] = useState('');
  const [complement, setComplement] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [telephone, setTelephone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength];
  const strengthColor = ['', '#ff4d4d', '#ffaa00', '#aadd00', '#00cc66'][strength];

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const validerCadrage = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(photoSrc, croppedAreaPixels);
    setPhotoCroppee(blob);
    setPhotoSrc(null);
  };

  const handleInscription = async () => {
    setError('');
    if (!email || !password || !prenom || !nom || !pseudo) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }
    if (!photoCroppee) {
      setError('Une photo de profil est obligatoire.');
      return;
    }
    if (strength < 2) {
      setError('Mot de passe trop faible. Ajoute des majuscules et des chiffres.');
      return;
    }
    setLoading(true);

    // Inscription Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'https://kevinteoart.fr' }
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const userId = data.user?.id;

    // Upload photo de profil
    const fileName = `avatars/${userId}.jpg`;
    await supabase.storage.from('teoart-files').upload(fileName, photoCroppee, { upsert: true });

    // Sauvegarder le profil
    await supabase.from('profils').insert({
      id: userId,
      email,
      prenom,
      nom,
      pseudo,
      date_naissance: dateNaissance || null,
      pays: pays || null,
      adresse: adresse || null,
      complement: complement || null,
      code_postal: codePostal || null,
      ville: ville || null,
      telephone: telephone || null,
    });

    setLoading(false);
    setSuccess(true);
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#fff',
    marginBottom: '12px',
    fontSize: '14px',
  };

  const labelStyle = {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    marginBottom: '4px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const encartStyle = {
    background: 'rgba(0,0,0,0.78)',
    border: '1px solid rgba(0,212,212,0.3)',
    borderRadius: '16px',
    padding: '28px 32px',
    maxWidth: '480px',
    width: '92%',
    backdropFilter: 'blur(10px)',
  };

  const titreEncart = (txt) => (
    <p style={{ color: '#00d4d4', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', borderBottom: '1px solid rgba(0,212,212,0.2)', paddingBottom: '12px' }}>{txt}</p>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollLeft  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
        .barre-left  { animation: scrollLeft  ${SPEED} linear infinite; }
        .barre-right { animation: scrollRight ${SPEED} linear infinite; }
        .barre-left:hover, .barre-right:hover { animation-play-state: paused; }
        input::placeholder { color: rgba(255,255,255,0.35); }
        input:focus { outline: none; border-color: rgba(0,212,212,0.6) !important; }
        button:hover { opacity: 0.88; }
        @media (max-width: 700px) {
          .encart-inscription { max-width: 85vw !important; width: 85vw !important; padding: 20px 18px !important; }
        }
      `}</style>

      {/* BANNIÈRE HAUT */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 0', position: 'relative', zIndex: 2 }}>
        <img src={`${R2}/site/banniere.jpg`} alt="bannière" style={{ maxWidth: BANNER_MAX, width: '92%', borderRadius: '14px', display: 'block' }} />
      </div>

      {/* LOGO */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', justifyContent: 'center', marginTop: '-60px', marginBottom: '0px' }}>
        <img src={`${R2}/site/Logo.png`} alt="logo" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #000', boxShadow: '0 0 0 3px #00d4d4', objectFit: 'cover' }} />
      </div>

      {/* ZONE BARRES + ENCARTS */}
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {barres.map((barre, i) => (
            <div key={i} style={{ width: '92%', maxWidth: BANNER_MAX, overflow: 'hidden', position: 'relative', borderRadius: '6px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to right, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, width: '60px', height: '100%', background: 'linear-gradient(to left, #000 20%, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{ display: 'flex', gap: `${GAP}px`, width: 'max-content' }}>
                {[...barre.images, ...barre.images].map((img, j) => (
                  <img key={j} src={`${R2}/bg/${img}`} alt="" style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, objectFit: 'cover', borderRadius: '5px', opacity: 0.5, display: 'block' }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ENCARTS INSCRIPTION */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: '16px', zIndex: 10, padding: '16px 20px 30px', overflowY: 'auto' }}>

          {success ? (
            <div className="encart-inscription" style={{ ...encartStyle, textAlign: 'center' }}>
              <p style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</p>
              <p style={{ color: '#00d4d4', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Compte créé !</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.7' }}>
                Un email de confirmation vient de t'être envoyé à <strong style={{ color: '#fff' }}>{email}</strong>.<br /><br />
                Clique sur le lien dans cet email pour activer ton compte. Le lien est valable 24h.<br /><br />
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>Pense à vérifier tes spams si tu ne le vois pas.</span>
              </p>
              <button onClick={() => navigate('/')} style={{ marginTop: '20px', width: '100%', background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '8px', padding: '13px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              {/* ÉTAPE 1 — Identifiants */}
              <div className="encart-inscription" style={encartStyle}>
                {titreEncart('① Identifiants')}
                <label style={labelStyle}>Email *</label>
                <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Mot de passe *</label>
                <input type="password" placeholder="Minimum 8 caractères" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: '8px' }} />
                {password.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strength ? strengthColor : 'rgba(255,255,255,0.1)', transition: 'background .3s' }} />
                      ))}
                    </div>
                    <p style={{ color: strengthColor, fontSize: '12px' }}>{strengthLabel}</p>
                  </div>
                )}
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>8 caractères minimum, avec majuscules et chiffres.</p>
              </div>

              {/* ÉTAPE 2 — Identité */}
              <div className="encart-inscription" style={encartStyle}>
                {titreEncart('② Identité')}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Prénom *</label>
                    <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Nom *</label>
                    <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <label style={labelStyle}>Pseudo * <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'none', fontSize: '10px' }}>— ce sera ton nom visible sur le site</span></label>
                <input type="text" placeholder="Ton pseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} style={inputStyle} />

                <label style={labelStyle}>Date de naissance <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'none' }}>(optionnel)</span></label>
                <input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic', marginBottom: '20px' }}>
                  🤫 Champ optionnel. Mais chut — quelques chanceux ont reçu un truc bizarre le jour de leur anniversaire. Coïncidence ? Peut-être. Peut-être pas. À toi de voir si tu tentes le destin.
                </p>

                <label style={labelStyle}>Photo de profil * <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'none', fontSize: '10px' }}>— obligatoire</span></label>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic', marginBottom: '12px' }}>
                  📸 Ta tête, ton héros préféré, ton plaid... peu importe. On va la rogner en rond de toute façon. Choisir avec soin ou au hasard, les deux marchent.
                </p>

                {!photoSrc && !photoCroppee && (
                  <button onClick={() => fileRef.current.click()} style={{ width: '100%', background: 'rgba(0,212,212,0.15)', border: '1px dashed rgba(0,212,212,0.4)', borderRadius: '8px', padding: '13px', color: '#00d4d4', fontSize: '14px', cursor: 'pointer', marginBottom: '12px' }}>
                    📁 Choisir une image
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

                {photoSrc && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '12px', overflow: 'hidden', background: '#111' }}>
                      <Cropper image={photoSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                    </div>
                    <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: '100%', margin: '10px 0', accentColor: '#00d4d4' }} />
                    <button onClick={validerCadrage} style={{ width: '100%', background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '8px', padding: '11px', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                      ✓ Valider le cadrage
                    </button>
                  </div>
                )}

                {photoCroppee && !photoSrc && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <img src={URL.createObjectURL(photoCroppee)} alt="profil" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00d4d4' }} />
                    <div>
                      <p style={{ color: '#00cc66', fontSize: '13px' }}>✓ Photo validée</p>
                      <button onClick={() => { setPhotoCroppee(null); setPhotoSrc(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Changer</button>
                    </div>
                  </div>
                )}
              </div>

              {/* ÉTAPE 3 — Adresse */}
              <div className="encart-inscription" style={encartStyle}>
                {titreEncart('③ Adresse de livraison')}
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>Optionnel maintenant — obligatoire uniquement lors d'une commande de version reliée.</p>
                <label style={labelStyle}>Pays</label>
                <input type="text" placeholder="France" value={pays} onChange={e => setPays(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Adresse</label>
                <input type="text" placeholder="12 rue des illustrations" value={adresse} onChange={e => setAdresse(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Complément</label>
                <input type="text" placeholder="Appartement, bâtiment..." value={complement} onChange={e => setComplement(e.target.value)} style={inputStyle} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Code postal</label>
                    <input type="text" placeholder="75000" value={codePostal} onChange={e => setCodePostal(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>Ville</label>
                    <input type="text" placeholder="Paris" value={ville} onChange={e => setVille(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <label style={labelStyle}>Téléphone</label>
                <input type="tel" placeholder="+33 6 00 00 00 00" value={telephone} onChange={e => setTelephone(e.target.value)} style={inputStyle} />
              </div>

              {/* BOUTON VALIDER */}
              {error && <p style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', maxWidth: '480px', width: '92%' }}>{error}</p>}
              <div style={{ maxWidth: '480px', width: '92%', paddingBottom: '20px' }}>
                <button onClick={handleInscription} disabled={loading}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #00d4d4, #0099aa)', border: 'none', borderRadius: '8px', padding: '15px', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'opacity .2s', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Création en cours...' : '🎨 Créer mon compte'}
                </button>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
                  Déjà un compte ? <span onClick={() => navigate('/')} style={{ color: '#00d4d4', cursor: 'pointer' }}>Se connecter</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BANNIÈRE BAS */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '24px 0 24px', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', maxWidth: '1200px', width: '92%' }}>
          <img src={`${R2}/site/banniere_bas.jpg`} alt="bannière bas" style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
          <div onClick={() => window.open('https://www.instagram.com/kevin_teoart/', '_blank')} style={{ position: 'absolute', top: 0, left: 0, width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://patreon.com/u119601283?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_blank')} style={{ position: 'absolute', top: 0, left: '33.33%', width: '33.33%', height: '100%', cursor: 'pointer' }} />
          <div onClick={() => window.open('https://www.facebook.com/groups/516417952677490/', '_blank')} style={{ position: 'absolute', top: 0, left: '66.66%', width: '33.34%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

    </div>
  );
}

export default Inscription;
