import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js'; //得手动引入,插件自动引入有问题
import { Injectable } from '@nestjs/common';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { OpenAITool, ToolCallResult } from '../mcp-client/mcp.type';
import { AIToolService } from '../mcp-client/tool.service';
import { ModelService } from '../model/model.service';
/* 
为 langchain 内置的agent框架通过mcp支持, 就是处理下格式（和内置tool保持一致）, 
因为等待函数调用和等待服务器调用, 都是await 一个promise罢了（只要其支持异步函数tool就支持mcp tool, 显然是支持的）
*/
@Injectable()
export class AgentService {
	constructor(
		private modelService: ModelService,
		private toolService: AIToolService
	) {}
	/**
	 *
	 * @param llm
	 * @param tools
	 * @param prompt 用于实现agent的prompt（不传则使用社区默认的）
	 * @returns agentExecutor
	 */
	async createOpenAIToolsAgent(
		llm: ChatOpenAI,
		client: Client,
		tools: OpenAITool[],
		prompt?: ChatPromptTemplate
	) {
		// 注意: 非内置的tools需要转为langchain支持的tools格式, 以使用langchain的agent框架
		const toolsLangChain = tools.map(
			tool =>
				new DynamicStructuredTool({
					name: tool.function.name,
					description: tool.function.description,
					schema: tool.function.parameters,
					func: async (agentArg: any) => {
						return new Promise((resolve, reject) => {
							this.toolService
								.callTool(client, tool.function.name, agentArg)
								.then((mcpResult: any) => {
									//处理其content字段
									const result: ToolCallResult = {
										content:
											typeof mcpResult.content === 'string'
												? mcpResult.content
												: JSON.stringify(mcpResult.content) //! 内部需要content是string!（和内置tool报持一致）
									};
									//处理其他字段（只返回content的话就不用处理了）
									/*if (typeof mcpResult === 'object' && mcpResult !== null) {
										Object.entries(mcpResult).forEach(([key, value]) => {
											if (key !== 'content') {
												result[key] = value;
											}
										});
									} */
									resolve(result.content); //! 经过调试返回result.content而不是result （和内置tool报持一致）
								})
								.catch(error => {
									//? 模型无法接收错误?
									reject(error);
								});
						});
					}
				})
		);
		prompt = prompt || (await pull<ChatPromptTemplate>('hwchase17/openai-tools-agent'));
		const agent = await createOpenAIToolsAgent({
			llm,
			prompt,
			tools
		});
		const agentExecutor = new AgentExecutor({
			agent,
			tools: toolsLangChain
		});
		return agentExecutor;
	}

	//实现和上面的一样
	async createReActAgent(llm: ChatOpenAI, tools: OpenAITool[]) {
		const prompt = await pull<PromptTemplate>('hwchase17/react');
		// const agent = await createReactAgent({ tools, llm, prompt });
		// const agentExecutor = new AgentExecutor({
		// 	agent,
		// 	tools
		// });
		// return agentExecutor;
	}
}
