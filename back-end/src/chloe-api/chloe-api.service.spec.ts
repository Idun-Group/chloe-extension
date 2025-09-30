import { Test, TestingModule } from '@nestjs/testing';
import { ChloeApiService } from './chloe-api.service';

describe('ChloeApiService', () => {
    let service: ChloeApiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChloeApiService],
        }).compile();

        service = module.get<ChloeApiService>(ChloeApiService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
