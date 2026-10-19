// BenitoTools: pezzi di interfaccia comuni agli strumenti per documenti.
import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { useBt } from '../strings';
import { ENGINE_MB, ENGINE_URL, EngineName } from './engines';
import { NotIsolatedError } from './libreoffice';
import { NoTablesError } from './pymupdf';
import { SameFormatError } from './convert';

type Bt = ReturnType<typeof useBt>;

// Un file per motore: se è in cache, il motore è già stato scaricato.
const PROBE: Record<EngineName, string> = {
  libreoffice: `${ENGINE_URL.libreoffice}soffice.wasm.gz`,
  pymupdf: `${ENGINE_URL.pymupdf}assets/pyodide.asm.wasm`,
  pandoc: ENGINE_URL.pandoc
};

async function isCached(name: EngineName) {
  try {
    if (!('caches' in self)) return false;
    return !!(await caches.match(new URL(PROBE[name], location.href).href));
  } catch {
    return false;
  }
}

/** Avviso "al primo uso scarica ~N MB" solo per i motori non ancora scaricati. */
export function EngineNotice({ engines }: { engines: EngineName[] }) {
  const bt = useBt();
  const [missing, setMissing] = useState<EngineName[]>([]);
  const key = [...new Set(engines)].sort().join(',');
  useEffect(() => {
    let alive = true;
    const list = key ? (key.split(',') as EngineName[]) : [];
    Promise.all(list.map(async (n) => ((await isCached(n)) ? null : n))).then(
      (r) => {
        if (alive) setMissing(r.filter((x): x is EngineName => !!x));
      }
    );
    return () => {
      alive = false;
    };
  }, [key]);
  if (!missing.length) return null;
  return (
    <>
      {missing.map((n) => (
        <Typography
          key={n}
          variant="caption"
          color="text.secondary"
          display="block"
        >
          {bt.docs.firstUse
            .replace('{name}', bt.docs.engine[n])
            .replace('{mb}', String(ENGINE_MB[n]))}
        </Typography>
      ))}
    </>
  );
}

export function docErrorText(e: unknown, bt: Bt) {
  if (e instanceof NotIsolatedError) return bt.docs.notIsolated;
  if (e instanceof NoTablesError) return bt.docs.noTables;
  if (e instanceof SameFormatError) return bt.docs.sameFormat;
  const msg = (e as Error)?.message ?? String(e);
  return msg;
}

export function formatLabel(ext: string, bt: Bt) {
  return bt.docs.formats[ext] ?? ext.toUpperCase();
}
