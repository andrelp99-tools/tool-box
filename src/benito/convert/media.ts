// BenitoTools: conversione audio e video sul dispositivo con mediabunny (WebCodecs).
import {
  ALL_FORMATS,
  AdtsOutputFormat,
  BlobSource,
  BufferTarget,
  Conversion,
  FlacOutputFormat,
  Input,
  MkvOutputFormat,
  MovOutputFormat,
  Mp3OutputFormat,
  Mp4OutputFormat,
  OggOutputFormat,
  Output,
  QUALITY_HIGH,
  QUALITY_LOW,
  QUALITY_MEDIUM,
  WavOutputFormat,
  WebMOutputFormat,
  canEncodeAudio
} from 'mediabunny';
import { AUDIO_OUTPUT, MIME, renamed } from './formats';

let encodersReady: Promise<void> | null = null;

/** Registra gli encoder WASM solo se il browser non sa già codificare quel formato. */
function registerEncoders() {
  encodersReady ??= (async () => {
    if (!(await canEncodeAudio('mp3'))) {
      const { registerMp3Encoder } = await import('@mediabunny/mp3-encoder');
      registerMp3Encoder();
    }
    if (!(await canEncodeAudio('aac'))) {
      const { registerAacEncoder } = await import('@mediabunny/aac-encoder');
      registerAacEncoder();
    }
    if (!(await canEncodeAudio('flac'))) {
      const { registerFlacEncoder } = await import('@mediabunny/flac-encoder');
      registerFlacEncoder();
    }
  })();
  return encodersReady;
}

function outputFormat(ext: string) {
  switch (ext) {
    case 'mp4':
    case 'm4a':
      return new Mp4OutputFormat();
    case 'mov':
      return new MovOutputFormat();
    case 'mkv':
      return new MkvOutputFormat();
    case 'webm':
      return new WebMOutputFormat();
    case 'mp3':
      return new Mp3OutputFormat();
    case 'wav':
      return new WavOutputFormat();
    case 'ogg':
      return new OggOutputFormat();
    case 'flac':
      return new FlacOutputFormat();
    case 'aac':
      return new AdtsOutputFormat();
    default:
      throw new Error(`Formato non supportato: ${ext}`);
  }
}

export type MediaQuality = 'low' | 'medium' | 'high';
const Q = { low: QUALITY_LOW, medium: QUALITY_MEDIUM, high: QUALITY_HIGH };

export interface MediaOptions {
  quality?: MediaQuality;
  /** Lato lungo massimo in pixel (solo video). */
  maxSide?: number;
  onProgress?: (p: number) => void;
  signal?: AbortSignal;
}

export async function convertMedia(file: File, to: string, opts: MediaOptions = {}): Promise<File> {
  await registerEncoders();
  const audioOnly = AUDIO_OUTPUT.includes(to);
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const target = new BufferTarget();
  const output = new Output({ format: outputFormat(to), target });
  try {
    const q = Q[opts.quality ?? 'medium'];
    let video: Record<string, unknown> = { bitrate: q };
    if (audioOnly) video = { discard: true };
    else if (opts.maxSide) {
      const track = await input.getPrimaryVideoTrack();
      if (track) {
        const w = track.displayWidth;
        const h = track.displayHeight;
        const m = Math.max(w, h);
        if (m > opts.maxSide) {
          const s = opts.maxSide / m;
          // dimensioni pari: richieste da molti encoder
          video.width = Math.max(2, Math.round((w * s) / 2) * 2);
          video.height = Math.max(2, Math.round((h * s) / 2) * 2);
          video.fit = 'contain';
        }
      }
    }
    const conversion = await Conversion.init({
      input,
      output,
      video,
      audio: { bitrate: q }
    });
    if (!conversion.isValid) {
      const reasons = conversion.discardedTracks.map((d) => `${d.track.type}: ${d.reason}`).join(', ');
      throw new Error(`Conversione impossibile (${reasons || 'nessuna traccia compatibile'})`);
    }
    if (opts.onProgress) conversion.onProgress = (p) => opts.onProgress!(p);
    opts.signal?.addEventListener('abort', () => conversion.cancel());
    await conversion.execute();
    const buf = target.buffer;
    if (!buf) throw new Error('Nessun risultato');
    return new File([buf], renamed(file.name, to), { type: MIME[to] ?? 'application/octet-stream' });
  } finally {
    input.dispose();
  }
}
