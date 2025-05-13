import { Controller, Get, Query } from '@nestjs/common';
import { RagService } from './Rag.service';

@Controller('rag')
class RagController {
	constructor(private ragService: RagService) {}
	@Get('ask')
	async getRagAnswer(@Query('input') input: string) {
		return await this.ragService.getRagAnswerFromChain(input);
	}
	@Get('embed')
	async dataEmbedToVectorStore() {
		return await this.ragService.dataEmbedToVectorStore();
	}
}

export default RagController;
