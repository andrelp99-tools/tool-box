import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoFlatten.title',
    description: 'pdf:benitoFlatten.description',
    shortDescription: 'pdf:benitoFlatten.shortDescription'
  },
  path: 'appiattisci',
  icon: 'material-symbols:layers-clear-outline-rounded',
  keywords: ['appiattisci', 'flatten', 'blocca', 'moduli', 'annotazioni'],
  component: lazy(() => import('./index'))
});
