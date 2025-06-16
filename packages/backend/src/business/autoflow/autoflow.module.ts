import { Module } from '@nestjs/common';
import { AutoflowService } from './autoflow.service';
import { AutoflowController } from './autoflow.controller';

@Module({
  controllers: [AutoflowController],
  providers: [AutoflowService],
})
export class AutoflowModule {}
