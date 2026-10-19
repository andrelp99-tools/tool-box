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
  convert: {
    input: 'File da convertire',
    images: 'Immagini',
    audio: 'Audio',
    videos: 'Video',
    to: 'Converti in',
    videoAudioHint: 'Scegli un formato audio per estrarre solo l\'audio dal video',
    quality: 'Qualità',
    qualityLow: 'Bassa (file piccolo)',
    qualityMedium: 'Media',
    qualityHigh: 'Alta',
    imageQualityDesc: 'Per JPG, WebP, AVIF, HEIC: valori più bassi = file più piccoli',
    maxSide: 'Lato lungo massimo (pixel)',
    maxSideDesc: 'Vuoto = dimensione originale',
    strip: 'Rimuovi dati personali (EXIF, GPS)',
    options: 'Opzioni di conversione',
    convert: 'Converti',
    converting: 'Conversione in corso…',
    cancel: 'Interrompi',
    done: 'Fatto',
    failed: 'Non riuscito',
    unsupported: 'Tipo di file non supportato',
    result: 'File convertiti',
    empty: 'Aggiungi dei file e tocca Converti',
    firstImage: 'Al primo uso viene scaricato il motore per le immagini (~15 MB), poi funziona offline.',
    noWebCodecs: 'Questo browser non supporta la conversione audio/video sul dispositivo (serve Chrome recente).'
  },
  qr: {
    camera: 'Usa la fotocamera',
    stopCamera: 'Ferma fotocamera',
    fromImage: 'Da un\'immagine',
    pointCamera: 'Inquadra il codice QR',
    notFound: 'Nessun codice trovato in questa immagine. Prova con una foto più nitida o più vicina.',
    cameraError: 'Fotocamera non disponibile. Controlla i permessi del browser.',
    result: 'Contenuto',
    open: 'Apri',
    copy: 'Copia',
    copied: 'Copiato',
    wifi: 'Rete WiFi',
    network: 'Nome rete',
    password: 'Password',
    contact: 'Contatto',
    history: 'Letti di recente',
    scanAnother: 'Leggi un altro'
  },
  photo: {
    input: 'Foto',
    detect: 'Trova volti',
    detecting: 'Cerco i volti…',
    found: 'Volti trovati',
    none: 'Nessun volto trovato: disegna a mano le aree da coprire.',
    detectError: 'Rilevamento automatico non disponibile: disegna a mano le aree da coprire.',
    draw: 'Disegna un rettangolo sopra la foto per coprire un\'altra area. Tocca un rettangolo per toglierlo.',
    style: 'Effetto',
    blur: 'Sfoca',
    pixel: 'Pixel',
    black: 'Nero',
    strength: 'Intensità',
    padding: 'Margine attorno ai volti',
    maxSide: 'Dimensione massima',
    original: 'Originale',
    save: 'Crea copia pulita',
    clean: 'Copia pulita: nessun dato EXIF/GPS, nome file neutro.',
    metadataFound: 'Dati nascosti trovati in questa foto',
    gps: 'Posizione GPS',
    camera: 'Dispositivo',
    date: 'Data scatto',
    noMetadata: 'Nessun dato nascosto evidente (verrà comunque ripulita).',
    clear: 'Togli tutte le aree',
    result: 'Foto protetta'
  },
  social: {
    input: 'Foto',
    preset: 'Formato',
    custom: 'Libero',
    output: 'Risultato',
    hint: 'Trascina e ridimensiona il riquadro per scegliere la parte visibile.',
    fill: 'Sfondo per foto troppo piccole',
    result: 'Foto ritagliata',
    crop: 'Ritaglia'
  },
  vcomp: {
    input: 'Video',
    mode: 'Modalità',
    bySize: 'Dimensione massima',
    byQuality: 'Qualità',
    target: 'Dimensione obiettivo',
    targetCustom: 'MB personalizzati',
    resolution: 'Risoluzione massima',
    original: 'Originale',
    audio: 'Audio',
    keepAudio: 'Mantieni audio',
    compress: 'Comprimi',
    compressing: 'Compressione…',
    info: 'Durata {d} · {w}×{h} · {s}',
    result: 'Video compresso',
    before: 'Prima',
    after: 'Dopo',
    tooSmall: 'Dimensione troppo piccola per questa durata: aumenta i MB o riduci la risoluzione.',
    failed: 'Compressione non riuscita',
    alreadySmall: 'Il video è già più leggero di così: tieni l\'originale.'
  },
  ocr: {
    options: 'Opzioni OCR',
    languageDesc: 'Lingua principale del testo nell\'immagine (migliora la precisione)',
    paragraphs: 'Riconosci i paragrafi',
    paragraphsDesc: 'Prova a mantenere la divisione in paragrafi del testo',
    input: 'Immagine',
    result: 'Testo estratto',
    error: 'Errore durante la lettura dell\'immagine',
    infoTitle: 'Immagine in testo (OCR)',
    info: 'Estrae il testo dalle immagini con il riconoscimento ottico dei caratteri. Carica un\'immagine con del testo, scegli la lingua e ottieni il testo. Funziona meglio con immagini nitide e ben contrastate. Al primo uso di una lingua viene scaricato il relativo modello.',
    languages: {
      eng: 'Inglese', fra: 'Francese', deu: 'Tedesco', spa: 'Spagnolo', ita: 'Italiano', por: 'Portoghese',
      rus: 'Russo', jpn: 'Giapponese', chi_sim: 'Cinese (semplificato)', chi_tra: 'Cinese (tradizionale)',
      kor: 'Coreano', ara: 'Arabo'
    }
  },
  qrStyle: {
    title: 'Stile',
    dots: 'Forma dei punti',
    corners: 'Forma degli angoli',
    square: 'Quadrati',
    dotsOpt: 'Puntini',
    rounded: 'Arrotondati',
    extraRounded: 'Molto arrotondati',
    classy: 'Eleganti',
    classyRounded: 'Eleganti arrotondati',
    circle: 'Cerchi',
    addLogo: 'Aggiungi logo',
    changeLogo: 'Cambia logo',
    logoHint: 'Il logo va al centro; la correzione errori passa in automatico al massimo.'
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
  convert: {
    input: 'Files to convert',
    images: 'Images',
    audio: 'Audio',
    videos: 'Videos',
    to: 'Convert to',
    videoAudioHint: 'Pick an audio format to extract only the audio from the video',
    quality: 'Quality',
    qualityLow: 'Low (small file)',
    qualityMedium: 'Medium',
    qualityHigh: 'High',
    imageQualityDesc: 'For JPG, WebP, AVIF, HEIC: lower values = smaller files',
    maxSide: 'Max long side (pixels)',
    maxSideDesc: 'Empty = original size',
    strip: 'Remove personal data (EXIF, GPS)',
    options: 'Conversion options',
    convert: 'Convert',
    converting: 'Converting…',
    cancel: 'Stop',
    done: 'Done',
    failed: 'Failed',
    unsupported: 'Unsupported file type',
    result: 'Converted files',
    empty: 'Add some files and tap Convert',
    firstImage: 'On first use the image engine (~15 MB) is downloaded, then it works offline.',
    noWebCodecs: 'This browser cannot convert audio/video on device (a recent Chrome is needed).'
  },
  qr: {
    camera: 'Use camera',
    stopCamera: 'Stop camera',
    fromImage: 'From a picture',
    pointCamera: 'Point at the QR code',
    notFound: 'No code found in this picture. Try a sharper or closer photo.',
    cameraError: 'Camera not available. Check the browser permissions.',
    result: 'Content',
    open: 'Open',
    copy: 'Copy',
    copied: 'Copied',
    wifi: 'WiFi network',
    network: 'Network name',
    password: 'Password',
    contact: 'Contact',
    history: 'Recently read',
    scanAnother: 'Scan another'
  },
  photo: {
    input: 'Photo',
    detect: 'Find faces',
    detecting: 'Looking for faces…',
    found: 'Faces found',
    none: 'No faces found: draw the areas to cover by hand.',
    detectError: 'Automatic detection not available: draw the areas to cover by hand.',
    draw: 'Draw a rectangle on the photo to cover another area. Tap a rectangle to remove it.',
    style: 'Effect',
    blur: 'Blur',
    pixel: 'Pixelate',
    black: 'Black',
    strength: 'Strength',
    padding: 'Margin around faces',
    maxSide: 'Maximum size',
    original: 'Original',
    save: 'Create clean copy',
    clean: 'Clean copy: no EXIF/GPS data, neutral file name.',
    metadataFound: 'Hidden data found in this photo',
    gps: 'GPS position',
    camera: 'Device',
    date: 'Date taken',
    noMetadata: 'No obvious hidden data (it will be cleaned anyway).',
    clear: 'Remove all areas',
    result: 'Protected photo'
  },
  social: {
    input: 'Photo',
    preset: 'Format',
    custom: 'Free',
    output: 'Output',
    hint: 'Drag and resize the frame to choose the visible part.',
    fill: 'Background for pictures that are too small',
    result: 'Cropped photo',
    crop: 'Crop'
  },
  vcomp: {
    input: 'Video',
    mode: 'Mode',
    bySize: 'Maximum size',
    byQuality: 'Quality',
    target: 'Target size',
    targetCustom: 'Custom MB',
    resolution: 'Maximum resolution',
    original: 'Original',
    audio: 'Audio',
    keepAudio: 'Keep audio',
    compress: 'Compress',
    compressing: 'Compressing…',
    info: 'Duration {d} · {w}×{h} · {s}',
    result: 'Compressed video',
    before: 'Before',
    after: 'After',
    tooSmall: 'Size too small for this duration: raise the MB or lower the resolution.',
    failed: 'Compression failed',
    alreadySmall: 'The video is already smaller than that: keep the original.'
  },
  ocr: {
    options: 'OCR options',
    languageDesc: 'Main language of the text in the picture (improves accuracy)',
    paragraphs: 'Detect paragraphs',
    paragraphsDesc: 'Try to keep the paragraph structure of the text',
    input: 'Picture',
    result: 'Extracted text',
    error: 'Error while reading the picture',
    infoTitle: 'Image to text (OCR)',
    info: 'Extracts text from pictures with optical character recognition. Upload a picture with text, choose the language and get the text. Works best with sharp, high-contrast pictures. The first time a language is used its model is downloaded.',
    languages: {
      eng: 'English', fra: 'French', deu: 'German', spa: 'Spanish', ita: 'Italian', por: 'Portuguese',
      rus: 'Russian', jpn: 'Japanese', chi_sim: 'Chinese (Simplified)', chi_tra: 'Chinese (Traditional)',
      kor: 'Korean', ara: 'Arabic'
    }
  },
  qrStyle: {
    title: 'Style',
    dots: 'Dot shape',
    corners: 'Corner shape',
    square: 'Square',
    dotsOpt: 'Dots',
    rounded: 'Rounded',
    extraRounded: 'Extra rounded',
    classy: 'Classy',
    classyRounded: 'Classy rounded',
    circle: 'Circles',
    addLogo: 'Add logo',
    changeLogo: 'Change logo',
    logoHint: 'The logo goes in the middle; error correction is set to maximum automatically.'
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
