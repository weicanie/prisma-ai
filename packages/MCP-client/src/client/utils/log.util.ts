import * as fs from 'fs';
import * as path from 'path';

const baseLogsDir = path.join(__dirname, '../../../logs');

export enum logType {
	GetTools = '[GET Tools]',
	GetToolsError = '[GET Tools Error]',
	ConnectToServer = '[Connect To Server]',
	LLMRequest = '[LLM Request]',
	LLMResponse = '[LLM Response]',
	LLMError = '[LLM Error]',
	LLMStream = '[LLM Stream]',
	ToolCall = '[Tool Call]',
	ToolCallResponse = '[Tool Call Response]',
	ToolCallError = '[Tool Call Error]',
	ServiceCall = '[Service Call]',
	ServiceError = '[Service Error]'
}

export function setTodayDir(): string {
	if (!fs.existsSync(baseLogsDir)) {
		fs.mkdirSync(baseLogsDir, { recursive: true });
	}
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	const todayDir = path.join(baseLogsDir, `${year}-${month}-${day}`);

	if (!fs.existsSync(todayDir)) {
		fs.mkdirSync(todayDir, { recursive: true });
	}

	return todayDir;
}

let index = 0;
export function addLogs(logData: any, logType: logType): void {
	//已存在则返回路径
	const todayDir = setTodayDir();

	const now = new Date();
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');

	const logFileName = `[${index++}] ${logType} ${hours}时${minutes}分${seconds}秒.json`;

	if (logData) {
		fs.writeFileSync(path.join(todayDir, logFileName), JSON.stringify(logData, null, 2), {
			flag: 'w'
		});
	}
}
