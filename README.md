# pdf-markup

A powerful Node.js package for generating PDF documents with custom text formatting using simple markup syntax. Create PDFs with bold text, italic text, custom font sizes, colors, and more using an intuitive markup language.

## Features

- 🎨 Custom text formatting (bold, italic, font sizes, colors)
- 📄 Custom page sizes and dimensions
- 🔤 Support for custom fonts
- ⚙️ Flexible configuration options
- 📝 Simple markup syntax
- 🚀 TypeScript support
- 📦 Zero external dependencies for basic usage

## Installation

```bash
npm install pdf-markup
```

## Quick Start

### TypeScript

```typescript
import { generatePdf } from 'pdf-markup';

const options = {
  text: `
    Welcome to <b>PDF Markup</b>!
    
    This text is <i>italic</i> and this is <b>bold</b>.
    
    <24>Large heading text</24>
    
    <#FF0000>This text is red</#> and <#0000FF>this is blue</#>.
    
    Normal text with default formatting.
  `
};

generatePdf(options)
  .then(filePath => {
    console.log(`PDF generated: ${filePath}`);
  })
  .catch(error => {
    console.error('Error generating PDF:', error);
  });
```

### JavaScript

```javascript
const { generatePdf } = require('pdf-markup');

const options = {
  text: `
    Welcome to <b>PDF Markup</b>!
    
    This text is <i>italic</i> and this is <b>bold</b>.
    
    <24>Large heading text</24>
    
    <#FF0000>This text is red</#> and <#0000FF>this is blue</#>.
    
    Normal text with default formatting.
  `
};

generatePdf(options)
  .then(filePath => {
    console.log(`PDF generated: ${filePath}`);
  })
  .catch(error => {
    console.error('Error generating PDF:', error);
  });
```

## Configuration Options

### Runtime Options

The `generatePdf` function accepts only the text content:

```typescript
interface GeneratePdfOptions {
  text: string;              // The markup text to render
}
```

All other configuration is handled through the configuration file.

### Configuration File

Create a `pdf-markup.config.js` or `pdf-markup.config.json` file in your project root:

**pdf-markup.config.js**
```javascript
module.exports = {
  pageSize: [595, 842],      // A4 format [width, height] in points
  fontSize: 12,              // Base font size in points
  lineHeight: 18,            // Line height in pixels
  color: { hex: '#000000' }, // Default text color
  margin: {
    top: 72,                 // Top margin in points (1 inch)
    left: 54                 // Left margin in points (0.75 inch)
  },
  outputDir: './pdfs',
  documentName: 'document.pdf',
  fontPaths: {
    normal: './fonts/Roboto-Regular.ttf',
    bold: './fonts/Roboto-Bold.ttf',
    italic: './fonts/Roboto-Italic.ttf',
    boldItalic: './fonts/Roboto-BoldItalic.ttf'
  }
};
```

**pdf-markup.config.json**
```json
{
  "pageSize": [595, 842],
  "fontSize": 12,
  "lineHeight": 18,
  "color": { "hex": "#000000" },
  "margin": {
    "top": 72,
    "left": 54
  },
  "outputDir": "./pdfs",
  "documentName": "document.pdf",
  "fontPaths": {
    "normal": "./fonts/Roboto-Regular.ttf",
    "bold": "./fonts/Roboto-Bold.ttf",
    "italic": "./fonts/Roboto-Italic.ttf",
    "boldItalic": "./fonts/Roboto-BoldItalic.ttf"
  }
}
```

### Configuration Interface

```typescript
interface PdfConfig {
  pageSize?: [number, number];    // Page dimensions [width, height] in points
  fontSize?: number;              // Base font size in points
  lineHeight?: number;            // Line height in pixels
  fontPaths?: {
    normal?: string;              // Path to regular font file
    bold?: string;                // Path to bold font file
    italic?: string;              // Path to italic font file
    boldItalic?: string;          // Path to bold italic font file
  };
  color?: PdfColor;               // Default text color
  margin?: {
    top: number;                  // Top margin in points
    left: number;                 // Left margin in points
  };
  documentName?: string;          // Output PDF filename
  outputDir?: string;             // Output directory path
}

type PdfColor = {
  rgb: {
    r: number;                    // Red component (0-255)
    g: number;                    // Green component (0-255)
    b: number;                    // Blue component (0-255)
  };
} | {
  hex: string;                    // Hex color format (e.g., "#FF0000")
};
```

