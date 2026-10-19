// BenitoTools: filigrana e timbri.
import React, { useState } from 'react';
import { Box, Chip, FormControlLabel, MenuItem, Slider, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { parseRanges, pdfFile, withSuffix } from '../../../pdf/lib';
import ColorField, { hexToRgb01 } from '../../../pdf/ColorField';

type Pos = 'center' | 'tl' | 'tr' | 'bl' | 'br';

export default function Watermark(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<'watermark' | 'stamp'>('watermark');
  const [text, setText] = useState('COPIA');
  const [size, setSize] = useState(60);
  const [opacity, setOpacity] = useState(25);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState('#c62828');
  const [pos, setPos] = useState<Pos>('center');
  const [border, setBorder] = useState(true);
  const [pages, setPages] = useState('');
  const presets = ['COPIA', 'BOZZA', 'RISERVATO', 'APPROVATO', 'PAGATO', 'ANNULLATO', `${new Date().toLocaleDateString()}`];

  const switchKind = (k: 'watermark' | 'stamp') => {
    setKind(k);
    if (k === 'stamp') {
      setSize(22);
      setOpacity(90);
      setAngle(-8);
      setPos('tr');
    } else {
      setSize(60);
      setOpacity(25);
      setAngle(45);
      setPos('center');
    }
  };

  const run = async () => {
    const doc = await PDFDocument.load(await file!.arrayBuffer(), { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const c = hexToRgb01(color);
    const col = rgb(c.r, c.g, c.b);
    const idx = new Set(parseRanges(pages, doc.getPageCount()));
    doc.getPages().forEach((page, i) => {
      if (!idx.has(i)) return;
      const { width, height } = page.getSize();
      const lines = text.split('\n');
      const lh = size * 1.15;
      const tw = Math.max(...lines.map((l) => font.widthOfTextAtSize(l, size)));
      const th = lh * lines.length;
      const pad = size * 0.4;
      const m = 30;
      // centro del blocco
      const cx = pos === 'center' ? width / 2 : pos.endsWith('l') ? m + tw / 2 + pad : width - m - tw / 2 - pad;
      const cy = pos === 'center' ? height / 2 : pos.startsWith('t') ? height - m - th / 2 - pad : m + th / 2 + pad;
      const rad = (angle * Math.PI) / 180;
      const rot = (dx: number, dy: number) => ({ x: cx + dx * Math.cos(rad) - dy * Math.sin(rad), y: cy + dx * Math.sin(rad) + dy * Math.cos(rad) });
      lines.forEach((l, k) => {
        const w = font.widthOfTextAtSize(l, size);
        const p = rot(-w / 2, th / 2 - lh * (k + 1) + size * 0.2);
        page.drawText(l, { x: p.x, y: p.y, size, font, color: col, opacity: opacity / 100, rotate: degrees(angle) });
      });
      if (kind === 'stamp' && border) {
        const p = rot(-tw / 2 - pad, -th / 2 - pad / 2);
        page.drawRectangle({
          x: p.x,
          y: p.y,
          width: tw + 2 * pad,
          height: th + pad,
          borderColor: col,
          borderWidth: Math.max(1.5, size / 10),
          borderOpacity: opacity / 100,
          rotate: degrees(angle)
        });
      }
    });
    return [pdfFile(await doc.save(), withSuffix(file!.name, kind === 'stamp' ? 'timbrato' : 'filigrana'))];
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      actionLabel={pt.apply}
      actionIcon="material-symbols:approval-outline-rounded"
      options={
        <Box>
          <ToggleButtonGroup exclusive size="small" value={kind} onChange={(_, v) => v && switchKind(v)} sx={{ mb: 2 }}>
            <ToggleButton value="watermark">{pt.wm.watermark}</ToggleButton>
            <ToggleButton value="stamp">{pt.wm.stamp}</ToggleButton>
          </ToggleButtonGroup>
          <TextField fullWidth multiline size="small" label={pt.wm.text} value={text} onChange={(e) => setText(e.target.value)} />
          <Stack direction="row" gap={0.5} flexWrap="wrap" my={1}>
            {presets.map((p) => (
              <Chip key={p} size="small" label={p} onClick={() => setText(p)} />
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {pt.wm.size}: {size}
          </Typography>
          <Slider value={size} min={8} max={140} onChange={(_, v) => setSize(v as number)} />
          <Typography variant="body2" color="text.secondary">
            {pt.wm.opacity}: {opacity}%
          </Typography>
          <Slider value={opacity} min={5} max={100} onChange={(_, v) => setOpacity(v as number)} />
          <Typography variant="body2" color="text.secondary">
            {pt.wm.angle}: {angle}°
          </Typography>
          <Slider value={angle} min={-90} max={90} onChange={(_, v) => setAngle(v as number)} />
          <TextField select fullWidth size="small" label={pt.wm.position} value={pos} onChange={(e) => setPos(e.target.value as Pos)} sx={{ my: 1 }}>
            <MenuItem value="center">{pt.wm.center}</MenuItem>
            <MenuItem value="tl">{pt.wm.tl}</MenuItem>
            <MenuItem value="tr">{pt.wm.tr}</MenuItem>
            <MenuItem value="bl">{pt.wm.bl}</MenuItem>
            <MenuItem value="br">{pt.wm.br}</MenuItem>
          </TextField>
          <ColorField label={pt.wm.color} value={color} onChange={setColor} />
          {kind === 'stamp' && <FormControlLabel control={<Switch checked={border} onChange={(e) => setBorder(e.target.checked)} />} label={pt.wm.border} />}
          <TextField fullWidth size="small" label={pt.pages} helperText={pt.pagesDesc} value={pages} onChange={(e) => setPages(e.target.value)} sx={{ mt: 1 }} />
        </Box>
      }
    />
  );
}
