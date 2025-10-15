import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SkillVo, UserInfoFromToken } from '@prisma-ai/shared';
import { Model } from 'mongoose';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill, SkillDocument } from './entities/skill.entity';

@Injectable()
export class SkillService {
	@InjectModel(Skill.name)
	private skillModel: Model<SkillDocument>;

	constructor(private readonly eventBusService: EventBusService) {}

	async create(createSkillDto: CreateSkillDto, userInfo: UserInfoFromToken): Promise<SkillVo> {
		const createdSkill = new this.skillModel({
			...createSkillDto,
			userInfo
		});
		const savedSkill = await createdSkill.save();
		/* 更新用户记忆 */
		this.eventBusService.emit(EventList.userMemoryChange, {
			userInfo: userInfo,
			skill: createSkillDto
		});
		return savedSkill;
	}

	async findOne(id: string, userInfo: UserInfoFromToken): Promise<SkillVo> {
		const skill = await this.skillModel
			.findOne({ _id: id, 'userInfo.userId': userInfo.userId })
			.exec();
		if (!skill) {
			throw new NotFoundException(`Skill with ID "${id}" not found`);
		}
		return skill;
	}

	async findAll(userInfo: UserInfoFromToken): Promise<SkillVo[]> {
		return this.skillModel.find({ 'userInfo.userId': userInfo.userId }).exec();
	}

	async update(
		id: string,
		updateSkillDto: UpdateSkillDto,
		userInfo: UserInfoFromToken
	): Promise<SkillVo> {
		const existingSkill = await this.skillModel
			.findByIdAndUpdate(id, { $set: updateSkillDto }, { new: true })
			.exec();
		if (!existingSkill) {
			throw new NotFoundException(`Skill with ID "${id}" not found`);
		}
		return existingSkill;
	}

	async remove(id: string, userInfo: UserInfoFromToken): Promise<void> {
		const result = await this.skillModel
			.deleteOne({ _id: id, 'userInfo.userId': userInfo.userId })
			.exec();
		if (result.deletedCount === 0) {
			throw new NotFoundException(`Skill with ID "${id}" not found`);
		}
	}
}
