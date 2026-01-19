import { Command } from '@langchain/langgraph';
import { Body, Controller, Get, Inject, Param, Post, Query, Sse } from '@nestjs/common';
import {
	ErrorCode,
	humanInputSchema,
	InterruptType,
	resultStepSchema,
	SelectedLLM,
	StageResult,
	UserAction,
	type ConversationSendDto,
	type ImplementDto,
	type RecoverDto,
	type SsePipeManager,
	type UserInfoFromToken
} from '@prisma-ai/shared';
import { RequireLogin, UserInfo } from '../../decorator';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { WithProjectGet } from '../../type/abstract';
import { AgentConversationService } from './agent-conversation.service';
import { PrismaAgentService } from './prisma-agent.service';
import { HumanInput } from './types';

// 支持以web UI方式使用Prisma Agent
@Controller('prisma_agent')
export class PrismaAgentController {
	constructor(
		private readonly prismaAgentService: PrismaAgentService,
		private readonly eventBusService: EventBusService,
		private readonly agentConversationService: AgentConversationService,
		@Inject('WithProjectGet')
		private readonly projectService: WithProjectGet,
		@Inject('SsePipeManager')
		private readonly sseManager: SsePipeManager
	) {}

	@RequireLogin()
	@Post('start')
	async start(
		@Body() implementDto: ImplementDto,
		@UserInfo() userInfo: UserInfoFromToken,
		@Query('uiType') uiType: 'CLI' | 'WEB' = 'WEB'
	) {
		const project = await this.projectService.findProjectById(implementDto.projectId, userInfo);
		const task = await this.prismaAgentService.startRunAgentTask(
			project,
			implementDto.lightspot,
			implementDto.projectPath,
			userInfo,
			crypto.randomUUID(),
			uiType
		);
		return task;
	}

	/** sse流式获取agent输出
	 * 使用已有的基础设施
	 */
	@Sse('stream')
	@RequireLogin()
	async sendMessageToAIStream(
		@Query('sessionId') sessionId: string,
		@Query('recover') recover: boolean,
		@Query('model') model: SelectedLLM,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		const metadata = {
			funcKey: this.prismaAgentService.sseAgentCurStream.name,
			poolName: this.prismaAgentService.poolName,
			model
		};

		if (recover) {
			return this.sseManager.handleSseRequestAndResponseRecover(sessionId, userInfo);
		}
		return this.sseManager.handleSseRequestAndResponse(sessionId, userInfo, metadata);
	}

	/**
	 * 前端通过长轮询方式，查看agent是否有正在生成的流，若有则请求sse推送
	 */
	@RequireLogin()
	@Get('has_cur_stream')
	async hasCurStream(@UserInfo() userInfo: UserInfoFromToken, @Query('runId') runId: string) {
		let agentHasCurStream = false;
		let pollDone = false; // 前端长轮询是否应该结束
		let interruptType: InterruptType | undefined; // 流结束后agent因何中断

		agentHasCurStream = await new Promise(resolve => {
			// 超时时间1分钟
			const timer = setTimeout(() => {
				resolve(false);
			}, 1000 * 60);

			// 先直接检查是否有正在生成的流
			if (this.prismaAgentService.ssePipeStatusMap[runId]?.hasUndoneStream) {
				clearTimeout(timer);
				resolve(true);
				interruptType = this.prismaAgentService.ssePipeStatusMap[runId]?.interruptType;
			}
			if (this.prismaAgentService.ssePipeStatusMap[runId] === undefined) {
				pollDone = true; // 执行已结束，前端长轮询应该结束
				resolve(false);
			}

			// 若没有正在生成的流，则监听是否有新的流生成
			this.eventBusService.once(EventList.pa_curSteamCreate, ({ metadata }) => {
				if (metadata.runId === runId) {
					clearTimeout(timer);
					resolve(true);
					interruptType = metadata.interruptType;
				}
			});
			this.eventBusService.once(EventList.pa_end, ({ metadata }) => {
				if (metadata.runId === runId) {
					clearTimeout(timer);
					resolve(false);
					pollDone = true; // 执行已结束，前端长轮询应该结束
				}
			});
		});

		return { hasCurStream: agentHasCurStream, pollDone, interruptType };
	}

	/**
	 * 前端接收完流数据后，调用此接口，删除当前流
	 */
	@RequireLogin()
	@Post('done_cur_stream')
	async doneCurStream(@UserInfo() userInfo: UserInfoFromToken, @Query('runId') runId: string) {
		if (this.prismaAgentService.ssePipeStatusMap[runId]?.hasUndoneStream) {
			await this.prismaAgentService.manageCurStream(runId, 'delete');
		}
	}

