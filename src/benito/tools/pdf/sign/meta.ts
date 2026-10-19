import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoSign.title',
    description: 'pdf:benitoSign.description',
    shortDescription: 'pdf:benitoSign.shortDescription'
  },
  path: 'firma',
  icon: 'material-symbols:signature-rounded',
  keywords: ['firma', 'firmare', 'sign', 'signature', 'autografo'],
  component: lazy(() => import('./index'))
});
