import { Controller } from '@nestjs/common';
import { PrismaAgentService } from './prisma-agent.service';

@Controller('prisma-agent')
export class PrismaAgentController {
  constructor(private readonly prismaAgentService: PrismaAgentService) {}
}
