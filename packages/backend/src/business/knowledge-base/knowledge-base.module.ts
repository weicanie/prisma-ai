import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OssModule } from '../../oss/oss.module';
import {
  Knowledgebase,
  KnowledgebaseSchema,
} from './entities/knowledge-base.entity';
import { KnowledgebaseController } from './knowledge-base.controller';
import { KnowledgebaseService } from './knowledge-base.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Knowledgebase.name, schema: KnowledgebaseSchema },
    ]),
    OssModule
  ],
  controllers: [KnowledgebaseController],
  providers: [KnowledgebaseService],
  exports: [KnowledgebaseService],
})
export class KnowledgebaseModule {}
