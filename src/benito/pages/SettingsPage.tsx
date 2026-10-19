// BenitoTools: pagina Impostazioni.
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Link,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBt } from '../strings';
import { isHistoryEnabled, setHistoryEnabled } from '../settings';
import { formatBytes, listHistory, onHistoryChange } from '../history';
import { canInstall, isStandalone, onInstallChange, promptInstall } from '../install';
import { getThemeMode, setThemeMode, ThemeMode } from '../theme';

const REPO_URL = 'https://github.com/andrelp99-tools/tool-box';

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} py={1.5}>
      <Box flexGrow={1} minWidth={0}>
        <Typography fontWeight={600}>{title}</Typography>
        {desc && (
          <Typography variant="body2" color="text.secondary">
            {desc}
          </Typography>
        )}
      </Box>
      <Box flexShrink={0}>{children}</Box>
    </Stack>
  );
}

export default function SettingsPage() {
  const bt = useBt();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState(isHistoryEnabled());
  const [used, setUsed] = useState<number | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getThemeMode());
  const [, refresh] = useState(0);

  useEffect(() => {
    const load = () =>
      listHistory()
        .then((l) => setUsed(l.reduce((a, b) => a + b.size, 0)))
        .catch(() => setUsed(0));
    load();
    const off1 = onHistoryChange(load);
    const off2 = onInstallChange(() => refresh((n) => n + 1));
    return () => {
      off1();
      off2();
    };
  }, []);

  return (
    <Box width="100%" display="flex" justifyContent="center" p={{ xs: 2, md: 4 }}>
      <Helmet title={`${bt.settings.title} - BenitoTools`} />
      <Box width={{ xs: '100%', md: '70%', lg: '50%' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <IconButton onClick={() => navigate('/')} aria-label={bt.common.back}>
            <Icon icon="material-symbols:arrow-back-rounded" />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            {bt.settings.title}
          </Typography>
        </Stack>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Row title={bt.settings.language}>
              <Select
                size="small"
                value={i18n.language?.startsWith('en') ? 'en' : 'it'}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value);
                  localStorage.setItem('lang', e.target.value);
                }}
              >
                <MenuItem value="it">Italiano</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </Row>
            <Row title={bt.settings.theme}>
              <Select
                size="small"
                value={theme}
                onChange={(e) => {
                  const v = e.target.value as ThemeMode;
                  setTheme(v);
                  setThemeMode(v);
                }}
              >
                <MenuItem value="system">{bt.settings.themeSystem}</MenuItem>
                <MenuItem value="light">{bt.settings.themeLight}</MenuItem>
                <MenuItem value="dark">{bt.settings.themeDark}</MenuItem>
              </Select>
            </Row>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Row title={bt.settings.history} desc={bt.settings.historyDesc}>
              <Switch
                checked={history}
                onChange={(e) => {
                  setHistory(e.target.checked);
                  setHistoryEnabled(e.target.checked);
                }}
              />
            </Row>
            <Row title={bt.settings.storage}>
              <Button size="small" onClick={() => navigate('/cronologia')}>
                {used === null ? '…' : formatBytes(used)}
              </Button>
            </Row>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Row
              title={bt.settings.install}
              desc={
                isStandalone()
                  ? bt.settings.installed
                  : canInstall()
                    ? bt.settings.installDesc
                    : bt.settings.installManual
              }
            >
              {!isStandalone() && canInstall() && (
                <Button variant="contained" onClick={() => promptInstall()}>
                  {bt.settings.install.split(' ')[0]}
                </Button>
              )}
            </Row>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography fontWeight={600} mb={1}>
              {bt.settings.about}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {bt.settings.aboutText}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {bt.settings.version}: {__APP_VERSION__} ({__COMMIT_HASH__}) ·{' '}
              <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
                {bt.settings.source}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
