import { Controller } from '@nestjs/common';
import { ProjectAgentService } from './project-agent.service';

@Controller('project-agent')
export class ProjectAgentController {
  constructor(private readonly projectAgentService: ProjectAgentService) {}
}
