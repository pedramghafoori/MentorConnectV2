import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const wrapText = (text: string, maxWidth: number, fontSize: number, font: any): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
};

export const buildPdf = async (
  waiverText: string,
  signaturePng: string,
  { name, date }: { name: string; date: Date }
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const margin = 40;
  const textWidth = width - margin * 2;

  // Add waiver text with custom wrapping
  const lines = wrapText(waiverText, textWidth, fontSize, font);
  page.drawText(lines.join('\n'), {
    x: margin,
    y: page.getHeight() - margin - fontSize,
    size: fontSize,
    font,
    lineHeight: fontSize * 1.3,
  });

  // Signature meta line
  const meta = `Signed by ${name} on ${date.toISOString().slice(0, 10)}`;
  page.drawText(meta, {
    x: margin,
    y: margin + 60,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Insert signature image
  const pngImage = await pdfDoc.embedPng(signaturePng);
  const pngDims = pngImage.scale(150 / pngImage.width); // 150 px wide
  page.drawImage(pngImage, {
    x: width - margin - pngDims.width,
    y: margin,
    width: pngDims.width,
    height: pngDims.height,
  });

  return pdfDoc.save();
}; 