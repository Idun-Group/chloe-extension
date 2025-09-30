import { Test, TestingModule } from '@nestjs/testing';
import { DataConverterService } from './data-converter.service';

describe('DataConverterService', () => {
    let service: DataConverterService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DataConverterService],
        }).compile();

        service = module.get<DataConverterService>(DataConverterService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
