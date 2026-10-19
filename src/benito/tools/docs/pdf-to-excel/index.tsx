// BenitoTools: tabelle del PDF in Excel o CSV (PyMuPDF).
import React from 'react';
import DocShortcut from '../../../docs/DocShortcut';
import { useBt } from '../../../strings';

export default function PdfToExcel() {
  const bt = useBt();
  return (
    <DocShortcut
      accept={['pdf']}
      outputs={['xlsx', 'csv']}
      inputTitle={bt.docs.inputPdf}
      hint={bt.docs.pdfHint}
      zipName="tabelle.zip"
    />
  );
}
