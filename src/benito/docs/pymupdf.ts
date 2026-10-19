// BenitoTools: PyMuPDF in WebAssembly (Python nel browser, pacchetto @bentopdf/pymupdf-wasm).
// PDF → Word (pdf2docx), tabelle → Excel/CSV, PDF → Markdown/HTML/testo, eBook → PDF.
import { ENGINE_URL } from './engines';
import { writeXlsx } from './xlsx';

let engine: Promise<any> | null = null;

export function getPyMuPDF(onStage?: (s: 'download') => void): Promise<any> {
  if (!engine) {
    onStage?.('download');
    engine = (async () => {
      const mod = await import(
        /* @vite-ignore */ `${ENGINE_URL.pymupdf}dist/index.js`
      );
      const p = new mod.PyMuPDF({
        assetPath: `${ENGINE_URL.pymupdf}assets/`,
        ghostscriptUrl: ENGINE_URL.ghostscript
      });
      await p.load();
      return p;
    })();
    engine.catch(() => {
      engine = null;
    });
  }
  return engine;
}

function baseName(name: string) {
  return name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
}

/** Formati eBook/altro che PyMuPDF trasforma in PDF. */
export const EBOOK_READ = ['epub', 'mobi', 'fb2', 'cbz', 'xps', 'oxps'];

export class NoTablesError extends Error {}

export async function pymupdfConvert(
  file: File,
  to: string,
  onStage?: (s: 'download' | 'convert') => void
): Promise<File> {
  const p = await getPyMuPDF(onStage);
  onStage?.('convert');
  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  const base = baseName(file.name);

  if (ext !== 'pdf') {
    if (to !== 'pdf') throw new Error(`${ext} → ${to}`);
    const blob: Blob = await p.convertToPdf(file, { filetype: ext });
    return new File([blob], `${base}.pdf`, { type: 'application/pdf' });
  }

  switch (to) {
    case 'docx': {
      const blob: Blob = await p.pdfToDocx(file);
      return new File([blob], `${base}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    }
    case 'md': {
      const md: string = await p.pdfToMarkdown(file, { pageBreaks: true });
      return new File([md], `${base}.md`, { type: 'text/markdown' });
    }
    case 'html': {
      const html: string = await p.pdfToHtml(file);
      return new File([html], `${base}.html`, { type: 'text/html' });
    }
    case 'txt': {
      const txt: string = await p.pdfToText(file);
      return new File([txt], `${base}.txt`, { type: 'text/plain' });
    }
    case 'xlsx':
    case 'csv': {
      const doc = await p.open(file);
      const tables: { page: number; rows: (string | null)[][] }[] = [];
      try {
        for (let i = 0; i < doc.pageCount; i++) {
          const page = doc.getPage(i);
          for (const t of page.findTables()) {
            if (t.rows?.length) tables.push({ page: i + 1, rows: t.rows });
          }
        }
      } finally {
        doc.close();
      }
      if (!tables.length) throw new NoTablesError('no tables');
      if (to === 'csv') {
        const esc = (v: string | null) => {
          const s = (v ?? '').replace(/\r?\n/g, ' ');
          return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        // Separatore ";" come Excel in italiano; tabelle separate da una riga vuota
        const csv = tables
          .map((t) => t.rows.map((r) => r.map(esc).join(';')).join('\r\n'))
          .join('\r\n\r\n');
        return new File(['﻿' + csv], `${base}.csv`, { type: 'text/csv' });
      }
      const blob = await writeXlsx(
        tables.map((t, i) => ({
          name: `Tabella ${i + 1} (pag. ${t.page})`,
          rows: t.rows
        }))
      );
      return new File([blob], `${base}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    }
  }
  throw new Error(`pdf → ${to}`);
}
