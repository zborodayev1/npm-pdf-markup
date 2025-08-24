import fs from "fs"; // File system module for reading font files
import path from "path"; // Path utilities
import { PDFDocument, PDFFont } from "pdf-lib"; // PDF document and font types
import { PdfConfig } from ".";

/**
 * Object containing all loaded PDF fonts.
 */
export interface LoadedFonts {
  normal: PDFFont; // Regular font
  bold: PDFFont; // Bold font
  italic: PDFFont; // Italic font
  boldItalic: PDFFont; // Bold + Italic font
}

/**
 * Load all fonts for PDF rendering.
 *
 * @param pdfDoc - PDFDocument instance where fonts will be embedded
 * @param baseDir - Base directory of the project to resolve font paths
 * @returns LoadedFonts object containing embedded fonts
 */
export async function loadFonts(pdfDoc: PDFDocument, baseDir: string, fontPaths?: PdfConfig["fontPaths"]): Promise<LoadedFonts> {
  // Paths to all font files
  const normalFontPath = fontPaths?.normal || path.join(baseDir, "fonts", "Roboto", "static", "Roboto-Regular.ttf");
  const boldFontPath = fontPaths?.bold || path.join(baseDir, "fonts", "Roboto", "static", "Roboto-Bold.ttf");
  const italicFontPath = fontPaths?.italic || path.join(baseDir, "fonts", "Roboto", "static", "Roboto-Italic.ttf");
  const boldItalicFontPath = fontPaths?.boldItalic || path.join(baseDir, "fonts", "Roboto", "static", "Roboto-BoldItalic.ttf");

  // Read font files into memory
  const normalFontBytes = fs.readFileSync(normalFontPath);
  const boldFontBytes = fs.readFileSync(boldFontPath);
  const italicFontBytes = fs.readFileSync(italicFontPath);
  const boldItalicFontBytes = fs.readFileSync(boldItalicFontPath);

  // Embed fonts into the PDF document and return as object
  return {
    normal: await pdfDoc.embedFont(normalFontBytes),
    bold: await pdfDoc.embedFont(boldFontBytes),
    italic: await pdfDoc.embedFont(italicFontBytes),
    boldItalic: await pdfDoc.embedFont(boldItalicFontBytes),
  };
}
