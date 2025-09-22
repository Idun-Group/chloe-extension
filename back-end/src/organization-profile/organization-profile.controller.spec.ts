import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationProfileController } from './organization-profile.controller';

describe('OrganizationProfileController', () => {
  let controller: OrganizationProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationProfileController],
    }).compile();

    controller = module.get<OrganizationProfileController>(OrganizationProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
