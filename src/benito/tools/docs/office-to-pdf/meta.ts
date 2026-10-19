import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: Word/Excel/PowerPoint/OpenDocument in PDF con LibreOffice WASM (sul dispositivo)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoOfficeToPdf.title',
    description: 'pdf:benitoOfficeToPdf.description',
    shortDescription: 'pdf:benitoOfficeToPdf.shortDescription'
  },
  path: 'office-in-pdf',
  icon: 'material-symbols:description-outline-rounded',
  keywords: [
    'word',
    'excel',
    'powerpoint',
    'office',
    'docx',
    'doc',
    'xlsx',
    'xls',
    'pptx',
    'ppt',
    'odt',
    'ods',
    'odp',
    'rtf',
    'libreoffice',
    'documento',
    'in pdf',
    'converti',
    'to pdf'
  ],
  component: lazy(() => import('./index'))
});
