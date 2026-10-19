import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ShareIcon from '@mui/icons-material/Share';
import { Icon } from '@iconify/react';
import { useBt } from '../../benito/strings';
import {
  canShareFiles,
  downloadFile,
  shareFiles,
  toStickerSource
} from '../../benito/share';
import { addToHistory } from '../../benito/history';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

export default function ResultFooter({
  handleDownload,
  handleCopy,
  disabled,
  hideCopy,
  downloadLabel,
  files
}: {
  handleDownload: () => void;
  handleCopy?: () => void;
  disabled?: boolean;
  hideCopy?: boolean;
  downloadLabel?: string;
  /** BenitoTools: file del risultato, per Condividi / Crea sticker */
  files?: File[];
}) {
  const { t } = useTranslation();
  const bt = useBt();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const shareable = (files ?? []).filter(Boolean);
  const images = shareable.filter((f) => f.type.startsWith('image/'));

  const handleShare = async (list: File[]) => {
    if (canShareFiles(list)) {
      await shareFiles(list);
    } else {
      for (const f of list) {
        downloadFile(f, f.name);
        await addToHistory(f);
      }
      showSnackBar(bt.result.shareUnsupported, 'success');
    }
  };

  const handleSticker = async () => {
    const converted = await Promise.all(images.map(toStickerSource));
    showSnackBar(bt.result.stickerHint, 'success');
    await handleShare(converted);
  };
  return (
    <Stack mt={1} direction={'row'} spacing={1} flexWrap={'wrap'} useFlexGap>
      <Button
        disabled={disabled}
        onClick={handleDownload}
        startIcon={<DownloadIcon />}
      >
        {downloadLabel || t('resultFooter.download')}
      </Button>
      {shareable.length > 0 && (
        <Button
          disabled={disabled}
          onClick={() => handleShare(shareable)}
          startIcon={<ShareIcon />}
        >
          {bt.result.share}
        </Button>
      )}
      {images.length > 0 && (
        <Button
          disabled={disabled}
          onClick={handleSticker}
          startIcon={<Icon icon="fluent:sticker-24-regular" />}
        >
          {bt.result.sticker}
        </Button>
      )}
      {!hideCopy && (
        <Button
          disabled={disabled}
          onClick={handleCopy}
          startIcon={<ContentPasteIcon />}
        >
          {t('resultFooter.copy')}
        </Button>
      )}
    </Stack>
  );
}
