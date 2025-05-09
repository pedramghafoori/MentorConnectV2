import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const wrapText = (text: string, maxWidth: number, fontSize: number, font: any): string[] => {
  // First split by newlines to preserve paragraph structure
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push(''); // Preserve empty lines
      continue;
    }

    const words = paragraph.split(' ');
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
  }
  return lines;
};

const validateSignaturePng = (signaturePng: string): boolean => {
  if (!signaturePng) {
    console.error('Signature PNG is empty');
    return false;
  }

  if (!signaturePng.startsWith('data:image/png;base64,')) {
    console.error('Invalid signature format. Expected data:image/png;base64, but got:', signaturePng.substring(0, 30) + '...');
    return false;
  }

  try {
    const base64Data = signaturePng.split(',')[1];
    if (!base64Data) {
      console.error('No base64 data found in signature PNG');
      return false;
    }

    // Try to decode the base64 data to ensure it's valid
    Buffer.from(base64Data, 'base64');
    return true;
  } catch (error) {
    console.error('Error validating signature PNG:', error);
    return false;
  }
};

export const buildPdf = async (
  waiverText: string,
  signaturePng: string,
  { name, date }: { name: string; date: Date }
): Promise<Uint8Array> => {
  try {
    console.log('Starting PDF generation with:', {
      hasWaiverText: !!waiverText,
      hasSignaturePng: !!signaturePng,
      name,
      date
    });

    if (!validateSignaturePng(signaturePng)) {
      throw new Error('Invalid signature PNG format');
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width } = page.getSize();

    console.log('Embedding font...');
    // Use Times-Roman which has better Unicode support
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontSize = 11;
    const margin = 40;
    const textWidth = width - margin * 2;

    // Replace problematic characters with alternatives
    const sanitizedText = waiverText
      .replace(/⸻/g, '---') // Replace horizontal line with dashes
      .replace(/\t/g, '    ') // Replace tabs with 4 spaces
      .replace(/[^\x00-\x7F]/g, '-'); // Replace any other non-ASCII characters with a dash

    // Add styled text logo at the top
    const logoText = 'LifeguardHub';
    const logoFontSize = 28;
    const logoColor = rgb(0.83, 0.2, 0.2); // #d33
    // Use Times-Roman for now; for a closer match, embed a custom font
    page.drawText(logoText, {
      x: margin,
      y: page.getHeight() - margin - logoFontSize / 2,
      size: logoFontSize,
      font,
      color: logoColor,
    });

    // Add waiver text with custom wrapping
    
    const lines = wrapText(sanitizedText, textWidth, fontSize, font);
    let y = page.getHeight() - margin - logoFontSize - 20;
    const lineHeight = fontSize * 1.3;

    for (const line of lines) {
      if (y < margin) {
        page = pdfDoc.addPage();
        // Redraw logo on new page
        page.drawText(logoText, {
          x: margin,
          y: page.getHeight() - margin - logoFontSize / 2,
          size: logoFontSize,
          font,
          color: logoColor,
        });
        y = page.getHeight() - margin - logoFontSize - 20;
      }
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
      });
      y -= lineHeight;
    }

    // Signature meta line
    console.log('Adding signature meta...');
    const meta = `Signed by ${name} on ${date.toISOString().slice(0, 10)}`;
    page.drawText(meta, {
      x: margin,
      y: margin + 60,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Insert signature image
    console.log('Embedding signature image...');
    try {
      const pngImage = await pdfDoc.embedPng(signaturePng);
      const pngDims = pngImage.scale(150 / pngImage.width); // 150 px wide
      page.drawImage(pngImage, {
        x: margin,
        y: margin,
        width: pngDims.width,
        height: pngDims.height,
      });
      console.log('Signature image embedded successfully');
    } catch (imageError: any) {
      console.error('Error embedding signature image:', {
        error: imageError.message,
        stack: imageError.stack,
        name: imageError.name
      });
      throw new Error('Failed to embed signature image: ' + imageError.message);
    }

    console.log('Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log('PDF generated successfully, size:', pdfBytes.length);
    return pdfBytes;
  } catch (error: any) {
    console.error('Error in buildPdf:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}; 