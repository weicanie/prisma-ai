import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ChainModule } from '../../chain/chain.module';
import { KnowledgebaseModule } from '../knowledge-base/knowledge-base.module';
import { PrismaAgentModule } from '../prisma-agent/prisma-agent.module';
import { TaskQueueModule } from '../../task-queue/task-queue.module';
import { AnkiUploadService } from './anki-upload.service';
import { CrawlQuestionService } from './crawl-question.service';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PdfQuestionBankImportService } from './pdf-question-bank-import.service';
@Module({
	controllers: [QuestionController],
	providers: [QuestionService, AnkiUploadService, CrawlQuestionService, PdfQuestionBankImportService],
	imports: [TaskQueueModule, ChainModule, HttpModule, KnowledgebaseModule, PrismaAgentModule]
})
export class QuestionModule {}
