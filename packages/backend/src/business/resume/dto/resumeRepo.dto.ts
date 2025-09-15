import { IsNotEmpty, IsString } from 'class-validator';
import { ActionType } from '../../../utils/resume/constant';
import { ResumeData } from '../../../utils/resume/type';

export class ResumeRepoDto {
	@IsString()
	@IsNotEmpty()
	readonly repoType: string;

	@IsString()
	@IsNotEmpty()
	readonly actionType: ActionType;

	readonly payload: { resumeData: ResumeData; prevResume?: ResumeData };
}
