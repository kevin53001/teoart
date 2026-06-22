// compresserImage.js
// Compresse une image File/Blob en JPEG si elle dépasse 500ko.
// Cible : entre 400ko et 500ko.
// Si le fichier est déjà sous 500ko, il est retourné tel quel (converti en base64).
// Retourne : { base64, fileType, fileName }

const LIMITE_HAUTE = 500 * 1024; // 500ko
const LIMITE_BASSE = 400 * 1024; // 400ko

export async function compresserImage(file, nomFichierSansExt) {
  const taille = file.size;

  // Pas de compression nécessaire
  if (taille <= LIMITE_HAUTE) {
    const base64 = await fileToBase64(file);
    const ext = file.name.split('.').pop();
    return {
      base64,
      fileType: file.type,
      fileName: `${nomFichierSansExt}.${ext}`,
    };
  }

  // Compression nécessaire — on dessine dans un canvas et on réduit la qualité
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0);

  let qualite = 0.85;
  let blob = null;

  // Boucle : on réduit la qualité jusqu'à passer sous 500ko
  while (qualite >= 0.05) {
    blob = await canvasToBlob(canvas, 'image/jpeg', qualite);
    if (blob.size <= LIMITE_HAUTE) break;
    qualite -= 0.05;
  }

  // Si même à qualité minimale c'est encore trop grand, on réduit aussi les dimensions
  if (blob && blob.size > LIMITE_HAUTE) {
    let scale = 0.9;
    while (scale >= 0.2 && blob.size > LIMITE_HAUTE) {
      const w = Math.round(imageBitmap.width * scale);
      const h = Math.round(imageBitmap.height * scale);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(imageBitmap, 0, 0, w, h);
      blob = await canvasToBlob(canvas, 'image/jpeg', 0.75);
      scale -= 0.1;
    }
  }

  // Si on est descendu sous 400ko, on remonte un peu la qualité
  if (blob && blob.size < LIMITE_BASSE && qualite < 0.95) {
    let qualiteHaute = qualite + 0.1;
    while (qualiteHaute <= 0.95) {
      const blobTest = await canvasToBlob(canvas, 'image/jpeg', qualiteHaute);
      if (blobTest.size > LIMITE_HAUTE) break;
      blob = blobTest;
      if (blobTest.size >= LIMITE_BASSE) break;
      qualiteHaute += 0.05;
    }
  }

  const base64 = await fileToBase64(blob);
  return {
    base64,
    fileType: 'image/jpeg',
    fileName: `${nomFichierSansExt}.jpg`,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

function canvasToBlob(canvas, type, qualite) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error('canvas.toBlob a échoué')); },
      type,
      qualite
    );
  });
}