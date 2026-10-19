// BenitoTools: conversione documenti. Sceglie da solo il motore giusto (anche due in fila):
//  - LibreOffice: Word/Excel/PowerPoint/OpenDocument ⇄ PDF e tra loro
//  - pandoc: Markdown, HTML, EPUB ⇄ Word/ODT
//  - PyMuPDF: PDF → Word/Excel/Markdown/HTML/testo, eBook → PDF
import { loConvert, LO_READ } from './libreoffice';
import { pandocConvert, PANDOC_READ, PANDOC_WRITE } from './pandoc';
import { EBOOK_READ, pymupdfConvert } from './pymupdf';
import type { EngineName } from './engines';

export type DocFamily =
  | 'text'
  | 'sheet'
  | 'slides'
  | 'drawing'
  | 'ebook'
  | 'pdf';

export const DOC_INPUT: Record<DocFamily, string[]> = {
  text: [
    'doc',
    'docx',
    'docm',
    'dot',
    'dotx',
    'odt',
    'ott',
    'rtf',
    'txt',
    'md',
    'markdown',
    'html',
    'htm',
    'rst',
    'tex',
    'epub',
    'wpd',
    'wps',
    'pages',
    'lwp'
  ],
  sheet: ['xls', 'xlsx', 'xlsm', 'ods', 'ots', 'csv', 'numbers'],
  slides: ['ppt', 'pptx', 'pps', 'ppsx', 'odp', 'otp', 'key'],
  drawing: ['odg', 'vsd', 'vsdx', 'pub'],
  ebook: EBOOK_READ.filter((e) => e !== 'epub'),
  pdf: ['pdf']
};

export const DOC_OUTPUT: Record<DocFamily, string[]> = {
  text: ['pdf', 'docx', 'odt', 'doc', 'rtf', 'txt', 'md', 'html', 'epub'],
  sheet: ['pdf', 'xlsx', 'ods', 'xls', 'csv', 'html'],
  slides: ['pdf', 'pptx', 'odp', 'ppt'],
  drawing: ['pdf'],
  ebook: ['pdf'],
  pdf: ['docx', 'xlsx', 'csv', 'md', 'txt', 'html']
};

export const DOC_DEFAULT: Record<DocFamily, string> = {
  text: 'pdf',
  sheet: 'pdf',
  slides: 'pdf',
  drawing: 'pdf',
  ebook: 'pdf',
  pdf: 'docx'
};

export const ALL_DOC_INPUT = Object.values(DOC_INPUT).flat();

export function extOf(name: string) {
  return (name.split('.').pop() ?? '').toLowerCase();
}

export function docFamilyOf(file: File): DocFamily | null {
  const ext = extOf(file.name);
  if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
  for (const f of Object.keys(DOC_INPUT) as DocFamily[]) {
    if (DOC_INPUT[f].includes(ext)) return f;
  }
  return null;
}

/** Motori che serviranno per convertire questo file nel formato scelto (per l'avviso del primo download). */
export function enginesFor(file: File, to: string): EngineName[] {
  const ext = extOf(file.name);
  const fam = docFamilyOf(file);
  if (!fam) return [];
  if (fam === 'pdf' || fam === 'ebook') return ['pymupdf'];
  if (fam !== 'text') return ['libreoffice'];
  if (PANDOC_WRITE.includes(to))
    return PANDOC_READ.includes(ext) ? ['pandoc'] : ['libreoffice', 'pandoc'];
  if (ext === 'epub' && to === 'pdf') return ['pymupdf'];
  if (LO_READ.includes(ext)) return ['libreoffice'];
  return to === 'docx' ? ['pandoc'] : ['pandoc', 'libreoffice'];
}

export type DocStage = 'download' | 'start' | 'convert';

export class SameFormatError extends Error {}

export async function convertDocument(
  file: File,
  to: string,
  onStage?: (s: DocStage) => void
): Promise<File> {
  const ext = extOf(file.name);
  const fam = docFamilyOf(file);
  if (!fam) throw new Error(ext);
  if (
    ext === to ||
    (ext === 'htm' && to === 'html') ||
    (ext === 'markdown' && to === 'md')
  ) {
    throw new SameFormatError(to);
  }
  if (fam === 'pdf' || fam === 'ebook')
    return pymupdfConvert(file, to, onStage);
  if (fam !== 'text') return loConvert(file, to, onStage);

  // Testi
  if (PANDOC_WRITE.includes(to)) {
    const src = PANDOC_READ.includes(ext)
      ? file
      : await loConvert(file, 'docx', onStage);
    onStage?.('convert');
    return pandocConvert(src, to);
  }
  if (ext === 'epub' && to === 'pdf')
    return pymupdfConvert(file, 'pdf', onStage);
  if (LO_READ.includes(ext)) return loConvert(file, to, onStage);
  // Markdown, reStructuredText, LaTeX, EPUB → Word con pandoc, poi (se serve) LibreOffice
  onStage?.('convert');
  const docx = await pandocConvert(file, 'docx');
  if (to === 'docx') return docx;
  return loConvert(docx, to, onStage);
}

/** Evita due risultati con lo stesso nome (es. prova.docx e prova.xlsx → prova.pdf). */
export function uniqueName(file: File, taken: File[]): File {
  const names = new Set(taken.map((f) => f.name));
  if (!names.has(file.name)) return file;
  const dot = file.name.lastIndexOf('.');
  const base = dot > 0 ? file.name.slice(0, dot) : file.name;
  const ext = dot > 0 ? file.name.slice(dot) : '';
  let n = 2;
  while (names.has(`${base} (${n})${ext}`)) n++;
  return new File([file], `${base} (${n})${ext}`, { type: file.type });
}
