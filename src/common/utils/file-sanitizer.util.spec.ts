import { FileSanitizer } from './file-sanitizer.util';

describe('FileSanitizer', () => {
  it('should sanitize regular filename and append .pdf', () => {
    const safeName = FileSanitizer.sanitizeOutputPdfName('my-report.docx');
    expect(safeName).toBe('my-report.pdf');
  });

  it('should strip path traversal sequences', () => {
    const safeName = FileSanitizer.sanitizeOutputPdfName('../../etc/passwd.jpg');
    expect(safeName).toBe('passwd.pdf');
  });

  it('should strip illegal header and filesystem characters', () => {
    const safeName = FileSanitizer.sanitizeOutputPdfName('invoice"<>|?*.xlsx');
    expect(safeName).toBe('invoice______.pdf');
  });

  it('should fallback to default if filename is empty or undefined', () => {
    const safeName = FileSanitizer.sanitizeOutputPdfName('');
    expect(safeName).toMatch(/^document_\d+\.pdf$/);
  });

  it('should format Content-Disposition according to RFC 5987 / RFC 6266', () => {
    const disposition = FileSanitizer.getSafeContentDisposition('informe de ventas.pdf');
    expect(disposition).toContain('filename="informe de ventas.pdf"');
    expect(disposition).toContain("filename*=UTF-8''informe%20de%20ventas.pdf");
  });
});
