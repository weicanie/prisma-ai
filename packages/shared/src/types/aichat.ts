/**
 * 对话可用的模型
 */
export enum AIChatLLM {
	// google
	gemini_2_5_pro = 'gemini-2.5-pro',
	gemini_2_5_flash = 'gemini-2.5-flash',
	// deepseek
	v3 = 'deepseek-chat',
	r1 = 'deepseek-reasoner'
	//zhipu
	// glm4_5 = 'glm-4.5',
	// kimi
	// k2 = 'kimi-k2-0711-preview',
	// 千问
	// qwen3 = 'qwen3-235b-a22b-instruct-2507',
	// qwen_max = 'qwen-max-latest',
	// qwen_plus = 'qwen-plus',
	// qwen_plus_latest = 'qwen-plus-latest',
}

export interface UserModelConfig<T = AIChatLLM> {
	llm_type: T;
}

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;

	loading?: boolean;
	create_at?: Date | null; //用来标识是否打字机展示（10*1000ms内的最后元素进行打字机）
}

export interface ConversationDto {
	label: string;
	id: number;
	keyname: string;
	content: ChatMessage[];
	user_id: number;
	project_id: string;
	create_at: Date | null;
	update_at: Date | null;
}

export interface MessageSendDto<T = AIChatLLM> {
	message: ChatMessage;
	keyname: string;
	modelConfig: UserModelConfig<T>;
	project_id: string;
}

export interface ConversationSendDto {
	keyname: string;
	project_id: string;
	label: string;

	content: ChatMessage[];
}
