import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';

@Module({
	controllers: [],
	providers: [PromptService],
	exports: [PromptService]
})
export class PromptModule {}
