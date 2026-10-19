// BenitoTools: LibreOffice in WebAssembly (pacchetto @matbee/libreoffice-converter), tutto sul dispositivo.
// Converte documenti Office/OpenDocument in PDF e tra loro. Richiede la pagina "isolata"
// (SharedArrayBuffer): le intestazioni le aggiunge il service worker (src/sw.ts).
import { ENGINE_URL, fetchMaybeGzip } from './engines';

/** Formati che LibreOffice sa aprire. */
export const LO_READ = [
  'doc',
  'docx',
  'docm',
  'dot',
  'dotx',
  'odt',
  'ott',
  'rtf',
  'txt',
  'html',
  'htm',
  'wpd',
  'wps',
  'pages',
  'lwp',
  'xls',
  'xlsx',
  'xlsm',
  'ods',
  'ots',
  'csv',
  'numbers',
  'ppt',
  'pptx',
  'pps',
  'ppsx',
  'odp',
  'otp',
  'key',
  'odg',
  'vsd',
  'vsdx',
  'pub'
];

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  txt: 'text/plain',
  html: 'text/html',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation'
};

// Formato di ingresso dichiarato a LibreOffice (per gli altri lascia riconoscere a lui).
const INPUT_HINT: Record<string, string> = {
  doc: 'doc',
  docx: 'docx',
  xls: 'xls',
  xlsx: 'xlsx',
  ppt: 'ppt',
  pptx: 'pptx',
  odt: 'odt',
  ods: 'ods',
  odp: 'odp',
  odg: 'odg',
  rtf: 'rtf',
  txt: 'txt',
  html: 'html',
  htm: 'htm',
  csv: 'csv'
};

export class NotIsolatedError extends Error {}

let converter: Promise<any> | null = null;

async function getConverter(onStage?: (s: 'download' | 'start') => void) {
  if (!self.crossOriginIsolated) throw new NotIsolatedError('not isolated');
  if (!converter) {
    converter = (async () => {
      onStage?.('download');
      const base = ENGINE_URL.libreoffice;
      const mod = await import(/* @vite-ignore */ `${base}browser.js`);
      const [wasm, data] = await Promise.all([
        fetchMaybeGzip(`${base}soffice.wasm.gz`),
        fetchMaybeGzip(`${base}soffice.data.gz`)
      ]);
      onStage?.('start');
      const c = new mod.WorkerBrowserConverter({
        sofficeJs: `${base}soffice.js`,
        sofficeWasm: URL.createObjectURL(
          new Blob([wasm], { type: 'application/wasm' })
        ),
        sofficeData: URL.createObjectURL(
          new Blob([data], { type: 'application/octet-stream' })
        ),
        sofficeWorkerJs: `${base}soffice.worker.js`,
        browserWorkerJs: `${base}browser.worker.global.js`,
        verbose: false
      });
      await c.initialize();
      return c;
    })();
    converter.catch(() => {
      converter = null;
    });
  }
  return converter;
}

function baseName(name: string) {
  return name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
}

// Una conversione alla volta (il motore è unico).
let queue: Promise<unknown> = Promise.resolve();

export function loConvert(
  file: File,
  to: string,
  onStage?: (s: 'download' | 'start' | 'convert') => void
): Promise<File> {
  const job = queue.then(async () => {
    const c = await getConverter(onStage);
    onStage?.('convert');
    const ext = (file.name.split('.').pop() ?? '').toLowerCase();
    const opts: Record<string, unknown> = { outputFormat: to };
    if (INPUT_HINT[ext]) opts.inputFormat = INPUT_HINT[ext];
    const res = await c.convert(
      new Uint8Array(await file.arrayBuffer()),
      opts,
      file.name
    );
    const bytes = new Uint8Array(res.data); // copia: il risultato può stare in memoria condivisa
    return new File([bytes], `${baseName(file.name)}.${to}`, {
      type: MIME[to] ?? res.mimeType
    });
  });
  queue = job.catch(() => undefined);
  return job;
}
