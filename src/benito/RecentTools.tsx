// BenitoTools: "Usati di recente" nella home.
import React, { useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tools } from '../tools';
import { validNamespaces } from '../i18n';
import { getRecentToolPaths } from './currentTool';
import { useBt } from './strings';

export default function RecentTools() {
  const bt = useBt();
  const { t } = useTranslation(validNamespaces);
  const navigate = useNavigate();
  const recent = useMemo(
    () =>
      getRecentToolPaths()
        .map((p) => tools.find((tool) => tool.path === p))
        .filter((x): x is (typeof tools)[number] => !!x),
    []
  );
  if (recent.length === 0) return null;
  return (
    <Box width={{ xs: '90%', md: '80%', lg: '60%' }} mt={2}>
      <Typography variant="subtitle2" color="text.secondary" mb={1}>
        {bt.home.recent}
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {recent.map((tool) => (
          <Chip
            key={tool.path}
            icon={<Icon icon={tool.icon} />}
            label={t(tool.name)}
            onClick={() => navigate('/' + tool.path)}
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );
}
