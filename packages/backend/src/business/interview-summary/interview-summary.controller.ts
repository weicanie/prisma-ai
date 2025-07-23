import { Body, Controller, Post } from '@nestjs/common';
import { RequireLogin, UserInfo } from '../../decorator';
import { InterviewSummaryService } from './interview-summary.service';
import {
	type InterviewSummaryCreateDto,
	type ImportSummariesDto,
	type UserInfoFromToken
} from '@prisma-ai/shared';

@Controller('interview-summary')
export class InterviewSummaryController {
	constructor(private readonly interviewSummaryService: InterviewSummaryService) {}

	@RequireLogin()
	@Post()
	async create(
		@Body()
		interviewSummary: InterviewSummaryCreateDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return this.interviewSummaryService.createInterviewSummary(interviewSummary, userInfo);
	}

	@RequireLogin()
	@Post('import')
	async importSummaries(
		@Body() importSummariesDto: ImportSummariesDto,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const { exporterId, importerId } = importSummariesDto;
		return this.interviewSummaryService.importSummariesAndArticles(
			exporterId,
			importerId ?? +userInfo.userId
		);
	}
}
