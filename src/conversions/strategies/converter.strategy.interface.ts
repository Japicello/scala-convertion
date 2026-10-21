export interface ConversionInput {
  buffer: Buffer;
  extension: string;
  originalName: string;
  mimeType: string;
}

export interface IConverterStrategy {
  /**
   * Unique name of the strategy for logging and diagnostics
   */
  readonly name: string;

  /**
   * Determines if this strategy can handle the given category and extension
   */
  supports(category: string, ext: string): boolean;

  /**
   * Executes the conversion to PDF buffer
   */
  convert(input: ConversionInput): Promise<Buffer>;
}
