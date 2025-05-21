import { Test, TestingModule } from '@nestjs/testing';
import { SessionPoolService } from './session-pool.service';

describe('SessionPoolService', () => {
  let service: SessionPoolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionPoolService],
    }).compile();

    service = module.get<SessionPoolService>(SessionPoolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
