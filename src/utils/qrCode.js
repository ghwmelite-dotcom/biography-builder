import QRCode from 'qrcode'

export async function generateQRCodeDataUrl(text, options = {}) {
  return QRCode.toDataURL(text, {
    width: options.width || 200,
    margin: options.margin || 2,
    color: {
      dark: options.dark || '#000000',
      light: options.light || '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  })
}
