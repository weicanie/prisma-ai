import { AIChatLLM } from '@prisma-ai/shared';
import * as fs from 'fs';
import { user_data_dir } from '../../../utils/constants';
interface AgentConfig {
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
		plan: AIChatLLM;
		plan_step: AIChatLLM;
		replan: AIChatLLM;
		// reflect使用与plan相同的LLM
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
