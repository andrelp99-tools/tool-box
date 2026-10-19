# BenitoTools

App personale di strumenti per file, testo e dati, installabile sul telefono (PWA). Link:
https://andrelp99-tools.github.io/tool-box/

Base: fork di [OmniTools](https://github.com/iib0011/omni-tools) (MIT).
Fasi successive porteranno funzioni ispirate a VERT (AGPL-3.0), BentoPDF (AGPL-3.0), Mini QR (GPL-3.0)
e Simon Willison tools (Apache-2.0): da quel momento l'intero progetto è distribuito con licenza AGPL-3.0.

## Modifiche rispetto a OmniTools
- Nome, icona e colori BenitoTools; tolti link esterni (Discord, stelle GitHub, traduzioni Locize).
- Italiano completo (`public/locales/it`), predefinito; solo italiano e inglese.
- Pubblicazione su GitHub Pages in `/tool-box/` (`.github/workflows/deploy.yml`).
- App installabile e offline (service worker `src/sw.ts`, vite-plugin-pwa).
- **Condividi con BenitoTools**: dalla galleria/altre app → pagina `/condividi` con gli strumenti adatti al file.
- **Cronologia** degli ultimi 30 file scaricati o condivisi (max 500 MB, solo sul dispositivo) → `/cronologia`.
- **Impostazioni** → `/impostazioni` (lingua, tema, cronologia, installazione).
- Pulsanti **Condividi** e **Crea sticker** (verso BenitoSticker) sui risultati.
- "Usati di recente" in home (i preferiti c'erano già: stellina sugli strumenti).

Il codice aggiunto è in `src/benito/`; nei file originali solo poche righe marcate "BenitoTools".

## Fasi
1. ✅ Base (questa)
2. ✅ Convertitore universale (`converters/converti`): immagini con ImageMagick WASM, audio e video con mediabunny/WebCodecs, tutto sul dispositivo. Nascosti i convertitori singoli doppioni (JPG, WebP, audio, JPG→PNG).
3. ✅ Leggi QR (fotocamera/immagine), QR con stile e logo (motore di Mini QR), Proteggi foto (volti sfocati + via EXIF/GPS),
   Ritaglia per social, Comprimi video a dimensione obiettivo (WebCodecs, sostituisce quello ffmpeg), OCR in italiano.
   Rilevamento volti: MediaPipe con WASM e modello serviti dall'app (copiati in fase di build).
4. ✅ Strumenti PDF (funzioni ispirate a BentoPDF, riscritte): Organizza, Firma, Compila modulo, Numeri di pagina e
   intestazioni, Filigrana e timbri, Ritaglia margini, PDF in immagini, PDF in testo, Scansione in PDF, OCR PDF
   (ricercabile), Sblocca (qpdf WASM), Rimuovi metadati, Oscura, Appiattisci, Bianco e nero, Ripara.
   Nascosti: editor SimplePDF (servizio esterno), PDF→PNG e Ruota PDF (coperti da PDF in immagini e Organizza).
5. ✅ Documenti (motori pesanti, scaricati solo al primo uso e poi offline):
   - **Convertitore universale** ora accetta anche documenti: Word, Excel, PowerPoint, OpenDocument, RTF, Markdown,
     HTML, EPUB, PDF, eBook (MOBI, FB2, CBZ, XPS), Visio/Publisher. Sceglie da solo il motore (anche due in fila).
   - Scorciatoie nella sezione PDF: **Office in PDF**, **PDF in Word** (anche Markdown/HTML), **PDF in Excel** (tabelle → XLSX/CSV).
   - Motori (`src/benito/docs/`, scaricati in fase di build da `scripts/benito-engines.sh` in `public/engines/`):
     LibreOffice WASM (@matbee/libreoffice-converter, MPL-2.0, ~75 MB), PyMuPDF + pdf2docx in Pyodide
     (@bentopdf/pymupdf-wasm + gs-wasm, AGPL-3.0, ~70 MB), pandoc 3.9 ufficiale (pandoc-wasm, GPL-2.0+, ~16 MB).
   - LibreOffice richiede la pagina "isolata" (SharedArrayBuffer): GitHub Pages non permette intestazioni personalizzate,
     quindi le aggiunge il service worker (`COEP: credentialless`, `COOP: same-origin`). Se la pagina è stata aperta
     prima del service worker, lo strumento la ricarica una volta da solo.
