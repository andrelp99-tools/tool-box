// BenitoTools: PDF in Word (PyMuPDF + pdf2docx).
import React from 'react';
import DocShortcut from '../../../docs/DocShortcut';
import { useBt } from '../../../strings';

export default function PdfToWord() {
  const bt = useBt();
  return (
    <DocShortcut
      accept={['pdf']}
      outputs={['docx', 'md', 'html']}
      inputTitle={bt.docs.inputPdf}
      zipName="word.zip"
    />
  );
}