## Custom Fonts Usage

Custom fonts are configured in the configuration file, not as runtime options:

```javascript
// pdf-markup.config.js
module.exports = {
  fontPaths: {
    normal: './fonts/MyFont-Regular.ttf',
    bold: './fonts/MyFont-Bold.ttf',
    italic: './fonts/MyFont-Italic.ttf',
    boldItalic: './fonts/MyFont-BoldItalic.ttf'
  },
  // other config options...
};
```

### Font Loading

The package includes default Roboto fonts, but you can override them by providing custom font paths in the configuration file. The font loading is handled automatically by the `fonts.ts` module.

## Supported Markup Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `<b>text</b>` | Bold text | `<b>Bold text</b>` |
| `<i>text</i>` | Italic text | `<i>Italic text</i>` |
| `<size>text</size>` | Custom font size | `<24>Large text</24>` |
| `<#COLOR>text</#>` | Custom text color | `<#FF0000>Red text</#>` |

### Color Format

Colors should be specified in hexadecimal format without the # symbol in the closing tag:
- `<#FF0000>Red text</#>`
- `<#00FF00>Green text</#>`
- `<#0000FF>Blue text</#>`
- `<#FFFF00>Yellow text</#>`

### Font Size Format

Font sizes are specified in points:
- `<12>Small text</12>`
- `<18>Medium text</18>`
- `<24>Large text</24>`
- `<36>Extra large text</36>`

## Configuration Details

### Page Sizes
Page sizes are specified as arrays of [width, height] in points (72 points = 1 inch):
- `[595, 842]` - A4 format (default)
- `[612, 792]` - Letter format
- `[842, 1191]` - A3 format
- `[420, 595]` - A5 format

### Margins
Only top and left margins are supported, specified in points:
```javascript
margin: {
  top: 72,     // 1 inch from top
  left: 54     // 0.75 inch from left
}
```

### Line Height
Line height is specified in pixels (not as a multiplier):
- `14` - Tight spacing
- `18` - Normal spacing (default)
- `24` - Loose spacing

### Color Configuration
Colors can be specified in two formats:

**Hex format:**
```javascript
color: { hex: '#FF0000' }
```

**RGB format:**
```javascript
color: {
  rgb: {
    r: 255,
    g: 0,
    b: 0
  }
}
```

## Output

The `generatePdf` function returns a Promise that resolves to the full file path of the generated PDF:

```typescript
generatePdf({ text: 'Hello World!' }).then(filePath => {
  console.log(`PDF saved to: ${filePath}`);
  // Example output: "/path/to/project/pdfs/document.pdf"
});
```

## Advanced Usage

### Combining Multiple Formatting Options

```typescript
const complexText = `
  <24><b>Document Title</b></24>
  
  This is a paragraph with <b>bold</b> and <i>italic</i> text.
  
  <18><#FF0000>Warning: Important Information</#></18>
  
  <#0000FF>Blue text</#> with normal formatting continues here.
  
  <12>Small print text at the bottom</12>
`;

generatePdf({ text: complexText });
```

### Processing Multiple Documents

```typescript
const documents = [
  { content: 'Content for document 1' },
  { content: 'Content for document 2' },
];

Promise.all(
  documents.map(doc => generatePdf({ text: doc.content }))
).then(filePaths => {
  console.log('All documents generated:', filePaths);
});
```

## API Reference

### `generatePdf(options: GeneratePdfOptions): Promise<string>`

Generates a PDF document with the specified text content and returns the file path.

**Parameters:**
- `options.text` - The markup text to render

**Returns:** Promise that resolves to the full file path of the generated PDF.

### `parseMarkup(line: string): TextFragment[]`

Parses markup text and returns an array of text fragments with formatting information.

**Parameters:**
- `line` - A single line of text with markup tags

**Returns:** Array of `TextFragment` objects containing text and formatting data.

```typescript
type TextFragment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  color?: {
    r: number;
    g: number;
    b: number;
  };
};
```

## Error Handling

```typescript
try {
  const filePath = await generatePdf({ text: 'Hello World!' });
  console.log('Success:', filePath);
} catch (error) {
  console.error('PDF generation failed:', error);
}
```

## Requirements

- Node.js 14.0 or higher
- Supports both CommonJS and ES modules

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
```markdown
[Npmjs](https://www.npmjs.com/package/pdf-markup)