// BenitoTools: Proteggi foto — sfoca volti/aree e salva una copia senza dati nascosti.
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import exifr from 'exifr';
import { ToolComponentProps } from '@tools/defineTool';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import InputHeader from '@components/InputHeader';
import { useBt } from '../../strings';
import { Box as Rect, detectFaces } from './faces';

type Style = 'blur' | 'pixel' | 'black';
const MAX_WORK = 2400; // lato massimo di lavoro (foto enormi vengono ridotte)

interface Meta {
  gps?: string;
  camera?: string;
  date?: string;
}

export default function PhotoPrivacy(_props: ToolComponentProps) {
  const bt = useBt();
  const [input, setInput] = useState<File | null>(null);
  const [boxes, setBoxes] = useState<Rect[]>([]);
  const [style, setStyle] = useState<Style>('blur');
  const [strength, setStrength] = useState(60);
  const [padding, setPadding] = useState(20);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ sev: 'info' | 'warning'; text: string } | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const srcRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; cur?: { x: number; y: number } } | null>(null);
  const [, redraw] = useState(0);

  // carica la foto in un canvas di lavoro (orientamento corretto) e legge i metadati
  useEffect(() => {
    setBoxes([]);
    setResult(null);
    setMeta(null);
    setStatus(null);
    srcRef.current = null;
    if (!input) return;
    (async () => {
      const bmp = await createImageBitmap(input, { imageOrientation: 'from-image' });
      const s = Math.min(1, MAX_WORK / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * s);
      c.height = Math.round(bmp.height * s);
      c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
      srcRef.current = c;
      redraw((n) => n + 1);
      try {
        const m = await exifr.parse(input, { gps: true, tiff: true, exif: true });
        if (m) {
          setMeta({
            gps: m.latitude != null ? `${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}` : undefined,
            camera: [m.Make, m.Model].filter(Boolean).join(' ') || undefined,
            date: m.DateTimeOriginal ? new Date(m.DateTimeOriginal).toLocaleString() : undefined
          });
        } else setMeta({});
      } catch {
        setMeta({});
      }
      runDetect();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const runDetect = async () => {
    const c = srcRef.current;
    if (!c) return;
    setBusy(true);
    setStatus({ sev: 'info', text: bt.photo.detecting });
    try {
      const found = await detectFaces(c);
      setBoxes((prev) => [...prev.filter((b) => !b.auto), ...found]);
      setStatus(found.length ? null : { sev: 'info', text: bt.photo.none });
    } catch (e) {
      console.warn('BenitoTools: rilevamento volti non riuscito', e);
      setStatus({ sev: 'warning', text: bt.photo.detectError });
    } finally {
      setBusy(false);
    }
  };

  const padded = (b: Rect, W: number, H: number): Rect => {
    if (!b.auto) return b;
    const p = padding / 100;
    const x = Math.max(0, b.x - b.w * p);
    const y = Math.max(0, b.y - b.h * p * 1.3);
    return { x, y, w: Math.min(W - x, b.w * (1 + 2 * p)), h: Math.min(H - y, b.h * (1 + 2.6 * p)) };
  };

  /** Disegna la foto con gli effetti applicati su un canvas della dimensione data. */
  const render = (target: HTMLCanvasElement, applyEffects: boolean) => {
    const src = srcRef.current!;
    const ctx = target.getContext('2d')!;
    const k = target.width / src.width;
    ctx.drawImage(src, 0, 0, target.width, target.height);
    if (!applyEffects) return;
    for (const raw of boxes) {
      const b = padded(raw, src.width, src.height);
      const r = { x: b.x * k, y: b.y * k, w: Math.max(1, b.w * k), h: Math.max(1, b.h * k) };
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
      if (style === 'black') {
        ctx.fillStyle = '#111';
        ctx.fillRect(r.x, r.y, r.w, r.h);
      } else if (style === 'pixel') {
        const cells = Math.max(3, Math.round(24 - (strength / 100) * 20));
        const tmp = document.createElement('canvas');
        tmp.width = cells;
        tmp.height = Math.max(1, Math.round((cells * r.h) / r.w));
        tmp.getContext('2d')!.drawImage(target, r.x, r.y, r.w, r.h, 0, 0, tmp.width, tmp.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, r.x, r.y, r.w, r.h);
        ctx.imageSmoothingEnabled = true;
      } else {
        const radius = Math.max(4, Math.min(r.w, r.h) * (0.05 + (strength / 100) * 0.25));
        // doppio passaggio: prima riduce i dettagli, poi sfoca (più robusto della sola sfocatura)
        const tmp = document.createElement('canvas');
        tmp.width = Math.max(1, Math.round(r.w / 6));
        tmp.height = Math.max(1, Math.round(r.h / 6));
        tmp.getContext('2d')!.drawImage(target, r.x, r.y, r.w, r.h, 0, 0, tmp.width, tmp.height);
        ctx.filter = `blur(${radius}px)`;
        ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, r.x - radius, r.y - radius, r.w + 2 * radius, r.h + 2 * radius);
        ctx.filter = 'none';
      }
      ctx.restore();
    }
  };

  // anteprima
  useEffect(() => {
    const src = srcRef.current;
    const view = viewRef.current;
    if (!src || !view) return;
    const s = Math.min(1, 1200 / Math.max(src.width, src.height));
    view.width = Math.round(src.width * s);
    view.height = Math.round(src.height * s);
    render(view, !showOriginal);
    const ctx = view.getContext('2d')!;
    if (!showOriginal) {
      ctx.lineWidth = 2;
      for (const b of boxes) {
        const p = padded(b, src.width, src.height);
        ctx.strokeStyle = b.auto ? '#7CFC00' : '#00BFFF';
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(p.x * s, p.y * s, p.w * s, p.h * s);
      }
    }
    const d = drag.current;
    if (d?.cur) {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#00BFFF';
      ctx.strokeRect(Math.min(d.x, d.cur.x) * s, Math.min(d.y, d.cur.y) * s, Math.abs(d.cur.x - d.x) * s, Math.abs(d.cur.y - d.y) * s);
    }
  });

  const toSrc = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const src = srcRef.current!;
    return {
      x: ((e.clientX - rect.left) / rect.width) * src.width,
      y: ((e.clientY - rect.top) / rect.height) * src.height
    };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!srcRef.current || showOriginal) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = toSrc(e);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    drag.current.cur = toSrc(e);
    redraw((n) => n + 1);
  };
  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !srcRef.current) return;
    const p = toSrc(e);
    const w = Math.abs(p.x - d.x);
    const h = Math.abs(p.y - d.y);
    const minSide = srcRef.current.width * 0.015;
    if (w < minSide && h < minSide) {
      // tocco: toglie il rettangolo sotto il dito
      const src = srcRef.current;
      const idx = boxes.findIndex((b) => {
        const q = padded(b, src.width, src.height);
        return p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h;
      });
      if (idx >= 0) setBoxes(boxes.filter((_, i) => i !== idx));
    } else {
      setBoxes([...boxes, { x: Math.min(d.x, p.x), y: Math.min(d.y, p.y), w, h }]);
    }
    setResult(null);
    redraw((n) => n + 1);
  };

  const save = async () => {
    const src = srcRef.current;
    if (!src || !input) return;
    const out = document.createElement('canvas');
    out.width = src.width;
    out.height = src.height;
    render(out, true);
    const png = input.type === 'image/png';
    const blob: Blob = await new Promise((res) => out.toBlob((b) => res(b!), png ? 'image/png' : 'image/jpeg', 0.92));
    const stamp = new Date().toISOString().slice(0, 10);
    setResult(new File([blob], `foto-protetta-${stamp}.${png ? 'png' : 'jpg'}`, { type: blob.type }));
  };

  const hasMeta = meta && (meta.gps || meta.camera || meta.date);

  return (
    <Box id="tool" mb={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {!input ? (
            <ToolImageInput value={input} onChange={setInput} accept={['image/*']} title={bt.photo.input} />
          ) : (
            <Box>
              <InputHeader title={bt.photo.input} />
              <Box sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 5, bgcolor: 'background.paper', lineHeight: 0 }}>
                <canvas
                  ref={viewRef}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  style={{ width: '100%', height: 'auto', touchAction: 'none', cursor: 'crosshair' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                {bt.photo.draw}
              </Typography>
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                <Button size="small" onClick={runDetect} disabled={busy} startIcon={busy ? <CircularProgress size={14} /> : <Icon icon="material-symbols:face-outline-rounded" />}>
                  {bt.photo.detect}
                </Button>
                <Button size="small" onClick={() => setBoxes([])} disabled={!boxes.length}>
                  {bt.photo.clear}
                </Button>
                <Button size="small" onPointerDown={() => setShowOriginal(true)} onPointerUp={() => setShowOriginal(false)} onPointerLeave={() => setShowOriginal(false)}>
                  {bt.photo.original}
                </Button>
                <Button size="small" onClick={() => setInput(null)}>
                  ✕
                </Button>
              </Stack>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {status && (
            <Alert severity={status.sev} sx={{ mb: 2 }}>
              {status.text}
            </Alert>
          )}
          {input && (
            <Box mb={2}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Chip size="small" color="primary" label={`${bt.photo.found}: ${boxes.filter((b) => b.auto).length}`} />
              </Stack>
              {meta && (
                <Alert severity={hasMeta ? 'warning' : 'success'} sx={{ mb: 2 }}>
                  {hasMeta ? (
                    <>
                      <b>{bt.photo.metadataFound}</b>
                      {meta.gps && <div>{bt.photo.gps}: {meta.gps}</div>}
                      {meta.camera && <div>{bt.photo.camera}: {meta.camera}</div>}
                      {meta.date && <div>{bt.photo.date}: {meta.date}</div>}
                    </>
                  ) : (
                    bt.photo.noMetadata
                  )}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {bt.photo.style}
              </Typography>
              <ToggleButtonGroup exclusive size="small" value={style} onChange={(_, v) => v && setStyle(v)} sx={{ mb: 2 }}>
                <ToggleButton value="blur">{bt.photo.blur}</ToggleButton>
                <ToggleButton value="pixel">{bt.photo.pixel}</ToggleButton>
                <ToggleButton value="black">{bt.photo.black}</ToggleButton>
              </ToggleButtonGroup>
              {style !== 'black' && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {bt.photo.strength}: {strength}%
                  </Typography>
                  <Slider value={strength} min={10} max={100} onChange={(_, v) => setStrength(v as number)} />
                </>
              )}
              <Typography variant="body2" color="text.secondary">
                {bt.photo.padding}: {padding}%
              </Typography>
              <Slider value={padding} min={0} max={60} onChange={(_, v) => setPadding(v as number)} />
              <Button variant="contained" size="large" fullWidth onClick={save} sx={{ mt: 1 }} startIcon={<Icon icon="material-symbols:shield-outline-rounded" />}>
                {bt.photo.save}
              </Button>
              <Typography variant="caption" color="text.secondary">
                {bt.photo.clean}
              </Typography>
            </Box>
          )}
          {result && <ToolFileResult title={bt.photo.result} value={result} />}
        </Grid>
      </Grid>
    </Box>
  );
}
