import React from 'react';

// ── Cloche de notifications ──────────────────────────────────────────────────
// Placeholder phase 13 — visible sur toutes les pages, logique notifications à venir
// Props :
//   hidden  {bool}  — si true, cache la cloche (ex: quand une popup est ouverte)

function Cloche({ hidden = false }) {
  if (hidden) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        right: '16px',
        zIndex: 100,
        cursor: 'pointer',
        fontSize: '22px',
        userSelect: 'none',
      }}
      title="Notifications"
    >
      🔔
    </div>
  );
}

export default Cloche;
