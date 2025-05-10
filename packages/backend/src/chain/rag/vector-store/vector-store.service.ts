import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Injectable } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import * as fs from 'fs';
/**pinecone云向量数据库的使用
 *  储存：带有向量和数据的record -> index（数据库,需要预先建立!需要VPN!）
 *  取用：index -> retriever -> record
 * */

//TODO 可以把配置项抽取到配置文件中
enum pineconeIndexs {
	KYJ = 'my-index', //《孔乙己》
	QIU = 'qiu-index' //《球状闪电》
}

interface RetriverConfig {
	k: number;
	verbose?: boolean;
}
//FIXME 需要VPN,得内置代理(查pinecone文档？)
@Injectable()
export class VectorStoreService {
	private pinecone: Pinecone;
	constructor() {
		this.pinecone = new Pinecone({
			apiKey: process.env.PINECONE_API_KEY
		});
	}

	async embedAndStoreToIndex(
		splitDocs: Document[],
		embeddings: OpenAIEmbeddings,
		indexAlias: string
	) {
		if (!pineconeIndexs[indexAlias]) {
			throw new Error(`Index ${indexAlias} does not exist`);
		}
		const indexName = pineconeIndexs[indexAlias];
		await PineconeStore.fromDocuments(splitDocs, embeddings, {
			pineconeIndex: this.pinecone.Index(indexName)
		});
	}

	async getRetrieverOfIndex(
		indexAlias: string,
		embeddings: OpenAIEmbeddings,
		config: RetriverConfig = { k: 3, verbose: false }
	) {
		if (!pineconeIndexs[indexAlias]) {
			throw new Error(`Index ${indexAlias} does not exist`);
		}
		const indexName = pineconeIndexs[indexAlias];
		const index = this.pinecone.Index(indexName);
		const vectorStore = new PineconeStore(embeddings, { pineconeIndex: index });

		const retriever = vectorStore.asRetriever(config.k);
		return retriever;
	}
}

/**
 * @param directory 相对于项目根目录的路径
 * @param filename
 * @param dataObj
 * @description 将数据对象以json格式写入文件
 */
export function saveToFile(directory: string = './db', filename: string, dataObj: any) {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
	}
	filename = filename.replace('.json', '');
	const filePath = `${directory}/${filename}.json`;
	fs.writeFile(filePath, JSON.stringify(dataObj), err => {
		if (err) {
			console.error(`Error writing ${filename}.json:`, err);
		} else {
			console.log('${filename}.json written successfully:', filePath);
		}
	});
}
