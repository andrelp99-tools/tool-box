// BenitoTools: conversioni tra formati di testo con pandoc (WASM ufficiale, sul dispositivo).
import JSZip from 'jszip';
import { ENGINE_URL } from './engines';

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, (data: any) => void>();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./pandoc.worker.ts', import.meta.url), {
      type: 'module'
    });
    worker.onmessage = (e) => {
      const cb = pending.get(e.data.id);
      if (cb) {
        pending.delete(e.data.id);
        cb(e.data);
      }
    };
  }
  return worker;
}

/** Nome del formato per pandoc a partire dall'estensione. */
export const PANDOC_FORMAT: Record<string, string> = {
  md: 'markdown',
  markdown: 'markdown',
  html: 'html',
  htm: 'html',
  docx: 'docx',
  odt: 'odt',
  epub: 'epub',
  rst: 'rst',
  tex: 'latex',
  latex: 'latex',
  rtf: 'rtf',
  txt: 'plain'
};

/** Formati che pandoc sa leggere. */
export const PANDOC_READ = [
  'md',
  'markdown',
  'html',
  'htm',
  'docx',
  'odt',
  'epub',
  'rst',
  'tex',
  'latex',
  'rtf'
];
/** Formati che produciamo con pandoc. */
export const PANDOC_WRITE = ['md', 'html', 'epub'];

const MIME: Record<string, string> = {
  md: 'text/markdown',
  html: 'text/html',
  epub: 'application/epub+zip',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text'
};

function baseName(name: string) {
  return name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
}

export async function pandocConvert(file: File, to: string): Promise<File> {
  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  const from = PANDOC_FORMAT[ext];
  const target = PANDOC_FORMAT[to];
  if (!from || !target) throw new Error(`${ext} → ${to}`);
  const inName = `input.${ext}`;
  const outName = `output.${to}`;
  const options: Record<string, unknown> = {
    from,
    to: target,
    'input-files': [inName],
    'output-file': outName,
    standalone: true
  };
  // HTML ed EPUB con le immagini dentro il file; Markdown con le immagini in una cartella (→ zip)
  if (to === 'html') options['embed-resources'] = true;
  if (to === 'md') options['extract-media'] = 'media';
  // Titolo della pagina/libro (senza aggiungere un titolo visibile all'HTML)
  if (to === 'html') options.metadata = { pagetitle: baseName(file.name) };
  if (to === 'epub') options.metadata = { title: baseName(file.name) };

  const id = ++seq;
  const w = getWorker();
  const data = await new Promise<any>((resolve) => {
    pending.set(id, resolve);
    w.postMessage({
      id,
      url: ENGINE_URL.pandoc,
      options,
      files: { [inName]: file }
    });
  });
  if (!data.ok) throw new Error(data.error);
  const out: Blob | undefined = data.files?.[outName];
  if (!out || out.size === 0)
    throw new Error((data.stderr || '').trim() || 'pandoc: nessun risultato');

  const media = Object.entries((data.mediaFiles ?? {}) as Record<string, Blob>);
  const name = `${baseName(file.name)}.${to}`;
  if (to === 'md' && media.length) {
    const zip = new JSZip();
    zip.file(name, out);
    media.forEach(([path, blob]) => zip.file(path, blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    return new File([blob], `${baseName(file.name)}.zip`, {
      type: 'application/zip'
    });
  }
  return new File([out], name, {
    type: MIME[to] ?? 'application/octet-stream'
  });
}
