// BenitoTools: interfaccia verso il worker ImageMagick.
import wasmUrl from '@imagemagick/magick-wasm/magick.wasm?url';
import { MIME, renamed } from './formats';

let worker: Worker | null = null;
const pending = new Map<string, { res: (d: Uint8Array) => void; rej: (e: Error) => void }>();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const { id, ok, out, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      ok ? p.res(out) : p.rej(new Error(error));
    };
    worker.onerror = (e) => {
      pending.forEach((p) => p.rej(new Error(e.message || 'worker error')));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  }
  return worker;
}

export interface ImageOptions {
  quality?: number;
  maxSide?: number;
  stripMetadata?: boolean;
}

export async function convertImage(file: File, to: string, opts: ImageOptions = {}): Promise<File> {
  const id = `${Date.now()}-${Math.random()}`;
  const buffer = await file.arrayBuffer();
  const inExt = (file.name.split('.').pop() ?? '').toLowerCase();
  const out = await new Promise<Uint8Array>((res, rej) => {
    pending.set(id, { res, rej });
    getWorker().postMessage(
      { id, wasmUrl: new URL(wasmUrl, location.href).href, buffer, inExt, to, ...opts },
      [buffer]
    );
  });
  return new File([out as Uint8Array<ArrayBuffer>], renamed(file.name, to), { type: MIME[to] ?? 'application/octet-stream' });
}
