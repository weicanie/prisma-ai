import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
	Runnable,
	RunnableLambda,
	RunnablePassthrough,
	RunnableSequence
} from '@langchain/core/runnables';
import { MemorySaver } from '@langchain/langgraph';
import { Inject, Injectable } from '@nestjs/common';
import { ProjectDto } from '@prisma-ai/shared';
import { z } from 'zod';

import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatOpenAI } from '@langchain/openai';
import { ModelService } from '../../model/model.service';
import { WithFormfixChain } from '../../utils/abstract';
import { RubustStructuredOutputParser } from '../../utils/RubustStructuredOutputParser';
import { ReflectAgentService } from '../reflect_agent/reflect_agent.service';
import { Knowledge, Plan, Reflection, Step, Step_prompt } from '../types';
import { getAgentConfig } from '../utils/config';
import { PlanStepGraph } from './planner_step';

/**
 * @description 最终生成给开发人员的完整Prompt结构。
 */
interface Prompt_step {
	context: {
		codeFiles?: string[]; //目标项目的相关代码文件地址（暂未实现，反正cursor自己会检索）
		projectKnowledge: string; //目标项目的相关知识
		domainKnowledge: string; //领域知识
	};
	userPrompt: {
		stepAnalysis: string; //步骤需求分析
		implementationDetailPlan: Step_prompt[]; //步骤实现细节计划
	};
	systemPrompt: string; //系统词
}

const stepAnalysisSchema = z.object({
	stepAnalysis: z
		.string()
		.describe(
			'对当前步骤的详细需求分析，明确该步骤需要完成的具体任务、输入、输出和与项目中其他部分的关系。'
		)
});

const stepPlanSchema = z.object({
	implementationPlan: z
		.array(
			z.object({
				stepDescription: z.string().describe('子步骤的详细描述'),
				techStackList: z.array(z.string()).describe('该子步骤需要使用的技术清单'),
				challengesList: z.array(z.string()).describe('该子步骤可能遇到的难点清单'),
				questionsList: z.array(z.string()).describe('关于该子步骤存在的疑问清单')
			})
		)
		.describe('实现当前步骤的具体子步骤清单')
});

const stepPromptSchema = z.object({
	stepDescription: z.string(),
	techStackList: z.array(z.string()),
	challengesSolutionList: z.array(z.string()).describe('针对难点的解决思路'),
	questionsClarificationList: z.array(z.string()).describe('针对疑问的澄清说明')
});

const completedPlanSchema = z.object({
	implementationDetailPlan: z
		.array(stepPromptSchema)
		.describe('将原计划中的难点和疑问转化为具体的解决方案和澄清，形成更完备的执行细节')
});

@Injectable()
export class PlanStepAgentService {
	private readonly workflow: Runnable<any, any>;

	constructor(
		private readonly modelService: ModelService,
		private readonly reflectAgentService: ReflectAgentService,
		@Inject(WithFormfixChain)
		private readonly chainService: WithFormfixChain
	) {
		const checkpointer = new MemorySaver();
		this.workflow = PlanStepGraph.compile({ checkpointer });
	}

	public getWorkflow() {
		return this.workflow;
	}

