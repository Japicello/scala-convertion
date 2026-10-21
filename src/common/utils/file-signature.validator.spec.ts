import { FileSignatureValidator } from './file-signature.validator';

describe('FileSignatureValidator', () => {
  it('should detect valid PDF magic bytes', () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 test content');
    const result = FileSignatureValidator.inspect(pdfBuffer, 'pdf');
    expect(result.isAllowed).toBe(true);
    expect(result.category).toBe('pdf');
  });

  it('should detect valid PNG magic bytes', () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const result = FileSignatureValidator.inspect(pngHeader, 'png');
    expect(result.isAllowed).toBe(true);
    expect(result.category).toBe('image');
    expect(result.detectedFormat).toBe('png');
  });

  it('should detect valid JPEG magic bytes', () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const result = FileSignatureValidator.inspect(jpegHeader, 'jpg');
    expect(result.isAllowed).toBe(true);
    expect(result.category).toBe('image');
    expect(result.detectedFormat).toBe('jpeg');
  });

  it('should detect valid modern Office document (ZIP signature)', () => {
    const docxHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const result = FileSignatureValidator.inspect(docxHeader, 'docx');
    expect(result.isAllowed).toBe(true);
    expect(result.category).toBe('document');
  });

  it('should reject spoofed file (e.g. executable or random binary renamed to docx)', () => {
    const fakeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ executable header
    const result = FileSignatureValidator.inspect(fakeBuffer, 'docx');
    expect(result.isAllowed).toBe(false);
  });
});
