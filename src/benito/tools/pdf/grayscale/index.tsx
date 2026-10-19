// BenitoTools: PDF in bianco e nero (scala di grigi).
import React, { useState } from 'react';
import { Slider, Typography } from '@mui/material';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { pdfFile, withSuffix } from '../../../pdf/lib';
import { rasterizePdf } from '../../../pdf/rasterize';

export default function GrayscalePdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState(150);
  const [progress, setProgress] = useState<string | null>(null);
  const run = async () => {
    const bytes = await rasterizePdf(file!, { dpi, grayscale: true, onProgress: (i, n) => setProgress(`${pt.page} ${i} ${pt.of} ${n}`) });
    setProgress(null);
    return [pdfFile(bytes, withSuffix(file!.name, 'grigi'))];
  };
  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      progressText={progress}
      actionLabel={pt.apply}
      actionIcon="material-symbols:invert-colors-rounded"
      options={
        <>
          <Typography variant="body2" color="text.secondary">
            {pt.gray.dpi}: {dpi}
          </Typography>
          <Slider value={dpi} min={72} max={300} step={6} onChange={(_, v) => setDpi(v as number)} />
          <Typography variant="caption" color="text.secondary">
            {pt.img.dpiDesc}
          </Typography>
        </>
      }
    />
  );
}
