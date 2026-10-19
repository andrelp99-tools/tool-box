#!/usr/bin/env bash
# BenitoTools: scarica i motori pesanti per i documenti e li mette in public/engines/
# (non salvati nel repo, scaricati dall'app solo al primo uso dello strumento che li usa).
#  - LibreOffice WASM (@matbee/libreoffice-converter, MPL-2.0): Word/Excel/PowerPoint/ODF ⇄ PDF e tra loro
#  - PyMuPDF WASM (@bentopdf/pymupdf-wasm, AGPL-3.0) + Ghostscript WASM (@bentopdf/gs-wasm, AGPL-3.0):
#    PDF → Word, tabelle → Excel, PDF → Markdown/HTML/testo, eBook → PDF
#  - pandoc (pandoc-wasm, binario ufficiale GPL-2.0+, wrapper MIT): Markdown/HTML/EPUB/Word/ODT tra loro
# Le cartelle hanno la versione nel nome: cambiando versione l'app scarica di nuovo il motore.
set -euo pipefail

LO_VER=2.6.0
PYMUPDF_VER=0.11.16
GS_VER=0.1.1
PANDOC_PKG_VER=1.1.0
PANDOC_VER=3.9

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/engines"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

rm -rf "$OUT"
mkdir -p "$OUT"
cd "$TMP"
npm pack --silent \
  "@matbee/libreoffice-converter@$LO_VER" \
  "@bentopdf/pymupdf-wasm@$PYMUPDF_VER" \
  "@bentopdf/gs-wasm@$GS_VER" \
  "pandoc-wasm@$PANDOC_PKG_VER" >/dev/null

unpack() { mkdir -p "$2" && tar xzf "$1" -C "$2" --strip-components=1; }
unpack matbee-libreoffice-converter-$LO_VER.tgz lo
unpack bentopdf-pymupdf-wasm-$PYMUPDF_VER.tgz pymupdf
unpack bentopdf-gs-wasm-$GS_VER.tgz gs
unpack pandoc-wasm-$PANDOC_PKG_VER.tgz pandoc

# LibreOffice: i due file grandi compressi (GitHub Pages ha un limite di 100 MB per file)
D="$OUT/libreoffice-$LO_VER"
mkdir -p "$D"
cp lo/wasm/soffice.js lo/wasm/soffice.worker.js lo/dist/browser.js lo/dist/browser.worker.global.js "$D/"
# Più thread pronti all'avvio: con 4 il caricamento di alcuni documenti a volte si blocca (tutti i thread occupati)
grep -q 'var pthreadPoolSize=4;' "$D/soffice.js"
sed -i 's/var pthreadPoolSize=4;/var pthreadPoolSize=8;/' "$D/soffice.js"
gzip -9 -c lo/wasm/soffice.wasm > "$D/soffice.wasm.gz"
gzip -9 -c lo/wasm/soffice.data > "$D/soffice.data.gz"
cp lo/package.json "$D/package.json"

# PyMuPDF e Ghostscript: struttura del pacchetto (dist/ + assets/)
for p in pymupdf:$PYMUPDF_VER gs:$GS_VER; do
  name=${p%%:*}; ver=${p##*:}
  D="$OUT/$name-$ver"
  mkdir -p "$D"
  cp -r "$name/dist" "$name/assets" "$name/LICENSE" "$D/"
done

# pandoc
D="$OUT/pandoc-$PANDOC_VER"
mkdir -p "$D"
gzip -9 -c pandoc/src/pandoc.wasm > "$D/pandoc.wasm.gz"
cp pandoc/LICENSE "$D/LICENSE"

du -sh "$OUT"/*
echo "BenitoTools: motori documenti pronti in $OUT"