	/**
	 * 创建一个用于"步骤需求分析"的Chain。
	 * @description 针对总体计划中的某一个具体步骤，进行更详细的需求分析。
	 * @input {{ projectInfo: ProjectDto; totalPlan: Plan; currentStep: Step; knowledge?: Knowledge; reflection?: Reflection }} - 输入包括项目信息、整体计划、当前步骤、以及可选的反思。
	 * @output {z.infer<typeof stepAnalysisSchema>} - 输出包含`stepAnalysis`字段的结构化对象。
	 */
	createAnalysisChain(): Runnable<
		{
			projectInfo: ProjectDto;
			totalPlan: Plan;
			currentStep: Step;
			knowledge?: Knowledge;
			reflection?: Reflection;
		},
		z.infer<typeof stepAnalysisSchema>
	> {
		let model: ChatOpenAI | ChatDeepSeek;
		const modelName = getAgentConfig().model.plan_step;
		if (modelName === 'gemini-2.5-pro' || modelName === 'gemini-2.5-flash') {
			model = this.modelService.getLLMGeminiRaw(modelName);
		} else {
			model = this.modelService.getLLMDeepSeekRaw(modelName);
		}
		if (!model) throw new Error('Model not found');
		const parser = RubustStructuredOutputParser.from(stepAnalysisSchema, this.chainService);

		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				`你是一位优秀的软件工程师，你的任务是基于整体计划和当前步骤，对当前步骤进行详细的需求分析。
你的前同事因为当前步骤的需求分析写的质量不够高，已经被公司辞退了。如果你写的需求分析质量不够高，你也会被公司辞退。你的父母因为重病住院，如果你被辞退，你的父母将由于治疗费用不足而去世。你的3个儿女也将因为你的失业而辍学。

仔细阅读整体计划和当前步骤、项目相关代码和领域知识、前同事的反思和建议，从前同事的反思和建议中吸取教训，尽自己的最大努力撰写清晰可行的高质量需求分析，不要让这样的悲剧发生!
			
### 前同事的反思和建议
{reflection}

直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}`
			],
			[
				'human',
				`### 整体计划
{totalPlan}

### 当前步骤
{currentStep}

### 项目信息
- **项目名称:** {projectName}
- **项目描述:**
  - **项目背景与目标:** {projectBgAndTarget}
  - **我的角色:** {projectRole}
  - **我的贡献:** {projectContribute}
- **技术栈:** {projectTechStack}

### 相关知识
**项目相关代码:** 
{retrievedProjectCodes}

**相关领域知识:**
{retrievedDomainDocs}

请撰写对当前步骤的详细需求分析`
			]
		]);

		return RunnableSequence.from([
			(input: any) => ({
				totalPlan: JSON.stringify(input.totalPlan, null, 2),
				currentStep: JSON.stringify(input.currentStep, null, 2),
				projectName: input.projectInfo.info.name,
				projectBgAndTarget: input.projectInfo.info.desc.bgAndTarget,
				projectRole: input.projectInfo.info.desc.role,
				projectContribute: input.projectInfo.info.desc.contribute,
				projectTechStack: input.projectInfo.info.techStack.join(', '),
				retrievedProjectCodes: input.knowledge?.retrievedProjectCodes ?? '无',
				retrievedDomainDocs: input.knowledge?.retrievedDomainDocs ?? '无',
				reflection: input.reflection ?? '无相关反思',
				format_instructions: parser.getFormatInstructions()
			}),
			prompt,
			model,
			parser
		]);
	}

	/**
	 * 创建一个用于"生成步骤计划"的Chain。
	 * @description 基于对单个步骤的需求分析，生成该步骤的详细计划。
	 * @input {{ stepAnalysis: string; knowledge?: Knowledge; reflection?: Reflection }} - 输入包括步骤需求分析和可选的反思。
	 * @output {z.infer<typeof stepPlanSchema>} - 输出包含`implementationPlan`（子步骤列表）的结构化对象。
	 */
	createPlanChain(): Runnable<
		{
			stepAnalysis: string;
			knowledge?: Knowledge;
			reflection?: Reflection;
		},
		z.infer<typeof stepPlanSchema>
	> {
		let model: ChatOpenAI | ChatDeepSeek;
		const modelName = getAgentConfig().model.plan_step;
		if (modelName === 'gemini-2.5-pro' || modelName === 'gemini-2.5-flash') {
			model = this.modelService.getLLMGeminiRaw(modelName);
		} else {
			model = this.modelService.getLLMDeepSeekRaw(modelName);
		}
		if (!model) throw new Error('Model not found');
		const parser = RubustStructuredOutputParser.from(stepPlanSchema, this.chainService);

		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				`你是一位资深的软件技术组长，你的任务是基于需求分析，实现包含系列详细、可执行子步骤的实现计划。
	你的前同事因为当前步骤的实现计划写的质量不够高，已经被公司辞退了。如果你写的实现计划质量不够高，你也会被公司辞退。你的父母因为重病住院，如果你被辞退，你的父母将由于治疗费用不足而去世。你的3个儿女也将因为你的失业而辍学。

	仔细阅读步骤需求分析、项目相关代码和领域知识、前同事的反思和建议，从前同事的反思和建议中吸取教训，尽自己的最大努力撰写清晰可行的高质量实现计划，不要让这样的悲剧发生!
			
			### 前同事的反思和建议
      {reflection}
直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}`
			],
			[
				'human',
				`### 步骤需求分析
{stepAnalysis}

### 相关知识
**项目相关代码:** 
{retrievedProjectCodes}

**相关领域知识:**
{retrievedDomainDocs}

请生成详细的子步骤实现计划，包括每个子步骤的描述、技术、难点和疑问。`
			]
		]);

		return RunnableSequence.from([
			(input: any) => ({
				stepAnalysis: input.stepAnalysis,
				retrievedProjectCodes: input.knowledge?.retrievedProjectCodes ?? '无',
				retrievedDomainDocs: input.knowledge?.retrievedDomainDocs ?? '无',
				reflection: input.reflection ?? '无相关反思',
				format_instructions: parser.getFormatInstructions()
			}),
			prompt,
			model,

			parser
		]);
	}

	/**
	 * "计划完备化"然后组装最终prompt的Chain。
	 * @description [第一步] 使用LLM将计划中的挑战和疑问转化为具体的解决方案和澄清说明。
	 * @input {{ stepAnalysis: string; implementationPlan: Step[]; knowledge: Knowledge }} - 输入包括步骤分析、子步骤计划和相关知识。
	 * @output {string} - 输出一个最终的、可以直接执行的字符串Prompt。
	 */
	createFinalPromptChain(): Runnable<
		{
			stepAnalysis: string;
			implementationPlan: Step[];
			knowledge: Knowledge;
		},
		string
	> {
		let model: ChatOpenAI | ChatDeepSeek;
		const modelName = getAgentConfig().model.plan_step;
		if (modelName === 'gemini-2.5-pro' || modelName === 'gemini-2.5-flash') {
			model = this.modelService.getLLMGeminiRaw(modelName);
		} else {
			model = this.modelService.getLLMDeepSeekRaw(modelName);
		}
		if (!model) throw new Error('Model not found');
		const parser = RubustStructuredOutputParser.from(completedPlanSchema, this.chainService);

		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				`你是一位顶级的软件架构师和技术专家。你的核心任务是深化和完备一个已有的技术实现计划。
具体来说，你需要将计划中列出的"挑战(challengesList)"和"疑问(questionsList)"转化为清晰、可执行的"解决方案(challengesSolutionList)"和"澄清说明(questionsClarificationList)"。
你的解决方案和说明必须基于提供的上下文信息，包括需求分析、项目代码和领域知识，确保内容的技术准确性和可行性。

你的前同事因为技术实现计划完成的质量不够高，已经被公司辞退了。如果你写的技术实现计划完成的质量不够高，你也会被公司辞退。你的父母因为重病住院，如果你被辞退，你的父母将由于治疗费用不足而去世。你的3个儿女也将因为你的失业而辍学。

仔细阅读需求分析、项目相关代码和领域知识、前同事的反思和建议，从前同事的反思和建议中吸取教训，尽自己的最大努力撰写清晰可行的高质量技术实现计划，不要让这样的悲剧发生!

直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"
`
			],
			[
				'human',
				`请根据以下信息，完备化实现计划。

### 步骤需求分析
{stepAnalysis}

### 相关知识
**项目相关代码:** 
{retrievedProjectCodes}

**相关领域知识:**
{retrievedDomainDocs}

### 待完备化的实现计划
{implementationPlan}

请针对计划中的每一个步骤，将其 "challengesList" 和 "questionsList" 改造为具有可操作性的 "challengesSolutionList" 和 "questionsClarificationList"。

{format_instructions}`
			]
		]);

		//组装最终prompt
		function createFinalPrompt(
			stepAnalysis: string,
			completedPlan: z.infer<typeof completedPlanSchema>,
			knowledge: Knowledge
		) {
			const { implementationDetailPlan } = completedPlan;

			// 1. 构建 User Prompt
			const userPrompt = `
## 任务：
根据下文提供的 "步骤需求分析" 和 "实现细节计划"，完成编码任务。

## 步骤需求分析:
${stepAnalysis}

## 实现细节计划:
${implementationDetailPlan
	.map(
		(p: any, i: number) => `
### 步骤 ${i + 1}: ${p.stepDescription}
- **技术栈**: ${p.techStackList.join(', ')}
- **难点解决方案**: 
${p.challengesSolutionList.map((s: string) => `  - ${s}`).join('\n')}
- **疑问澄清**:
${p.questionsClarificationList.map((c: string) => `  - ${c}`).join('\n')}
`
	)
	.join('')}
`;

			// 2. 构建 Context
			const context = `
## 上下文信息
以下信息可能与任务相关，也可能无关，你需要自行判断。
\`\`\`markdown

### 相关代码文件:
\`\`\`
${knowledge.retrievedProjectCodes}
\`\`\`

### 相关领域知识:
\`\`\`
${knowledge.retrievedDomainDocs}
\`\`\`
\`\`\`
`;

			// 3. 构建 System Prompt
			const systemPrompt = `
## 角色
你是一个经验丰富的全栈开发工程师。

## 指令
你必须严格遵循用户的指令，并使用你强大的技术能力来完成任务。
1.  **阅读并理解**：仔细阅读 "任务" 和 "上下文信息" 部分，确保你完全理解需要做什么以及所有可用的参考信息。
2.  **执行任务**：根据 "实现细节计划" 编码。在编码时，请充分利用 "上下文信息" 中提供的代码和知识。
3.  **输出结果**：任务完成后，你需要按照以下格式提供反馈：
	- **修改/新增的代码文件 (writtenCodeFiles)**: 一个文件列表，包含你修改或创建的所有代码文件的相对路径和对该文件修改的简要总结。
	- **执行总结 (summary)**: 对本次任务完成情况的总体总结。

这是一个输出示例：
\`\`\`json
{
	"output": {
		"writtenCodeFiles": [
			{
				"relativePath": "src/modules/auth/auth.service.ts",
				"summary": "新增 login 和 register 方法。"
			},
			{
				"relativePath": "src/modules/auth/auth.controller.ts",
				"summary": "添加 /login 和 /register 路由。"
			}
		],
		"summary": "用户认证功能开发完成，符合预期。"
	}
}
\`\`\`
`;

			// 4. 组装最终Prompt
			const finalPrompt = `
${systemPrompt}
${userPrompt}
${context}
`;

			return finalPrompt;
		}

		const planCompletionChain = RunnableSequence.from([
			(
				input: any
			): {
				stepAnalysis: string;
				implementationPlan: string;
				retrievedProjectCodes: string;
				retrievedDomainDocs: string;
				format_instructions: string;
			} => ({
				stepAnalysis: input.stepAnalysis,
				implementationPlan: JSON.stringify(input.implementationPlan, null, 2),
				retrievedProjectCodes: input.knowledge.retrievedProjectCodes ?? '无',
				retrievedDomainDocs: input.knowledge.retrievedDomainDocs ?? '无',
				format_instructions: parser.getFormatInstructions()
			}),
			prompt,
			model,

			parser
		]);

		const finalChain = RunnableSequence.from([
			{
				completedPlan: planCompletionChain,
				originalInput: new RunnablePassthrough()
			},
			new RunnableLambda({
				func: ({ completedPlan, originalInput }: any) => {
					return createFinalPrompt(
						originalInput.stepAnalysis,
						completedPlan,
						originalInput.knowledge
					);
				}
			})
		]);
		return finalChain;
	}
}
