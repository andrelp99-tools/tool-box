// BenitoTools: PDF in immagini (JPG/PNG/WebP) con DPI a scelta.
import React, { useState } from 'react';
import { Box, MenuItem, Slider, TextField, Typography } from '@mui/material';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { canvasToBlob, openPdfjs, parseRanges, renderPage } from '../../../pdf/lib';

const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export default function PdfToImages(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('jpg');
  const [dpi, setDpi] = useState(150);
  const [quality, setQuality] = useState(85);
  const [pages, setPages] = useState('');
  const [progress, setProgress] = useState<string | null>(null);

  const run = async () => {
    const pdf = await openPdfjs(file!);
    const idx = parseRanges(pages, pdf.numPages);
    const base = file!.name.replace(/\.pdf$/i, '');
    const out: File[] = [];
    for (const [k, i] of idx.entries()) {
      setProgress(`${pt.page} ${k + 1} ${pt.of} ${idx.length}`);
      const c = await renderPage(pdf, i + 1, dpi / 72);
      const blob = await canvasToBlob(c, MIME[format], quality / 100);
      out.push(new File([blob], `${base}-${String(i + 1).padStart(3, '0')}.${format}`, { type: MIME[format] }));
      c.width = c.height = 1;
    }
    setProgress(null);
    return out;
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      progressText={progress}
      actionLabel={pt.apply}
      actionIcon="material-symbols:image-outline-rounded"
      zipName="pagine.zip"
      options={
        <Box>
          <TextField select fullWidth size="small" label={pt.img.format} value={format} onChange={(e) => setFormat(e.target.value)} sx={{ mb: 2 }}>
            <MenuItem value="jpg">JPG</MenuItem>
            <MenuItem value="png">PNG</MenuItem>
            <MenuItem value="webp">WebP</MenuItem>
          </TextField>
          <Typography variant="body2" color="text.secondary">
            {pt.img.dpi}: {dpi}
          </Typography>
          <Slider value={dpi} min={72} max={300} step={6} onChange={(_, v) => setDpi(v as number)} />
          <Typography variant="caption" color="text.secondary">
            {pt.img.dpiDesc}
          </Typography>
          {format !== 'png' && (
            <>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {pt.img.quality}: {quality}%
              </Typography>
              <Slider value={quality} min={30} max={100} onChange={(_, v) => setQuality(v as number)} />
            </>
          )}
          <TextField fullWidth size="small" label={pt.pages} helperText={pt.pagesDesc} value={pages} onChange={(e) => setPages(e.target.value)} sx={{ mt: 1 }} />
        </Box>
      }
    />
  );
}
