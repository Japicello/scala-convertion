import { HttpException, HttpStatus } from '@nestjs/common';

export class ConversionFailedException extends HttpException {
  constructor(message: string, cause?: unknown) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Conversion Failed',
        message,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
      { cause },
    );
  }
}

export class InvalidFileFormatException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Invalid File Format',
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
