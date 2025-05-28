import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resume, ResumeSchema } from './entities/resume.entity';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';

@Module({
	imports: [MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }])],
	controllers: [ResumeController],
	providers: [ResumeService],
	exports: [ResumeService]
})
export class ResumeModule {}
