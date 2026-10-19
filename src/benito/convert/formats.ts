// BenitoTools: formati del Convertitore universale.
import { docFamilyOf } from '../docs/convert';

export type Category = 'image' | 'audio' | 'video' | 'document';

export const IMAGE_INPUT_EXT = [
  'png',
  'jpg',
  'jpeg',
  'jfif',
  'webp',
  'gif',
  'avif',
  'heic',
  'heif',
  'bmp',
  'tif',
  'tiff',
  'ico',
  'svg',
  'psd',
  'jxl',
  'tga',
  'qoi',
  'dng',
  'cr2',
  'cr3',
  'nef',
  'arw',
  'raf',
  'orf',
  'rw2'
];
export const AUDIO_INPUT_EXT = [
  'mp3',
  'wav',
  'ogg',
  'oga',
  'opus',
  'flac',
  'aac',
  'm4a',
  'weba'
];
export const VIDEO_INPUT_EXT = [
  'mp4',
  'm4v',
  'mov',
  'mkv',
  'webm',
  '3gp',
  'ts',
  'mts',
  'm2ts'
];

export const IMAGE_OUTPUT = [
  'jpg',
  'png',
  'webp',
  'avif',
  'gif',
  'heic',
  'bmp',
  'tiff',
  'ico',
  'jxl'
];
export const AUDIO_OUTPUT = ['mp3', 'm4a', 'wav', 'ogg', 'flac', 'aac'];
export const VIDEO_OUTPUT = ['mp4', 'webm', 'mkv', 'mov'];

export const DEFAULT_OUTPUT: Record<Exclude<Category, 'document'>, string> = {
  image: 'jpg',
  audio: 'mp3',
  video: 'mp4'
};

export function extOf(name: string) {
  return (name.split('.').pop() ?? '').toLowerCase();
}

export function categoryOf(file: File): Category | null {
  const ext = extOf(file.name);
  if (file.type.startsWith('image/') || IMAGE_INPUT_EXT.includes(ext))
    return 'image';
  if (file.type.startsWith('video/') || VIDEO_INPUT_EXT.includes(ext))
    return 'video';
  if (file.type.startsWith('audio/') || AUDIO_INPUT_EXT.includes(ext))
    return 'audio';
  if (docFamilyOf(file)) return 'document';
  return null;
}

/** Formati di uscita possibili per una categoria (un video può diventare anche solo audio). */
export function outputsFor(cat: Exclude<Category, 'document'>): string[] {
  if (cat === 'image') return IMAGE_OUTPUT;
  if (cat === 'audio') return AUDIO_OUTPUT;
  return [...VIDEO_OUTPUT, ...AUDIO_OUTPUT];
}

export const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  heic: 'image/heic',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  ico: 'image/x-icon',
  jxl: 'image/jxl',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  zip: 'application/zip'
};

export function renamed(name: string, ext: string) {
  const base = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
  return `${base}.${ext}`;
}
