// BenitoTools: funzioni comuni per gli strumenti PDF (pdf.js per vedere, pdf-lib per modificare, qpdf per sicurezza).
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function openPdfjs(file: File | Blob, password?: string): Promise<PDFDocumentProxy> {
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjsLib.getDocument({ data, password }).promise;
}

/** Disegna una pagina (1-based) su un canvas. `scale` 1 = 72 dpi. */
export async function renderPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  canvas: HTMLCanvasElement = document.createElement('canvas')
) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport } as any).promise;
  page.cleanup();
  return canvas;
}

/** Miniatura (data URL) larga circa `width` pixel. */
export async function thumbnail(pdf: PDFDocumentProxy, pageNumber: number, width = 180) {
  const page = await pdf.getPage(pageNumber);
  const v = page.getViewport({ scale: 1 });
  const c = await renderPage(pdf, pageNumber, width / v.width);
  return c.toDataURL('image/jpeg', 0.7);
}

export function canvasToBlob(c: HTMLCanvasElement, type = 'image/jpeg', q = 0.9): Promise<Blob> {
  return new Promise((r, j) => c.toBlob((b) => (b ? r(b) : j(new Error('toBlob'))), type, q));
}

export function pdfFile(bytes: Uint8Array, name: string) {
  return new File([bytes as Uint8Array<ArrayBuffer>], name, { type: 'application/pdf' });
}

export function withSuffix(name: string, suffix: string, ext = 'pdf') {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}-${suffix}.${ext}`;
}

/** Interpreta "1,3,5-7" (1-based) → indici 0-based validi. Vuoto = tutte. */
export function parseRanges(text: string, total: number): number[] {
  const t = text.trim();
  if (!t) return Array.from({ length: total }, (_, i) => i);
  const out = new Set<number>();
  for (const part of t.split(/[,;\s]+/)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const a = Math.max(1, parseInt(m[1], 10));
    const b = Math.min(total, m[2] ? parseInt(m[2], 10) : a);
    for (let i = a; i <= b; i++) out.add(i - 1);
  }
  return [...out].sort((x, y) => x - y);
}

// ---- qpdf (WASM) per password, riparazione, linearizzazione ----
let qpdfPromise: Promise<any> | null = null;

async function getQpdf() {
  qpdfPromise ??= (async () => {
    const [{ default: createModule }, { default: wasmUrl }] = await Promise.all([
      import('@neslinesli93/qpdf-wasm'),
      import('@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url')
    ]);
    return (createModule as any)({ locateFile: () => wasmUrl, noInitialRun: true });
  })();
  return qpdfPromise;
}

/** Esegue qpdf con argomenti; input.pdf → output.pdf. Ritorna i byte o lancia un errore. */
export async function runQpdf(input: Uint8Array, args: string[]): Promise<Uint8Array> {
  const q = await getQpdf();
  const id = Math.random().toString(36).slice(2);
  const inP = `/in-${id}.pdf`;
  const outP = `/out-${id}.pdf`;
  q.FS.writeFile(inP, input);
  let code = 0;
  try {
    code = q.callMain([...args.map((a) => a.replace('{in}', inP).replace('{out}', outP))]);
  } catch (e: any) {
    code = typeof e?.status === 'number' ? e.status : 2;
  }
  try {
    // qpdf: 0 = ok, 3 = ok con avvisi
    if (code !== 0 && code !== 3) throw new Error(`qpdf ${code}`);
    return q.FS.readFile(outP) as Uint8Array;
  } finally {
    try {
      q.FS.unlink(inP);
    } catch {
      /* */
    }
    try {
      q.FS.unlink(outP);
    } catch {
      /* */
    }
  }
}
