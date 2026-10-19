// BenitoTools: PDF in testo (pdf.js).
import React, { useState } from 'react';
import { FormControlLabel, Switch, TextField } from '@mui/material';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { openPdfjs, parseRanges, withSuffix } from '../../../pdf/lib';

export default function PdfToText(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState('');
  const [breaks, setBreaks] = useState(true);

  const run = async () => {
    const pdf = await openPdfjs(file!);
    const idx = parseRanges(pages, pdf.numPages);
    const parts: string[] = [];
    for (const i of idx) {
      const page = await pdf.getPage(i + 1);
      const tc = await page.getTextContent();
      let text = '';
      let lastY: number | null = null;
      for (const item of tc.items as any[]) {
        if (!('str' in item)) continue;
        const y = item.transform?.[5];
        if (lastY !== null && Math.abs(y - lastY) > 2) text += '\n';
        text += item.str + (item.hasEOL ? '\n' : '');
        lastY = y;
      }
      parts.push((breaks ? `--- ${pt.page} ${i + 1} ---\n` : '') + text.replace(/\n{3,}/g, '\n\n').trim());
    }
    const all = parts.join('\n\n');
    if (!all.replace(/--- .* ---/g, '').trim()) throw new Error(pt.text.empty);
    return [new File([all], withSuffix(file!.name, 'testo', 'txt'), { type: 'text/plain' })];
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      actionLabel={pt.apply}
      actionIcon="material-symbols:text-snippet-outline-rounded"
      options={
        <>
          <TextField fullWidth size="small" label={pt.pages} helperText={pt.pagesDesc} value={pages} onChange={(e) => setPages(e.target.value)} sx={{ mb: 1 }} />
          <FormControlLabel control={<Switch checked={breaks} onChange={(e) => setBreaks(e.target.checked)} />} label={pt.text.pageBreaks} />
        </>
      }
    />
  );
}
