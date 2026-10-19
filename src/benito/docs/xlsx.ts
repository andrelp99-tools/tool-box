// BenitoTools: scrittura minima di file .xlsx (un foglio per tabella), senza librerie pesanti.
import JSZip from 'jszip';

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // caratteri di controllo non ammessi in XML
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

function colName(i: number) {
  let s = '';
  i += 1;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function sheetXml(rows: (string | number | null)[][]) {
  const body = rows
    .map((r, ri) => {
      const cells = r
        .map((v, ci) => {
          if (v === null || v === undefined || v === '') return '';
          const ref = `${colName(ci)}${ri + 1}`;
          const str = String(v).trim();
          if (/^-?\d+(\.\d+)?$/.test(str) && str.length < 15)
            return `<c r="${ref}"><v>${str}</v></c>`;
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${esc(
            str
          )}</t></is></c>`;
        })
        .join('');
      return `<row r="${ri + 1}">${cells}</row>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

export async function writeXlsx(
  sheets: { name: string; rows: (string | number | null)[][] }[]
): Promise<Blob> {
  const zip = new JSZip();
  const used = new Set<string>();
  const names = sheets.map((s, i) => {
    let n =
      s.name.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31) || `Foglio ${i + 1}`;
    while (used.has(n)) n = `${n.slice(0, 28)} ${i + 1}`;
    used.add(n);
    return n;
  });
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets
      .map(
        (_, i) =>
          `<Override PartName="/xl/worksheets/sheet${
            i + 1
          }.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
      )
      .join('')}</Types>`
  );
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
  );
  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names
      .map(
        (n, i) =>
          `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
      )
      .join('')}</sheets></workbook>`
  );
  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
      .map(
        (_, i) =>
          `<Relationship Id="rId${
            i + 1
          }" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${
            i + 1
          }.xml"/>`
      )
      .join('')}</Relationships>`
  );
  sheets.forEach((s, i) =>
    zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s.rows))
  );
  return zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}
