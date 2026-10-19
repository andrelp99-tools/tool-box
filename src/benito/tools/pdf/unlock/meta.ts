import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoUnlock.title',
    description: 'pdf:benitoUnlock.description',
    shortDescription: 'pdf:benitoUnlock.shortDescription'
  },
  path: 'sblocca',
  icon: 'material-symbols:lock-open-right-outline-rounded',
  keywords: ['sblocca', 'password', 'togli password', 'unlock', 'restrizioni', 'decrypt'],
  component: lazy(() => import('./index'))
});
