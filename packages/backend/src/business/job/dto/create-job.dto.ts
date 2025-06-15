import { JobOpenStatus, JobStatus } from '@prism-ai/shared';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  readonly jobName: string;

  @IsString()
  @IsNotEmpty()
  readonly companyName: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly location?: string;

  @IsOptional()
  @IsString()
  readonly salary?: string;

  @IsOptional()
  @IsString()
  readonly link?: string;
  @IsOptional()
  @IsString()
  job_status?: JobOpenStatus; // 职位状态， "open", "closed"
  @IsOptional()
  @IsString()
  status?: JobStatus; // 职位内部状态，"committed", "embedded", "matched" 未处理、已embedding、已被用户简历追踪
}
