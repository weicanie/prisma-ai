import { Command } from '@langchain/langgraph';
import { Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
import { ZodError } from 'zod';
import { EventBusService } from '../../EventBus/event-bus.service';
import { Event_Payload, EventList, InterruptType, UserAction } from '../../type/eventBus';
import { user_data_dir } from '../../utils/constants';
import { PrismaAgentService } from './prisma-agent.service';
import { HumanInput, humanInputSchema, Result_step, resultStepSchema, ReviewType } from './types';
/* 支持以CLI方式使用Prisma Agent
  agent以发布事件/处理事件的方式进行生产和消费。
  这种事件驱动的模式可以实现解耦。
*/
class PrismaAgentCLIAdapter {
	private readonly prismaAgentService: PrismaAgentService;
	private readonly eventBusService: EventBusService;
	private readonly logger = new Logger(PrismaAgentCLIAdapter.name);
	private outputDir = '';

	constructor(prismaAgentService: PrismaAgentService, eventBusService: EventBusService) {
		this.prismaAgentService = prismaAgentService;
		this.eventBusService = eventBusService;
	}

	init(userId: string) {
		this.outputDir = user_data_dir.agentOutputPath(userId);
		fs.mkdir(this.outputDir, { recursive: true }).catch(error => {
			this.logger.error('Failed to create agent_output directory', error);
		});
		this.eventBusService.on(EventList.pa_interrupt, this._handleInterruptEvent.bind(this));
	}

	clean() {
		this.eventBusService.off(EventList.pa_interrupt, this._handleInterruptEvent.bind(this));
	}

	async _handleInterruptEvent(e: Event_Payload[EventList.pa_interrupt]) {
		const interruptData = e.interruptData;
		// 步骤1、将要 review 的内容写入文件
		const outputPath = await this.writeReviewFile(
			e.interruptData.reviewType,
			e.interruptData.content!
		);
		const humanFeedbackPath = path.join(
			user_data_dir.agentOutputPath(e.metadata.userId),
			'human_feedback.json'
		);

		// 保存当前中断信息到文件，供审查和调试。
		// await fs.writeFile(
		// 	path.join(
		// 		user_data_dir.agentOutputPath(threadConfig.configurable.userId),
		// 		'interrupt_payload.json'
		// 	),
		// 	JSON.stringify(interruptData, null, 2)
		// );

		/** 工具函数
		 * @description 根据中断类型，写入不同的反馈表单到文件。
		 * @param interruptType - 中断类型。
		 */
		const displayHumanFeedback = async (interruptType: InterruptType) => {
			if (interruptType === InterruptType.HumanReview) {
				await fs.writeFile(
					humanFeedbackPath,
					JSON.stringify({ action: 'accept', content: '反馈内容' }, null, 2)
				);
			} else if (interruptType === InterruptType.ExecuteStep) {
				await fs.writeFile(
					humanFeedbackPath,
					JSON.stringify(
						{
							output: {
								userFeedback: '你的反馈(由你撰写)',
								writtenCodeFiles: '修改总结清单(ai生成)',
								summary: '最终总结(ai生成)'
							}
						},
						null,
						2
					)
				);
			}
		};

		// 步骤2: 设置命令行界面，进入循环，不断提示用户，直到获得一个有效的输入。
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		const askQuestion = (query: string): Promise<string> =>
			new Promise(resolve => rl.question(query, resolve));

		let validatedInput: HumanInput | Result_step | null = null;

		while (validatedInput === null) {
			// 根据中断的类型（是需要审核，还是需要执行步骤），显示不同的提示信息。
			if (interruptData.type === InterruptType.HumanReview) {
				// 这是来自 waitForHumanReview 的审核请求
				await displayHumanFeedback(InterruptType.HumanReview);
				this.logger.log(
					`\n=== 需要您审核输出文件: ${this.getRealFilePath(outputPath)} ===
					\n1. 请在以下文件中输入您的反馈: ${this.getRealFilePath(humanFeedbackPath)}
					\n命令: accept（完全接受并继续） | fix（手动修改然后继续） | redo（反馈并重做,反馈内容填在content里）
					\n2. 输入 'do' 继续, 或输入 'exit' 退出.`
				);
			} else if (interruptData.type === InterruptType.ExecuteStep) {
				await displayHumanFeedback(InterruptType.ExecuteStep);
				// 这是来自 executeStep 的执行请求
				this.logger.log(`\n=== 需要执行步骤 ===
					\n1. 请根据以下文件中的描述执行编码任务: ${this.getRealFilePath(outputPath)}
					\n2. 请在以下文件中输入结果反馈: ${this.getRealFilePath(humanFeedbackPath)}
					\n3. 输入 'do' 继续, 或输入 'exit' 退出.`);
			} else {
				this.logger.error('未知的中断类型:', interruptData.type);
				throw new Error('未知的中断类型');
			}

			const command = await askQuestion('> ');

			if (command.toLowerCase() === 'exit') {
				rl.close();
				throw new Error('用户中止了流程。');
			}

			// 当用户准备好后，输入'do'，程序会读取反馈文件。
			if (command.toLowerCase() === 'do') {
				try {
					const feedbackContent = await fs.readFile(humanFeedbackPath, 'utf-8');
					const feedbackJson = JSON.parse(feedbackContent);
					// 使用 Zod schema 对用户在文件中输入的内容进行严格的格式校验。
					switch (interruptData.type) {
						case InterruptType.ExecuteStep:
							// 校验 Result_step
							validatedInput = resultStepSchema.parse(feedbackJson);
							break;
						case InterruptType.HumanReview:
							// 校验 HumanInput
							validatedInput = humanInputSchema.parse(feedbackJson);
							break;
						default:
							throw new Error('未知的 InterruptType');
					}
					this.logger.log('反馈校验成功。');
				} catch (error) {
					// 如果校验失败，打印详细错误，并让用户重新修改文件。
					if (error instanceof ZodError) {
						this.logger.error('格式校验错误:', error.errors);
						this.logger.error(`文件 ${humanFeedbackPath} 格式错误，请按原格式提交。`);
					} else {
						this.logger.error(`读取或解析 ${humanFeedbackPath} 时出错:`, error);
					}
					validatedInput = null; // 重置 validatedInput，使循环继续。
				}
			}
		}

		rl.close();
		// 步骤3: 将校验通过的用户输入包装成一个 Command 对象，用于恢复 graph 的执行。
		if (interruptData.type === InterruptType.HumanReview) {
			const reviewType = interruptData.reviewType;
			if (!reviewType) {
				throw new Error(
					'Could not determine review type from current state for HumanReview interrupt.'
				);
			}
			// 当用户选择手动修改时，需要读取修改后的内容
			validatedInput = validatedInput as HumanInput;
			let fixedContent: string | Record<any, any> = '';
			if (validatedInput.action === UserAction.FIX) {
				let fixedContentStr = await fs.readFile(outputPath, 'utf-8');
				const fileExtension = path.extname(outputPath);
				const isJson = fileExtension === '.json';
				fixedContent = isJson ? JSON.parse(fixedContentStr) : fixedContentStr;
			}

			this.eventBusService.emit(EventList.pa_recover, {
				metadata: {
					runId: e.metadata.runId,
					userId: e.metadata.userId
				},
				type: InterruptType.HumanReview,
				resumeCommand: new Command({
					resume: validatedInput,
					update: {
						humanIO: {
							input: validatedInput as HumanInput
						},
						fixedContent
					}
				})
			});
		} else if (interruptData.type === InterruptType.ExecuteStep) {
			this.eventBusService.emit(EventList.pa_recover, {
				metadata: {
					runId: e.metadata.runId,
					userId: e.metadata.userId
				},
				type: InterruptType.ExecuteStep,
				resumeCommand: new Command({
					resume: validatedInput
				})
			});
		} else {
			throw new Error(`Unknown interrupt type: ${interruptData.type}`);
		}
	}

	/** 工具
	 * 将需要用户 review 的内容写入指定文件
	 * @param reviewType 要 review 的内容类型，决定了写入哪个文件（如 plan.json, analysis.md 等）。
	 * @param content 要写入文件的字符串内容。
	 * @returns {Promise<string>} - 返回写入文件的绝对路径。
	 */
	private async writeReviewFile(reviewType: ReviewType, content: string): Promise<string> {
		const getFilePath = (reviewType: ReviewType) => {
			switch (reviewType) {
				case ReviewType.PLAN:
				case ReviewType.RE_PLAN:
					return path.join(this.outputDir, 'plan.json');
				case ReviewType.ANALYSIS:
				case ReviewType.RE_ANALYSIS:
					return path.join(this.outputDir, 'analysis.md');
				case ReviewType.PLAN_STEP:
					return path.join(this.outputDir, 'plan_step.json');
				case ReviewType.ANALYSIS_STEP:
					return path.join(this.outputDir, 'analysis_step.md');
				case ReviewType.Execute_Step:
					return path.join(this.outputDir, 'plan_step_for_execution.json');
				default:
					throw new Error(`Unsupported review type: ${reviewType}`);
			}
		};
		const filePath = getFilePath(reviewType);
		try {
			// 使用 fs/promises 异步写入
			await fs.writeFile(filePath, content, { encoding: 'utf-8' });
			return filePath;
		} catch (error) {
			this.logger.error(`Failed to write to ${filePath}`, error);
			throw error;
		}
	}

	/** 工具
	 * @description 将容器内路径转换为真实文件路径（挂载的卷）
	 * @param filePath 文件路径
	 * @returns 真实文件路径
	 */
	private getRealFilePath(filePath: string) {
		if (process.env.NODE_ENV === 'production') {
			filePath = filePath.replace('/app', './');
		}
		return filePath;
	}
}

export { PrismaAgentCLIAdapter };
