import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LookupResult, LookupResultSchema } from '../project/entities/lookupResult.entity';
import { Resume, ResumeSchema } from './entities/resume.entity';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Resume.name, schema: ResumeSchema },
			{ name: LookupResult.name, schema: LookupResultSchema }
		])
	],
	controllers: [ResumeController],
	providers: [ResumeService],
	exports: [ResumeService]
})
export class ResumeModule {}
