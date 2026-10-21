import { Test, TestingModule } from '@nestjs/testing';
import { ConversionsService } from './conversions.service';
import { CONVERTER_STRATEGIES } from '../common/config/conversion.config';
import { IConverterStrategy } from './strategies/converter.strategy.interface';
import { InvalidFileFormatException } from '../common/exceptions/conversion.exception';
import type { UploadedFile as MulterFile } from '../common/types/file.types';

describe('ConversionsService', () => {
  let service: ConversionsService;
  let mockStrategy: jest.Mocked<IConverterStrategy>;

  beforeEach(async () => {
    mockStrategy = {
      name: 'MockStrategy',
      supports: jest.fn().mockReturnValue(true),
      convert: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock pdf')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversionsService,
        {
          provide: CONVERTER_STRATEGIES,
          useValue: [mockStrategy],
        },
      ],
    }).compile();

    service = module.get<ConversionsService>(ConversionsService);
  });

  it('should throw InvalidFileFormatException if buffer is empty', async () => {
    const emptyFile = {
      buffer: Buffer.from([]),
      originalname: 'test.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    } as MulterFile;

    await expect(service.convertToPdf(emptyFile)).rejects.toThrow(
      InvalidFileFormatException,
    );
  });

  it('should successfully route to strategy when magic bytes are valid', async () => {
    const validDocxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const file = {
      buffer: validDocxBuffer,
      originalname: 'contract.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    } as MulterFile;

    const result = await service.convertToPdf(file);

    expect(result.filename).toBe('contract.pdf');
    expect(mockStrategy.convert.mock.calls.length).toBe(1);
  });
});
