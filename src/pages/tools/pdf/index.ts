import { tool as pdfPdfToPng } from './pdf-to-png/meta';
import { tool as pdfRotatePdf } from './rotate-pdf/meta';
import { meta as splitPdfMeta } from './split-pdf/meta';
import { meta as mergePdf } from './merge-pdf/meta';
import { DefinedTool } from '@tools/defineTool';
import { tool as compressPdfTool } from './compress-pdf/meta';
import { tool as protectPdfTool } from './protect-pdf/meta';
import { meta as pdfToEpub } from './pdf-to-epub/meta';
import { tool as pdfEditor } from './editor/meta';
import { tool as convertToPdf } from './convert-to-pdf/meta';
import { meta as extractImageFromPdf } from './extract-images-from-pdf/meta';
// BenitoTools: strumenti PDF aggiuntivi (fase 4)
import { tool as b_organize } from '../../../benito/tools/pdf/organize/meta';
import { tool as b_page_numbers } from '../../../benito/tools/pdf/page-numbers/meta';
import { tool as b_crop } from '../../../benito/tools/pdf/crop/meta';
import { tool as b_sign } from '../../../benito/tools/pdf/sign/meta';
import { tool as b_forms } from '../../../benito/tools/pdf/forms/meta';
import { tool as b_watermark } from '../../../benito/tools/pdf/watermark/meta';
import { tool as b_to_images } from '../../../benito/tools/pdf/to-images/meta';
import { tool as b_to_text } from '../../../benito/tools/pdf/to-text/meta';
import { tool as b_scan } from '../../../benito/tools/pdf/scan/meta';
import { tool as b_ocr } from '../../../benito/tools/pdf/ocr/meta';
import { tool as b_unlock } from '../../../benito/tools/pdf/unlock/meta';
import { tool as b_metadata } from '../../../benito/tools/pdf/metadata/meta';
import { tool as b_redact } from '../../../benito/tools/pdf/redact/meta';
import { tool as b_flatten } from '../../../benito/tools/pdf/flatten/meta';
import { tool as b_grayscale } from '../../../benito/tools/pdf/grayscale/meta';
import { tool as b_repair } from '../../../benito/tools/pdf/repair/meta';
// BenitoTools: documenti (motori pesanti, scaricati al primo uso)
import { tool as b_office_to_pdf } from '../../../benito/tools/docs/office-to-pdf/meta';
import { tool as b_pdf_to_word } from '../../../benito/tools/docs/pdf-to-word/meta';
import { tool as b_pdf_to_excel } from '../../../benito/tools/docs/pdf-to-excel/meta';

// BenitoTools: l'editor SimplePDF (servizio esterno) e PDF→PNG (sostituito da PDF in immagini) sono nascosti
void pdfEditor;
void pdfPdfToPng;
void pdfRotatePdf; // coperto da Organizza PDF
export const pdfTools: DefinedTool[] = [
  b_organize,
  mergePdf,
  splitPdfMeta,
  b_sign,
  b_forms,
  compressPdfTool,
  b_office_to_pdf,
  b_pdf_to_word,
  b_pdf_to_excel,
  b_to_images,
  convertToPdf,
  b_scan,
  b_ocr,
  b_to_text,
  b_page_numbers,
  b_watermark,
  b_crop,
  b_redact,
  b_unlock,
  protectPdfTool,
  b_metadata,
  b_flatten,
  b_grayscale,
  b_repair,
  pdfToEpub,
  extractImageFromPdf
];
