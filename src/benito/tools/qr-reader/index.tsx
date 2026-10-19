// BenitoTools: Leggi QR (fotocamera o immagine).
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { ToolComponentProps } from '@tools/defineTool';
import { useBt } from '../../strings';
import { decode, parse, Parsed } from './decode';
import { takePendingFiles } from '../../sharedFiles';

const HIST_KEY = 'benito.qrHistory';
function loadHist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export default function QrReader(_props: ToolComponentProps) {
  const bt = useBt();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [hist, setHist] = useState<string[]>(loadHist);
  const [copied, setCopied] = useState(false);

  const found = (value: string) => {
    setRaw(value);
    setError(null);
    stop();
    navigator.vibrate?.(60);
    const h = [value, ...loadHist().filter((x) => x !== value)].slice(0, 10);
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(h));
    } catch {
      /* ignora */
    }
    setHist(h);
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const start = async () => {
    setRaw(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      setScanning(true);
    } catch {
      setError(bt.qr.cameraError);
    }
  };

  // collega lo stream al video e cerca un codice ~6 volte al secondo
  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return;
    const v = videoRef.current;
    v.srcObject = streamRef.current;
    v.play().catch(() => undefined);
    let alive = true;
    const loop = async () => {
      if (!alive) return;
      if (v.readyState >= 2) {
        const r = await decode(v).catch(() => null);
        if (r && alive) return found(r);
      }
      setTimeout(loop, 160);
    };
    loop();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  useEffect(() => () => stop(), []);

  const fromFile = async (file: File) => {
    setRaw(null);
    try {
      const bmp = await createImageBitmap(file);
      const r = await decode(bmp);
      if (r) found(r);
      else setError(bt.qr.notFound);
    } catch {
      setError(bt.qr.notFound);
    }
  };

  // immagine arrivata da "Condividi con BenitoTools"
  useEffect(() => {
    const f = takePendingFiles(['image/*'])[0];
    if (f) fromFile(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const p: Parsed | null = raw ? parse(raw) : null;

  return (
    <Box id="tool" mb={4}>
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
        {!scanning ? (
          <Button variant="contained" size="large" onClick={start} startIcon={<Icon icon="material-symbols:photo-camera-outline-rounded" />}>
            {raw ? bt.qr.scanAnother : bt.qr.camera}
          </Button>
        ) : (
          <Button color="error" variant="outlined" size="large" onClick={stop}>
            {bt.qr.stopCamera}
          </Button>
        )}
        <Button size="large" variant="outlined" onClick={() => fileRef.current?.click()} startIcon={<Icon icon="material-symbols:image-outline-rounded" />}>
          {bt.qr.fromImage}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) fromFile(f);
            e.target.value = '';
          }}
        />
      </Stack>

      {scanning && (
        <Box position="relative" maxWidth={480} borderRadius={3} overflow="hidden" mb={2} bgcolor="black">
          <video ref={videoRef} playsInline muted style={{ width: '100%', display: 'block' }} />
          <Box
            position="absolute"
            sx={{ inset: '18%', border: '3px solid rgba(255,255,255,.85)', borderRadius: 3, pointerEvents: 'none' }}
          />
          <Typography position="absolute" bottom={8} width="100%" textAlign="center" color="white" variant="body2">
            {bt.qr.pointCamera}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {p && raw && (
        <Card variant="outlined" sx={{ mb: 2, maxWidth: 640 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              {p.kind === 'wifi' ? bt.qr.wifi : p.kind === 'contact' ? bt.qr.contact : bt.qr.result}
            </Typography>
            {p.kind === 'wifi' ? (
              <Box>
                <Typography>
                  {bt.qr.network}: <b>{p.ssid}</b>
                </Typography>
                {p.password && (
                  <Typography>
                    {bt.qr.password}: <b>{p.password}</b>
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{raw}</Typography>
            )}
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
              {p.kind === 'url' && (
                <Button variant="contained" href={p.url} target="_blank" rel="noopener noreferrer" startIcon={<Icon icon="material-symbols:open-in-new-rounded" />}>
                  {bt.qr.open}
                </Button>
              )}
              {p.kind === 'email' && (
                <Button variant="contained" href={`mailto:${p.to}`}>
                  {bt.qr.open}
                </Button>
              )}
              {p.kind === 'tel' && (
                <Button variant="contained" href={`tel:${p.number}`}>
                  {bt.qr.open}
                </Button>
              )}
              <Button onClick={() => copy(p.kind === 'wifi' ? p.password : raw)} startIcon={<Icon icon="material-symbols:content-copy-outline-rounded" />}>
                {copied ? bt.qr.copied : p.kind === 'wifi' ? `${bt.qr.copy} ${bt.qr.password.toLowerCase()}` : bt.qr.copy}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {hist.length > 0 && (
        <Box maxWidth={640}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            {bt.qr.history}
          </Typography>
          <Stack spacing={0.5}>
            {hist.map((h) => (
              <Button key={h} variant="text" onClick={() => setRaw(h)} sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                <Typography noWrap variant="body2">
                  {h}
                </Typography>
              </Button>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
