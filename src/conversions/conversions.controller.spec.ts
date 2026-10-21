import { Test, TestingModule } from '@nestjs/testing';
import { ConversionsController } from './conversions.controller';
import { ConversionsService } from './conversions.service';

describe('ConversionsController', () => {
  let controller: ConversionsController;
  let service: jest.Mocked<ConversionsService>;

  beforeEach(async () => {
    const mockService = {
      convertToPdf: jest.fn(),
    } as unknown as jest.Mocked<ConversionsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversionsController],
      providers: [
        {
          provide: ConversionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ConversionsController>(ConversionsController);
    service = module.get<ConversionsService>(ConversionsService) as jest.Mocked<ConversionsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
