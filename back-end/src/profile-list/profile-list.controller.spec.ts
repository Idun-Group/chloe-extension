import { Test, TestingModule } from '@nestjs/testing';
import { ProfileListController } from './profile-list.controller';

describe('ProfileListController', () => {
  let controller: ProfileListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileListController],
    }).compile();

    controller = module.get<ProfileListController>(ProfileListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
