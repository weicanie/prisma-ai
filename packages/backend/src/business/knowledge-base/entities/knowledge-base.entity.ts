import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileTypeEnum, KnowledgeTypeEnum, KnowledgeVo, UserInfoFromToken } from '@prisma-ai/shared';
import { Document } from 'mongoose';
import { UserInfo } from '../../project/entities/project.entity';

@Schema({ timestamps: true })
export class Knowledgebase implements Omit<KnowledgeVo, 'id' | 'createdAt' | 'updatedAt'> {
	@Prop({ required: true })
	name: string;

	@Prop({ type: String, enum: FileTypeEnum, required: true })
	fileType: FileTypeEnum;

	/* 知识标签-由用户自定义*/
	@Prop([String])
	tag: string[];
	/* 知识类型-声明知识用途

  1.项目相关
    用户项目
      项目文档 'userProjectDoc'
      项目代码（github地址） 'userProjectRepo'
    同类型开源项目
      开源项目文档 'openSourceProjectDoc'
      开源项目代码（github地址） 'openSourceProjectRepo'
  2.技术相关
    技术文档 'techDoc'
  3.面试相关
    面试题（面经转为面试题） 'interviewQuestion'
  4.其它 'other'

  */
	@Prop({ type: String, enum: KnowledgeTypeEnum, required: true })
	type: KnowledgeTypeEnum;

	/* 
  文档内容
  1.txt: 文本内容
  2.doc: 文档web url、文档oss url
  3.url: 文档url
  */
	@Prop({ required: true })
	content: string;

	@Prop({ type: UserInfo })
	userInfo: UserInfoFromToken;
}
export type KnowledgebaseDocument = Knowledgebase &
	Document & {
		createdAt: Date;
		updatedAt: Date;
	};

export const KnowledgebaseSchema = SchemaFactory.createForClass(Knowledgebase);

KnowledgebaseSchema.set('toJSON', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString(); // Convert _id to id string
		delete ret._id;
	}
});

KnowledgebaseSchema.set('toObject', {
	versionKey: false,
	transform: function (doc, ret) {
		ret.id = ret._id.toString();
		delete ret._id;
	}
});

KnowledgebaseSchema.index({ 'userInfo.userId': 1 });
KnowledgebaseSchema.index({ name: 1 });
