// 为 readline/promises 提供类型声明
declare module 'readline/promises' {
	import type { ReadStream, WriteStream } from 'fs';

	interface Interface {
		question(query: string): Promise<string>;
		close(): void;
	}

	export function createInterface(options: { input: ReadStream; output: WriteStream }): Interface;
}

/* sdk内置了类型声明,只是引入方式要注意手动、加.js（esm和cjs兼容问题）

declare module '@modelcontextprotocol/sdk/client/index.js' {
	export class Client {
		constructor(options: { name: string; version: string });
		connect(transport: any): void;
		listTools(): Promise<{ tools: Array<{ name: string; description: string; inputSchema: any }> }>;
		callTool(params: {
			name: string;
			arguments: any;
		}): Promise<{ content: string; [key: string]: any }>;
		close(): Promise<void>;
	}
}

declare module '@modelcontextprotocol/sdk/client/stdio.js' {
	export class StdioClientTransport {
		constructor(options: { command: string; args: string[] });
	}
} 
	
*/
