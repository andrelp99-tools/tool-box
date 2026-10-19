import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoCrop.title',
    description: 'pdf:benitoCrop.description',
    shortDescription: 'pdf:benitoCrop.shortDescription'
  },
  path: 'ritaglia',
  icon: 'material-symbols:crop-rounded',
  keywords: ['ritaglia', 'margini', 'crop', 'taglia'],
  component: lazy(() => import('./index'))
});
