import { Test, TestingModule } from '@nestjs/testing';
import { ChloeApiController } from './chloe-api.controller';

describe('ChloeApiController', () => {
  let controller: ChloeApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChloeApiController],
    }).compile();

    controller = module.get<ChloeApiController>(ChloeApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
