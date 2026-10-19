import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoRedact.title',
    description: 'pdf:benitoRedact.description',
    shortDescription: 'pdf:benitoRedact.shortDescription'
  },
  path: 'oscura',
  icon: 'material-symbols:format-strikethrough-rounded',
  keywords: ['oscura', 'censura', 'nascondi', 'redact', 'nero', 'privacy'],
  component: lazy(() => import('./index'))
});
