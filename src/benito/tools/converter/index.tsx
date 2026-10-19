// BenitoTools: Convertitore universale (immagini, audio, video) sul dispositivo.
// Motori: ImageMagick WASM (immagini) e mediabunny/WebCodecs (audio e video).
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import JSZip from 'jszip';
import ToolContent from '@components/ToolContent';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import InputHeader from '@components/InputHeader';
import { ToolComponentProps } from '@tools/defineTool';
import MultiFileInput from '../../components/MultiFileInput';
import { useBt } from '../../strings';
import {
  AUDIO_INPUT_EXT,
  Category,
  categoryOf,
  DEFAULT_OUTPUT,
  IMAGE_INPUT_EXT,
  outputsFor,
  VIDEO_INPUT_EXT
} from '../../convert/formats';

interface Options {
  imageTo: string;
  audioTo: string;
  videoTo: string;
  imageQuality: number;
  mediaQuality: 'low' | 'medium' | 'high';
  maxSide: string;
  stripMetadata: boolean;
}

const initialValues: Options = {
  imageTo: DEFAULT_OUTPUT.image,
  audioTo: DEFAULT_OUTPUT.audio,
  videoTo: DEFAULT_OUTPUT.video,
  imageQuality: 85,
  mediaQuality: 'medium',
  maxSide: '',
  stripMetadata: true
};

const ACCEPT = [
  'image/*',
  'audio/*',
  'video/*',
  ...[...IMAGE_INPUT_EXT, ...AUDIO_INPUT_EXT, ...VIDEO_INPUT_EXT].map((e) => `.${e}`)
];

type Status = { state: 'waiting' | 'working' | 'done' | 'error'; progress: number; error?: string };

