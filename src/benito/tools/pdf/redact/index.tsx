// BenitoTools: Oscura PDF — rettangoli neri definitivi (le pagine segnate diventano immagini).
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, IconButton, Slider, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { ToolComponentProps } from '@tools/defineTool';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { openPdfjs, pdfFile, renderPage, withSuffix } from '../../../pdf/lib';
import { rasterizePdf } from '../../../pdf/rasterize';

interface R {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function RedactPdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [img, setImg] = useState<string | null>(null);
  const [rects, setRects] = useState<R[]>([]);
  const [draft, setDraft] = useState<R | null>(null);
  const [dpi, setDpi] = useState(150);
  const [progress, setProgress] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setPdf(null);
    setRects([]);
    setPageIdx(0);
    if (file) openPdfjs(file).then(setPdf);
  }, [file]);
  useEffect(() => {
    setImg(null);
    if (pdf) renderPage(pdf, pageIdx + 1, 1.5).then((c) => setImg(c.toDataURL('image/jpeg', 0.85)));
  }, [pdf, pageIdx]);

  const f = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) };
  };
  const down = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = f(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!start.current) return;
    const p = f(e);
    const s = start.current;
    setDraft({ page: pageIdx, x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  };
  const up = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const p = f(e);
    if (Math.abs(p.x - s.x) < 0.01 && Math.abs(p.y - s.y) < 0.01) {
      // tocco: rimuove il rettangolo sotto
      const i = rects.findIndex((r) => r.page === pageIdx && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
      if (i >= 0) setRects(rects.filter((_, k) => k !== i));
    } else if (draft) setRects([...rects, draft]);
    setDraft(null);
  };

  const run = async () => {
    const pages = new Set(rects.map((r) => r.page));
    const bytes = await rasterizePdf(file!, {
      dpi,
      pages,
      onProgress: (i, n) => setProgress(`${pt.page} ${i} ${pt.of} ${n}`),
      draw: (ctx, i) => {
        ctx.fillStyle = '#000';
        const W = ctx.canvas.width;
        const H = ctx.canvas.height;
        for (const r of rects.filter((q) => q.page === i)) ctx.fillRect(r.x * W - 1, r.y * H - 1, r.w * W + 2, r.h * H + 2);
      }
    });
    setProgress(null);
    return [pdfFile(bytes, withSuffix(file!.name, 'oscurato'))];
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      progressText={progress}
      disabled={!rects.length}
      actionLabel={pt.apply}
      actionIcon="material-symbols:format-strikethrough-rounded"
      options={
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            {pt.redact.warning}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {pt.redact.dpi}: {dpi}
          </Typography>
          <Slider value={dpi} min={100} max={300} step={10} onChange={(_, v) => setDpi(v as number)} />
          <Typography variant="body2">
            {rects.length} {pt.redact.marked}
          </Typography>
        </Box>
      }
      below={
        pdf &&
        img && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {pt.redact.hint}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <IconButton disabled={pageIdx === 0} onClick={() => setPageIdx(pageIdx - 1)}>
                <Icon icon="material-symbols:chevron-left-rounded" />
              </IconButton>
              <Typography variant="body2">
                {pt.page} {pageIdx + 1} {pt.of} {pdf.numPages}
              </Typography>
              <IconButton disabled={pageIdx >= pdf.numPages - 1} onClick={() => setPageIdx(pageIdx + 1)}>
                <Icon icon="material-symbols:chevron-right-rounded" />
              </IconButton>
            </Stack>
            <Box ref={box} position="relative" onPointerDown={down} onPointerMove={move} onPointerUp={up} sx={{ boxShadow: 3, lineHeight: 0, touchAction: 'none', cursor: 'crosshair', userSelect: 'none' }}>
              <img src={img} alt="" draggable={false} style={{ width: '100%', pointerEvents: 'none' }} />
              {[...rects.filter((r) => r.page === pageIdx), ...(draft ? [draft] : [])].map((r, i) => (
                <Box key={i} position="absolute" sx={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%`, bgcolor: 'rgba(0,0,0,.85)', outline: '1px solid red' }} />
              ))}
            </Box>
          </Box>
        )
      }
    />
  );
}
