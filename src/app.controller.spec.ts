import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status', () => {
      const result = appController.getRoot();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('name', 'file-converter-api');
    });

    it('should return health status on /health', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
    });
  });
});