	/** 非流式获取agent输出
	 * 前端通过长轮询方式，获取agent的阶段成果（agent主动中断），进行review或者execute
	 * @return 请求超时|中断|执行已结束
	 */
	@RequireLogin()
	@Get('stage_result')
	async getStageResult(@UserInfo() userInfo: UserInfoFromToken, @Query('runId') runId: string) {
		const interruptData: StageResult | null = await new Promise(resolve => {
			// 超时时间1分钟
			const timer = setTimeout(() => {
				resolve(null);
			}, 1000 * 60);
			this.eventBusService.once(EventList.pa_interrupt, ({ metadata, interruptData }) => {
				if (metadata.runId === runId && metadata.userId === userInfo.userId) {
					clearTimeout(timer);
					resolve({ ...interruptData, done: false });
				}
			});
			this.eventBusService.once(EventList.pa_end, ({ metadata }) => {
				if (metadata.runId === runId && metadata.userId === userInfo.userId) {
					clearTimeout(timer);
					resolve({ done: true });
				}
			});
		});
		if (!interruptData) {
			throw new Error(ErrorCode.TIMEOUT + 'No interrupt data received within 1 minute');
		}
		return interruptData;
	}

	/**
	 * 用户review或者execute后，反馈以恢复agent执行
	 */
	@RequireLogin()
	@Post('stage_recover')
	async recover(@UserInfo() userInfo: UserInfoFromToken, @Body() recoverDto: RecoverDto) {
		const feedback = recoverDto.feedback;
		let interruptType: InterruptType = feedback.hasOwnProperty('action')
			? InterruptType.HumanReview
			: InterruptType.ExecuteStep;

		// 使用 Zod schema 对用户的反馈内容进行严格的格式校验
		try {
			if (interruptType === InterruptType.HumanReview) {
				humanInputSchema.parse(feedback);
			} else {
				resultStepSchema.parse(feedback);
			}
		} catch (error) {
			return new Error('Invalid feedback format. Please check your input.' + error);
		}

		// 恢复 graph 的执行
		if (interruptType === InterruptType.HumanReview) {
			this.eventBusService.emit(EventList.pa_recover, {
				metadata: {
					runId: recoverDto.runId,
					userId: userInfo.userId
				},
				type: InterruptType.HumanReview,
				resumeCommand: new Command({
					resume: feedback,
					update: {
						humanIO: {
							input: feedback
						},
						fixedContent:
							(feedback as HumanInput).action === UserAction.FIX ? recoverDto.fixedContent : ''
					}
				})
			});
		} else if (interruptType === InterruptType.ExecuteStep) {
			this.eventBusService.emit(EventList.pa_recover, {
				metadata: {
					runId: recoverDto.runId,
					userId: userInfo.userId
				},
				type: InterruptType.ExecuteStep,
				resumeCommand: new Command({
					resume: feedback
				})
			});
		}
	}

	/**
	 * 用户手动中断agent
	 */
	@RequireLogin()
	@Post('user_interrupt')
	async interrupt(@UserInfo() userInfo: UserInfoFromToken, @Query('runId') runId: string) {
		return 'not implemented';
	}

	/**
	 * 用户手动中断agent
	 */
	@RequireLogin()
	@Post('user_recover')
	async userRecover(@UserInfo() userInfo: UserInfoFromToken, @Query('runId') runId: string) {
		return 'not implemented';
	}

	/**
	 * 初始化项目的第一个空会话、更新已有的会话
	 */
	@Post('store')
	@RequireLogin()
	async storeConversation(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() conversationDto: ConversationSendDto
	) {
		return await this.agentConversationService.storeConversation(userInfo, conversationDto);
	}

	/**
	 * 给项目新建一个会话
	 */
	@Post('store-new')
	@RequireLogin()
	async storeNewConversation(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() conversationDto: ConversationSendDto
	) {
		return await this.agentConversationService.storeNewConversation(userInfo, conversationDto);
	}

	/**
	 * 获取某一项目经验下的对话历史列表
	 */
	@Get('/:project_id')
	@RequireLogin()
	async getConversationList(
		@UserInfo() userInfo: UserInfoFromToken,
		@Param('project_id') project_id: string
	) {
		return await this.agentConversationService.getConversationList(userInfo, project_id);
	}
}
