export interface ConversionConfig {
  maxFileSize: number;
  conversionTimeoutMs: number;
  maxImagePixels: number;
}

export const CONVERSION_CONFIG: ConversionConfig = {
  maxFileSize: 25 * 1024 * 1024, // 25 MB
  conversionTimeoutMs: 30000,     // 30 seconds timeout for LibreOffice
  maxImagePixels: 50_000_000,    // 50 Megapixels max to prevent decompression bombs
};

export const CONVERTER_STRATEGIES = Symbol('CONVERTER_STRATEGIES');
