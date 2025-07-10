import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ChainModule } from '../../chain/chain.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { AnkiUploadService } from './anki-upload.service';
import { CrawlQuestionService } from './crawl-question.service';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
@Module({
	controllers: [QuestionController],
	providers: [QuestionService, AnkiUploadService, CrawlQuestionService],
	imports: [TaskQueueModule, ChainModule, HttpModule]
})
export class QuestionModule {}
