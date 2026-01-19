import z from 'zod';
import { AIChatLLM } from '../aichat';

export interface AgentConfig {
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

export const agentConfigSchema = z.object({
	CRAG: z.boolean(),
	topK: z.object({
		plan: z.object({
			knowledge: z.number(),
			projectCode: z.number()
		}),
		plan_step: z.object({
			knowledge: z.number(),
			projectCode: z.number()
		}),
		replan: z.object({
			knowledge: z.number(),
			projectCode: z.number()
		})
	}),
	model: z.object({
		plan: z.nativeEnum(AIChatLLM),
		plan_step: z.nativeEnum(AIChatLLM),
		replan: z.nativeEnum(AIChatLLM)
	})
});
