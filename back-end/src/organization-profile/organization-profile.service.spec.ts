import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationProfileService } from './organization-profile.service';

describe('OrganizationProfileService', () => {
  let service: OrganizationProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationProfileService],
    }).compile();

    service = module.get<OrganizationProfileService>(OrganizationProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
