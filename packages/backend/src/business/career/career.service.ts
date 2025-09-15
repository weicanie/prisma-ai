import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserInfoFromToken } from '@prisma-ai/shared';
import { Model } from 'mongoose';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { Career, CareerDocument } from './entities/career.entity';

@Injectable()
export class CareerService {
	constructor(
		@InjectModel(Career.name)
		private readonly careerModel: Model<CareerDocument>
	) {}

	async create(createCareerDto: CreateCareerDto, userInfo: UserInfoFromToken) {
		const created = await this.careerModel.create({
			userInfo,
			...createCareerDto,
			startDate: new Date(createCareerDto.startDate),
			endDate: createCareerDto.endDate ? new Date(createCareerDto.endDate) : undefined
		});
		return created;
	}

	async findAll(userId: string) {
		return this.careerModel.find({ 'userInfo.userId': userId }).sort({ startDate: -1 });
	}

	async findOne(id: string) {
		const doc = await this.careerModel.findById(id);
		if (!doc) throw new NotFoundException('工作经历不存在');
		return doc;
	}

	async update(id: string, updateCareerDto: UpdateCareerDto, userInfo: UserInfoFromToken) {
		const doc = await this.careerModel.findByIdAndUpdate(
			id,
			{ $set: updateCareerDto },
			{ new: true }
		);
		if (!doc) throw new NotFoundException('工作经历不存在');
		return doc;
	}

	async remove(id: string) {
		const doc = await this.careerModel.findByIdAndDelete(id);
		if (!doc) throw new NotFoundException('工作经历不存在');
		return { id: doc.id } as any;
	}
}
