import React, { useState, useRef, useEffect } from 'react';

// ── Liste des pays (FR en premier, puis ordre alphabétique) ──────────────────
const PAYS = [
  'France',
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne',
  'Andorre', 'Angola', 'Antigua-et-Barbuda', 'Arabie saoudite', 'Argentine',
  'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan',
  'Bahamas', 'Bahreïn', 'Bangladesh', 'Barbade', 'Bélarus', 'Belgique',
  'Belize', 'Bénin', 'Bhoutan', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana',
  'Brésil', 'Brunéi', 'Bulgarie', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodge', 'Cameroun', 'Canada', 'Centrafrique', 'Chili',
  'Chine', 'Chypre', 'Colombie', 'Comores', 'Congo', 'Corée du Nord',
  'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba',
  'Danemark', 'Djibouti', 'Dominique',
  'Égypte', 'Émirats arabes unis', 'Équateur', 'Érythrée', 'Espagne',
  'Eswatini', 'Estonie', 'État de Palestine', 'États-Unis', 'Éthiopie',
  'Fidji', 'Finlande',
  'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala',
  'Guinée', 'Guinée-Bissau', 'Guinée équatoriale', 'Guyana',
  'Haïti', 'Honduras', 'Hongrie',
  'Îles Marshall', 'Îles Salomon', 'Inde', 'Indonésie', 'Irak', 'Iran',
  'Irlande', 'Islande', 'Israël', 'Italie',
  'Jamaïque', 'Japon', 'Jordanie',
  'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati', 'Kosovo', 'Koweït',
  'Laos', 'Lesotho', 'Lettonie', 'Liban', 'Libéria', 'Libye',
  'Liechtenstein', 'Lituanie', 'Luxembourg',
  'Macédoine du Nord', 'Madagascar', 'Malaisie', 'Malawi', 'Maldives',
  'Mali', 'Malte', 'Maroc', 'Maurice', 'Mauritanie', 'Mexique',
  'Micronésie', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro',
  'Mozambique', 'Myanmar',
  'Namibie', 'Nauru', 'Népal', 'Nicaragua', 'Niger', 'Nigéria',
  'Niue', 'Norvège', 'Nouvelle-Zélande',
  'Oman', 'Ouganda', 'Ouzbékistan',
  'Pakistan', 'Palaos', 'Panama', 'Papouasie-Nouvelle-Guinée', 'Paraguay',
  'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal',
  'Qatar',
  'République démocratique du Congo', 'République dominicaine',
  'République tchèque', 'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
  'Saint-Kitts-et-Nevis', 'Saint-Marin', 'Saint-Vincent-et-les-Grenadines',
  'Sainte-Lucie', 'Salvador', 'Samoa', 'São Tomé-et-Príncipe', 'Sénégal',
  'Serbie', 'Seychelles', 'Sierra Leone', 'Singapour', 'Slovaquie',
  'Slovénie', 'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède',
  'Suisse', 'Suriname', 'Syrie',
  'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Timor oriental',
  'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie', 'Turkménistan',
  'Turquie', 'Tuvalu',
  'Ukraine', 'Uruguay',
  'Vanuatu', 'Vatican', 'Venezuela', 'Viêt Nam',
  'Yémen',
  'Zambie', 'Zimbabwe',
];

// ── Composant PaysInput ──────────────────────────────────────────────────────
// Props :
//   value        {string}   — valeur courante
//   onChange     {fn}       — callback(nouvelleValeur)
//   style        {object}   — style de l'input (hérité de la page parente)
//   placeholder  {string}   — placeholder optionnel

function PaysInput({ value, onChange, style = {}, placeholder = 'France' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [survolIndex, setSurvolIndex] = useState(-1);
  const ref = useRef(null);

  // Fermer si clic en dehors
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setSurvolIndex(-1);
    if (val.length >= 1) {
      const filtre = PAYS.filter(p =>
        p.toLowerCase().startsWith(val.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtre);
      setOuvert(filtre.length > 0);
    } else {
      setSuggestions([]);
      setOuvert(false);
    }
  };

  const handleSelect = (pays) => {
    onChange(pays);
    setSuggestions([]);
    setOuvert(false);
  };

  const handleKeyDown = (e) => {
    if (!ouvert) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSurvolIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSurvolIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && survolIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[survolIndex]);
    } else if (e.key === 'Escape') {
      setOuvert(false);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setOuvert(true);
        }}
        placeholder={placeholder}
        style={style}
        autoComplete="off"
      />
      {ouvert && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          width: '100%',
          background: '#0a1a1a',
          border: '1px solid rgba(0,212,212,0.35)',
          borderRadius: '8px',
          margin: 0,
          padding: '4px 0',
          listStyle: 'none',
          zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          maxHeight: '220px',
          overflowY: 'auto',
        }}>
          {suggestions.map((pays, i) => (
            <li
              key={pays}
              onMouseDown={() => handleSelect(pays)}
              onMouseEnter={() => setSurvolIndex(i)}
              style={{
                padding: '9px 14px',
                cursor: 'pointer',
                fontSize: '13px',
                color: i === survolIndex ? '#00d4d4' : 'rgba(255,255,255,0.8)',
                background: i === survolIndex ? 'rgba(0,212,212,0.08)' : 'transparent',
                transition: 'background .1s, color .1s',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              {pays}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PaysInput;
