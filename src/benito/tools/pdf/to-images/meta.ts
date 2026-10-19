import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoToImages.title',
    description: 'pdf:benitoToImages.description',
    shortDescription: 'pdf:benitoToImages.shortDescription'
  },
  path: 'pdf-in-immagini',
  icon: 'material-symbols:image-outline-rounded',
  keywords: ['jpg', 'png', 'webp', 'immagini', 'foto', 'converti', 'pdf to jpg'],
  component: lazy(() => import('./index'))
});
