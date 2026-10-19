import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoWatermark.title',
    description: 'pdf:benitoWatermark.description',
    shortDescription: 'pdf:benitoWatermark.shortDescription'
  },
  path: 'filigrana',
  icon: 'material-symbols:approval-outline-rounded',
  keywords: ['filigrana', 'timbro', 'watermark', 'stamp', 'copia', 'approvato', 'bozza'],
  component: lazy(() => import('./index'))
});
