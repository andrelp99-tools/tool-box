// BenitoTools: Sblocca PDF (qpdf).
import React, { useState } from 'react';
import { Alert, TextField } from '@mui/material';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { pdfFile, runQpdf, withSuffix } from '../../../pdf/lib';

export default function UnlockPdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');

  const run = async () => {
    const input = new Uint8Array(await file!.arrayBuffer());
    try {
      const out = await runQpdf(input, [`--password=${password}`, '--decrypt', '{in}', '{out}']);
      return [pdfFile(out, withSuffix(file!.name, 'sbloccato'))];
    } catch {
      throw new Error(pt.wrongPassword);
    }
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      actionLabel={pt.unlock.action}
      actionIcon="material-symbols:lock-open-right-outline-rounded"
      options={
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            {pt.unlock.hint}
          </Alert>
          <TextField fullWidth type="password" label={pt.password} value={password} onChange={(e) => setPassword(e.target.value)} />
        </>
      }
    />
  );
}
