import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: ritaglio per social (ispirato a Social Media Cropper di Simon Willison)
export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:benitoSocialCrop.title',
    description: 'image:benitoSocialCrop.description',
    shortDescription: 'image:benitoSocialCrop.shortDescription'
  },
  path: 'ritaglia-social',
  icon: 'material-symbols:crop-portrait-outline-rounded',
  keywords: ['instagram', 'storie', 'story', 'tiktok', 'whatsapp', 'facebook', 'youtube', 'ritaglia', 'crop', 'social', 'post', 'copertina'],
  component: lazy(() => import('./index'))
});
