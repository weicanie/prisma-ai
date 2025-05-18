import { OpenAITool } from '../mcp-client/mcp.type';

interface ToolList extends Array<OpenAITool> {}

interface ToolSpecify {
	type: 'function';
	function: {
		name: string;
	};
}

type ToolChoice = ToolSpecify | 'none' | 'auto';

//指定 llm 可用的 tools 和行为限制
interface ToolBinding {
	tools: ToolList;
	tool_choice: ToolChoice;
}
