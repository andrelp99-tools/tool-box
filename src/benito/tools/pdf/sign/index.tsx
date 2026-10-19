// BenitoTools: Firma PDF — firma disegnata, scritta o da immagine, posizionata sulle pagine.
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontUrl from '@fontsource/dancing-script/files/dancing-script-latin-400-normal.woff2?url';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { openPdfjs, pdfFile, renderPage, withSuffix } from '../../../pdf/lib';
import ColorField from '../../../pdf/ColorField';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface Placement {
  id: number;
  page: number; // 0-based
  x: number; // frazione 0..1 dalla sinistra
  y: number; // frazione 0..1 dall'alto
  w: number; // frazione della larghezza pagina
}

let pid = 1;

/** Ritaglia i bordi trasparenti di un canvas. */
function trim(c: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = c.getContext('2d')!;
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let x0 = width,
    y0 = height,
    x1 = 0,
    y1 = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 <= x0 || y1 <= y0) return c;
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 8;
  out.height = y1 - y0 + 8;
  out.getContext('2d')!.drawImage(c, x0 - 4, y0 - 4, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

function SignaturePad({ color, onChange }: { color: string; onChange: (url: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const pt = usePt();

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * e.currentTarget.width, y: ((e.clientY - r.top) / r.height) * e.currentTarget.height };
  };
  const emit = () => {
    const c = ref.current!;
    onChange(trim(c).toDataURL('image/png'));
  };
  return (
    <Box>
      <canvas
        ref={ref}
        width={900}
        height={300}
        style={{ width: '100%', height: 150, background: '#fff', border: '1px dashed #999', borderRadius: 8, touchAction: 'none' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          last.current = pos(e);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext('2d')!;
          const p = pos(e);
          ctx.strokeStyle = color;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(last.current!.x, last.current!.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          last.current = p;
        }}
        onPointerUp={() => {
          drawing.current = false;
          emit();
        }}
      />
      <Button
        size="small"
        onClick={() => {
          const c = ref.current!;
          c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
          onChange(null);
        }}
      >
        {pt.sign.clear}
      </Button>
    </Box>
  );
}

async function typedSignature(name: string, color: string) {
  const face = new FontFace('BenitoSign', `url(${fontUrl})`);
  await face.load();
  (document.fonts as any).add(face);
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 300;
  const ctx = c.getContext('2d')!;
  ctx.font = '150px BenitoSign';
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 20, 150);
  return trim(c).toDataURL('image/png');
}

export default function SignPdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [tab, setTab] = useState(0);
  const [color, setColor] = useState('#0b2a7a');
  const [name, setName] = useState('');
  const [sig, setSig] = useState<string | null>(null);
  const [sigRatio, setSigRatio] = useState(3);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [pageImg, setPageImg] = useState<string | null>(null);
  const [places, setPlaces] = useState<Placement[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [withDate, setWithDate] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);

  useEffect(() => {
    setPdf(null);
    setPlaces([]);
    setPageIdx(0);
    if (file) openPdfjs(file).then(setPdf).catch(console.error);
  }, [file]);

  useEffect(() => {
    setPageImg(null);
    if (pdf) renderPage(pdf, pageIdx + 1, 1.5).then((c) => setPageImg(c.toDataURL('image/jpeg', 0.85)));
  }, [pdf, pageIdx]);

  useEffect(() => {
    if (tab !== 1 || !name.trim()) return;
    const t = setTimeout(() => typedSignature(name, color).then(setSig), 250);
    return () => clearTimeout(t);
  }, [tab, name, color]);

  useEffect(() => {
    if (!sig) return;
    const img = new Image();
    img.onload = () => setSigRatio(img.width / img.height);
    img.src = sig;
  }, [sig]);

  const frac = (e: React.PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const onPageDown = (e: React.PointerEvent) => {
    if (!sig || (e.target as HTMLElement).dataset.sig) return;
    const f = frac(e);
    const w = 0.3;
    const p = { id: pid++, page: pageIdx, x: Math.max(0, f.x - w / 2), y: Math.max(0, f.y - w / sigRatio / 2), w };
    setPlaces([...places, p]);
    setSelected(p.id);
  };

  const onSigDown = (e: React.PointerEvent, p: Placement) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const f = frac(e);
    drag.current = { id: p.id, dx: f.x - p.x, dy: f.y - p.y };
    setSelected(p.id);
  };
  const onSigMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const f = frac(e);
    setPlaces((ps) => ps.map((p) => (p.id === d.id ? { ...p, x: Math.min(1 - p.w, Math.max(0, f.x - d.dx)), y: Math.max(0, f.y - d.dy) } : p)));
  };

  const sel = places.find((p) => p.id === selected);

  const run = async () => {
    const doc = await PDFDocument.load(await file!.arrayBuffer(), { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const png = await doc.embedPng(sig!);
    const today = new Date().toLocaleDateString();
    for (const p of places) {
      const page = doc.getPage(p.page);
      const { width, height } = page.getSize();
      const w = p.w * width;
      const h = w / sigRatio;
      const x = p.x * width;
      const y = height - p.y * height - h;
      page.drawImage(png, { x, y, width: w, height: h });
      if (withDate) page.drawText(today, { x, y: y - 12, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
    }
    return [pdfFile(await doc.save(), withSuffix(file!.name, 'firmato'))];
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      disabled={!sig || !places.length}
      actionLabel={pt.sign.save}
      actionIcon="material-symbols:signature-rounded"
      below={
        pageImg &&
        pdf && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {pt.sign.place}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <IconButton disabled={pageIdx === 0} onClick={() => setPageIdx(pageIdx - 1)} aria-label={pt.sign.prev}>
                <Icon icon="material-symbols:chevron-left-rounded" />
              </IconButton>
              <Typography variant="body2">
                {pt.page} {pageIdx + 1} {pt.of} {pdf.numPages}
              </Typography>
              <IconButton disabled={pageIdx >= pdf.numPages - 1} onClick={() => setPageIdx(pageIdx + 1)} aria-label={pt.sign.next}>
                <Icon icon="material-symbols:chevron-right-rounded" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                {places.length} {pt.sign.placed}
              </Typography>
            </Stack>
            <Box
              ref={boxRef}
              position="relative"
              onPointerDown={onPageDown}
              onPointerMove={onSigMove}
              onPointerUp={() => (drag.current = null)}
              sx={{ boxShadow: 3, lineHeight: 0, touchAction: 'none', cursor: sig ? 'copy' : 'default', userSelect: 'none' }}
            >
              <img src={pageImg} alt="" style={{ width: '100%', pointerEvents: 'none' }} draggable={false} />
              {sig &&
                places
                  .filter((p) => p.page === pageIdx)
                  .map((p) => (
                    <img
                      key={p.id}
                      data-sig="1"
                      src={sig}
                      alt=""
                      draggable={false}
                      onPointerDown={(e) => onSigDown(e, p)}
                      style={{
                        position: 'absolute',
                        left: `${p.x * 100}%`,
                        top: `${p.y * 100}%`,
                        width: `${p.w * 100}%`,
                        outline: p.id === selected ? '2px dashed #1c64f2' : 'none',
                        cursor: 'move',
                        touchAction: 'none'
                      }}
                    />
                  ))}
            </Box>
            {sel && (
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary">
                  {pt.sign.size}
                </Typography>
                <Slider value={sel.w} min={0.08} max={0.8} step={0.01} onChange={(_, v) => setPlaces(places.map((p) => (p.id === sel.id ? { ...p, w: v as number } : p)))} />
                <Button size="small" color="error" onClick={() => setPlaces(places.filter((p) => p.id !== sel.id))}>
                  {pt.sign.remove}
                </Button>
              </Box>
            )}
          </Box>
        )
      }
      options={
        <Box>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
            <Tab label={pt.sign.draw} />
            <Tab label={pt.sign.type} />
            <Tab label={pt.sign.image} />
          </Tabs>
          {tab === 0 && <SignaturePad color={color} onChange={setSig} />}
          {tab === 1 && <TextField fullWidth label={pt.sign.yourName} value={name} onChange={(e) => setName(e.target.value)} />}
          {tab === 2 && (
            <Button variant="outlined" component="label">
              {pt.sign.image}
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const img = new Image();
                  img.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = img.width;
                    c.height = img.height;
                    c.getContext('2d')!.drawImage(img, 0, 0);
                    setSig(c.toDataURL('image/png'));
                  };
                  img.src = URL.createObjectURL(f);
                }}
              />
            </Button>
          )}
          {tab !== 2 && <ColorField label={pt.sign.color} value={color} onChange={setColor} />}
          {sig && (
            <Box mt={1} p={1} border="1px solid" borderColor="divider" borderRadius={2} bgcolor="#fff" textAlign="center">
              <img src={sig} alt="" style={{ maxHeight: 70, maxWidth: '100%' }} />
            </Box>
          )}
          <FormControlLabel control={<Switch checked={withDate} onChange={(e) => setWithDate(e.target.checked)} />} label={pt.sign.date} />
        </Box>
      }
    />
  );
}
