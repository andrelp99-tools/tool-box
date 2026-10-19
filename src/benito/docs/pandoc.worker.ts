/// <reference lib="webworker" />
// BenitoTools: pandoc in un worker (non blocca la pagina durante la conversione).
// @ts-ignore - file JS copiato da pandoc-wasm
import { createPandocInstance } from './pandoc-core.js';

type Req = {
  id: number;
  url: string;
  options: Record<string, unknown>;
  files: Record<string, Blob | string>;
};

let instance: Promise<any> | null = null;

async function load(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let blob = await res.blob();
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] === 0x1f && head[1] === 0x8b) {
    blob = await new Response(
      blob.stream().pipeThrough(new DecompressionStream('gzip'))
    ).blob();
  }
  return createPandocInstance(await blob.arrayBuffer());
}

self.onmessage = async (e: MessageEvent<Req>) => {
  const { id, url, options, files } = e.data;
  try {
    if (!instance) instance = load(url);
    const pandoc = await instance;
    const res = await pandoc.convert(options, null, files);
    (self as unknown as Worker).postMessage({
      id,
      ok: true,
      stderr: res.stderr,
      files: res.files,
      mediaFiles: res.mediaFiles
    });
  } catch (err) {
    instance = null;
    (self as unknown as Worker).postMessage({
      id,
      ok: false,
      error: (err as Error)?.message ?? String(err)
    });
  }
};
