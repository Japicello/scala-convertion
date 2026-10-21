import * as path from 'path';

export class FileSanitizer {
  /**
   * Sanitizes a file name to prevent path traversal, header injection, and illegal characters.
   * Strips directory paths and special characters, appending .pdf extension.
   */
  static sanitizeOutputPdfName(originalName?: string): string {
    if (!originalName || typeof originalName !== 'string') {
      return `document_${Date.now()}.pdf`;
    }

    // Extract basename to prevent directory traversal
    const base = path.basename(originalName);

    // Get name without extension
    const parsed = path.parse(base);
    let nameWithoutExt = parsed.name.trim();

    // Remove dangerous characters: null bytes, newlines, quotes, slashes, control chars
    // Strip ASCII control characters (0x00 to 0x1F and 0x7F)
    nameWithoutExt = Array.from(nameWithoutExt)
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && code !== 127;
      })
      .join('')
      .replace(/["'\\/<>:|?*]/g, '_')   // replace filesystem/header illegal chars
      .trim();

    if (!nameWithoutExt) {
      nameWithoutExt = `document_${Date.now()}`;
    }

    // Limit length to avoid excessively long filenames
    if (nameWithoutExt.length > 100) {
      nameWithoutExt = nameWithoutExt.substring(0, 100);
    }

    return `${nameWithoutExt}.pdf`;
  }

  /**
   * Generates a safe Content-Disposition header value conforming to RFC 6266 / RFC 5987
   */
  static getSafeContentDisposition(pdfFilename: string): string {
    const asciiFallback = pdfFilename.replace(/[^\x20-\x7E]/g, '_');
    const encoded = encodeURIComponent(pdfFilename);
    return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
  }
}
