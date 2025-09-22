import { Test, TestingModule } from '@nestjs/testing';
import { PeopleProfileService } from './people-profile.service';

describe('PeopleProfileService', () => {
  let service: PeopleProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeopleProfileService],
    }).compile();

    service = module.get<PeopleProfileService>(PeopleProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
