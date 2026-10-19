import React from 'react';
import { Box, TextField } from '@mui/material';

/** Selettore colore semplice (input nativo). */
export default function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Box display="flex" alignItems="center" gap={1} mb={1}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 44, height: 36, border: 'none', background: 'none' }} />
      <TextField size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} sx={{ width: 140 }} />
    </Box>
  );
}

export function hexToRgb01(hex: string) {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16) / 255, g: parseInt(m[2], 16) / 255, b: parseInt(m[3], 16) / 255 };
}
