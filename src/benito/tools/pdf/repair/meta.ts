import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoRepair.title',
    description: 'pdf:benitoRepair.description',
    shortDescription: 'pdf:benitoRepair.shortDescription'
  },
  path: 'ripara',
  icon: 'material-symbols:build-outline-rounded',
  keywords: ['ripara', 'danneggiato', 'repair', 'errore', 'corrotto'],
  component: lazy(() => import('./index'))
});
