import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  FileTypeEnum,
  KnowledgeTypeEnum,
  KnowledgeVo,
  UserInfoFromToken,
} from '@prism-ai/shared';
import { Document } from 'mongoose';
import { UserInfo } from '../../project/entities/project.entity';

@Schema({ timestamps: true })
export class Knowledgebase
  implements Omit<KnowledgeVo, 'id' | 'createdAt' | 'updatedAt'>
{
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fileType: `${FileTypeEnum}`;

  @Prop([String])
  tag: string[];

  @Prop({ required: true })
  type: `${KnowledgeTypeEnum}`;

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
  },
});

KnowledgebaseSchema.set('toObject', {
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

KnowledgebaseSchema.index({ 'userInfo.userId': 1 });
KnowledgebaseSchema.index({ name: 1 });
