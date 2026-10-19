// BenitoTools: ritaglia i margini delle pagine (CropBox), con anteprima.
import React, { useEffect, useRef, useState } from 'react';
import { Box, Slider, TextField, Typography } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { openPdfjs, parseRanges, pdfFile, renderPage, withSuffix } from '../../../pdf/lib';

export default function CropPdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [m, setM] = useState({ top: 5, bottom: 5, left: 5, right: 5 });
  const [pages, setPages] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreview(null);
    if (!file) return;
    openPdfjs(file)
      .then((pdf) => renderPage(pdf, 1, 1.2))
      .then((c) => setPreview(c.toDataURL('image/jpeg', 0.8)))
      .catch(() => undefined);
  }, [file]);

  const run = async () => {
    const doc = await PDFDocument.load(await file!.arrayBuffer(), { ignoreEncryption: true });
    const idx = new Set(parseRanges(pages, doc.getPageCount()));
    doc.getPages().forEach((page, i) => {
      if (!idx.has(i)) return;
      const { x, y, width, height } = page.getCropBox();
      const nx = x + (width * m.left) / 100;
      const ny = y + (height * m.bottom) / 100;
      const nw = width * (1 - (m.left + m.right) / 100);
      const nh = height * (1 - (m.top + m.bottom) / 100);
      page.setCropBox(nx, ny, nw, nh);
      page.setMediaBox(nx, ny, nw, nh);
    });
    return [pdfFile(await doc.save(), withSuffix(file!.name, 'ritagliato'))];
  };

  const slider = (k: keyof typeof m, label: string) => (
    <Box key={k}>
      <Typography variant="body2" color="text.secondary">
        {label}: {m[k]}%
      </Typography>
      <Slider value={m[k]} min={0} max={40} onChange={(_, v) => setM({ ...m, [k]: v as number })} />
    </Box>
  );

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      actionLabel={pt.apply}
      actionIcon="material-symbols:crop-rounded"
      below={
        preview && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {pt.crop.preview}
            </Typography>
            <Box ref={boxRef} position="relative" display="inline-block" maxWidth="100%" boxShadow={3} overflow="hidden">
              <img src={preview} alt="" style={{ maxWidth: '100%', display: 'block' }} />
              <Box
                position="absolute"
                sx={{
                  top: `${m.top}%`,
                  bottom: `${m.bottom}%`,
                  left: `${m.left}%`,
                  right: `${m.right}%`,
                  outline: '2px dashed #1c64f2',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,.35)'
                }}
              />
            </Box>
          </Box>
        )
      }
      options={
        <Box>
          <Typography fontWeight={600} mb={1}>
            {pt.crop.margins}
          </Typography>
          {slider('top', pt.crop.top)}
          {slider('bottom', pt.crop.bottom)}
          {slider('left', pt.crop.left)}
          {slider('right', pt.crop.right)}
          <TextField fullWidth size="small" label={pt.pages} helperText={pt.pagesDesc} value={pages} onChange={(e) => setPages(e.target.value)} />
        </Box>
      }
    />
  );
}
