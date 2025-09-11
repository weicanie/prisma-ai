import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserInfoFromToken } from '@prisma-ai/shared';
import { Model } from 'mongoose';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Education, EducationDocument } from './entities/education.entity';

@Injectable()
export class EducationService {
	constructor(
		@InjectModel(Education.name)
		private readonly educationModel: Model<EducationDocument>
	) {}

	// 创建教育经历
	async create(createEducationDto: CreateEducationDto, userInfo: UserInfoFromToken) {
		const { ...rest } = createEducationDto;
		const created = await this.educationModel.create({
			userInfo,
			...rest,
			startDate: new Date(rest.startDate),
			endDate: rest.endDate ? new Date(rest.endDate) : undefined
		});
		return created;
	}

	// 查询当前用户的教育经历列表
	async findAll(userId: string) {
		const filter = { 'userInfo.userId': userId };
		return this.educationModel.find(filter).sort({ startDate: -1 }).lean();
	}

	// 根据 id 查询
	async findOne(id: string) {
		const doc = await this.educationModel.findById(id).lean();
		if (!doc) throw new NotFoundException('教育经历不存在');
		return doc;
	}

	// 更新
	async update(id: string, updateEducationDto: UpdateEducationDto, userInfo: UserInfoFromToken) {
		const { ...rest } = updateEducationDto;
		const $set: any = { ...rest };
		if (userInfo) {
			$set.userInfo = {
				...(userInfo ? { userInfo } : {})
			};
		}
		if (rest.startDate) $set.startDate = new Date(rest.startDate as any);
		if (rest.endDate) $set.endDate = new Date(rest.endDate as any);
		const doc = await this.educationModel.findByIdAndUpdate(id, { $set }, { new: true }).lean();
		if (!doc) throw new NotFoundException('教育经历不存在');
		return doc;
	}

	// 删除
	async remove(id: string) {
		const doc = await this.educationModel.findByIdAndDelete(id).lean();
		if (!doc) throw new NotFoundException('教育经历不存在');
		return { id: doc.id } as any;
	}
}
