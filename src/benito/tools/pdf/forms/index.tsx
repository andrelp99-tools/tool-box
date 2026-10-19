// BenitoTools: Compila modulo PDF (campi AcroForm con pdf-lib).
import React, { useEffect, useState } from 'react';
import { Alert, Box, Checkbox, FormControlLabel, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { PDFCheckBox, PDFDocument, PDFDropdown, PDFOptionList, PDFRadioGroup, PDFTextField } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { pdfFile, withSuffix } from '../../../pdf/lib';

type Field =
  | { kind: 'text'; name: string; value: string; multiline: boolean }
  | { kind: 'check'; name: string; value: boolean }
  | { kind: 'choice'; name: string; value: string; options: string[] };

export default function FillForm(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<Field[] | null>(null);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    setFields(null);
    if (!file) return;
    (async () => {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const list: Field[] = [];
      for (const f of doc.getForm().getFields()) {
        const name = f.getName();
        if (f instanceof PDFTextField) list.push({ kind: 'text', name, value: f.getText() ?? '', multiline: f.isMultiline() });
        else if (f instanceof PDFCheckBox) list.push({ kind: 'check', name, value: f.isChecked() });
        else if (f instanceof PDFDropdown) list.push({ kind: 'choice', name, value: f.getSelected()[0] ?? '', options: f.getOptions() });
        else if (f instanceof PDFOptionList) list.push({ kind: 'choice', name, value: f.getSelected()[0] ?? '', options: f.getOptions() });
        else if (f instanceof PDFRadioGroup) list.push({ kind: 'choice', name, value: f.getSelected() ?? '', options: f.getOptions() });
      }
      setFields(list);
    })().catch(() => setFields([]));
  }, [file]);

  const set = (i: number, value: string | boolean) => setFields((fs) => fs!.map((f, k) => (k === i ? ({ ...f, value } as Field) : f)));

  const run = async () => {
    const doc = await PDFDocument.load(await file!.arrayBuffer(), { ignoreEncryption: true });
    const form = doc.getForm();
    for (const f of fields ?? []) {
      const field = form.getField(f.name);
      if (f.kind === 'text' && field instanceof PDFTextField) field.setText(f.value);
      if (f.kind === 'check' && field instanceof PDFCheckBox) (f.value ? field.check() : field.uncheck());
      if (f.kind === 'choice' && f.value) {
        if (field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) field.select(f.value);
      }
    }
    if (lock) form.flatten();
    return [pdfFile(await doc.save(), withSuffix(file!.name, 'compilato'))];
  };

  const pretty = (n: string) => n.replace(/[_.]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');

  return (
    <PdfShell
      file={file}
      setFile={setFile}
      run={run}
      disabled={!fields?.length}
      actionLabel={pt.forms.save}
      actionIcon="material-symbols:edit-document-outline-rounded"
      options={
        fields && (
          <Box>
            {fields.length === 0 ? (
              <Alert severity="info">{pt.forms.noFields}</Alert>
            ) : (
              <>
                <Typography fontWeight={600} mb={1}>
                  {pt.forms.fields} ({fields.length})
                </Typography>
                <Box sx={{ maxHeight: 480, overflow: 'auto', pr: 1 }}>
                  {fields.map((f, i) =>
                    f.kind === 'text' ? (
                      <TextField key={f.name} fullWidth size="small" margin="dense" label={pretty(f.name)} value={f.value} multiline={f.multiline} onChange={(e) => set(i, e.target.value)} />
                    ) : f.kind === 'check' ? (
                      <FormControlLabel key={f.name} sx={{ display: 'flex' }} control={<Checkbox checked={f.value} onChange={(e) => set(i, e.target.checked)} />} label={pretty(f.name)} />
                    ) : (
                      <TextField key={f.name} select fullWidth size="small" margin="dense" label={pretty(f.name)} value={f.value} onChange={(e) => set(i, e.target.value)}>
                        {f.options.map((o) => (
                          <MenuItem key={o} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </TextField>
                    )
                  )}
                </Box>
                <FormControlLabel control={<Switch checked={lock} onChange={(e) => setLock(e.target.checked)} />} label={pt.forms.lock} />
              </>
            )}
          </Box>
        )
      }
    />
  );
}
