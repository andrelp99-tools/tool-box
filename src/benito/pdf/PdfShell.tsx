// BenitoTools: struttura comune degli strumenti PDF (ingresso, opzioni, pulsante, risultato).
import React, { ReactNode, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import ToolPdfInput from '@components/input/ToolPdfInput';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import JSZip from 'jszip';
import { usePt } from './strings';

export interface PdfShellProps {
  file: File | null;
  setFile: (f: File | null) => void;
  /** Esegue l'operazione e ritorna i file prodotti. */
  run: () => Promise<File[]>;
  actionLabel: string;
  actionIcon?: string;
  options?: ReactNode;
  /** Contenuto sotto l'ingresso (anteprime, editor…) */
  below?: ReactNode;
  disabled?: boolean;
  progressText?: string | null;
  input?: ReactNode;
  resultTitle?: string;
  zipName?: string;
}

export default function PdfShell(p: PdfShellProps) {
  const pt = usePt();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<File[]>([]);
  const [zip, setZip] = useState<File | null>(null);

  const go = async () => {
    setBusy(true);
    setError(null);
    setResults([]);
    setZip(null);
    try {
      const out = await p.run();
      setResults(out);
      if (out.length > 1) {
        const z = new JSZip();
        out.forEach((f) => z.file(f.name, f));
        const blob = await z.generateAsync({ type: 'blob' });
        setZip(new File([blob], p.zipName ?? 'risultato.zip', { type: 'application/zip' }));
      }
    } catch (e) {
      console.error(e);
      setError(`${pt.error}: ${(e as Error)?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box id="tool" mb={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {p.input ?? (
            <ToolPdfInput
              value={p.file}
              onChange={(f) => {
                p.setFile(f);
                setResults([]);
                setError(null);
              }}
              accept={['application/pdf']}
              title={pt.input}
            />
          )}
          {p.below}
        </Grid>
        <Grid item xs={12} md={6}>
          {p.options && <Box mb={2}>{p.options}</Box>}
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Button
              variant="contained"
              size="large"
              disabled={busy || p.disabled || (!p.file && !p.input)}
              onClick={go}
              startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <Icon icon={p.actionIcon ?? 'material-symbols:play-arrow-rounded'} />}
            >
              {busy ? pt.working : p.actionLabel}
            </Button>
          </Stack>
          {busy && p.progressText && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              {p.progressText}
            </Typography>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {results.length === 1 && <ToolFileResult title={p.resultTitle ?? pt.result} value={results[0]} />}
          {results.length > 1 && <ToolMultiFileResult title={p.resultTitle ?? pt.result} value={results} zipFile={zip} />}
        </Grid>
      </Grid>
    </Box>
  );
}
