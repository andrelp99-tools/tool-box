import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: strumento PDF (funzione ispirata a BentoPDF)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoScan.title',
    description: 'pdf:benitoScan.description',
    shortDescription: 'pdf:benitoScan.shortDescription'
  },
  path: 'scansione',
  icon: 'material-symbols:document-scanner-outline-rounded',
  keywords: ['scanner', 'scansione', 'scan', 'foto', 'documento', 'camscanner'],
  component: lazy(() => import('./index'))
});
