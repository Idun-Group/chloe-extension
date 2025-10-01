import { Test, TestingModule } from '@nestjs/testing';
import { PeopleProfileController } from './people-profile.controller';

describe('PeopleProfileController', () => {
    let controller: PeopleProfileController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PeopleProfileController],
        }).compile();

        controller = module.get<PeopleProfileController>(
            PeopleProfileController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
