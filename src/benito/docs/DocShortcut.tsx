// BenitoTools: strumento "scorciatoia" per i documenti (es. Office in PDF, PDF in Word):
// più file in ingresso, un formato di uscita, stessi motori del Convertitore universale.
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import JSZip from 'jszip';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import MultiFileInput from '../components/MultiFileInput';
import { useBt } from '../strings';
import {
  convertDocument,
  docFamilyOf,
  enginesFor,
  uniqueName
} from './convert';
import { docErrorText, EngineNotice, formatLabel } from './ui';
import { useIsolation } from './isolation';

type Status = {
  state: 'waiting' | 'working' | 'done' | 'error';
  text?: string;
};

export default function DocShortcut({
  accept,
  outputs,
  inputTitle,
  hint,
  zipName,
  needsIsolation
}: {
  /** Estensioni accettate, senza punto */
  accept: string[];
  /** Formati di uscita possibili (il primo è quello predefinito) */
  outputs: string[];
  inputTitle: string;
  hint?: string;
  zipName: string;
  needsIsolation?: boolean;
}) {
  const bt = useBt();
  useIsolation(!!needsIsolation);
  const [files, setFiles] = useState<File[]>([]);
  const [to, setTo] = useState(outputs[0]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status[]>([]);
  const [results, setResults] = useState<File[]>([]);
  const [zip, setZip] = useState<File | null>(null);

  const engines = useMemo(
    () => files.flatMap((f) => enginesFor(f, to)),
    [files, to]
  );
  const acceptList = useMemo(
    () => [
      ...accept.map((e) => `.${e}`),
      ...(accept.includes('pdf') ? ['application/pdf'] : [])
    ],
    [accept]
  );

  const run = async () => {
    setBusy(true);
    setResults([]);
    setZip(null);
    const st: Status[] = files.map(() => ({ state: 'waiting' }));
    setStatus([...st]);
    const out: File[] = [];
    for (let i = 0; i < files.length; i++) {
      st[i] = { state: 'working', text: bt.docs.stage.convert };
      setStatus([...st]);
      try {
        if (!docFamilyOf(files[i])) throw new Error(bt.convert.unsupported);
        const r = await convertDocument(files[i], to, (s) => {
          st[i] = { state: 'working', text: bt.docs.stage[s] };
          setStatus([...st]);
        });
        out.push(uniqueName(r, out));
        st[i] = { state: 'done' };
      } catch (e) {
        console.error(e);
        st[i] = { state: 'error', text: docErrorText(e, bt) };
      }
      setStatus([...st]);
      setResults([...out]);
    }
    if (out.length > 1) {
      const z = new JSZip();
      out.forEach((f) => z.file(f.name, f));
      const blob = await z.generateAsync({ type: 'blob' });
      setZip(new File([blob], zipName, { type: 'application/zip' }));
    }
    setBusy(false);
  };

  return (
    <Box id="tool" mb={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MultiFileInput
            value={files}
            onChange={(f) => {
              setFiles(f);
              setStatus([]);
              setResults([]);
              setZip(null);
            }}
            accept={acceptList}
            title={inputTitle}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          {outputs.length > 1 && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {bt.convert.to}
              </Typography>
              <Select
                size="small"
                fullWidth
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {outputs.map((o) => (
                  <MenuItem key={o} value={o}>
                    {formatLabel(o, bt)}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
          {hint && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={1}
            >
              {hint}
            </Typography>
          )}
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <Button
              variant="contained"
              size="large"
              disabled={busy || !files.length}
              onClick={run}
              startIcon={
                busy ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Icon icon="material-symbols:sync-alt-rounded" />
                )
              }
            >
              {busy ? bt.convert.converting : bt.docs.convert}
            </Button>
          </Stack>
          {!busy && !results.length && (
            <Box mb={2}>
              <EngineNotice engines={engines} />
              {files.length > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {bt.docs.heavy}
                </Typography>
              )}
            </Box>
          )}
          <Stack spacing={1} mb={2}>
            {status.map((s, i) =>
              files[i] ? (
                <Box key={i}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="body2" noWrap maxWidth="65%">
                      {files[i].name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={s.state === 'error' ? 'error' : 'text.secondary'}
                    >
                      {s.state === 'done'
                        ? `✓ ${bt.convert.done}`
                        : s.state === 'error'
                          ? bt.convert.failed
                          : s.text ?? ''}
                    </Typography>
                  </Stack>
                  {s.state === 'working' && <LinearProgress />}
                  {s.state === 'error' && (
                    <Alert severity="error" sx={{ mt: 0.5 }}>
                      {s.text}
                    </Alert>
                  )}
                </Box>
              ) : null
            )}
          </Stack>
          {results.length === 1 && (
            <ToolFileResult title={bt.docs.result} value={results[0]} />
          )}
          {results.length > 1 && (
            <ToolMultiFileResult
              title={bt.docs.result}
              value={results}
              zipFile={zip}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