export default function UniversalConverter({ title }: ToolComponentProps) {
  const bt = useBt();
  const [input, setInput] = useState<File[]>([]);
  const [values, setValues] = useState<Options>(initialValues);
  const [status, setStatus] = useState<Status[]>([]);
  const [results, setResults] = useState<File[]>([]);
  const [zip, setZip] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cats = useMemo(() => {
    const s = new Set<Category>();
    input.forEach((f) => {
      const c = categoryOf(f);
      if (c) s.add(c);
    });
    return s;
  }, [input]);

  const hasMedia = cats.has('audio') || cats.has('video');
  const noWebCodecs = hasMedia && typeof (window as any).AudioEncoder === 'undefined';

  const targetFor = (c: Category, v: Options) =>
    c === 'image' ? v.imageTo : c === 'audio' ? v.audioTo : v.videoTo;

  const run = async () => {
    if (!input.length || running) return;
    setRunning(true);
    setResults([]);
    setZip(null);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const st: Status[] = input.map(() => ({ state: 'waiting', progress: 0 }));
    setStatus([...st]);
    const out: File[] = [];
    const maxSide = parseInt(values.maxSide, 10) || undefined;

    for (let i = 0; i < input.length; i++) {
      if (ctrl.signal.aborted) break;
      const file = input[i];
      const cat = categoryOf(file);
      st[i] = { state: 'working', progress: 0 };
      setStatus([...st]);
      try {
        if (!cat) throw new Error(bt.convert.unsupported);
        const to = targetFor(cat, values);
        let result: File;
        if (cat === 'image') {
          const { convertImage } = await import('../../convert/image');
          result = await convertImage(file, to, {
            quality: values.imageQuality,
            maxSide,
            stripMetadata: values.stripMetadata
          });
        } else {
          const { convertMedia } = await import('../../convert/media');
          result = await convertMedia(file, to, {
            quality: values.mediaQuality,
            maxSide,
            signal: ctrl.signal,
            onProgress: (p) => {
              st[i] = { state: 'working', progress: p };
              setStatus([...st]);
            }
          });
        }
        out.push(result);
        st[i] = { state: 'done', progress: 1 };
      } catch (e) {
        st[i] = { state: 'error', progress: 0, error: (e as Error)?.message ?? String(e) };
      }
      setStatus([...st]);
      setResults([...out]);
    }

    if (out.length > 1) {
      const z = new JSZip();
      out.forEach((f) => z.file(f.name, f));
      const blob = await z.generateAsync({ type: 'blob' });
      setZip(new File([blob], 'convertiti.zip', { type: 'application/zip' }));
    }
    setRunning(false);
    abortRef.current = null;
  };

  const formatSelect = (
    label: string,
    value: string,
    options: string[],
    onChange: (v: string) => void,
    hint?: string
  ) => (
    <Box mb={2}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Select
        size="small"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <MenuItem key={o} value={o}>
            {o.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Box>
  );

  const resultPanel = (
    <Box>
      <InputHeader title={bt.convert.convert} />
      <Stack spacing={1} mb={2}>
        {noWebCodecs && <Alert severity="warning">{bt.convert.noWebCodecs}</Alert>}
        {cats.has('image') && !running && results.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            {bt.convert.firstImage}
          </Typography>
        )}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="large"
            disabled={!input.length || running}
            onClick={run}
            startIcon={<Icon icon="material-symbols:sync-alt-rounded" />}
          >
            {running ? bt.convert.converting : bt.convert.convert}
          </Button>
          {running && (
            <Button color="error" onClick={() => abortRef.current?.abort()}>
              {bt.convert.cancel}
            </Button>
          )}
        </Stack>
        {input.length === 0 && (
          <Typography color="text.secondary">{bt.convert.empty}</Typography>
        )}
        {status.map((s, i) =>
          input[i] ? (
            <Box key={i}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" noWrap maxWidth="70%">
                  {input[i].name}
                </Typography>
                <Typography
                  variant="caption"
                  color={s.state === 'error' ? 'error' : 'text.secondary'}
                >
                  {s.state === 'done'
                    ? `✓ ${bt.convert.done}`
                    : s.state === 'error'
                      ? bt.convert.failed
                      : s.state === 'working'
                        ? `${Math.round(s.progress * 100)}%`
                        : ''}
                </Typography>
              </Stack>
              {s.state === 'working' && (
                <LinearProgress
                  variant={s.progress > 0 ? 'determinate' : 'indeterminate'}
                  value={s.progress * 100}
                />
              )}
              {s.state === 'error' && (
                <Typography variant="caption" color="error">
                  {s.error}
                </Typography>
              )}
            </Box>
          ) : null
        )}
      </Stack>
      {results.length > 0 && (
        <ToolMultiFileResult title={bt.convert.result} value={results} zipFile={zip} />
      )}
    </Box>
  );

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      inputComponent={
        <MultiFileInput value={input} onChange={setInput} accept={ACCEPT} title={bt.convert.input} />
      }
      resultComponent={resultPanel}
      initialValues={initialValues}
      compute={(v: Options) => setValues(v)}
      getGroups={({ values: v, updateField }) => [
        {
          title: bt.convert.options,
          component: (
            <Box>
              {(cats.size === 0 || cats.has('image')) &&
                formatSelect(`${bt.convert.images} → ${bt.convert.to}`, v.imageTo, outputsFor('image'), (x) => updateField('imageTo', x))}
              {(cats.size === 0 || cats.has('audio')) &&
                formatSelect(`${bt.convert.audio} → ${bt.convert.to}`, v.audioTo, outputsFor('audio'), (x) => updateField('audioTo', x))}
              {(cats.size === 0 || cats.has('video')) &&
                formatSelect(
                  `${bt.convert.videos} → ${bt.convert.to}`,
                  v.videoTo,
                  outputsFor('video'),
                  (x) => updateField('videoTo', x),
                  bt.convert.videoAudioHint
                )}
            </Box>
          )
        },
        {
          title: bt.convert.quality,
          component: (
            <Box>
              {(cats.size === 0 || cats.has('image')) && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    {bt.convert.images}: {v.imageQuality}%
                  </Typography>
                  <Slider
                    value={v.imageQuality}
                    min={10}
                    max={100}
                    onChange={(_, val) => updateField('imageQuality', val as number)}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {bt.convert.imageQualityDesc}
                  </Typography>
                </Box>
              )}
              {(cats.size === 0 || hasMedia) && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {bt.convert.audio} / {bt.convert.videos}
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={v.mediaQuality}
                    onChange={(e) => updateField('mediaQuality', e.target.value as Options['mediaQuality'])}
                  >
                    <MenuItem value="low">{bt.convert.qualityLow}</MenuItem>
                    <MenuItem value="medium">{bt.convert.qualityMedium}</MenuItem>
                    <MenuItem value="high">{bt.convert.qualityHigh}</MenuItem>
                  </Select>
                </Box>
              )}
              <TextField
                size="small"
                fullWidth
                type="number"
                label={bt.convert.maxSide}
                helperText={bt.convert.maxSideDesc}
                value={v.maxSide}
                onChange={(e) => updateField('maxSide', e.target.value)}
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={v.stripMetadata}
                    onChange={(e) => updateField('stripMetadata', e.target.checked)}
                  />
                }
                label={bt.convert.strip}
              />
            </Box>
          )
        }
      ]}
    />
  );
}
