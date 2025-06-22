import { Body, Controller, Post } from '@nestjs/common';
import { ProjectDto } from '@prism-ai/shared';
import { PrismaAgentService } from './prisma-agent.service';

interface TestDto {
	projectInfo: ProjectDto;
	lightSpot: string;
	projectPath: string;
	userId: string;
	sessionId: string;
}

@Controller('test')
export class TestController {
	constructor(private readonly prismaAgentService: PrismaAgentService) {}

	@Post('test')
	async test(@Body() testDto: TestDto) {
		return this.prismaAgentService.invoke(
			testDto.projectInfo,
			testDto.lightSpot,
			testDto.projectPath,
			testDto.userId,
			testDto.sessionId
		);
	}
}
