import * as fs from 'fs';
import * as path from 'path';
interface AgentConfig {
	_uploadedProjects: string[];
	CRAG: boolean;
	topK: {
		plan: {
			knowledge: number;
			projectCode: number;
		};
		plan_step: {
			knowledge: number;
			projectCode: number;
		};
		replan: {
			knowledge: number;
			projectCode: number;
		};
	};
	model: {
		plan: 'deepseek-reasoner' | 'deepseek-chat' | 'gemini-2.5-pro' | 'gemini-2.5-flash';
		plan_step: 'deepseek-reasoner' | 'deepseek-chat' | 'gemini-2.5-pro' | 'gemini-2.5-flash';
		replan: 'deepseek-reasoner' | 'deepseek-chat' | 'gemini-2.5-pro' | 'gemini-2.5-flash';
	};
}
const agentConfigPath = path.join(process.cwd(), 'prisma_agent_config.json');

export function getAgentConfig() {
	const agentConfig: AgentConfig = JSON.parse(fs.readFileSync(agentConfigPath, 'utf-8'));
	return agentConfig;
}
export function updateAgentConfig(agentConfig: AgentConfig) {
	fs.writeFileSync(agentConfigPath, JSON.stringify(agentConfig, null, 2));
}
