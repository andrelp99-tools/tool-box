// BenitoTools: decodifica QR/codici a barre. Usa BarcodeDetector (Chrome Android) se c'è,
// altrimenti jsQR (solo QR).
import jsQR from 'jsqr';

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };
let detector: Detector | null | undefined;

async function getDetector(): Promise<Detector | null> {
  if (detector !== undefined) return detector ?? null;
  try {
    const BD = (window as any).BarcodeDetector;
    if (BD) {
      const formats: string[] = await BD.getSupportedFormats();
      detector = formats.length ? new BD({ formats }) : null;
    } else detector = null;
  } catch {
    detector = null;
  }
  return detector ?? null;
}

const canvas = document.createElement('canvas');

export async function decode(src: HTMLVideoElement | HTMLImageElement | ImageBitmap): Promise<string | null> {
  const d = await getDetector();
  if (d) {
    try {
      const r = await d.detect(src);
      if (r[0]?.rawValue) return r[0].rawValue;
    } catch {
      /* passa a jsQR */
    }
  }
  const w = 'videoWidth' in src ? src.videoWidth : src.width;
  const h = 'videoHeight' in src ? src.videoHeight : src.height;
  if (!w || !h) return null;
  const scale = Math.min(1, 1280 / Math.max(w, h));
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const res = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
  return res?.data ?? null;
}

export type Parsed =
  | { kind: 'url'; url: string }
  | { kind: 'wifi'; ssid: string; password: string; type: string }
  | { kind: 'contact'; text: string }
  | { kind: 'email'; to: string }
  | { kind: 'tel'; number: string }
  | { kind: 'text'; text: string };

export function parse(raw: string): Parsed {
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return { kind: 'url', url: t };
  if (/^WIFI:/i.test(t)) {
    const get = (k: string) => (t.match(new RegExp(`${k}:((?:\\\\.|[^;])*)`, 'i'))?.[1] ?? '').replace(/\\(.)/g, '$1');
    return { kind: 'wifi', ssid: get('S'), password: get('P'), type: get('T') };
  }
  if (/^BEGIN:VCARD/i.test(t) || /^MECARD:/i.test(t)) return { kind: 'contact', text: t };
  if (/^mailto:/i.test(t)) return { kind: 'email', to: t.slice(7) };
  if (/^tel:/i.test(t)) return { kind: 'tel', number: t.slice(4) };
  return { kind: 'text', text: t };
}
