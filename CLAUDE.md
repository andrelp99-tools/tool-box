# BenitoTools (tool-box)

PWA personale di strumenti per file, testo e dati: tutto nel browser, offline, i file non escono dal dispositivo. Usata da Andrea su telefono (Nothing Phone, Android) e PC (Chrome/Edge).
- Sito/PWA: https://andrelp99-tools.github.io/tool-box/ — deploy automatico a ogni push su `main` (workflow "Pubblica BenitoTools").
- Base: fork di OmniTools (iib0011/omni-tools, MIT) + funzioni da VERT, BentoPDF, Mini QR, Simon's tools → licenza **AGPL-3.0**.
- Remote: `origin` = andrelp99-tools/tool-box, `upstream` = iib0011/omni-tools.
- Codice aggiunto in `src/benito/`; nei file originali solo righe marcate "BenitoTools" (facilita il sync con upstream).
- Fasi 1-5 fatte (base, convertitore universale, QR/foto/video, 16 strumenti PDF, documenti con LibreOffice/PyMuPDF/pandoc WASM). Dettagli: **BENITO.md**.
- Scelte: resta PWA (niente APK); italiano predefinito + inglese; ponte "Crea sticker" verso BenitoSticker (repo tool-stickers).
- In sospeso: icona definitiva (la fornisce Andrea).
- Preferenza: un'app unica invece di tante app simili; funzioni nuove vanno integrate qui.

## Regole di lavoro di Andrea
- Rispondi in italiano, stile **caveman max** (risposte corte, solo sostanza). Plugin `caveman@benito` se installato.
- Prima di agire fai domande per capire contesto, richieste, scopi. Proponi idee sensate quando servono.
- Lavora sempre inline: **mai sub-agenti** (vale anche per le skill di superpowers che li usano).
- Modifiche grafiche, anteprime di come verrebbe una funzione o lunghe serie di domande con esempi: mostrale in una pagina HTML/mockup invece che a testo.
- Ogni libreria o repo esterna nuova: prima controlla codice, licenza, sicurezza, permessi; poi proponi.
- Commit firmati `Claude <noreply@anthropic.com>`, **mai con l'email personale**: il profilo GitHub personale (andrelp99) è collegato a LinkedIn e il lavoro dell'org non deve comparire lì.
- PC Windows di casa, spesso spento, niente Docker/WSL. Andrea non ama la riga di comando: comandi pronti da incollare, spiegati in breve.
- A fine lavoro aggiorna **BENITO.md** (note tecniche) e la sezione "In sospeso".
- Contesto completo (scelte, storico, altre app): progetto "Implementazioni app da Github" nell'app Claude.
