import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { Injectable } from '@nestjs/common';
import { AgentExecutor, createOpenAIToolsAgent, createReactAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { ModelService } from '../model/model.service';
@Injectable()
export class AgentService {
	constructor(private modelService: ModelService) {}
	async createAgentWithTools(tools: any[]) {
		const prompt = await pull<ChatPromptTemplate>('hwchase17/openai-tools-agent');
		const agent = await createOpenAIToolsAgent({
			llm: this.modelService.getLLMOpenAIRaw(), //直接使用模型实例,为了类型兼容,也避免潜在的其它问题
			prompt,
			tools
		});
		const agentExecutor = new AgentExecutor({
			agent,
			tools
		});
		return agentExecutor;
	}

	async createReActAgent(tools: any[]) {
		const llm = this.modelService.getLLMDeepSeekRaw(); //直接使用模型实例,为了类型兼容,也避免潜在的其它问题
		const prompt = await pull<PromptTemplate>('hwchase17/react');
		const agent = await createReactAgent({ tools, llm, prompt });
		const agentExecutor = new AgentExecutor({
			agent,
			tools
		});
		return agentExecutor;
	}
}
