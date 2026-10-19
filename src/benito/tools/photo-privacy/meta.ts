import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

// BenitoTools: proteggi foto (ispirato a Photo Scrubber di Simon Willison)
export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:benitoPhotoPrivacy.title',
    description: 'image:benitoPhotoPrivacy.description',
    shortDescription: 'image:benitoPhotoPrivacy.shortDescription'
  },
  path: 'proteggi-foto',
  icon: 'material-symbols:face-retouching-off-outline-rounded',
  keywords: ['privacy', 'volti', 'sfoca', 'blur', 'exif', 'gps', 'metadati', 'faces', 'anonimizza', 'censura'],
  component: lazy(() => import('./index'))
});
