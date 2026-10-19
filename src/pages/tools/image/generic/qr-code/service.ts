import * as QRCode from 'qrcode';
import { InitialValuesType } from './types';

/** Formats the raw form values into the string that gets encoded in the QR code, based on the selected type. */
export function formatQRCodeData(values: InitialValuesType): string {
  switch (values.qrCodeType) {
    case 'URL':
      return values.url;

    case 'Text':
      return values.text;

    case 'Email': {
      let emailData = `mailto:${values.emailAddress}`;
      if (values.emailSubject || values.emailBody) {
        emailData += '?';
        if (values.emailSubject) {
          emailData += `subject=${encodeURIComponent(values.emailSubject)}`;
        }
        if (values.emailBody) {
          emailData += `${
            values.emailSubject ? '&' : ''
          }body=${encodeURIComponent(values.emailBody)}`;
        }
      }
      return emailData;
    }
    case 'Phone':
      return `tel:${values.phoneNumber}`;

    case 'SMS':
      return `sms:${values.smsNumber}${
        values.smsMessage
          ? `?body=${encodeURIComponent(values.smsMessage)}`
          : ''
      }`;

    case 'WiFi': {
      const encryption =
        values.wifiEncryption === 'None' ? 'nopass' : values.wifiEncryption;
      return `WIFI:T:${encryption};S:${values.wifiSsid};P:${values.wifiPassword};;`;
    }
    case 'vCard':
      return `BEGIN:VCARD
VERSION:3.0
N:${values.vCardName}
FN:${values.vCardName}
ORG:${values.vCardCompany}
TITLE:${values.vCardTitle}
TEL:${values.vCardPhone}
EMAIL:${values.vCardEmail}
ADR:${values.vCardAddress}
URL:${values.vCardWebsite}
END:VCARD`;

    default:
      return '';
  }
}

/**
 * Renders the QR code for the given form values and returns it as a
 * downloadable PNG File. Returns null if there's nothing to encode yet
 * (e.g. required field for the current type is still empty).
 */
export async function generateQrCodeFile(
  options: InitialValuesType
): Promise<File | null> {
  const qrValue = formatQRCodeData(options);
  if (!qrValue) return null;

  // BenitoTools: con uno stile o un logo usa qr-code-styling (motore di Mini QR)
  if (
    (options.dotStyle && options.dotStyle !== 'square') ||
    (options.cornerStyle && options.cornerStyle !== 'square') ||
    options.logo
  ) {
    const { default: QRCodeStyling } = await import('qr-code-styling');
    const size = Number(options.size) || 200;
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      type: 'canvas',
      data: qrValue,
      margin: Math.round(size * 0.04),
      qrOptions: { errorCorrectionLevel: options.logo ? 'H' : options.correctionLevel },
      dotsOptions: { type: options.dotStyle ?? 'square', color: options.fgColor },
      cornersSquareOptions: { type: options.cornerStyle ?? 'square', color: options.fgColor },
      cornersDotOptions: { type: options.cornerStyle === 'square' ? 'square' : 'dot', color: options.fgColor },
      backgroundOptions: { color: options.bgColor },
      image: options.logo || undefined,
      imageOptions: { margin: 4, hideBackgroundDots: true, imageSize: 0.3 }
    });
    const blob = (await qr.getRawData('png')) as Blob;
    return new File([blob], 'qr-code.png', { type: 'image/png' });
  }

  const canvas = document.createElement('canvas');

  return new Promise((resolve, reject) => {
    QRCode.toDataURL(
      canvas,
      qrValue,
      {
        color: {
          dark: options.fgColor,
          light: options.bgColor
        },
        width: Number(options.size) || 200,
        errorCorrectionLevel: options.correctionLevel
      },
      async (error, url) => {
        // The original callback never checked `error`, so a QR generation
        // failure (e.g. text too long for the chosen correction level)
        // would silently try to fetch `undefined` and throw a confusing
        // error instead. Surface it properly here.
        if (error) {
          reject(error);
          return;
        }
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const file = new File([blob], 'qr-code.png', { type: 'image/png' });
          resolve(file);
        } catch (fetchErr) {
          reject(fetchErr);
        }
      }
    );
  });
}
