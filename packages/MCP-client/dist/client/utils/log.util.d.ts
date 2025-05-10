export declare enum logType {
    GetTools = "[GET Tools]",
    GetToolsError = "[GET Tools Error]",
    ConnectToServer = "[Connect To Server]",
    LLMRequest = "[LLM Request]",
    LLMResponse = "[LLM Response]",
    LLMError = "[LLM Error]",
    LLMStream = "[LLM Stream]",
    ToolCall = "[Tool Call]",
    ToolCallResponse = "[Tool Call Response]",
    ToolCallError = "[Tool Call Error]",
    ServiceCall = "[Service Call]",
    ServiceError = "[Service Error]"
}
export declare function clearLogs(): void;
export declare function addLogs(logData: any, logType: logType): void;
