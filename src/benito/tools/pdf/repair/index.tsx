// BenitoTools: Ripara PDF (qpdf ricostruisce la struttura; se fallisce prova con pdf-lib).
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { pdfFile, runQpdf, withSuffix } from '../../../pdf/lib';

export default function RepairPdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const run = async () => {
    const input = new Uint8Array(await file!.arrayBuffer());
    try {
      const out = await runQpdf(input, ['{in}', '--object-streams=generate', '{out}']);
      return [pdfFile(out, withSuffix(file!.name, 'riparato'))];
    } catch {
      try {
        const doc = await PDFDocument.load(input, { ignoreEncryption: true, throwOnInvalidObject: false });
        return [pdfFile(await doc.save(), withSuffix(file!.name, 'riparato'))];
      } catch {
        throw new Error(pt.repair.failed);
      }
    }
  };
  return <PdfShell file={file} setFile={setFile} run={run} actionLabel={pt.apply} actionIcon="material-symbols:build-outline-rounded" />;
}
