import { Test, TestingModule } from '@nestjs/testing';
import { SessionPoolController } from './session-pool.controller';
import { SessionPoolService } from './session-pool.service';

describe('SessionPoolController', () => {
  let controller: SessionPoolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionPoolController],
      providers: [SessionPoolService],
    }).compile();

    controller = module.get<SessionPoolController>(SessionPoolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
