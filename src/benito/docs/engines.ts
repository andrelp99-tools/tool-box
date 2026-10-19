// BenitoTools: motori pesanti per i documenti, serviti dall'app in /engines/ (vedi scripts/benito-engines.sh).
// Vengono scaricati solo al primo uso e poi restano nella cache del telefono (funzionano offline).

const BASE = `${import.meta.env.BASE_URL}engines/`;

export const ENGINE_URL = {
  libreoffice: `${BASE}libreoffice-2.6.0/`,
  pymupdf: `${BASE}pymupdf-0.11.16/`,
  ghostscript: `${BASE}gs-0.1.1/`,
  pandoc: `${BASE}pandoc-3.9/pandoc.wasm.gz`
};

/** Dimensione indicativa del download al primo uso (MB). */
export const ENGINE_MB = {
  libreoffice: 75,
  pymupdf: 70,
  pandoc: 16
};

export type EngineName = keyof typeof ENGINE_MB;

const GZIP = [0x1f, 0x8b];

/** Scarica un file e, se è compresso gzip, lo decomprime. */
export async function fetchMaybeGzip(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} (${url.split('/').pop()})`);
  let blob = await res.blob();
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] === GZIP[0] && head[1] === GZIP[1]) {
    const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
    blob = await new Response(stream).blob();
  }
  return blob;
}
