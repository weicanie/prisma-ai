import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SkillVo, UserInfoFromToken } from '@prism-ai/shared';
import { Model } from 'mongoose';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill, SkillDocument } from './entities/skill.entity';

@Injectable()
export class SkillService {
  @InjectModel(Skill.name)
  private skillModel: Model<SkillDocument>;

  constructor() {}

  async create(
    createSkillDto: CreateSkillDto,
    userInfo: UserInfoFromToken,
  ): Promise<SkillVo> {
    const createdSkill = new this.skillModel({
      ...createSkillDto,
      userInfo,
    });
    return createdSkill.save();
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
    userInfo: UserInfoFromToken,
  ): Promise<SkillVo> {
    const existingSkill = await this.skillModel
      .findOneAndUpdate(
        { _id: id, 'userInfo.userId': userInfo.userId },
        updateSkillDto,
        { new: true }, // Return the updated document
      )
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
