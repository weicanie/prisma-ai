import OpenAI from 'openai';
import { OpenAITool } from '../types';
export declare class LLMService {
    private openai;
    private model;
    constructor(apiKey: string, model?: string, baseURL?: string);
    sendMessage(messages: Array<OpenAI.Chat.ChatCompletionMessageParam>, tools?: OpenAITool[]): Promise<OpenAI.Chat.Completions.ChatCompletion & {
        _request_id?: string | null;
    }>;
    getModel(): string;
    setModel(model: string): void;
}
