import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoGrayscale.title',
    description: 'pdf:benitoGrayscale.description',
    shortDescription: 'pdf:benitoGrayscale.shortDescription'
  },
  path: 'bianco-nero',
  icon: 'material-symbols:invert-colors-rounded',
  keywords: ['bianco e nero', 'grigi', 'grayscale', 'stampa', 'inchiostro'],
  component: lazy(() => import('./index'))
});
