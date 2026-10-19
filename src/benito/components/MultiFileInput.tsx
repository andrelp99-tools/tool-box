// BenitoTools: input generico per più file di qualsiasi tipo (stile OmniTools).
import React, { useRef } from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import InputHeader from '@components/InputHeader';
import InputFooter from '@components/input/InputFooter';
import useFileDrop from '../../hooks/useFileDrop';
import { formatBytes } from '../history';

function iconFor(f: File) {
  if (f.type.startsWith('image/')) return 'material-symbols:image-outline-rounded';
  if (f.type.startsWith('video/')) return 'material-symbols:movie-outline-rounded';
  if (f.type.startsWith('audio/')) return 'material-symbols:music-note-rounded';
  return 'material-symbols:draft-outline-rounded';
}

export default function MultiFileInput({
  value,
  onChange,
  accept,
  title
}: {
  value: File[];
  onChange: (files: File[]) => void;
  accept: string[];
  title: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const ref = useRef<HTMLInputElement>(null);
  const { isDragging, dropHandlers, addFiles } = useFileDrop({
    accept,
    onFiles: (files) => onChange([...value, ...files])
  });

  return (
    <Box>
      <InputHeader title={title} />
      <Box
        {...dropHandlers}
        onClick={value.length ? undefined : () => ref.current?.click()}
        sx={{
          width: '100%',
          height: 300,
          overflow: 'auto',
          borderRadius: 2,
          boxShadow: '5',
          bgcolor: 'background.paper',
          border: 1,
          borderStyle: isDragging ? 'dashed' : 'solid',
          borderColor: isDragging ? theme.palette.primary.main : 'divider',
          cursor: value.length ? undefined : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: value.length ? 'flex-start' : 'center',
          p: 1
        }}
      >
        {value.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" px={2}>
            {isDragging
              ? t('toolMultipleInput.dropFilesHere')
              : t('toolMultipleInput.selectFilesDescription')}
          </Typography>
        ) : (
          value.map((f, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Icon icon={iconFor(f)} fontSize={24} />
              <Box flexGrow={1} minWidth={0}>
                <Typography noWrap variant="body2" fontWeight={600}>
                  {f.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(f.size)}
                </Typography>
              </Box>
              <IconButton
                size="small"
                aria-label={t('toolMultipleInput.deleteFile')}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >
                <Icon icon="material-symbols:close-rounded" />
              </IconButton>
            </Box>
          ))
        )}
      </Box>
      <InputFooter handleImport={() => ref.current?.click()} handleClear={() => onChange([])} />
      <input
        ref={ref}
        type="file"
        multiple
        accept={accept.join(',')}
        style={{ display: 'none' }}
        onChange={async (e) => {
          if (e.target.files) await addFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </Box>
  );
}
