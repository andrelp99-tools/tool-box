// BenitoTools: Appiattisci PDF (moduli con pdf-lib; annotazioni trasformando le pagine in immagini).
import React, { useState } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { pdfFile, withSuffix } from '../../../pdf/lib';
import { rasterizePdf } from '../../../pdf/rasterize';

export default function FlattenPdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [annots, setAnnots] = useState(false);
  const run = async () => {
    const doc = await PDFDocument.load(await file!.arrayBuffer(), { ignoreEncryption: true });
    try {
      doc.getForm().flatten();
    } catch {
      /* nessun modulo */
    }
    let bytes = await doc.save();
    if (annots) bytes = await rasterizePdf(pdfFile(bytes, 'x.pdf'), { dpi: 150 });
    return [pdfFile(bytes, withSuffix(file!.name, 'appiattito'))];
  };
  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      actionLabel={pt.apply}
      actionIcon="material-symbols:layers-clear-outline-rounded"
      options={
        <>
          <FormControlLabel control={<Switch checked disabled />} label={pt.flatten.forms} />
          <FormControlLabel control={<Switch checked={annots} onChange={(e) => setAnnots(e.target.checked)} />} label={pt.flatten.annotations} />
        </>
      }
    />
  );
}
