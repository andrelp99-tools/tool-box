// BenitoTools: Ritaglia per social — misure pronte per i social più usati.
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import ReactCrop, { centerCrop, Crop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Icon } from '@iconify/react';
import { ToolComponentProps } from '@tools/defineTool';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import InputHeader from '@components/InputHeader';
import { useBt } from '../../strings';

interface Preset {
  id: string;
  label: string;
  w?: number;
  h?: number;
}

const PRESETS: Preset[] = [
  { id: 'ig-square', label: 'Instagram post 1:1', w: 1080, h: 1080 },
  { id: 'ig-portrait', label: 'Instagram post 4:5', w: 1080, h: 1350 },
  { id: 'story', label: 'Storie / Reels / TikTok 9:16', w: 1080, h: 1920 },
  { id: 'wa-profile', label: 'Foto profilo (WhatsApp, IG) 1:1', w: 640, h: 640 },
  { id: 'wa-status', label: 'Stato WhatsApp 9:16', w: 1080, h: 1920 },
  { id: 'fb-cover', label: 'Facebook copertina', w: 1640, h: 624 },
  { id: 'fb-post', label: 'Facebook post 1.91:1', w: 1200, h: 630 },
  { id: 'yt-thumb', label: 'YouTube miniatura 16:9', w: 1280, h: 720 },
  { id: 'x-post', label: 'X / Twitter 16:9', w: 1600, h: 900 },
  { id: 'li-banner', label: 'LinkedIn banner', w: 1584, h: 396 },
  { id: 'free', label: '' }
];

export default function SocialCrop(_props: ToolComponentProps) {
  const bt = useBt();
  const [input, setInput] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [presetId, setPresetId] = useState('ig-portrait');
  const [crop, setCrop] = useState<Crop>();
  const [px, setPx] = useState<PixelCrop>();
  const [result, setResult] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const aspect = preset.w && preset.h ? preset.w / preset.h : undefined;

  useEffect(() => {
    if (!input) return setUrl(null);
    const u = URL.createObjectURL(input);
    setUrl(u);
    setResult(null);
    return () => URL.revokeObjectURL(u);
  }, [input]);

  const initCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const { width, height } = img;
    const c = aspect
      ? centerCrop(makeAspectCrop({ unit: '%', width: 100 }, aspect, width, height), width, height)
      : ({ unit: '%', x: 5, y: 5, width: 90, height: 90 } as Crop);
    setCrop(c);
    setPx(undefined);
  };

  useEffect(initCrop, [presetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const doCrop = async () => {
    const img = imgRef.current;
    if (!img || !input) return;
    const sx = img.naturalWidth / img.width;
    const sy = img.naturalHeight / img.height;
    const c = px ?? {
      x: ((crop?.x ?? 0) / 100) * img.width,
      y: ((crop?.y ?? 0) / 100) * img.height,
      width: ((crop?.width ?? 100) / 100) * img.width,
      height: ((crop?.height ?? 100) / 100) * img.height
    };
    const srcW = c.width * sx;
    const srcH = c.height * sy;
    const outW = preset.w ?? Math.round(srcW);
    const outH = preset.h ?? Math.round(srcH);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, c.x * sx, c.y * sy, srcW, srcH, 0, 0, outW, outH);
    const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), 'image/jpeg', 0.92));
    const base = input.name.replace(/\.[^.]+$/, '');
    setResult(new File([blob], `${base}-${preset.id}.jpg`, { type: 'image/jpeg' }));
  };

  return (
    <Box id="tool" mb={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {!url ? (
            <ToolImageInput value={input} onChange={setInput} accept={['image/*']} title={bt.social.input} />
          ) : (
            <Box>
              <InputHeader title={bt.social.input} />
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setPx(c)} aspect={aspect} keepSelection>
                <img ref={imgRef} src={url} alt="" onLoad={initCrop} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
              </ReactCrop>
              <Typography variant="caption" color="text.secondary" display="block">
                {bt.social.hint}
              </Typography>
              <Button size="small" onClick={() => setInput(null)} sx={{ mt: 1 }}>
                ✕
              </Button>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {bt.social.preset}
          </Typography>
          <Select fullWidth size="small" value={presetId} onChange={(e) => setPresetId(e.target.value)} sx={{ mb: 1 }}>
            {PRESETS.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.id === 'free' ? bt.social.custom : `${p.label} — ${p.w}×${p.h}`}
              </MenuItem>
            ))}
          </Select>
          <Stack direction="row" spacing={1} mb={2}>
            <Button variant="contained" size="large" disabled={!url} onClick={doCrop} startIcon={<Icon icon="material-symbols:crop-rounded" />}>
              {bt.social.crop}
            </Button>
          </Stack>
          {result && <ToolFileResult title={bt.social.result} value={result} />}
        </Grid>
      </Grid>
    </Box>
  );
}
