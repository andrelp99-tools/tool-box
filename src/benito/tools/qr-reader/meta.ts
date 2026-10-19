import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: lettore QR (ispirato a Mini QR)
export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:benitoQrReader.title',
    description: 'image:benitoQrReader.description',
    shortDescription: 'image:benitoQrReader.shortDescription'
  },
  path: 'leggi-qr',
  icon: 'material-symbols:qr-code-scanner-rounded',
  keywords: ['qr', 'leggi', 'scansiona', 'scanner', 'codice', 'barre', 'barcode', 'read', 'scan'],
  component: lazy(() => import('./index'))
});
