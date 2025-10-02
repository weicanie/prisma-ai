import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AIChatLLM, UserMemoryAction, UserMemoryT } from '@prisma-ai/shared';
import { Model } from 'mongoose';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { AichatChainService } from '../../chain/aichat-chain.service';
import { WithGetUserMemory } from '../../utils/abstract';
import { UserMemory, UserMemoryDocument } from './entities/user-memory.entity';

@Injectable()
export class UserMemoryService implements OnModuleInit, WithGetUserMemory {
	constructor(
		private readonly eventBusService: EventBusService,
		private readonly aichatChainService: AichatChainService,
		@InjectModel(UserMemory.name) private userMemoryModel: Model<UserMemoryDocument>
	) {}

	async onModuleInit() {
		this.eventBusService.on(EventList.userMemoryChange, this.userMemoryChangeHandler.bind(this));
	}

	async userMemoryChangeHandler(input: UserMemoryAction) {
		const { userinfo } = input;
		const userId = userinfo.userId;

		const existingMemory = await this.userMemoryModel.findOne({ 'userInfo.userId': userId }).lean();

		if (existingMemory) {
			// 更新逻辑: 调用 updateUserMemoryChain
			const chain = await this.aichatChainService.updateUserMemoryChain({
				llm_type: AIChatLLM.gemini_2_5_flash // 默认使用性价比高的模型
			});

			const new_info = this.formatNewInfo(input);

			const updatedMemory: UserMemoryT = await chain.invoke({
				existing_memory: {
					userProfile: existingMemory.userProfile,
					jobSeekDestination: existingMemory.jobSeekDestination
				},
				new_info: new_info
			});

			await this.userMemoryModel.updateOne(
				{ 'userInfo.userId': userId },
				{
					userProfile: updatedMemory.userProfile,
					jobSeekDestination: updatedMemory.jobSeekDestination,
					userInfo: userinfo
				},
				{ upsert: true }
			);
		} else {
			// 创建逻辑: 调用 createUserMemoryChain
			const chain = await this.aichatChainService.createUserMemoryChain({
				llm_type: AIChatLLM.gemini_2_5_flash // 默认使用性价比高的模型
			});
			const payload = this.formatCreationPayload(input);
			const newMemory: UserMemoryT = await chain.invoke(payload);

			await this.userMemoryModel.create({
				...newMemory,
				userInfo: userinfo
			});
		}
	}
	/**
	 * 将 UserMemoryAction 转换为 createUserMemoryChain 所需的输入对象
	 * @param input
	 * @returns
	 */
	private formatCreationPayload(input: UserMemoryAction) {
		const payload: { [key: string]: string } = {};
		if (input.skill)
			payload.skill = typeof input.skill === 'string' ? input.skill : JSON.stringify(input.skill);
		if (input.project)
			payload.project =
				typeof input.project === 'string' ? input.project : JSON.stringify(input.project);
		if (input.career)
			payload.career =
				typeof input.career === 'string' ? input.career : JSON.stringify(input.career);
		if (input.education)
			payload.education =
				typeof input.education === 'string' ? input.education : JSON.stringify(input.education);
		if (input.job)
			payload.job = typeof input.job === 'string' ? input.job : JSON.stringify(input.job);
		return payload;
	}

	/**
	 * 将 UserMemoryAction 转换为 updateUserMemoryChain 所需的 new_info 字符串
	 * @param input
	 * @returns
	 */
	private formatNewInfo(input: UserMemoryAction): string {
		let infoString = '';
		if (input.skill)
			infoString += `技能更新: ${
				typeof input.skill === 'string' ? input.skill : JSON.stringify(input.skill)
			}\n`;
		if (input.project)
			infoString += `项目更新: ${
				typeof input.project === 'string' ? input.project : JSON.stringify(input.project)
			}\n`;
		if (input.career)
			infoString += `工作经历更新: ${
				typeof input.career === 'string' ? input.career : JSON.stringify(input.career)
			}\n`;
		if (input.education)
			infoString += `教育背景更新: ${
				typeof input.education === 'string' ? input.education : JSON.stringify(input.education)
			}\n`;
		if (input.job)
			infoString += `求职意向更新: ${
				typeof input.job === 'string' ? input.job : JSON.stringify(input.job)
			}\n`;
		return infoString.trim();
	}

	async getUserMemory(userId: string) {
		const userMemory = await this.userMemoryModel.findOne({ 'userInfo.userId': userId }).lean();
		return userMemory as UserMemoryT;
	}

	/**
	 * 直接更新用户记忆（不通过AI处理）
	 * @param userId 用户ID
	 * @param userMemoryData 用户记忆数据
	 * @returns 更新后的用户记忆
	 */
	async updateUserMemory(userId: string, userMemoryData: UserMemoryT) {
		// 获取用户信息
		const existingMemory = await this.userMemoryModel.findOne({ 'userInfo.userId': userId }).lean();

		if (!existingMemory) {
			throw new Error('用户记忆不存在，无法更新');
		}

		// 直接更新用户记忆数据
		const updatedMemory = await this.userMemoryModel.findOneAndUpdate(
			{ 'userInfo.userId': userId },
			{
				userProfile: userMemoryData.userProfile,
				jobSeekDestination: userMemoryData.jobSeekDestination,
				// 保持原有的用户信息不变
				userInfo: existingMemory.userInfo
			},
			{
				new: true, // 返回更新后的文档
				lean: true // 返回普通对象而不是Mongoose文档
			}
		);

		return updatedMemory;
	}
}
