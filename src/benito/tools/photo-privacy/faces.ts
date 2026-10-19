// BenitoTools: rilevamento volti con MediaPipe (file WASM e modello serviti dall'app).
import type { FaceDetector } from '@mediapipe/tasks-vision';

let detector: Promise<FaceDetector> | null = null;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  auto?: boolean;
}

function getDetector() {
  detector ??= (async () => {
    const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision');
    const base = `${location.origin}${import.meta.env.BASE_URL}mediapipe`;
    const fileset = await FilesetResolver.forVisionTasks(base);
    return FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${base}/blaze_face_short_range.tflite` },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.4
    });
  })().catch((e) => {
    detector = null;
    throw e;
  });
  return detector;
}

/** Trova i volti. Analizza anche 4 tasselli sovrapposti per i volti piccoli (foto di gruppo). */
export async function detectFaces(img: HTMLCanvasElement): Promise<Box[]> {
  const d = await getDetector();
  const boxes: Box[] = [];
  const add = (dets: { boundingBox?: { originX: number; originY: number; width: number; height: number } }[], ox: number, oy: number, s: number) => {
    for (const det of dets) {
      const b = det.boundingBox;
      if (b) boxes.push({ x: ox + b.originX / s, y: oy + b.originY / s, w: b.width / s, h: b.height / s, auto: true });
    }
  };
  add(d.detect(img).detections, 0, 0, 1);
  // tasselli: 2x2 con sovrapposizione del 20%
  const W = img.width;
  const H = img.height;
  const tw = Math.round(W * 0.6);
  const th = Math.round(H * 0.6);
  const tile = document.createElement('canvas');
  for (const [ox, oy] of [
    [0, 0],
    [W - tw, 0],
    [0, H - th],
    [W - tw, H - th]
  ]) {
    tile.width = tw;
    tile.height = th;
    tile.getContext('2d')!.drawImage(img, ox, oy, tw, th, 0, 0, tw, th);
    add(d.detect(tile).detections, ox, oy, 1);
  }
  return dedupe(boxes);
}

function iou(a: Box, b: Box) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return inter / (a.w * a.h + b.w * b.h - inter);
}

function dedupe(list: Box[]) {
  const out: Box[] = [];
  for (const b of list.sort((p, q) => q.w * q.h - p.w * p.h)) {
    if (!out.some((o) => iou(o, b) > 0.3)) out.push(b);
  }
  return out;
}
