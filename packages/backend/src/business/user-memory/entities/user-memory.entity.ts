import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type jobSeekDestinationT, type UserProfileT } from '@prisma-ai/shared';
import { HydratedDocument } from 'mongoose';
import { UserInfo } from '../../project/entities/project.entity';

@Schema({ timestamps: true })
export class UserMemory {
	@Prop({ type: Object, required: true })
	userProfile: UserProfileT;

	@Prop({ type: Object, required: true })
	jobSeekDestination: jobSeekDestinationT;

	@Prop({ type: UserInfo, required: true })
	userInfo: UserInfo;
}

export type UserMemoryDocument = HydratedDocument<UserMemory> & {
	id: string;
	createdAt: string;
	updatedAt: string;
};

export const UserMemorySchema = SchemaFactory.createForClass(UserMemory);

UserMemorySchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // 将 _id 转换为 id 字符串
		delete ret._id;
	}
});

// 为每个用户ID创建唯一索引，确保一个用户只有一份记忆
UserMemorySchema.index({ 'userInfo.userId': 1 }, { unique: true });
