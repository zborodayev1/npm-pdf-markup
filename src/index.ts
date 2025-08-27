// Node.js standard modules
import fs from "fs"; // File system operations (read/write files)
import { createRequire } from "module"; // For loading CommonJS modules in ESM
import path from "path"; // Path utilities
import { fileURLToPath } from "url"; // Convert file URLs to paths

// PDF library
import { PDFDocument, rgb } from "pdf-lib"; // Main PDF generation functions

// Project-specific helpers
import { loadConfig } from "./config"; // Load PDF configuration (page size, font, etc.)
import { loadFonts } from "./fonts"; // Load custom fonts for PDF

// Enable using fontkit with pdf-lib
const require = createRequire(import.meta.url);
const fontkit = require("fontkit"); // For registering and embedding custom fonts

// --- Type definitions ---

/**
 * Options for generating a PDF.
 */
export interface GeneratePdfOptions {
  text: string; // Text content to render in the PDF
  outputDirProp?: string;       // Optional output directory, overrides config
  documentNameProp?: string;    // Optional document name, overrides config
  marginProp?: { top: number; left: number }; // Optional margin, overrides config
}

/**
 * Color type for PDF text.
 */
export type PdfColor = 
  | { rgb: { r: number; g: number; b: number } } // RGB color
  | { hex: string }; // Hex color string

/**
 * Single piece of text with formatting.
 */
type TextFragment = {
  text: string; // Text content
  bold?: boolean; // Bold style
  italic?: boolean; // Italic style
  fontSize?: number; // Font size
  color?: { r: number; g: number; b: number }; // RGB color
  margin?: { top?: number; bottom?: number; left?: number; right?: number }; // margin 
};

/**
 * PDF configuration options.
 */
export interface PdfConfig {
  pageSize?: [number, number]; // Width and height of the PDF page, default [595, 842] (A4)
  fontSize?: number; // Default font size for text
  lineHeight?: number; // Space between lines, default fontSize + 10
  fontPaths?: { 
    normal?: string; // Path to custom regular font
    bold?: string;   // Path to custom bold font
    italic?: string; // Path to custom italic font
    boldItalic?: string; // Path to custom bold+italic font
  };
  color?: PdfColor; // Default text color
  margin?: { top: number; left: number }; // Page margins from top and left edges
  documentName?: string; // Prefix for the generated PDF file name
  outputDir?: string; // Directory where generated PDFs will be saved
}

// --- Utility functions ---

/**
 * Convert hex color to RGB object.
 */
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

/**
 * Resolve PdfColor to pdf-lib's rgb format.
 */
function resolveColor(color?: PdfColor) {
  if (!color) return rgb(0, 0, 0); // Default black

  if ("rgb" in color) {
    return rgb(color.rgb.r / 255, color.rgb.g / 255, color.rgb.b / 255);
  }

  if ("hex" in color) {
    const { r, g, b } = hexToRgb(color.hex);
    return rgb(r / 255, g / 255, b / 255);
  }

  return rgb(0, 0, 0);
}

// --- Text parsing ---

/**
 * Parse custom markup in text into TextFragment objects.
 *
 * Supported tags:
 * - <b>...</b> for bold
 * - <i>...</i> for italic
 * - <21>...</21> for font size
 * - <#FF0000>...</#> for color
 * - <mt4>, <mb5>, <ml10>, <mr8> for margin (top, bottom, left, right)
 * - </m> to reset margin
 */
