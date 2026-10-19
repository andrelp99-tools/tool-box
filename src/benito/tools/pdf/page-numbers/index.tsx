// BenitoTools: numeri di pagina, intestazione e piè di pagina.
import React, { useState } from 'react';
import { Box, FormControlLabel, MenuItem, Slider, Switch, TextField, Typography } from '@mui/material';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { pdfFile, withSuffix } from '../../../pdf/lib';
import ColorField, { hexToRgb01 } from '../../../pdf/ColorField';

type H = 'left' | 'center' | 'right';

export default function PageNumbers(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [numbers, setNumbers] = useState(true);
  const [format, setFormat] = useState('{n}');
  const [numPos, setNumPos] = useState<'top' | 'bottom'>('bottom');
  const [numAlign, setNumAlign] = useState<H>('center');
  const [header, setHeader] = useState('');
  const [footer, setFooter] = useState('');
  const [size, setSize] = useState(11);
  const [start, setStart] = useState(1);
  const [skipFirst, setSkipFirst] = useState(false);
  const [color, setColor] = useState('#333333');

  const formats = [
    { v: '{n}', l: '1' },
    { v: '{n} / {N}', l: '1 / 10' },
    { v: `${pt.page} {n}`, l: `${pt.page} 1` },
    { v: `${pt.page} {n} ${pt.of} {N}`, l: `${pt.page} 1 ${pt.of} 10` },
    { v: '- {n} -', l: '- 1 -' }
  ];

  const run = async () => {
    const doc = await PDFDocument.load(await file!.arrayBuffer(), { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const { r, g, b } = hexToRgb01(color);
    const pages = doc.getPages();
    const total = pages.length - (skipFirst ? 1 : 0) + (start - 1);
    const date = new Date().toLocaleDateString();
    pages.forEach((page, i) => {
      if (skipFirst && i === 0) return;
      const n = i + start - (skipFirst ? 1 : 0);
      const fill = (t: string) => t.replace(/\{n\}/g, String(n)).replace(/\{N\}/g, String(total)).replace(/\{data\}/g, date);
      const { width, height } = page.getSize();
      const margin = Math.max(18, size * 1.8);
      const put = (text: string, vpos: 'top' | 'bottom', align: H) => {
        if (!text) return;
        const w = font.widthOfTextAtSize(text, size);
        const x = align === 'left' ? margin : align === 'right' ? width - margin - w : (width - w) / 2;
        const y = vpos === 'top' ? height - margin : margin - size * 0.3;
        page.drawText(text, { x, y, size, font, color: rgb(r, g, b) });
      };
      if (header) put(fill(header), 'top', 'center');
      if (footer) put(fill(footer), 'bottom', numbers && numPos === 'bottom' && numAlign === 'center' ? 'left' : 'center');
      if (numbers) put(fill(format), numPos, numAlign);
    });
    return [pdfFile(await doc.save(), withSuffix(file!.name, 'numerato'))];
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      actionLabel={pt.apply}
      actionIcon="material-symbols:format-list-numbered-rounded"
      options={
        <Box>
          <FormControlLabel control={<Switch checked={numbers} onChange={(e) => setNumbers(e.target.checked)} />} label={pt.num.numbers} />
          {numbers && (
            <Box pl={1}>
              <TextField select fullWidth size="small" label={pt.num.format} value={format} onChange={(e) => setFormat(e.target.value)} sx={{ my: 1 }}>
                {formats.map((f) => (
                  <MenuItem key={f.v} value={f.v}>
                    {f.l}
                  </MenuItem>
                ))}
              </TextField>
              <Box display="flex" gap={1}>
                <TextField select size="small" label={pt.num.position} value={numPos} onChange={(e) => setNumPos(e.target.value as 'top' | 'bottom')} sx={{ flex: 1 }}>
                  <MenuItem value="top">{pt.num.top}</MenuItem>
                  <MenuItem value="bottom">{pt.num.bottom}</MenuItem>
                </TextField>
                <TextField select size="small" label=" " value={numAlign} onChange={(e) => setNumAlign(e.target.value as H)} sx={{ flex: 1 }}>
                  <MenuItem value="left">{pt.num.left}</MenuItem>
                  <MenuItem value="center">{pt.num.center}</MenuItem>
                  <MenuItem value="right">{pt.num.right}</MenuItem>
                </TextField>
              </Box>
              <TextField type="number" size="small" label={pt.num.startAt} value={start} onChange={(e) => setStart(Math.max(0, parseInt(e.target.value, 10) || 1))} sx={{ mt: 1, width: 140 }} />
              <FormControlLabel control={<Switch checked={skipFirst} onChange={(e) => setSkipFirst(e.target.checked)} />} label={pt.num.skipFirst} />
            </Box>
          )}
          <TextField fullWidth size="small" label={pt.num.header} value={header} onChange={(e) => setHeader(e.target.value)} sx={{ mt: 2 }} />
          <TextField fullWidth size="small" label={pt.num.footer} value={footer} onChange={(e) => setFooter(e.target.value)} helperText={pt.num.textHint} sx={{ mt: 1 }} />
          <Typography variant="body2" color="text.secondary" mt={1}>
            {pt.num.size}: {size}
          </Typography>
          <Slider value={size} min={6} max={28} onChange={(_, v) => setSize(v as number)} />
          <ColorField label={pt.num.color} value={color} onChange={setColor} />
        </Box>
      }
    />
  );
}
