import { startCrawlQuestionSchema } from '@prism-ai/shared';
import { createZodDto } from 'nestjs-zod';

/**
 * 爬虫启动参数的数据传输对象
 */
export class StartCrawlQuestionDto extends createZodDto(startCrawlQuestionSchema) {}
