import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoForms.title',
    description: 'pdf:benitoForms.description',
    shortDescription: 'pdf:benitoForms.shortDescription'
  },
  path: 'compila-modulo',
  icon: 'material-symbols:edit-document-outline-rounded',
  keywords: ['modulo', 'compila', 'form', 'campi', 'fill'],
  component: lazy(() => import('./index'))
});
