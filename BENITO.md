# BenitoTools

App personale di strumenti per file, testo e dati, installabile sul telefono (PWA) e pubblicata su
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
3. QR (crea/leggi) + photo-scrubber, cropper social, compressore video, OCR (Simon Willison tools)
4. Strumenti PDF da BentoPDF: pagine, firma e moduli, conversioni, sicurezza e pulizia
