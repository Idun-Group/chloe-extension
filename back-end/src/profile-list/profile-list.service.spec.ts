import { Test, TestingModule } from '@nestjs/testing';
import { ProfileListService } from './profile-list.service';

describe('ProfileListService', () => {
    let service: ProfileListService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProfileListService],
        }).compile();

        service = module.get<ProfileListService>(ProfileListService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
