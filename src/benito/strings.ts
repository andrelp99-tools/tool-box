// BenitoTools: testi delle parti aggiunte (italiano + inglese), separati dai file
// di traduzione di OmniTools per non creare conflitti negli aggiornamenti.
import { useTranslation } from 'react-i18next';

const it = {
  history: {
    title: 'Cronologia',
    subtitle: 'Gli ultimi 30 file che hai scaricato o condiviso. Restano solo su questo dispositivo.',
    empty: 'Nessun file ancora. I file che scarichi o condividi compariranno qui.',
    disabled: 'La cronologia è spenta. Puoi riattivarla nelle impostazioni.',
    clear: 'Svuota cronologia',
    clearConfirm: 'Eliminare tutti i file della cronologia?',
    download: 'Scarica',
    share: 'Condividi',
    delete: 'Elimina',
    openWith: 'Apri con…',
    from: 'da'
  },
  settings: {
    title: 'Impostazioni',
    language: 'Lingua',
    theme: 'Tema',
    themeLight: 'Chiaro',
    themeDark: 'Scuro',
    themeSystem: 'Come il sistema',
    history: 'Cronologia dei file',
    historyDesc: 'Salva sul dispositivo gli ultimi 30 file scaricati o condivisi (max 500 MB).',
    storage: 'Spazio usato',
    install: 'Installa BenitoTools',
    installDesc: 'Aggiungila alla schermata home: funziona anche offline e compare in "Condividi".',
    installed: 'App installata ✓',
    installManual: 'Da Chrome: menu ⋮ → "Aggiungi a schermata Home" / "Installa app".',
    about: 'Informazioni',
    aboutText:
      'BenitoTools è un fork personale di OmniTools (MIT) con parti ispirate a VERT, BentoPDF, Mini QR e Simon Willison tools. Tutto funziona nel browser: i file non lasciano il dispositivo.',
    source: 'Codice su GitHub',
    version: 'Versione'
  },
  share: {
    title: 'File ricevuti',
    subtitle: 'Scegli cosa fare con:',
    nothing: 'Nessun file ricevuto. Usa "Condividi" da un\'altra app e scegli BenitoTools.',
    noTools: 'Nessuno strumento adatto a questo tipo di file.',
    searchPlaceholder: 'Cerca uno strumento',
    textReceived: 'Testo ricevuto',
    textTools: 'Strumenti per il testo'
  },
  result: {
    share: 'Condividi',
    sticker: 'Crea sticker',
    stickerHint: 'Nel menu Condividi scegli BenitoSticker',
    shareUnsupported: 'Condivisione non supportata da questo browser: il file è stato scaricato.',
    downloadZip: 'Scarica tutto (ZIP)'
  },
  home: {
    favorites: 'Preferiti',
    recent: 'Usati di recente',
    favoritesHint: 'Tocca ☆ su uno strumento per aggiungerlo ai preferiti'
  },
  common: {
    cancel: 'Annulla',
    confirm: 'Conferma',
    back: 'Indietro',
    useTool: 'Usa lo strumento',
    allTools: 'Tutti gli strumenti'
  }
};

type Dict = typeof it;

const en: Dict = {
  history: {
    title: 'History',
    subtitle: 'The last 30 files you downloaded or shared. They stay on this device only.',
    empty: 'No files yet. Files you download or share will appear here.',
    disabled: 'History is turned off. You can turn it back on in settings.',
    clear: 'Clear history',
    clearConfirm: 'Delete all files in history?',
    download: 'Download',
    share: 'Share',
    delete: 'Delete',
    openWith: 'Open with…',
    from: 'from'
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    history: 'File history',
    historyDesc: 'Keep the last 30 downloaded or shared files on this device (max 500 MB).',
    storage: 'Storage used',
    install: 'Install BenitoTools',
    installDesc: 'Add it to your home screen: works offline and appears in "Share".',
    installed: 'App installed ✓',
    installManual: 'In Chrome: menu ⋮ → "Add to Home screen" / "Install app".',
    about: 'About',
    aboutText:
      'BenitoTools is a personal fork of OmniTools (MIT) with parts inspired by VERT, BentoPDF, Mini QR and Simon Willison tools. Everything runs in the browser: files never leave your device.',
    source: 'Source on GitHub',
    version: 'Version'
  },
  share: {
    title: 'Received files',
    subtitle: 'Choose what to do with:',
    nothing: 'No files received. Use "Share" from another app and pick BenitoTools.',
    noTools: 'No tool fits this file type.',
    searchPlaceholder: 'Search a tool',
    textReceived: 'Received text',
    textTools: 'Text tools'
  },
  result: {
    share: 'Share',
    sticker: 'Make sticker',
    stickerHint: 'In the Share menu pick BenitoSticker',
    shareUnsupported: 'Sharing not supported by this browser: the file was downloaded.',
    downloadZip: 'Download all (ZIP)'
  },
  home: {
    favorites: 'Favorites',
    recent: 'Recently used',
    favoritesHint: 'Tap ☆ on a tool to add it to favorites'
  },
  common: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    useTool: 'Use this tool',
    allTools: 'All tools'
  }
};

export function benitoStrings(lang: string | undefined): Dict {
  return lang?.startsWith('en') ? en : it;
}

/** Hook: testi Benito nella lingua attuale (si aggiorna al cambio lingua). */
export function useBt(): Dict {
  const { i18n } = useTranslation();
  return benitoStrings(i18n.language);
}
