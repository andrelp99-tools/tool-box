// BenitoTools: testi degli strumenti PDF (italiano + inglese).
import { useTranslation } from 'react-i18next';

const it = {
  input: 'PDF',
  inputs: 'File',
  result: 'Risultato',
  apply: 'Applica',
  working: 'Elaborazione…',
  error: 'Operazione non riuscita',
  pages: 'Pagine',
  pagesDesc: 'Numeri o intervalli, es. 1,3,5-7 (vuoto = tutte)',
  allPages: 'Tutte le pagine',
  page: 'Pagina',
  of: 'di',
  password: 'Password',
  wrongPassword: 'Password errata o PDF protetto',
  needPassword: 'Questo PDF è protetto: inserisci la password',
  // organizza
  org: {
    hint: 'Tocca le pagine per selezionarle, poi usa i pulsanti. Trascina per spostare.',
    selectAll: 'Seleziona tutte',
    selectNone: 'Deseleziona',
    left: 'Sposta prima',
    right: 'Sposta dopo',
    rotate: 'Ruota',
    del: 'Elimina',
    dup: 'Duplica',
    blank: 'Pagina bianca dopo',
    reverse: 'Inverti ordine',
    extract: 'Estrai selezionate',
    save: 'Salva PDF',
    selected: 'selezionate'
  },
  // numeri pagina
  num: {
    what: 'Cosa aggiungere',
    numbers: 'Numeri di pagina',
    header: 'Intestazione',
    footer: 'Piè di pagina',
    format: 'Formato numero',
    position: 'Posizione',
    top: 'In alto',
    bottom: 'In basso',
    left: 'Sinistra',
    center: 'Centro',
    right: 'Destra',
    size: 'Dimensione testo',
    startAt: 'Primo numero',
    skipFirst: 'Salta la prima pagina (copertina)',
    text: 'Testo',
    textHint: 'Puoi usare {n} (pagina), {N} (totale), {data}',
    color: 'Colore'
  },
  crop: {
    margins: 'Margini da tagliare (%)',
    top: 'Sopra',
    bottom: 'Sotto',
    left: 'Sinistra',
    right: 'Destra',
    preview: 'Anteprima prima pagina'
  },
  sign: {
    draw: 'Disegna',
    type: 'Scrivi',
    image: 'Immagine',
    clear: 'Cancella',
    yourName: 'Il tuo nome',
    color: 'Colore',
    useSignature: 'Usa questa firma',
    place: 'Tocca la pagina dove mettere la firma, poi trascinala o ridimensionala.',
    addAgain: 'Aggiungi anche qui',
    remove: 'Togli',
    size: 'Dimensione firma',
    date: 'Aggiungi data sotto la firma',
    save: 'Salva PDF firmato',
    prev: 'Pagina precedente',
    next: 'Pagina successiva',
    placed: 'firme inserite'
  },
  forms: {
    noFields: 'Questo PDF non ha campi compilabili. Per scrivere su un PDF qualsiasi usa "Firma PDF" (puoi scrivere testo) o l\'Editor.',
    lock: 'Blocca i campi dopo la compilazione',
    save: 'Salva PDF compilato',
    fields: 'Campi'
  },
  wm: {
    kind: 'Tipo',
    watermark: 'Filigrana',
    stamp: 'Timbro',
    text: 'Testo',
    presets: 'Testi pronti',
    size: 'Dimensione',
    opacity: 'Opacità',
    angle: 'Inclinazione',
    color: 'Colore',
    position: 'Posizione',
    center: 'Centro',
    tl: 'In alto a sinistra',
    tr: 'In alto a destra',
    bl: 'In basso a sinistra',
    br: 'In basso a destra',
    border: 'Cornice del timbro'
  },
  img: {
    format: 'Formato',
    dpi: 'Qualità (DPI)',
    dpiDesc: '72 = schermo, 150 = buona, 300 = stampa',
    quality: 'Compressione JPG/WebP'
  },
  text: {
    pageBreaks: 'Separa le pagine con una riga',
    empty: 'Nessun testo trovato: forse è un PDF scansionato. Usa "OCR PDF".'
  },
  scan: {
    photos: 'Foto dei documenti',
    camera: 'Scatta foto',
    mode: 'Effetto',
    bw: 'Bianco e nero',
    gray: 'Scala di grigi',
    color: 'Colori migliorati',
    original: 'Originale',
    contrast: 'Contrasto',
    pageSize: 'Formato pagina',
    a4: 'A4',
    fit: 'Come la foto',
    margin: 'Margine bianco'
  },
  ocr: {
    language: 'Lingua del testo',
    progress: 'Riconosco la pagina {p} di {n}…',
    outputs: 'Risultato',
    searchable: 'PDF ricercabile',
    textOnly: 'Solo testo',
    firstUse: 'Al primo uso viene scaricato il modello della lingua (pochi MB).'
  },
  unlock: {
    hint: 'Serve la password del PDF. Se il PDF ha solo restrizioni (stampa/copia) lascia vuoto.',
    done: 'PDF sbloccato',
    action: 'Sblocca'
  },
  meta: {
    found: 'Informazioni trovate',
    none: 'Nessuna informazione trovata',
    title: 'Titolo',
    author: 'Autore',
    subject: 'Oggetto',
    keywords: 'Parole chiave',
    creator: 'Creato con',
    producer: 'Prodotto da',
    created: 'Creato il',
    modified: 'Modificato il',
    remove: 'Rimuovi tutto'
  },
  redact: {
    hint: 'Disegna rettangoli sulle parti da oscurare. Tocca un rettangolo per toglierlo.',
    dpi: 'Qualità delle pagine oscurate (DPI)',
    marked: 'aree segnate',
    warning: 'Le pagine con aree oscurate diventano immagini: il testo lì non sarà più selezionabile.'
  },
  flatten: {
    forms: 'Moduli',
    annotations: 'Annotazioni e commenti (trasforma le pagine in immagini)'
  },
  gray: {
    dpi: 'Qualità (DPI)'
  },
  repair: {
    done: 'PDF riparato',
    failed: 'Non è stato possibile riparare questo PDF'
  }
};

