import { PartialType } from '@nestjs/mapped-types';
import { CreateKnowledgebaseDto } from './create-knowledgebase.dto';

export class UpdateKnowledgebaseDto extends PartialType(
  CreateKnowledgebaseDto,
) {}
