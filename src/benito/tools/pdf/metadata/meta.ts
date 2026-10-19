import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoMetadata.title',
    description: 'pdf:benitoMetadata.description',
    shortDescription: 'pdf:benitoMetadata.shortDescription'
  },
  path: 'rimuovi-metadati',
  icon: 'material-symbols:visibility-off-outline-rounded',
  keywords: ['metadati', 'privacy', 'autore', 'metadata', 'pulisci'],
  component: lazy(() => import('./index'))
});
