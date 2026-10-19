// BenitoTools: Comprimi video — a una dimensione obiettivo o per qualità, sul dispositivo.
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import { ToolComponentProps } from '@tools/defineTool';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { useBt } from '../../strings';
import { formatBytes } from '../../history';
import type { MediaInfo, MediaQuality } from '../../convert/media';

const TARGETS = [
  { mb: 15, label: 'WhatsApp (16 MB)' },
  { mb: 24, label: 'Email (25 MB)' },
  { mb: 50, label: '50 MB' },
  { mb: 95, label: 'WhatsApp documento / 100 MB' }
];
const RES = [0, 1080, 720, 480];

function fmtDur(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, '0')}`;
}

export default function VideoCompress(_props: ToolComponentProps) {
  const bt = useBt();
  const [input, setInput] = useState<File | null>(null);
  const [info, setInfo] = useState<MediaInfo | null>(null);
  const [mode, setMode] = useState<'size' | 'quality'>('size');
  const [targetMb, setTargetMb] = useState(15);
  const [custom, setCustom] = useState('');
  const [quality, setQuality] = useState<MediaQuality>('medium');
  const [maxRes, setMaxRes] = useState(720);
  const [keepAudio, setKeepAudio] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    setInfo(null);
    setResult(null);
    setError(null);
    if (!input) return;
    import('../../convert/media')
      .then((m) => m.getMediaInfo(input))
      .then(setInfo)
      .catch((e) => setError(String(e?.message ?? e)));
  }, [input]);

  const target = (parseFloat(custom) || targetMb) * 1024 * 1024;
  const audioBps = keepAudio && info?.hasAudio ? 96_000 : 0;
  const videoBps = info ? Math.floor((target * 8 * 0.94) / Math.max(1, info.duration) - audioBps) : 0;
  const tooSmall = mode === 'size' && info && videoBps < 150_000;

  const run = async () => {
    if (!input) return;
    setError(null);
    setResult(null);
    setProgress(0);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const { convertMedia } = await import('../../convert/media');
      const out = await convertMedia(input, 'mp4', {
        maxSide: maxRes || undefined,
        quality,
        videoBitrate: mode === 'size' ? Math.max(150_000, videoBps) : undefined,
        audioBitrate: mode === 'size' ? 96_000 : undefined,
        noAudio: !keepAudio,
        signal: ctrl.signal,
        onProgress: setProgress
      });
      const base = input.name.replace(/\.[^.]+$/, '');
      if (out.size >= input.size) {
        // il video era già più leggero: tengo l'originale
        setError(bt.vcomp.alreadySmall);
        setResult(input);
      } else setResult(new File([out], `${base}-compresso.mp4`, { type: 'video/mp4' }));
    } catch (e) {
      if (!ctrl.signal.aborted) setError(`${bt.vcomp.failed}: ${(e as Error)?.message ?? e}`);
    } finally {
      setProgress(null);
      abort.current = null;
    }
  };

  return (
    <Box id="tool" mb={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ToolVideoInput value={input} onChange={setInput} title={bt.vcomp.input} />
          {info && input && (
            <Typography variant="caption" color="text.secondary">
              {bt.vcomp.info
                .replace('{d}', fmtDur(info.duration))
                .replace('{w}', String(info.width))
                .replace('{h}', String(info.height))
                .replace('{s}', formatBytes(input.size))}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <ToggleButtonGroup exclusive size="small" value={mode} onChange={(_, v) => v && setMode(v)} sx={{ mb: 2 }}>
            <ToggleButton value="size">{bt.vcomp.bySize}</ToggleButton>
            <ToggleButton value="quality">{bt.vcomp.byQuality}</ToggleButton>
          </ToggleButtonGroup>
          {mode === 'size' ? (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {bt.vcomp.target}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Select size="small" value={targetMb} onChange={(e) => { setTargetMb(Number(e.target.value)); setCustom(''); }} sx={{ flex: 2 }}>
                  {TARGETS.map((t) => (
                    <MenuItem key={t.mb} value={t.mb}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
                <TextField size="small" type="number" label={bt.vcomp.targetCustom} value={custom} onChange={(e) => setCustom(e.target.value)} sx={{ flex: 1 }} />
              </Stack>
            </Box>
          ) : (
            <Select size="small" fullWidth value={quality} onChange={(e) => setQuality(e.target.value as MediaQuality)} sx={{ mb: 2 }}>
              <MenuItem value="low">{bt.convert.qualityLow}</MenuItem>
              <MenuItem value="medium">{bt.convert.qualityMedium}</MenuItem>
              <MenuItem value="high">{bt.convert.qualityHigh}</MenuItem>
            </Select>
          )}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {bt.vcomp.resolution}
          </Typography>
          <Select size="small" fullWidth value={maxRes} onChange={(e) => setMaxRes(Number(e.target.value))} sx={{ mb: 1 }}>
            {RES.map((r) => (
              <MenuItem key={r} value={r}>
                {r ? `${r}p` : bt.vcomp.original}
              </MenuItem>
            ))}
          </Select>
          <FormControlLabel control={<Switch checked={keepAudio} onChange={(e) => setKeepAudio(e.target.checked)} />} label={bt.vcomp.keepAudio} />
          {tooSmall && (
            <Alert severity="warning" sx={{ my: 1 }}>
              {bt.vcomp.tooSmall}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ my: 1 }}>
              {error}
            </Alert>
          )}
          <Stack direction="row" spacing={1} my={2}>
            <Button variant="contained" size="large" disabled={!input || progress !== null} onClick={run} startIcon={<Icon icon="material-symbols:compress-rounded" />}>
              {progress !== null ? bt.vcomp.compressing : bt.vcomp.compress}
            </Button>
            {progress !== null && (
              <Button color="error" onClick={() => abort.current?.abort()}>
                {bt.convert.cancel}
              </Button>
            )}
          </Stack>
          {progress !== null && <LinearProgress variant="determinate" value={progress * 100} sx={{ mb: 2 }} />}
          {result && input && result !== input && (
            <>
              <Typography variant="body2" mb={1}>
                {bt.vcomp.before}: {formatBytes(input.size)} → {bt.vcomp.after}: <b>{formatBytes(result.size)}</b>
              </Typography>
              <ToolFileResult title={bt.vcomp.result} value={result} />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
