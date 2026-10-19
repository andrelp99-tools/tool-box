// BenitoTools: pagina "File ricevuti" (da "Condividi con BenitoTools" o da "Apri con…"
// nella cronologia). Mostra i file e gli strumenti adatti al loro tipo.
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBt } from '../strings';
import { tools } from '../../tools';
import { DefinedTool } from '../../tools/defineTool';
import { validNamespaces } from '../../i18n';
import { ALL_DOC_INPUT } from '../docs/convert';
import {
  cleanupShared,
  deleteSharedEntry,
  getSharedEntry,
  setPendingFiles,
  setPendingText,
  takePendingFiles
} from '../sharedFiles';

type Kind =
  | 'image'
  | 'gif'
  | 'png'
  | 'jpeg'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'text'
  | 'doc'
  | 'other';

function kindsOf(file: File): Kind[] {
  const t = file.type;
  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  if (t === 'image/gif' || ext === 'gif') return ['image', 'gif'];
  if (t === 'image/png' || ext === 'png') return ['image', 'png'];
  if (t === 'image/jpeg' || ext === 'jpg' || ext === 'jpeg')
    return ['image', 'jpeg'];
  if (t.startsWith('image/') || ['heic', 'heif', 'webp', 'bmp'].includes(ext))
    return ['image'];
  if (t.startsWith('video/')) return ['video'];
  if (t.startsWith('audio/')) return ['audio'];
  if (t === 'application/pdf' || ext === 'pdf') return ['pdf'];
  const doc = ALL_DOC_INPUT.includes(ext);
  if (
    t.startsWith('text/') ||
    ['txt', 'csv', 'json', 'xml', 'md', 'tsv'].includes(ext)
  )
    return doc ? ['text', 'doc'] : ['text'];
  if (doc) return ['doc'];
  return ['other'];
}

/** Quale tipo di file accetta ogni strumento (in base a categoria e percorso). */
function toolAccepts(tool: DefinedTool): Kind[] {
  const p = tool.path;
  switch (tool.type) {
    case 'image-generic':
      return p.endsWith('qr-code')
        ? []
        : p.includes('image-to-text')
          ? ['png', 'jpeg']
          : ['image'];
    case 'png':
      return p.includes('jgp-to-png') || p.includes('jpg-to-png')
        ? ['jpeg']
        : ['png'];
    case 'gif':
      return p.includes('images-to-gif') ? ['image'] : ['gif'];
    case 'video':
      return ['video'];
    case 'audio':
      return p.includes('extract-audio') ? ['video'] : ['audio'];
    case 'pdf':
      if (p.includes('office-in-pdf')) return ['doc'];
      return p.includes('convert-to-pdf') || p.includes('scansione')
        ? ['image']
        : ['pdf'];
    case 'converters':
      if (p.includes('converti'))
        return ['image', 'audio', 'video', 'doc', 'pdf'];
      if (p.includes('audio')) return ['audio'];
      if (p.includes('video')) return ['video'];
      return ['image'];
    case 'string':
    case 'list':
    case 'json':
    case 'csv':
    case 'xml':
      return ['text'];
    default:
      return [];
  }
}

export default function SharePage() {
  const bt = useBt();
  const { t } = useTranslation(validNamespaces);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [files, setFiles] = useState<File[] | null>(null);
  const [text, setText] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    cleanupShared().catch(() => undefined);
    const id = params.get('id');
    if (id) {
      getSharedEntry(id)
        .then(async (entry) => {
          setFiles(entry?.files ?? []);
          setText(entry?.text ?? '');
          if (entry) await deleteSharedEntry(id);
        })
        .catch(() => setFiles([]));
    } else {
      setFiles(takePendingFiles(['*']));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kinds = useMemo(() => {
    const k = new Set<Kind>();
    files?.forEach((f) => kindsOf(f).forEach((x) => k.add(x)));
    if (text && (!files || files.length === 0)) k.add('text');
    return k;
  }, [files, text]);

  const matching = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tools
      .filter((tool) => toolAccepts(tool).some((k) => kinds.has(k)))
      .filter((tool) => !q || t(tool.name).toLowerCase().includes(q));
  }, [kinds, search, t]);

  const open = (tool: DefinedTool) => {
    if (files && files.length > 0) setPendingFiles(files);
    if (text) setPendingText(text);
    navigate('/' + tool.path);
  };

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="center"
      p={{ xs: 2, md: 4 }}
    >
      <Helmet title={`${bt.share.title} - BenitoTools`} />
      <Box width={{ xs: '100%', md: '80%', lg: '60%' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <IconButton onClick={() => navigate('/')} aria-label={bt.common.back}>
            <Icon icon="material-symbols:arrow-back-rounded" />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            {bt.share.title}
          </Typography>
        </Stack>

        {files === null ? (
          <Box textAlign="center" mt={6}>
            <CircularProgress />
          </Box>
        ) : files.length === 0 && !text ? (
          <Typography color="text.secondary" mt={4} textAlign="center">
            {bt.share.nothing}
          </Typography>
        ) : (
          <>
            <Typography color="text.secondary" mb={1}>
              {bt.share.subtitle}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
              {files.map((f, i) => (
                <Chip
                  key={i}
                  label={f.name}
                  icon={<Icon icon="material-symbols:draft-outline-rounded" />}
                />
              ))}
              {text && (
                <Chip
                  label={`${bt.share.textReceived}: ${text.slice(0, 40)}${
                    text.length > 40 ? '…' : ''
                  }`}
                  icon={<Icon icon="material-symbols:notes-rounded" />}
                />
              )}
            </Stack>
            <TextField
              fullWidth
              size="small"
              placeholder={bt.share.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />
            {matching.length === 0 ? (
              <Typography color="text.secondary">{bt.share.noTools}</Typography>
            ) : (
              <Grid container spacing={1.5}>
                {matching.map((tool) => (
                  <Grid item xs={12} sm={6} key={tool.path}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardActionArea
                        onClick={() => open(tool)}
                        sx={{ p: 1.5, height: '100%' }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Icon icon={tool.icon} fontSize={28} />
                          <Box minWidth={0}>
                            <Typography fontWeight={600}>
                              {t(tool.name)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t(tool.shortDescription)}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
