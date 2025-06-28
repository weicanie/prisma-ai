import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Runnable, RunnableSequence } from '@langchain/core/runnables';
import { MemorySaver } from '@langchain/langgraph';
import { Inject, Injectable } from '@nestjs/common';
import { ProjectDto } from '@prism-ai/shared';
import { z } from 'zod';
import { WithFormfixChain } from '../../chain/abstract';
import { ModelService } from '../../model/model.service';
import { RubustStructuredOutputParser } from '../../utils/RubustStructuredOutputParser';
import { Reflection } from '../types';
import { PlanGraph } from './planner';
import { ReplanGraph } from './replanner';

const analysisSchema = z.object({
	highlightAnalysis: z.string().describe('对亮点的详细需求分析，包括功能点、非功能需求、约束等')
});

const planSchema = z.object({
	implementationPlan: z
		.array(
			z.object({
				stepDescription: z.string().describe('步骤的详细描述'),
				techStackList: z.array(z.string()).describe('该步骤需要使用的技术清单'),
				challengesList: z.array(z.string()).describe('该步骤可能遇到的难点清单'),
				questionsList: z.array(z.string()).describe('关于该步骤存在的疑问清单')
			})
		)
		.describe('实现亮点的具体步骤清单')
});

@Injectable()
export class PlanExecuteAgentService {
	private readonly planWorkflow: ReturnType<typeof PlanGraph.compile>;

	private readonly replanWorkflow: ReturnType<typeof ReplanGraph.compile>;

	constructor(
		private readonly modelService: ModelService,
		@Inject(WithFormfixChain)
		private readonly chainService: WithFormfixChain
	) {
		const checkpointer = new MemorySaver();
		const checkpointer2 = new MemorySaver();
		this.planWorkflow = PlanGraph.compile({ checkpointer });
		this.replanWorkflow = ReplanGraph.compile({ checkpointer: checkpointer2 });
	}

	public getPlanWorkflow() {
		return this.planWorkflow;
	}

	public getReplanWorkflow() {
		return this.replanWorkflow;
	}

