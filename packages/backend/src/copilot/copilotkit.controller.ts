import { CopilotRuntime, copilotRuntimeNestEndpoint, LangChainAdapter } from '@copilotkit/runtime';
import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ModelService } from '../model/model.service';

@Controller()
export class CopilotkitController {
	constructor(public modelService: ModelService) {}
	@All('/copilotkit')
	copilotkit(@Req() req: Request, @Res() res: Response) {
		const serviceAdapter = new LangChainAdapter({
			chainFn: async ({ messages, tools }) => {
				const model = await this.modelService.getLLMDeepSeekRaw('deepseek-chat');
				return model.bindTools(tools).stream(messages);
				// or optionally enable strict mode
				// return model.bindTools(tools, { strict: true }).stream(messages);
			}
		});
		const runtime = new CopilotRuntime();

		const handler = copilotRuntimeNestEndpoint({
			runtime,
			serviceAdapter,
			endpoint: '/copilotkit'
		});
		return handler(req, res);
	}
}
