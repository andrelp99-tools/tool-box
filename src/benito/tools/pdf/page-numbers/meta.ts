import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoPageNumbers.title',
    description: 'pdf:benitoPageNumbers.description',
    shortDescription: 'pdf:benitoPageNumbers.shortDescription'
  },
  path: 'numeri-pagina',
  icon: 'material-symbols:format-list-numbered-rounded',
  keywords: ['numeri', 'pagina', 'intestazione', 'piè di pagina', 'footer', 'header', 'numerazione'],
  component: lazy(() => import('./index'))
});
