import { Module } from '@nestjs/common';
import { AutoflowService } from './autoflow.service';

@Module({
  controllers: [],
  providers: [AutoflowService],
})
export class AutoflowModule {}
