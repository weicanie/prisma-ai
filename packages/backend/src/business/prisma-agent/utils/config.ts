import * as fs from 'fs';
import { user_data_dir } from '../../../utils/constants';
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

export function getAgentConfig(userId: string) {
	const agentConfig: AgentConfig = JSON.parse(
		fs.readFileSync(user_data_dir.agentConfigPath(userId), 'utf-8')
	);
	return agentConfig;
}
export function updateAgentConfig(agentConfig: AgentConfig, userId: string) {
	fs.writeFileSync(user_data_dir.agentConfigPath(userId), JSON.stringify(agentConfig, null, 2));
}
