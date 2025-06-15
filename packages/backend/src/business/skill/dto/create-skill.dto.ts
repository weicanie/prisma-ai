import { SkillItem } from '../entities/skill.entity';

export class CreateSkillDto {
  readonly name: string;
  readonly content: SkillItem[];
}
