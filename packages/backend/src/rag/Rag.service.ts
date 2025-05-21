import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { BufferMemory } from 'langchain/memory';
import * as path from 'path';

import { ModelService } from '../model/model.service';
import { VectorStoreService } from '../vector-store/vector-store.service';

@Injectable()
export class RagService {
	constructor(
		private vectorStoreService: VectorStoreService,
		private modelService: ModelService
	) {}

	async dataEmbedToVectorStore() {
		//1.加载数据
		const text = await new TextLoader(path.join(process.cwd(), '/data/qiu.txt')).load();
		//2.切分数据
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 300,
			chunkOverlap: 80
		});
		const docs = await textSplitter.splitDocuments(text);
		//3.embedding并储存到向量数据库
		await this.vectorStoreService.embedAndStoreToIndex(
			docs,
			this.modelService.embedModel_openai,
			'QIU'
		);
	}
	//TODO 数据库储存用户的会话和聊天历史
	//TODO 存在的问题：当用户输入的问题和书中内容不相关时，检索到的内容会影响模型的回答
	async getRagAnswerFromChain(userInput: string) {
		//4.检索
		const retriever = await this.vectorStoreService.getRetrieverOfIndex(
			'QIU',
			this.modelService.embedModel_openai,
			{ k: 3, verbose: true }
		);
		const infoRetrieved = await retriever.invoke(userInput);
		//5.prompt增强
		const prompt = ChatPromptTemplate.fromTemplate(
			`你是熟读科幻作家刘慈欣的作品《球状闪电》的超忠实原著党,对书中的细节了如指掌。
			请你根据以下对话历史和书中的内容回答问题。
			对话历史:
			{history}

			以下是原文中跟用户回答相关的内容：{infoRetrieved}。
			请你仅根据书中的内容和对话历史回答问题：{question}。

			请注意，你的回答必须完全基于原文中跟用户回答相关的内容和对话历史，而不是你自己的观点或想象。
			如果书中没有相关内容，请回答“书中没有相关内容”。
			如果你无法回答，请回答“我不知道”。`
		);
		//构建chain
		const outParser = new StringOutputParser();

		const memory = new BufferMemory({
			chatHistory: this.modelService.getChatHistory()
		});

		const chain = RunnableSequence.from([
			{
				question: input => input.question,
				infoRetrieved: input => input.infoRetrieved,
				history: async (input, options) => {
					const vars = await memory.loadMemoryVariables({ input });
					return vars.history || vars.summary || '历史记录为空';
				}
			},
			new RunnablePassthrough({
				func: async input => {
					console.log('infoRetrieved:', input.infoRetrieved);
					return input;
				}
			}),
			prompt,
			this.modelService.getLLMOpenAIRaw(),
			outParser,
			RunnableLambda.from(async input => {
				await memory.saveContext({ input: userInput }, { output: input });
				return input;
			})
		]);

		//6.生成
		const result = await chain.stream({
			infoRetrieved,
			question: userInput,
			verbose: true
		});

		for await (let chunk of result) {
			console.log(chunk);
		}
	}
}
