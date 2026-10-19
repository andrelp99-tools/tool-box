import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoToText.title',
    description: 'pdf:benitoToText.description',
    shortDescription: 'pdf:benitoToText.shortDescription'
  },
  path: 'pdf-in-testo',
  icon: 'material-symbols:text-snippet-outline-rounded',
  keywords: ['testo', 'txt', 'estrai', 'text'],
  component: lazy(() => import('./index'))
});
