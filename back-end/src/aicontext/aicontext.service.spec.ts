import { Test, TestingModule } from '@nestjs/testing';
import { AicontextService } from './aicontext.service';

describe('AicontextService', () => {
    let service: AicontextService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AicontextService],
        }).compile();

        service = module.get<AicontextService>(AicontextService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
