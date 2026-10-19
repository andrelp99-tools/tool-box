// BenitoTools: opzioni di stile per il generatore QR (punti, angoli, logo al centro).
import React, { useRef } from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useBt } from '../../strings';

interface Values {
  dotStyle?: string;
  cornerStyle?: string;
  logo?: string;
}

export function QrStyleOptions({
  values,
  updateField
}: {
  values: Values;
  updateField: (name: any, value: any) => void;
}) {
  const bt = useBt();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Box>
      <Typography variant="body2" fontWeight={600} mb={1}>
        {bt.qrStyle.title}
      </Typography>
      <TextField select fullWidth margin="dense" label={bt.qrStyle.dots} value={values.dotStyle ?? 'square'} onChange={(e) => updateField('dotStyle', e.target.value)}>
        <MenuItem value="square">{bt.qrStyle.square}</MenuItem>
        <MenuItem value="dots">{bt.qrStyle.dotsOpt}</MenuItem>
        <MenuItem value="rounded">{bt.qrStyle.rounded}</MenuItem>
        <MenuItem value="extra-rounded">{bt.qrStyle.extraRounded}</MenuItem>
        <MenuItem value="classy">{bt.qrStyle.classy}</MenuItem>
        <MenuItem value="classy-rounded">{bt.qrStyle.classyRounded}</MenuItem>
      </TextField>
      <TextField select fullWidth margin="dense" label={bt.qrStyle.corners} value={values.cornerStyle ?? 'square'} onChange={(e) => updateField('cornerStyle', e.target.value)}>
        <MenuItem value="square">{bt.qrStyle.square}</MenuItem>
        <MenuItem value="dot">{bt.qrStyle.circle}</MenuItem>
        <MenuItem value="extra-rounded">{bt.qrStyle.rounded}</MenuItem>
      </TextField>
      <Stack direction="row" spacing={1} alignItems="center" mt={1}>
        {values.logo && <img src={values.logo} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />}
        <Button size="small" variant="outlined" onClick={() => ref.current?.click()}>
          {values.logo ? bt.qrStyle.changeLogo : bt.qrStyle.addLogo}
        </Button>
        {values.logo && (
          <Button size="small" onClick={() => updateField('logo', '')}>
            ✕
          </Button>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {bt.qrStyle.logoHint}
      </Typography>
      <input
        ref={ref}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => updateField('logo', String(r.result));
          r.readAsDataURL(f);
          e.target.value = '';
        }}
      />
    </Box>
  );
}
