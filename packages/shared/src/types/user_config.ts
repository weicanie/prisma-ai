import { z } from 'zod';

// 用户配置
export interface UserConfig {
	// LLM配置
	llm: {
		deepseek: {
			apiKey: string;
		};
		openai: {
			apiKey: string;
			baseUrl: string;
		};
		googleai: {
			apiKey: string;
		};
		zhipu: {
			apiKey: string;
		};
		qwen: {
			apiKey: string;
		};
	};
	// 向量数据库配置
	vectorDb: {
		pinecone: {
			apiKey: string;
		};
	};
	// 搜索服务配置（可选）
	search: {
		serpapi: {
			apiKey: string;
		};
	};
}

// UserConfig 对应的 Zod schema
export const UserConfigSchema = z.object({
	// LLM配置
	llm: z.object({
		deepseek: z.object({
			apiKey: z.string().min(0).max(200)
		}),
		openai: z.object({
			apiKey: z.string().min(0).max(200),
			baseUrl: z.string().min(0).max(200)
		}),
		googleai: z.object({
			apiKey: z.string().min(0).max(200)
		}),
		zhipu: z.object({
			apiKey: z.string().min(0).max(200)
		}),
		qwen: z.object({
			apiKey: z.string().min(0).max(200)
		})
	}),
	// 向量数据库配置
	vectorDb: z.object({
		pinecone: z.object({
			apiKey: z.string().min(0).max(200)
		})
	}),
	// 搜索服务配置（可选）
	search: z.object({
		serpapi: z.object({
			apiKey: z.string().min(0).max(200)
		})
	})
});

// 从 schema 派生的类型
export type UserConfigFromSchema = z.infer<typeof UserConfigSchema>;

export const initialUserConfig: UserConfig = {
	llm: {
		deepseek: {
			apiKey: ''
		},
		openai: {
			apiKey: '',
			baseUrl: ''
		},
		googleai: {
			apiKey: ''
		},
		zhipu: {
			apiKey: ''
		},
		qwen: {
			apiKey: ''
		}
	},
	vectorDb: {
		pinecone: {
			apiKey: ''
		}
	},
	search: {
		serpapi: {
			apiKey: ''
		}
	}
};
