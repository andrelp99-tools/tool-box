// BenitoTools: Office in PDF (LibreOffice WASM).
import React from 'react';
import DocShortcut from '../../../docs/DocShortcut';
import { DOC_INPUT } from '../../../docs/convert';
import { useBt } from '../../../strings';

export default function OfficeToPdf() {
  const bt = useBt();
  return (
    <DocShortcut
      accept={[
        ...DOC_INPUT.text.filter((e) => e !== 'epub'),
        ...DOC_INPUT.sheet,
        ...DOC_INPUT.slides,
        ...DOC_INPUT.drawing
      ]}
      outputs={['pdf']}
      inputTitle={bt.docs.input}
      zipName="pdf.zip"
      needsIsolation
    />
  );
}
