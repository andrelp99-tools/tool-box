import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: PDF in Word modificabile con PyMuPDF + pdf2docx (sul dispositivo)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoPdfToWord.title',
    description: 'pdf:benitoPdfToWord.description',
    shortDescription: 'pdf:benitoPdfToWord.shortDescription'
  },
  path: 'pdf-in-word',
  icon: 'material-symbols:edit-document-outline-rounded',
  keywords: [
    'word',
    'docx',
    'modificabile',
    'modificare',
    'editabile',
    'pdf to word',
    'converti',
    'documento'
  ],
  component: lazy(() => import('./index'))
});
