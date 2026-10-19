import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoOrganize.title',
    description: 'pdf:benitoOrganize.description',
    shortDescription: 'pdf:benitoOrganize.shortDescription'
  },
  path: 'organizza',
  icon: 'material-symbols:auto-awesome-mosaic-outline-rounded',
  keywords: ['organizza', 'riordina', 'ordine', 'pagine', 'elimina', 'estrai', 'ruota', 'duplica', 'pagina bianca', 'organize', 'reorder'],
  component: lazy(() => import('./index'))
});
