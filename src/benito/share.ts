// BenitoTools: condivisione dei risultati (Web Share API) e download.
import { addToHistory } from './history';

export function canShareFiles(files: File[]): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.canShare &&
      files.length > 0 &&
      navigator.canShare({ files })
    );
  } catch {
    return false;
  }
}

/** Apre il menu "Condividi" di Android con i file. Ritorna false se annullato o non supportato. */
export async function shareFiles(files: File[], title?: string): Promise<boolean> {
  if (!canShareFiles(files)) return false;
  try {
    await navigator.share({ files, title });
    for (const f of files) await addToHistory(f);
    return true;
  } catch {
    return false;
  }
}

export function downloadFile(file: File | Blob, name: string) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Converte un'immagine in PNG (BenitoSticker accetta qualsiasi immagine, ma PNG è il più sicuro). */
export async function toStickerSource(file: File): Promise<File> {
  if (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif')
    return file;
  try {
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    canvas.getContext('2d')!.drawImage(bmp, 0, 0);
    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png')
    );
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.png', {
      type: 'image/png'
    });
  } catch {
    return file;
  }
}
