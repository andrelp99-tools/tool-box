// BenitoTools: Scansione in PDF — foto di documenti → PDF pulito come da scanner.
import React, { useState } from 'react';
import { Box, Button, MenuItem, Slider, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { PDFDocument } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import MultiFileInput from '../../../components/MultiFileInput';
import { usePt } from '../../../pdf/strings';
import { canvasToBlob, pdfFile } from '../../../pdf/lib';

type Mode = 'bw' | 'gray' | 'color' | 'original';
const A4 = [595.28, 841.89];

/** Soglia adattiva (Bradley) per bianco e nero con ombre irregolari. */
function adaptiveBW(img: ImageData, strength: number) {
  const { width: w, height: h, data } = img;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 1; y <= h; y++) {
    let row = 0;
    for (let x = 1; x <= w; x++) {
      row += gray[(y - 1) * w + (x - 1)];
      integral[y * (w + 1) + x] = integral[(y - 1) * (w + 1) + x] + row;
    }
  }
  const s = Math.max(8, Math.round(w / 16));
  const t = 0.08 + (strength / 100) * 0.12;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const x1 = Math.max(0, x - s),
        x2 = Math.min(w - 1, x + s),
        y1 = Math.max(0, y - s),
        y2 = Math.min(h - 1, y + s);
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);
      const sum = integral[(y2 + 1) * (w + 1) + (x2 + 1)] - integral[y1 * (w + 1) + (x2 + 1)] - integral[(y2 + 1) * (w + 1) + x1] + integral[y1 * (w + 1) + x1];
      const v = gray[y * w + x] * count < sum * (1 - t) ? 0 : 255;
      const k = (y * w + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = v;
    }
}

/** Livelli automatici + contrasto. */
function enhance(img: ImageData, contrast: number, gray: boolean) {
  const d = img.data;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) hist[Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])]++;
  const total = d.length / 4;
  let lo = 0,
    hi = 255,
    acc = 0;
  for (; lo < 255; lo++) if ((acc += hist[lo]) > total * 0.01) break;
  acc = 0;
  for (; hi > 0; hi--) if ((acc += hist[hi]) > total * 0.05) break;
  const range = Math.max(1, hi - lo);
  const c = 1 + contrast / 100;
  const map = (v: number) => Math.max(0, Math.min(255, ((((v - lo) / range) * 255 - 128) * c) + 128));
  for (let i = 0; i < d.length; i += 4) {
    if (gray) {
      const g = map(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
      d[i] = d[i + 1] = d[i + 2] = g;
    } else {
      d[i] = map(d[i]);
      d[i + 1] = map(d[i + 1]);
      d[i + 2] = map(d[i + 2]);
    }
  }
}

export default function ScanToPdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>('bw');
  const [contrast, setContrast] = useState(30);
  const [size, setSize] = useState<'a4' | 'fit'>('a4');
  const [margin, setMargin] = useState(3);
  const [progress, setProgress] = useState<string | null>(null);

  const run = async () => {
    const doc = await PDFDocument.create();
    for (const [i, f] of files.entries()) {
      setProgress(`${i + 1} / ${files.length}`);
      const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' });
      const s = Math.min(1, 2200 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * s);
      c.height = Math.round(bmp.height * s);
      const ctx = c.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(bmp, 0, 0, c.width, c.height);
      if (mode !== 'original') {
        const img = ctx.getImageData(0, 0, c.width, c.height);
        if (mode === 'bw') adaptiveBW(img, contrast);
        else enhance(img, contrast, mode === 'gray');
        ctx.putImageData(img, 0, 0);
      }
      const blob = mode === 'bw' ? await canvasToBlob(c, 'image/png') : await canvasToBlob(c, 'image/jpeg', 0.85);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const image = mode === 'bw' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
      if (size === 'a4') {
        const land = c.width > c.height;
        const [W, H] = land ? [A4[1], A4[0]] : A4;
        const m = (Math.min(W, H) * margin) / 100;
        const k = Math.min((W - 2 * m) / c.width, (H - 2 * m) / c.height);
        const page = doc.addPage([W, H]);
        page.drawImage(image, { x: (W - c.width * k) / 2, y: (H - c.height * k) / 2, width: c.width * k, height: c.height * k });
      } else {
        const k = 72 / 150;
        const page = doc.addPage([c.width * k, c.height * k]);
        page.drawImage(image, { x: 0, y: 0, width: c.width * k, height: c.height * k });
      }
      c.width = c.height = 1;
    }
    setProgress(null);
    const stamp = new Date().toISOString().slice(0, 10);
    return [pdfFile(await doc.save(), `scansione-${stamp}.pdf`)];
  };

  return (
    <PdfShell
      file={null}
      setFile={() => undefined}
      run={run}
      disabled={!files.length}
      progressText={progress}
      actionLabel={pt.apply}
      actionIcon="material-symbols:document-scanner-outline-rounded"
      input={
        <Box>
          <MultiFileInput value={files} onChange={setFiles} accept={['image/*']} title={pt.scan.photos} />
          <Button variant="outlined" component="label" startIcon={<Icon icon="material-symbols:photo-camera-outline-rounded" />} sx={{ mt: 1 }}>
            {pt.scan.camera}
            <input
              hidden
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFiles([...files, f]);
                e.target.value = '';
              }}
            />
          </Button>
        </Box>
      }
      options={
        <Box>
          <TextField select fullWidth size="small" label={pt.scan.mode} value={mode} onChange={(e) => setMode(e.target.value as Mode)} sx={{ mb: 2 }}>
            <MenuItem value="bw">{pt.scan.bw}</MenuItem>
            <MenuItem value="gray">{pt.scan.gray}</MenuItem>
            <MenuItem value="color">{pt.scan.color}</MenuItem>
            <MenuItem value="original">{pt.scan.original}</MenuItem>
          </TextField>
          {mode !== 'original' && (
            <>
              <Typography variant="body2" color="text.secondary">
                {pt.scan.contrast}: {contrast}
              </Typography>
              <Slider value={contrast} min={0} max={100} onChange={(_, v) => setContrast(v as number)} />
            </>
          )}
          <TextField select fullWidth size="small" label={pt.scan.pageSize} value={size} onChange={(e) => setSize(e.target.value as 'a4' | 'fit')} sx={{ my: 1 }}>
            <MenuItem value="a4">{pt.scan.a4}</MenuItem>
            <MenuItem value="fit">{pt.scan.fit}</MenuItem>
          </TextField>
          {size === 'a4' && (
            <>
              <Typography variant="body2" color="text.secondary">
                {pt.scan.margin}: {margin}%
              </Typography>
              <Slider value={margin} min={0} max={10} onChange={(_, v) => setMargin(v as number)} />
            </>
          )}
        </Box>
      }
    />
  );
}
