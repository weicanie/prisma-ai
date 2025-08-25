export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface ConversationDto {
	label: string;
	id: number;
	keyname: string;
	content: ChatMessage[];
	user_id: number;
	create_at: Date | null;
	update_at: Date | null;
}

export interface MessageSendDto {
	message: ChatMessage;
}

export interface ConversationSendDto {
	key: string;
	label: string;
	content: ChatMessage[];
}