export function parseMarkup(line: string): TextFragment[] {
  const fragments: TextFragment[] = [];

   // Current styles state
  let bold = false;
  let italic = false;
  let fontSize: number | undefined;
  let color: { r: number; g: number; b: number } | undefined;

  // Current margin object applied to fragments
  let currentMargin: { top?: number; bottom?: number; left?: number; right?: number } = {};

  // Regex for parsing tags in line
  const regex = /<(\/?b|\/?i|\/?\d+|#?[0-9A-Fa-f]{6}|m[trbl]\d+|\/m)>/g;
  const marginRegex = /^m([trbl])(\d+)$/;
  let lastIndex = 0;

  for (const match of line.matchAll(regex)) {
    // Push text between previous tag and current tag
    if (match.index! > lastIndex) {
      fragments.push({
        text: line.slice(lastIndex, match.index),
        bold,
        italic,
        fontSize,
        color,
        margin: { ...currentMargin }, // clone current margin for this fragment
      });
    }

    const tag = match[1];
    // Update styles based on tag
    if (tag === "b") bold = true;
    else if (tag === "/b") bold = false;

    else if (tag === "i") italic = true;
    else if (tag === "/i") italic = false;

    else if (/^\d+$/.test(tag)) fontSize = parseInt(tag, 10);
    else if (/^\/\d+$/.test(tag)) fontSize = undefined;

    else if (tag.startsWith("#")) color = hexToRgb(tag);
    else if (tag.startsWith("/#")) color = undefined;
     // Reset margin if closing tag
    else if (tag === "/m") {
      currentMargin = {};
    } else {
      // Parse margin tags: mt, mb, ml, mr
      const m = tag.match(marginRegex);
      if (m) {
        const dir = m[1];       // t/r/b/l
        const value = parseInt(m[2], 10);
        if (dir === "t") currentMargin.top = value;
        else if (dir === "b") currentMargin.bottom = value;
        else if (dir === "l") currentMargin.left = value;
        else if (dir === "r") currentMargin.right = value;
      }
    }

    lastIndex = match.index! + match[0].length;
}
  // Push remaining text after last tag
  if (lastIndex < line.length) {
    fragments.push({
      text: line.slice(lastIndex),
      bold,
      italic,
      fontSize,
      color,
      margin: { ...currentMargin },
    });
  }

  return fragments;
}

// --- PDF generation ---

/**
 * Generate a PDF file from text with optional markup.
 *
 * Returns the full path to the generated PDF.
 */
export async function generatePdf({
  text, outputDirProp, marginProp, documentNameProp
}: GeneratePdfOptions): Promise<string> {
  const config = await loadConfig(); // Load config from JSON or JS

   // Use prop if provided, otherwise fallback to config, otherwise default
  const outputDir = outputDirProp || config.outputDir || path.join(process.cwd(), "generated");
  const documentName = documentNameProp || config.documentName || "document";
  const margin = marginProp || config.margin || { top: 50, left: 50 };

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true }); // Ensure folder exists
  }

  const filePath = path.join(outputDir, `${documentName}-${Date.now()}.pdf`);

  // Needed for font loading
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Create PDF document and register custom fonts
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Add a new page
  const page = pdfDoc.addPage(config.pageSize || [595, 842]);
  const { height } = page.getSize();

  const fontSize = config.fontSize || 14;
  const fonts = await loadFonts(pdfDoc, __dirname, config.fontPaths); // Load custom fonts
  const lineHeight = config.lineHeight ?? fontSize + 10;
  const color = resolveColor(config.color);
  

  let y = height - margin.top;

  // Render each line of text
  for (const line of text.split("\n")) {
    const fragments = parseMarkup(line);

    const lineMt = Math.max(...fragments.map(f => f.margin?.top ?? 0));  // apply top margin of the line
    y -= lineMt;

    let x = margin.left;

    for (const frag of fragments) {
      const usedFont = 
        frag.bold && frag.italic
          ? fonts.boldItalic
          : frag.bold
          ? fonts.bold
          : frag.italic
          ? fonts.italic
          : fonts.normal;

      const size = frag.fontSize ?? fontSize;

      const fragX = x + (frag.margin?.left ?? 0);  // apply left margin of fragment
      const fragY = y;

      page.drawText(frag.text, {
        x: fragX,
        y: fragY,
        size,
        font: usedFont,
        color: frag.color
          ? rgb(frag.color.r / 255, frag.color.g / 255, frag.color.b / 255)
          : color,
      });

      x += usedFont.widthOfTextAtSize(frag.text, size) + (frag.margin?.right ?? 0);  // apply right margin
    }

    const lineMb = Math.max(...fragments.map(f => f.margin?.bottom ?? 0)); // apply bottom margin of line
    y -= lineHeight + lineMb; 
  }

  // Save PDF to disk
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);

  return filePath;
}

