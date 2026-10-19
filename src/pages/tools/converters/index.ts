import { tool as convertersAudioConverter } from './audio-converter/meta';
import { tool as convertersWebpConverter } from './convert-to-webp/meta';
import { tool as convertersJpgConverter } from './convert-to-jpg/meta';
import { tool as convertersGifConverter } from './video-to-gif/meta';
import { tool as benitoUniversalConverter } from '../../../benito/tools/converter/meta';

// BenitoTools: il Convertitore universale sostituisce audio/JPG/WebP (doppioni nascosti)
void convertersAudioConverter;
void convertersWebpConverter;
void convertersJpgConverter;
export const convertersTools = [benitoUniversalConverter, convertersGifConverter];
