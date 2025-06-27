import { Module } from '@nestjs/common';
import { ProjectAgentService } from './project-agent.service';
import { ProjectAgentController } from './project-agent.controller';

@Module({
  controllers: [ProjectAgentController],
  providers: [ProjectAgentService],
})
export class ProjectAgentModule {}
