/// <reference lib="webworker" />
// BenitoTools: conversione immagini con ImageMagick (WebAssembly) in un worker.
import {
  initializeImageMagick,
  MagickFormat,
  MagickImage,
  MagickImageCollection,
  MagickReadSettings,
  MagickColor,
  AlphaAction
} from '@imagemagick/magick-wasm';

let ready: Promise<void> | null = null;

const FORMAT: Record<string, MagickFormat> = {
  jpg: MagickFormat.Jpeg,
  png: MagickFormat.Png,
  webp: MagickFormat.WebP,
  avif: MagickFormat.Avif,
  gif: MagickFormat.Gif,
  heic: MagickFormat.Heic,
  bmp: MagickFormat.Bmp,
  tiff: MagickFormat.Tiff,
  ico: MagickFormat.Ico,
  jxl: MagickFormat.Jxl
};
const NO_ALPHA = new Set(['jpg', 'bmp']);
const ANIMATED_IN = new Set(['gif', 'webp']);
const ANIMATED_OUT = new Set(['gif', 'webp']);

interface Job {
  id: string;
  wasmUrl?: string;
  buffer?: ArrayBuffer;
  inExt?: string;
  to?: string;
  quality?: number;
  maxSide?: number;
  stripMetadata?: boolean;
}

function write(img: { write: (f: MagickFormat, cb: (d: Uint8Array) => void) => void }, f: MagickFormat) {
  return new Promise<Uint8Array>((res) => img.write(f, (d) => res(d.slice())));
}

async function convert(job: Job): Promise<Uint8Array> {
  const to = job.to!;
  const fmt = FORMAT[to];
  const data = new Uint8Array(job.buffer!);
  const inExt = (job.inExt ?? '').replace('jpeg', 'jpg');

  // GIF/WebP animati verso GIF/WebP: mantengo l'animazione.
  if (ANIMATED_IN.has(inExt) && ANIMATED_OUT.has(to)) {
    const col = MagickImageCollection.create();
    try {
      col.read(data);
      if (col.length > 1) {
        col.coalesce();
        for (const frame of col) {
          if (job.maxSide) fit(frame, job.maxSide);
          if (job.stripMetadata) frame.strip();
        }
        return await new Promise<Uint8Array>((res) => col.write(fmt, (d) => res(d.slice())));
      }
    } finally {
      col.dispose();
    }
  }

  const img = MagickImage.create(data, new MagickReadSettings({}));
  try {
    img.autoOrient();
    if (job.maxSide) fit(img, job.maxSide);
    if (job.stripMetadata) img.strip();
    if (job.quality) img.quality = job.quality;
    if (NO_ALPHA.has(to) && img.hasAlpha) {
      img.backgroundColor = new MagickColor(255, 255, 255, 255);
      img.alpha(AlphaAction.Remove);
    }
    if (to === 'ico') fit(img, 256);
    return await write(img, fmt);
  } finally {
    img.dispose();
  }
}

function fit(img: { width: number; height: number; resize: (w: number, h: number) => void }, max: number) {
  const m = Math.max(img.width, img.height);
  if (m > max) {
    const s = max / m;
    img.resize(Math.max(1, Math.round(img.width * s)), Math.max(1, Math.round(img.height * s)));
  }
}

self.onmessage = async (e: MessageEvent<Job>) => {
  const job = e.data;
  try {
    if (!ready) {
      ready = (async () => {
        const wasm = await (await fetch(job.wasmUrl!)).arrayBuffer();
        await initializeImageMagick(new Uint8Array(wasm));
      })();
    }
    await ready;
    const out = await convert(job);
    (self as unknown as Worker).postMessage({ id: job.id, ok: true, out }, [out.buffer]);
  } catch (err) {
    ready = ready ?? null;
    (self as unknown as Worker).postMessage({ id: job.id, ok: false, error: String((err as Error)?.message ?? err) });
  }
};
