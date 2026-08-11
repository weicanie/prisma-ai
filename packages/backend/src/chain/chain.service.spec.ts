import { AIChatLLM } from '@prisma-ai/shared';
import { ChainService } from './chain.service';

describe('ChainService structured model routing', () => {
	it('uses the selected plan_step provider without overriding the model', async () => {
		const deepseek = { id: 'deepseek' };
		const modelService = {
			deepseek_config: { configuration: { baseURL: 'configured' } },
			getLLMDeepSeek: jest.fn().mockResolvedValue(deepseek)
		};
		const service = new ChainService(modelService as any, {} as any, {} as any, {} as any, {} as any, {} as any);
		const userConfig = { llm: { deepseek: { apiKey: 'user-key' } } } as any;

		await expect(service.getStructuredLLM(AIChatLLM.v3, userConfig)).resolves.toBe(deepseek);
		expect(modelService.getLLMDeepSeek).toHaveBeenCalledWith(expect.objectContaining({ model: AIChatLLM.v3 }));
		expect(modelService.getLLMDeepSeek).toHaveBeenCalledWith(expect.objectContaining({ configuration: expect.objectContaining({ apiKey: 'user-key' }) }));
	});

	it('routes the reasoning model to the existing thought-model service', async () => {
		const thoughtModel = { id: 'reasoning' };
		const thoughtModelService = { getDeepSeekThinkingModleflat: jest.fn().mockResolvedValue(thoughtModel) };
		const service = new ChainService({} as any, thoughtModelService as any, {} as any, {} as any, {} as any, {} as any);

		await expect(service.getStructuredLLM(AIChatLLM.r1, {} as any)).resolves.toBe(thoughtModel);
		expect(thoughtModelService.getDeepSeekThinkingModleflat).toHaveBeenCalledWith(AIChatLLM.r1, {}, true);
	});
});
