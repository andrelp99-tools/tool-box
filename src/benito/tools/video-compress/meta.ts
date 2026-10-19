import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: compressore video veloce (WebCodecs), ispirato a Video Compressor di Simon Willison
export const tool = defineTool('video', {
  i18n: {
    name: 'video:benitoCompress.title',
    description: 'video:benitoCompress.description',
    shortDescription: 'video:benitoCompress.shortDescription'
  },
  path: 'comprimi',
  icon: 'material-symbols:compress-rounded',
  keywords: ['comprimi', 'riduci', 'compress', 'whatsapp', 'email', 'mb', 'peso', 'dimensione', 'video'],
  component: lazy(() => import('./index'))
});
