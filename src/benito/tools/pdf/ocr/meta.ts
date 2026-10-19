import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoOcr.title',
    description: 'pdf:benitoOcr.description',
    shortDescription: 'pdf:benitoOcr.shortDescription'
  },
  path: 'ocr',
  icon: 'material-symbols:document-search-outline-rounded',
  keywords: ['ocr', 'ricercabile', 'riconoscimento', 'testo', 'scansionato', 'searchable'],
  component: lazy(() => import('./index'))
});
