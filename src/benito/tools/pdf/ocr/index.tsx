// BenitoTools: OCR PDF — aggiunge un livello di testo invisibile (PDF ricercabile) e produce il testo.
import React, { useState } from 'react';
import { Box, FormControlLabel, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { useBt } from '../../../strings';
import { openPdfjs, parseRanges, pdfFile, renderPage, withSuffix } from '../../../pdf/lib';

const LANGS = ['ita', 'eng', 'fra', 'deu', 'spa', 'por'];

export default function OcrPdf(_p: ToolComponentProps) {
  const pt = usePt();
  const bt = useBt();
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState('ita');
  const [pages, setPages] = useState('');
  const [searchable, setSearchable] = useState(true);
  const [progress, setProgress] = useState<string | null>(null);

  const run = async () => {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker(lang);
    try {
      const pdf = await openPdfjs(file!);
      const idx = parseRanges(pages, pdf.numPages);
      const doc = await PDFDocument.load(await file!.arrayBuffer(), { ignoreEncryption: true });
      const texts: string[] = [];
      for (const [k, i] of idx.entries()) {
        setProgress(pt.ocr.progress.replace('{p}', String(k + 1)).replace('{n}', String(idx.length)));
        const canvas = await renderPage(pdf, i + 1, 200 / 72);
        const { data } = await worker.recognize(canvas, { pdfTextOnly: true }, { text: true, pdf: searchable });
        texts.push(`--- ${pt.page} ${i + 1} ---\n${(data.text ?? '').trim()}`);
        if (searchable && data.pdf) {
          // pagina di solo testo invisibile, sovrapposta all'originale
          const layer = await PDFDocument.load(new Uint8Array(data.pdf));
          const [embedded] = await doc.embedPdf(layer, [0]);
          const page = doc.getPage(i);
          const { width, height } = page.getSize();
          page.drawPage(embedded, { x: 0, y: 0, width, height });
        }
        canvas.width = canvas.height = 1;
      }
      setProgress(null);
      const out: File[] = [];
      if (searchable) out.push(pdfFile(await doc.save(), withSuffix(file!.name, 'ocr')));
      out.push(new File([texts.join('\n\n')], withSuffix(file!.name, 'ocr', 'txt'), { type: 'text/plain' }));
      return out;
    } finally {
      await worker.terminate();
    }
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      progressText={progress}
      actionLabel={pt.apply}
      actionIcon="material-symbols:document-search-outline-rounded"
      zipName="ocr.zip"
      options={
        <Box>
          <TextField select fullWidth size="small" label={pt.ocr.language} value={lang} onChange={(e) => setLang(e.target.value)} sx={{ mb: 1 }}>
            {LANGS.map((l) => (
              <MenuItem key={l} value={l}>
                {bt.ocr.languages[l as keyof typeof bt.ocr.languages]}
              </MenuItem>
            ))}
          </TextField>
          <TextField fullWidth size="small" label={pt.pages} helperText={pt.pagesDesc} value={pages} onChange={(e) => setPages(e.target.value)} sx={{ mb: 1 }} />
          <FormControlLabel control={<Switch checked={searchable} onChange={(e) => setSearchable(e.target.checked)} />} label={pt.ocr.searchable} />
          <Typography variant="caption" color="text.secondary" display="block">
            {pt.ocr.firstUse}
          </Typography>
        </Box>
      }
    />
  );
}
