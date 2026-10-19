// BenitoTools: ricostruisce un PDF trasformando alcune pagine in immagini (oscura, grigi, appiattisci).
import { PDFDocument } from 'pdf-lib';
import { canvasToBlob, openPdfjs, renderPage } from './lib';

export async function rasterizePdf(
  file: File,
  opts: {
    dpi: number;
    /** pagine (0-based) da trasformare in immagine; undefined = tutte */
    pages?: Set<number>;
    /** modifica il canvas prima di salvarlo (es. rettangoli neri, grigi) */
    draw?: (ctx: CanvasRenderingContext2D, pageIndex: number, scale: number) => void;
    grayscale?: boolean;
    onProgress?: (i: number, n: number) => void;
  }
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pdf = await openPdfjs(file);
  const out = await PDFDocument.create();
  const n = pdf.numPages;
  for (let i = 0; i < n; i++) {
    opts.onProgress?.(i + 1, n);
    if (opts.pages && !opts.pages.has(i)) {
      const [p] = await out.copyPages(src, [i]);
      out.addPage(p);
      continue;
    }
    const scale = opts.dpi / 72;
    const c = await renderPage(pdf, i + 1, scale);
    const ctx = c.getContext('2d')!;
    if (opts.grayscale) {
      const img = ctx.getImageData(0, 0, c.width, c.height);
      const d = img.data;
      for (let k = 0; k < d.length; k += 4) {
        const g = 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2];
        d[k] = d[k + 1] = d[k + 2] = g;
      }
      ctx.putImageData(img, 0, 0);
    }
    opts.draw?.(ctx, i, scale);
    const jpg = await out.embedJpg(new Uint8Array(await (await canvasToBlob(c, 'image/jpeg', 0.88)).arrayBuffer()));
    const pageSize = (await pdf.getPage(i + 1)).getViewport({ scale: 1 });
    const page = out.addPage([pageSize.width, pageSize.height]);
    page.drawImage(jpg, { x: 0, y: 0, width: pageSize.width, height: pageSize.height });
    c.width = c.height = 1;
  }
  return out.save({ useObjectStreams: true });
}
