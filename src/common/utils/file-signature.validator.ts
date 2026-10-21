export type SupportedCategory = 'image' | 'document' | 'pdf' | 'text' | 'unknown';

export interface FileTypeMetadata {
  category: SupportedCategory;
  detectedFormat?: string;
  isAllowed: boolean;
}

export class FileSignatureValidator {
  /**
   * Inspects the buffer's initial bytes (magic numbers) and reported metadata
   * to verify that the file content matches its declared nature.
   */
  static inspect(buffer: Buffer, originalExt: string): FileTypeMetadata {
    if (!buffer || buffer.length === 0) {
      return { category: 'unknown', isAllowed: false };
    }

    const ext = originalExt.toLowerCase().replace(/^\./, '').trim();

    // 1. Check for PDF: %PDF-
    if (
      buffer.length >= 5 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46 &&
      buffer[4] === 0x2d
    ) {
      return { category: 'pdf', detectedFormat: 'pdf', isAllowed: true };
    }

    // 2. Check for PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { category: 'image', detectedFormat: 'png', isAllowed: true };
    }

    // 3. Check for JPEG: FF D8 FF
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return { category: 'image', detectedFormat: 'jpeg', isAllowed: true };
    }

    // 4. Check for WEBP: RIFF....WEBP
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { category: 'image', detectedFormat: 'webp', isAllowed: true };
    }

    // 5. Check for GIF: GIF87a or GIF89a (47 49 46 38)
    if (
      buffer.length >= 4 &&
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return { category: 'image', detectedFormat: 'gif', isAllowed: true };
    }

    // 6. Check for BMP: BM (42 4D)
    if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) {
      return { category: 'image', detectedFormat: 'bmp', isAllowed: true };
    }

    // 7. Check for TIFF: II*. (49 49 2A 00) or MM.* (4D 4D 00 2A)
    if (
      buffer.length >= 4 &&
      ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
       (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a))
    ) {
      return { category: 'image', detectedFormat: 'tiff', isAllowed: true };
    }

    // 8. Check for Modern Office / OpenDocument (ZIP archive signature: PK\x03\x04)
    // .docx, .xlsx, .pptx, .odt, .ods, .odp
    if (
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    ) {
      const allowedZipDocs = new Set(['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp']);
      if (allowedZipDocs.has(ext)) {
        return { category: 'document', detectedFormat: ext, isAllowed: true };
      }
      // If declared as something else, could be a disguised zip/apk/jar
      return { category: 'unknown', isAllowed: false };
    }

    // 9. Check for Legacy Office Binary Format (OLE CFB): D0 CF 11 E0 A1 B1 1A E1
    // .doc, .xls, .ppt
    if (
      buffer.length >= 8 &&
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0 &&
      buffer[4] === 0xa1 &&
      buffer[5] === 0xb1 &&
      buffer[6] === 0x1a &&
      buffer[7] === 0xe1
    ) {
      const allowedLegacyDocs = new Set(['doc', 'xls', 'ppt']);
      if (allowedLegacyDocs.has(ext)) {
        return { category: 'document', detectedFormat: ext, isAllowed: true };
      }
      return { category: 'unknown', isAllowed: false };
    }

    // 10. Check for RTF: {\rtf (7B 5C 72 74 66)
    if (
      buffer.length >= 5 &&
      buffer[0] === 0x7b &&
      buffer[1] === 0x5c &&
      buffer[2] === 0x72 &&
      buffer[3] === 0x74 &&
      buffer[4] === 0x66
    ) {
      return { category: 'document', detectedFormat: 'rtf', isAllowed: true };
    }

    // 11. Check for Text-based files (txt, csv, html, htm, xml, svg)
    const textExtensions = new Set(['txt', 'csv', 'html', 'htm', 'xml', 'svg']);
    if (textExtensions.has(ext)) {
      if (this.isLikelyText(buffer)) {
        if (ext === 'svg') {
          return { category: 'image', detectedFormat: 'svg', isAllowed: true };
        }
        return { category: 'document', detectedFormat: ext, isAllowed: true };
      }
    }

    return { category: 'unknown', isAllowed: false };
  }

  /**
   * Helper to verify if the buffer contains valid text/UTF-8 and no binary null bytes
   */
  private static isLikelyText(buffer: Buffer): boolean {
    const checkLength = Math.min(buffer.length, 1024);
    for (let i = 0; i < checkLength; i++) {
      if (buffer[i] === 0x00) {
        return false; // Binary file disguised as text
      }
    }
    return true;
  }
}
