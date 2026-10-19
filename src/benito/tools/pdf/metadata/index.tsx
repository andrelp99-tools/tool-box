// BenitoTools: Rimuovi metadati PDF.
import React, { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { PDFDocument, PDFName } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { pdfFile, withSuffix } from '../../../pdf/lib';

export default function RemoveMetadata(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<[string, string][] | null>(null);

  useEffect(() => {
    setInfo(null);
    if (!file) return;
    (async () => {
      try {
        const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
        const rows: [string, string | undefined][] = [
          [pt.meta.title, doc.getTitle()],
          [pt.meta.author, doc.getAuthor()],
          [pt.meta.subject, doc.getSubject()],
          [pt.meta.keywords, doc.getKeywords()],
          [pt.meta.creator, doc.getCreator()],
          [pt.meta.producer, doc.getProducer()],
          [pt.meta.created, doc.getCreationDate()?.toLocaleString()],
          [pt.meta.modified, doc.getModificationDate()?.toLocaleString()]
        ];
        setInfo(rows.filter((r): r is [string, string] => !!r[1]));
      } catch {
        setInfo([]);
      }
    })();
  }, [file, pt]);

  const run = async () => {
    const doc = await PDFDocument.load(await file!.arrayBuffer(), { updateMetadata: false });
    doc.setTitle('');
    doc.setAuthor('');
    doc.setSubject('');
    doc.setKeywords([]);
    doc.setCreator('');
    doc.setProducer('');
    const epoch = new Date(0);
    doc.setCreationDate(epoch);
    doc.setModificationDate(epoch);
    // toglie anche i metadati XMP e il dizionario Info
    doc.catalog.delete(PDFName.of('Metadata'));
    doc.context.trailerInfo.Info = undefined;
    for (const page of doc.getPages()) page.node.delete(PDFName.of('Metadata'));
    const bytes = await doc.save({ useObjectStreams: true, updateFieldAppearances: false });
    return [pdfFile(bytes, withSuffix(file!.name, 'pulito'))];
  };

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      actionLabel={pt.meta.remove}
      actionIcon="material-symbols:visibility-off-outline-rounded"
      options={
        info && (
          <Box>
            {info.length ? (
              <Alert severity="warning">
                <b>{pt.meta.found}</b>
                {info.map(([k, v]) => (
                  <div key={k}>
                    {k}: {v}
                  </div>
                ))}
              </Alert>
            ) : (
              <Alert severity="success">{pt.meta.none}</Alert>
            )}
          </Box>
        )
      }
    />
  );
}
