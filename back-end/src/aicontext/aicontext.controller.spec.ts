import { Test, TestingModule } from '@nestjs/testing';
import { AicontextController } from './aicontext.controller';

describe('AicontextController', () => {
    let controller: AicontextController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AicontextController],
        }).compile();

        controller = module.get<AicontextController>(AicontextController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
