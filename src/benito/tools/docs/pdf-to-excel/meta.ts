import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: tabelle di un PDF in Excel/CSV con PyMuPDF (sul dispositivo)
export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:benitoPdfToExcel.title',
    description: 'pdf:benitoPdfToExcel.description',
    shortDescription: 'pdf:benitoPdfToExcel.shortDescription'
  },
  path: 'pdf-in-excel',
  icon: 'material-symbols:table-chart-outline-rounded',
  keywords: [
    'excel',
    'xlsx',
    'csv',
    'tabelle',
    'tabella',
    'foglio',
    'estrai',
    'pdf to excel',
    'table'
  ],
  component: lazy(() => import('./index'))
});
