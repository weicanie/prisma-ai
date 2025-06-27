import * as fs from 'fs/promises';
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
}
const agentConfigPath = path.join(process.cwd(), 'prisma_agent_config.json');

export async function getAgentConfig() {
	const agentConfig: AgentConfig = JSON.parse(await fs.readFile(agentConfigPath, 'utf-8'));
	return agentConfig;
}
export async function updateAgentConfig(agentConfig: AgentConfig) {
	await fs.writeFile(agentConfigPath, JSON.stringify(agentConfig, null, 2));
}
