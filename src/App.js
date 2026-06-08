import React from 'react';

const R2 = 'https://images.kevinteoart.fr';

const barres = [
  { direction: 'left', images: Array.from({length: 20}, (_, i) => `bg_${String(i+1).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 20}, (_, i) => `bg_${String(i+21).padStart(3,'0')}.jpg`) },
  { direction: 'left', images: Array.from({length: 20}, (_, i) => `bg_${String(i+41).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 20}, (_, i) => `bg_${String(i+61).padStart(3,'0')}.jpg`) },
  { direction: 'left', images: Array.from({length: 20}, (_, i) => `bg_${String(i+81).padStart(3,'0')}.jpg`) },
  { direction: 'right', images: Array.from({length: 20}, (_, i) => `bg_${String(i+101).padStart(3,'0')}.jpg`) },
];

function App() {
  return (
    <div style={{background:'#000', minHeight:'100vh', fontFamily:'Segoe UI, sans-serif', overflowX:'hidden'}}>

      {/* BANNIERE */}
      <div style={{width:'100%', background:'#000', display:'flex', justifyContent:'center', padding:'20px 0 0', position:'relative', zIndex:2}}>
        <img src={`${R2}/site/banniere.jpg`} alt="banniere" style={{maxWidth:'1200px', width:'90%', borderRadius:'12px'}} />
      </div>

      {/* LOGO */}
      <div style={{position:'relative', zIndex:20, display:'flex', justifyContent:'center', marginTop:'-70px', marginBottom:'20px'}}>
        <img src={`${R2}/site/Logo.png`} alt="logo" style={{width:'138px', height:'138px', borderRadius:'50%', border:'4px solid #000', boxShadow:'0 0 0 3px #00d4d4', objectFit:'cover'}} />
      </div>

      {/* BARRES ANIMEES */}
      <div style={{position:'relative', width:'100%'}}>
        <style>{`
          @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
          .barre-left { animation: scrollLeft 40s linear infinite; }
          .barre-right { animation: scrollRight 40s linear infinite; }
        `}</style>

        {barres.map((barre, i) => (
          <div key={i} style={{overflow:'hidden', marginBottom:'6px', position:'relative'}}>
            <div style={{position:'absolute', left:0, top:0, width:'60px', height:'100%', background:'linear-gradient(to right, #000, transparent)', zIndex:1}} />
            <div style={{position:'absolute', right:0, top:0, width:'60px', height:'100%', background:'linear-gradient(to left, #000, transparent)', zIndex:1}} />
            <div className={barre.direction === 'left' ? 'barre-left' : 'barre-right'} style={{display:'flex', gap:'6px', width:'max-content'}}>
              {[...barre.images, ...barre.images].map((img, j) => (
                <img key={j} src={`${R2}/bg/${img}`} alt="" style={{width:'160px', height:'220px', objectFit:'cover', borderRadius:'6px'}} />
              ))}
            </div>
          </div>
        ))}

        {/* ENCARTS */}
        <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center', gap:'40px', zIndex:10, padding:'20px'}}>
          
          {/* MESSAGE */}
          <div style={{background:'rgba(0,0,0,0.75)', border:'1px solid rgba(0,212,212,0.3)', borderRadius:'16px', padding:'30px', maxWidth:'420px', backdropFilter:'blur(8px)'}}>
            <p style={{color:'#00d4d4', fontStyle:'italic', marginBottom:'16px', fontSize:'15px'}}>Des idées plein la tête et la tête dans les nuages, bienvenue dans mon univers.</p>
            <p style={{color:'rgba(255,255,255,0.75)', fontSize:'14px', lineHeight:'1.7'}}>Ici vous trouverez toutes mes illustrations à colorier — des personnages, des univers, des émotions — pensés pour vous emmener ailleurs le temps d'une page.<br/><br/>Constituez votre collection, découvrez les nouveautés, partagez vos coloriages et plongez dans mes histoires. Ce site c'est un peu ma maison, et j'espère qu'elle vous ressourcera.</p>
          </div>

          {/* CONNEXION */}
          <div style={{background:'rgba(0,0,0,0.75)', border:'1px solid rgba(0,212,212,0.3)', borderRadius:'16px', padding:'30px', width:'320px', backdropFilter:'blur(8px)'}}>
            <p style={{color:'#fff', fontSize:'18px', fontWeight:'bold', textAlign:'center', marginBottom:'6px'}}>Connexion</p>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:'12px', textAlign:'center', marginBottom:'20px'}}>Inscription obligatoire pour accéder au contenu du site.</p>
            <input type="email" placeholder="Adresse email" style={{width:'100%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'12px', color:'#fff', marginBottom:'12px', fontSize:'14px'}} />
            <input type="password" placeholder="Mot de passe" style={{width:'100%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'12px', color:'#fff', marginBottom:'16px', fontSize:'14px'}} />
            <button style={{width:'100%', background:'linear-gradient(135deg, #00d4d4, #0099aa)', border:'none', borderRadius:'8px', padding:'13px', color:'#fff', fontWeight:'bold', fontSize:'15px', cursor:'pointer', marginBottom:'12px'}}>Se connecter</button>
            <div style={{color:'rgba(255,255,255,0.3)', textAlign:'center', marginBottom:'12px'}}>— ou —</div>
            <button style={{width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', padding:'13px', color:'rgba(255,255,255,0.7)', fontSize:'15px', cursor:'pointer'}}>Créer un compte</button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default App;