type Dict = typeof it;

const en: Dict = {
  input: 'PDF',
  inputs: 'Files',
  result: 'Result',
  apply: 'Apply',
  working: 'Working…',
  error: 'Operation failed',
  pages: 'Pages',
  pagesDesc: 'Numbers or ranges, e.g. 1,3,5-7 (empty = all)',
  allPages: 'All pages',
  page: 'Page',
  of: 'of',
  password: 'Password',
  wrongPassword: 'Wrong password or protected PDF',
  needPassword: 'This PDF is protected: enter the password',
  org: {
    hint: 'Tap pages to select them, then use the buttons. Drag to move.',
    selectAll: 'Select all',
    selectNone: 'Deselect',
    left: 'Move earlier',
    right: 'Move later',
    rotate: 'Rotate',
    del: 'Delete',
    dup: 'Duplicate',
    blank: 'Blank page after',
    reverse: 'Reverse order',
    extract: 'Extract selected',
    save: 'Save PDF',
    selected: 'selected'
  },
  num: {
    what: 'What to add',
    numbers: 'Page numbers',
    header: 'Header',
    footer: 'Footer',
    format: 'Number format',
    position: 'Position',
    top: 'Top',
    bottom: 'Bottom',
    left: 'Left',
    center: 'Center',
    right: 'Right',
    size: 'Text size',
    startAt: 'First number',
    skipFirst: 'Skip the first page (cover)',
    text: 'Text',
    textHint: 'You can use {n} (page), {N} (total), {data} (date)',
    color: 'Color'
  },
  crop: {
    margins: 'Margins to cut (%)',
    top: 'Top',
    bottom: 'Bottom',
    left: 'Left',
    right: 'Right',
    preview: 'First page preview'
  },
  sign: {
    draw: 'Draw',
    type: 'Type',
    image: 'Image',
    clear: 'Clear',
    yourName: 'Your name',
    color: 'Color',
    useSignature: 'Use this signature',
    place: 'Tap the page where the signature goes, then drag or resize it.',
    addAgain: 'Add here too',
    remove: 'Remove',
    size: 'Signature size',
    date: 'Add date under the signature',
    save: 'Save signed PDF',
    prev: 'Previous page',
    next: 'Next page',
    placed: 'signatures placed'
  },
  forms: {
    noFields: 'This PDF has no fillable fields. To write on any PDF use "Sign PDF" (you can type text) or the Editor.',
    lock: 'Lock the fields after filling',
    save: 'Save filled PDF',
    fields: 'Fields'
  },
  wm: {
    kind: 'Type',
    watermark: 'Watermark',
    stamp: 'Stamp',
    text: 'Text',
    presets: 'Ready texts',
    size: 'Size',
    opacity: 'Opacity',
    angle: 'Angle',
    color: 'Color',
    position: 'Position',
    center: 'Center',
    tl: 'Top left',
    tr: 'Top right',
    bl: 'Bottom left',
    br: 'Bottom right',
    border: 'Stamp border'
  },
  img: {
    format: 'Format',
    dpi: 'Quality (DPI)',
    dpiDesc: '72 = screen, 150 = good, 300 = print',
    quality: 'JPG/WebP compression'
  },
  text: {
    pageBreaks: 'Separate pages with a line',
    empty: 'No text found: maybe it is a scanned PDF. Use "OCR PDF".'
  },
  scan: {
    photos: 'Document photos',
    camera: 'Take photos',
    mode: 'Effect',
    bw: 'Black and white',
    gray: 'Grayscale',
    color: 'Enhanced colors',
    original: 'Original',
    contrast: 'Contrast',
    pageSize: 'Page size',
    a4: 'A4',
    fit: 'Same as photo',
    margin: 'White margin'
  },
  ocr: {
    language: 'Text language',
    progress: 'Reading page {p} of {n}…',
    outputs: 'Result',
    searchable: 'Searchable PDF',
    textOnly: 'Text only',
    firstUse: 'On first use the language model is downloaded (a few MB).'
  },
  unlock: {
    hint: 'The PDF password is needed. If the PDF only has restrictions (print/copy) leave it empty.',
    done: 'PDF unlocked',
    action: 'Unlock'
  },
  meta: {
    found: 'Information found',
    none: 'No information found',
    title: 'Title',
    author: 'Author',
    subject: 'Subject',
    keywords: 'Keywords',
    creator: 'Created with',
    producer: 'Produced by',
    created: 'Created',
    modified: 'Modified',
    remove: 'Remove all'
  },
  redact: {
    hint: 'Draw rectangles over the parts to black out. Tap a rectangle to remove it.',
    dpi: 'Quality of redacted pages (DPI)',
    marked: 'areas marked',
    warning: 'Pages with redactions become images: the text there will no longer be selectable.'
  },
  flatten: {
    forms: 'Forms',
    annotations: 'Annotations and comments (turns pages into images)'
  },
  gray: {
    dpi: 'Quality (DPI)'
  },
  repair: {
    done: 'PDF repaired',
    failed: 'This PDF could not be repaired'
  }
};

export function usePt(): Dict {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith('en') ? en : it;
}
