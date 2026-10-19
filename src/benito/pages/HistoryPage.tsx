// BenitoTools: pagina Cronologia.
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useBt } from '../strings';
import {
  clearHistory,
  deleteHistoryItem,
  formatBytes,
  HistoryItem,
  listHistory,
  onHistoryChange
} from '../history';
import { isHistoryEnabled } from '../settings';
import { canShareFiles, downloadFile, shareFiles } from '../share';
import { setPendingFiles } from '../sharedFiles';

function iconFor(type: string) {
  if (type.startsWith('image/')) return 'material-symbols:image-outline-rounded';
  if (type.startsWith('video/')) return 'material-symbols:movie-outline-rounded';
  if (type.startsWith('audio/')) return 'material-symbols:music-note-rounded';
  if (type === 'application/pdf') return 'material-symbols:picture-as-pdf-outline-rounded';
  if (type.includes('zip')) return 'material-symbols:folder-zip-outline-rounded';
  return 'material-symbols:draft-outline-rounded';
}

function Thumb({ item }: { item: HistoryItem }) {
  const url = useMemo(
    () => (item.type.startsWith('image/') ? URL.createObjectURL(item.blob) : null),
    [item]
  );
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return (
    <Box
      sx={{
        width: 64,
        height: 64,
        flexShrink: 0,
        borderRadius: 2,
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {url ? (
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Icon icon={iconFor(item.type)} fontSize={32} />
      )}
    </Box>
  );
}

export default function HistoryPage() {
  const bt = useBt();
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [confirm, setConfirm] = useState(false);
  const enabled = isHistoryEnabled();

  useEffect(() => {
    const load = () => listHistory().then(setItems).catch(() => setItems([]));
    load();
    const off = onHistoryChange(load);
    return () => {
      off();
    };
  }, []);

  const asFile = (it: HistoryItem) => new File([it.blob], it.name, { type: it.type });

  return (
    <Box width="100%" display="flex" justifyContent="center" p={{ xs: 2, md: 4 }}>
      <Helmet title={`${bt.history.title} - BenitoTools`} />
      <Box width={{ xs: '100%', md: '70%', lg: '50%' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <IconButton onClick={() => navigate('/')} aria-label={bt.common.back}>
            <Icon icon="material-symbols:arrow-back-rounded" />
          </IconButton>
          <Typography variant="h5" fontWeight={700} flexGrow={1}>
            {bt.history.title}
          </Typography>
          {items && items.length > 0 && (
            <Button color="error" onClick={() => setConfirm(true)}>
              {bt.history.clear}
            </Button>
          )}
        </Stack>
        <Typography color="text.secondary" mb={2}>
          {enabled ? bt.history.subtitle : bt.history.disabled}
        </Typography>
        {items && items.length === 0 && (
          <Typography color="text.secondary" textAlign="center" mt={6}>
            {bt.history.empty}
          </Typography>
        )}
        <Stack spacing={1.5}>
          {items?.map((it) => (
            <Card key={it.id} variant="outlined">
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', pb: 0 }}>
                <Thumb item={it} />
                <Box minWidth={0}>
                  <Typography fontWeight={600} noWrap title={it.name}>
                    {it.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatBytes(it.size)} · {new Date(it.date).toLocaleString()}
                  </Typography>
                  {it.toolName && (
                    <Typography variant="caption" color="text.secondary">
                      {bt.history.from} {it.toolName}
                    </Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  startIcon={<Icon icon="material-symbols:download-rounded" />}
                  onClick={() => downloadFile(it.blob, it.name)}
                >
                  {bt.history.download}
                </Button>
                {canShareFiles([asFile(it)]) && (
                  <Button
                    size="small"
                    startIcon={<Icon icon="material-symbols:share-outline" />}
                    onClick={() => shareFiles([asFile(it)])}
                  >
                    {bt.history.share}
                  </Button>
                )}
                <Button
                  size="small"
                  startIcon={<Icon icon="material-symbols:open-in-new-rounded" />}
                  onClick={() => {
                    setPendingFiles([asFile(it)]);
                    navigate('/condividi?from=history');
                  }}
                >
                  {bt.history.openWith}
                </Button>
                <Box flexGrow={1} />
                <IconButton
                  size="small"
                  aria-label={bt.history.delete}
                  onClick={() => deleteHistoryItem(it.id)}
                >
                  <Icon icon="material-symbols:delete-outline-rounded" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Box>
      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>{bt.history.clearConfirm}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>{bt.common.cancel}</Button>
          <Button
            color="error"
            onClick={async () => {
              await clearHistory();
              setConfirm(false);
            }}
          >
            {bt.common.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