	/**
	 * 创建一个用于"需求分析"的Chain。
	 * 该Chain负责根据项目信息和要实现的功能亮点，生成详细的需求分析。
	 * @input {{ projectInfo: ProjectDto; lightSpot: string; knowledge?: any; reflection?: Reflection }} - 输入包括项目信息、功能亮点、可选的知识库内容和反思。
	 * @output {z.infer<typeof analysisSchema>} - 输出一个包含`highlightAnalysis`字段的结构化对象。
	 */
	createAnalysisChain(): Runnable<
		{
			projectInfo: ProjectDto;
			lightSpot: string;
			knowledge?: { retrievedProjectCodes: string; retrievedDomainDocs: string };
			reflection?: Reflection;
		},
		z.infer<typeof analysisSchema>
	> {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const parser = RubustStructuredOutputParser.from(analysisSchema, this.chainService);

		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				`你是一位顶级的软件需求分析师。你的任务是基于用户提供的项目信息、要实现的功能亮点以及相关的知识和反思，生成一份详尽、专业的需求分析报告。
你的前同事因为用户要求的需求分析写的质量不够高，已经被公司辞退了。如果你写的需求分析质量不够高，你也会被公司辞退。你的父母因为重病住院，如果你被辞退，你的父母将由于治疗费用不足而去世。你的3个儿女也将因为你的失业而辍学。

仔细阅读用户提供的目标项目信息和要实现的功能亮点、前同事的反思和建议、项目相关代码和相关领域知识，从前同事的反思和建议中吸取教训，尽自己的最大努力撰写清晰可行的高质量需求分析，不要让这样的悲剧发生!

### 前同事的反思和建议
{reflection}

**输出要求:**
- 你必须只输出一个名为 'highlightAnalysis' 的JSON对象。
- 需求分析必须清晰，逻辑清晰，条理清晰。
- 需求分析必须专业，符合软件需求分析的规范。
- 需求分析必须准确，符合项目实际情况。

直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}`
			],
			[
				'human',
				`请为以下功能亮点进行需求分析。

### 目标项目信息
- **项目名称:** {projectName}
- **项目描述:**
  - **项目背景与目标:** {projectBgAndTarget}
  - **我的角色:** {projectRole}
  - **我的贡献:** {projectContribute}
- **技术栈:** {projectTechStack}

### 要实现的功能亮点
{lightSpot}

### 相关知识

**项目相关代码:** 
{retrievedProjectCodes}

**相关领域知识:**
{retrievedDomainDocs}

请生成详细的需求分析。`
			]
		]);

		return RunnableSequence.from([
			{
				reflection: input => input.reflection ?? '无相关反思',
				projectName: input => input.projectInfo.info.name,
				projectBgAndTarget: input => input.projectInfo.info.desc.bgAndTarget,
				projectRole: input => input.projectInfo.info.desc.role,
				projectContribute: input => input.projectInfo.info.desc.contribute,
				projectTechStack: input => input.projectInfo.info.techStack.join(', '),
				lightSpot: input => input.lightSpot,
				retrievedProjectCodes: input => input.knowledge?.retrievedProjectCodes ?? '无',
				retrievedDomainDocs: input => input.knowledge?.retrievedDomainDocs ?? '无',
				format_instructions: () => parser.getFormatInstructions()
			},
			prompt,
			model,

			parser
		]);
	}

	/**
	 * 创建一个用于"生成计划"的Chain。
	 * 该Chain负责根据需求分析结果，制定出分步骤的实现计划。
	 * @input {{ projectInfo: ProjectDto; lightSpot: string; highlightAnalysis: string; knowledge?: any; reflection?: Reflection }} - 输入包括项目信息、功能亮点、需求分析、可选的知识库内容和反思。
	 * @output {z.infer<typeof planSchema>} - 输出一个包含`implementationPlan`数组的结构化对象。
	 */
	createPlanChain(): Runnable<
		{
			projectInfo: ProjectDto;
			lightSpot: string;
			highlightAnalysis: string;
			knowledge?: { retrievedProjectCodes: string; retrievedDomainDocs: string };
			reflection?: Reflection;
		},
		z.infer<typeof planSchema>
	> {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const parser = RubustStructuredOutputParser.from(planSchema, this.chainService);

		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				`你是一位资深的软件架构师和技术主管。你的任务是基于需求分析、项目现有代码和相关领域知识，制定一个清晰、可行、分步骤的实现计划。
你的前同事因为当前实现计划写的质量不够高，已经被公司辞退了。如果你写的实现计划质量不够高，你也会被公司辞退。你的父母因为重病住院，如果你被辞退，你的父母将由于治疗费用不足而去世。你的3个儿女也将因为你的失业而辍学。

仔细阅读用户提供的需求分析、项目相关代码和相关领域知识、前同事的反思和建议，从前同事的反思和建议中吸取教训，尽自己的最大努力制定清晰可行的高质量实现计划，不要让这样的悲剧发生!

### 前同事的反思和建议
{reflection}

**输出要求:**
- 你必须只输出一个名为 'implementationPlan' 的JSON对象，它是一个步骤数组。
- 每个步骤都应包含 'stepDescription', 'techStackList', 'challengesList', 'questionsList'。
- 计划需要具备可执行性，步骤之间逻辑清晰，并且要考虑到潜在的挑战和问题。
- 当所有步骤都完成后，需求会被实现。

直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}`
			],
			[
				'human',
				`请为以下功能亮点制定实现计划。

### 目标项目信息
- **项目名称:** {projectName}
- **项目描述:**
  - **项目背景与目标:** {projectBgAndTarget}
  - **我的角色:** {projectRole}
  - **我的贡献:** {projectContribute}
- **技术栈:** {projectTechStack}

### 要实现的功能亮点
{lightSpot}

### 需求分析
{highlightAnalysis}

### 相关知识 

**项目相关代码:** 
{retrievedProjectCodes}

**相关领域知识:**
{retrievedDomainDocs}



请生成分步实现计划。`
			]
		]);
		return RunnableSequence.from([
			{
				reflection: input => input.reflection ?? '无相关反思',
				projectName: input => input.projectInfo.info.name,
				projectBgAndTarget: input => input.projectInfo.info.desc.bgAndTarget,
				projectRole: input => input.projectInfo.info.desc.role,
				projectContribute: input => input.projectInfo.info.desc.contribute,
				projectTechStack: input => input.projectInfo.info.techStack.join(', '),
				lightSpot: input => input.lightSpot,
				highlightAnalysis: input => input.highlightAnalysis,
				retrievedProjectCodes: input => input.knowledge?.retrievedProjectCodes ?? '无',
				retrievedDomainDocs: input => input.knowledge?.retrievedDomainDocs ?? '无',
				format_instructions: () => parser.getFormatInstructions()
			},
			prompt,
			model,

			parser
		]);
	}

	/**
	 * 创建一个用于"重新进行需求分析"的Chain (Re-analysis)。
	 * 在重新规划(replan)流程中使用。它接收比初始分析更多的上下文，包括用户反馈、执行结果和反思。
	 * @input 完整的重新规划上下文。
	 * @output 更新后的`highlightAnalysis`。
	 */
	createReAnalysisChain(): Runnable<
		{
			projectName: string;
			projectDescription: string;
			projectTechStack: string;
			lightSpot: string;
			originalPlan: string;
			userFeedback: string;
			summary: string;
			writtenCodeFiles: string;
			stepResultList: string;
			retrievedProjectCodes: string;
			retrievedDomainDocs: string;
			reflection: string;
		},
		z.infer<typeof analysisSchema>
	> {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const parser = RubustStructuredOutputParser.from(analysisSchema, this.chainService);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				`你是一位顶级的软件需求分析师。你的任务是基于上一个执行步骤的结果和用户反馈，重新审视和更新项目功能亮点的需求分析。
你的前同事因为用户要求的需求分析写的质量不够高，已经被公司辞退了。如果你写的需求分析质量不够高，你也会被公司辞退。你的父母因为重病住院，如果你被辞退，你的父母将由于治疗费用不足而去世。你的3个儿女也将因为你的失业而辍学。

仔细阅读用户提供的需求分析、项目相关代码和相关领域知识、前同事的反思和建议，从前同事的反思和建议中吸取教训，尽自己的最大努力撰写清晰可行的高质量需求分析，不要让这样的悲剧发生!

### 前同事的反思和建议
{reflection}

**核心任务:**
- **评估反馈**: 仔细分析用户反馈和执行摘要，理解哪里与预期不符或需要调整。
- **结合反思**: 深入理解'反思与建议'部分，将其作为修正需求分析的核心依据。
- **更新分析**: 基于以上信息，生成一份更新后的、更精确的需求分析报告。

**输出要求:**
- 你必须只输出一个名为 'highlightAnalysis' 的JSON对象。
- 新的分析必须明确地回应反馈和反思中提出的问题。

直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}`
			],
			[
				'human',
				`我们刚刚执行了第一个步骤，请根据执行结果调整需求分析。

### 目标项目信息
- **项目名称:** {projectName}
- **项目描述:** {projectDescription}
- **技术栈:** {projectTechStack}

### 要实现的功能亮点
{lightSpot}

### 原始计划
\`\`\`json
{originalPlan}
\`\`\`

### 上一步的执行结果
- **用户反馈:** {userFeedback}
- **执行总结:** {summary}
- **修改/新增的代码文件:**
{writtenCodeFiles}

### 所有步骤的执行结果
\`\`\`json
{stepResultList}
\`\`\`

### 相关知识
**项目相关代码:**
{retrievedProjectCodes}
**相关领域知识:**
{retrievedDomainDocs}

请基于以上所有信息，生成一份更新后的详细需求分析。`
			]
		]);
		return RunnableSequence.from([
			(input: any) => ({
				...input,
				reflection: input.reflection ?? '无相关反思',
				format_instructions: parser.getFormatInstructions()
			}),
			prompt,
			model,

			parser
		]);
	}

	/**
	 * 创建一个用于"重新生成计划"的Chain (Re-plan)。
	 * 在重新规划(replan)流程中使用。它基于更新后的需求分析，以及所有历史和反馈信息，生成一个全新的、用于完成剩余任务的计划。
	 * @input 完整的重新规划上下文。
	 * @output 更新后的`implementationPlan`。
	 */
	createRePlanChain(): Runnable<
		{
			projectName: string;
			projectDescription: string;
			projectTechStack: string;
			lightSpot: string;
			highlightAnalysis: string;
			originalPlan: string;
			userFeedback: string;
			summary: string;
			writtenCodeFiles: string;
			stepResultList: string;
			retrievedProjectCodes: string;
			retrievedDomainDocs: string;
			reflection: string;
		},
		z.infer<typeof planSchema>
	> {
		const model = this.modelService.getLLMDeepSeekRaw('deepseek-chat');
		const parser = RubustStructuredOutputParser.from(planSchema, this.chainService);
		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				`你是一位资深的软件架构师。你的任务是基于更新后的需求分析和对上一步执行结果的反馈，为项目**剩余的工作**制定一个全新的、详细的实现计划。
你的前同事因为当前实现计划写的质量不够高，已经被公司辞退了。如果你写的实现计划质量不够高，你也会被公司辞退。你的父母因为重病住院，如果你被辞退，你的父母将由于治疗费用不足而去世。你的3个儿女也将因为你的失业而辍学。
仔细阅读用户提供的需求分析、上一步和所有步骤的执行结果、项目相关代码和相关领域知识、前同事的反思和建议，从前同事的反思和建议中吸取教训，尽自己的最大努力制定清晰可行的高质量实现计划，不要让这样的悲剧发生!

### 前同事的反思和建议
{reflection}

**核心任务:**
- **审视过去**: 分析原始计划和上一步的执行结果，理解已完成的工作和出现的问题。
- **面向未来**: 基于新的需求分析和反思建议，为**未完成的目标**设计一套新的、更优的执行步骤。
- **详细规划**: 新计划的每个步骤都必须是具体、可执行的。

**输出要求:**
- 你必须只输出一个名为 'implementationPlan' 的JSON对象，它是一个步骤数组。
- **这个计划应该只包含完成目标所需的【剩余步骤】**。不要包含已经完成的工作。
- 每个步骤都应包含 'stepDescription', 'techStackList', 'challengesList', 'questionsList'。
- 计划需要具备可执行性，步骤之间逻辑清晰，并且要考虑到潜在的挑战和问题。
- 当所有步骤都完成后，需求会被实现。

直接输出JSON对象本身,而不是markdown格式的json块。
比如你应该直接输出"{{"name":"..."}}"而不是"\`\`\`json\n{{"name":"..."}}\n\`\`\`"

{format_instructions}`
			],
			[
				'human',
				`我们刚刚执行了一个步骤，并根据执行结果更新了需求分析，现在需要根据执行结果为剩余的工作而调整计划。

### 目标项目信息
- **项目名称:** {projectName}
- **项目描述:** {projectDescription}
- **技术栈:** {projectTechStack}

### 要实现的功能亮点
{lightSpot}

### 原始计划
\`\`\`json
{originalPlan}
\`\`\`

### 上一步执行结果
- **用户反馈:** {userFeedback}
- **执行总结:** {summary}
- **修改/新增的代码文件:**
{writtenCodeFiles}

### 所有步骤的执行结果
\`\`\`json
{stepResultList}
\`\`\`

### 需求分析
{highlightAnalysis}

### 相关知识
**项目相关代码:**
{retrievedProjectCodes}
**相关领域知识:**
{retrievedDomainDocs}


请为**剩余的工作**生成一个全新的、详细的、分步骤的实现计划。
如果要实现的功能亮点已完成，返回空数组`
			]
		]);
		return RunnableSequence.from([
			(input: any) => ({
				...input,
				reflection: input.reflection ?? '无相关反思',
				format_instructions: parser.getFormatInstructions()
			}),
			prompt,
			model,

			parser
		]);
	}
}
