/**
 * @description 用户作为求职者的画像。
 * 该结构基于MECE原则设计，以关键词提炼为核心。
 *
 * 一、关键词驱动 (Keyword-Centric)：几乎所有字段都是 string[] 类型，强制LLM以提炼和归纳核心短语为目标，避免了冗长的自由发挥，输出结果更干净、更易于机器处理。
 *
 * 二、严格遵循MECE原则：
 * 相互独立 (Mutually Exclusive)：qualifications (我是谁), skills_matrix (我会什么), responsibilities (我做过什么) 三大模块清晰地划分了候选人画像的不同维度，互不重叠。
 * 在模块内部，如programming_languages和frameworks_and_libraries也做了精细切
 * 割。
 *
 * 完全穷尽 (Completely Exhaustive)：
 * 此结构试图涵盖一份职位描述（JD）中所有可能提炼出的关键信息，从学历背景到软硬技
 * 能，再到工作内容和项目影响力，形成了一个全面的画像。
 *
 * 三、高度通用 (High Generality)：该模型不依赖于任何特定岗位的术语。无论是开发
 * 工程师、产品经理还是财务分析师，他们的要求都可以被解构并填充到这个通用的“资历-
 * 能力-职责”框架中。
 */
import { z } from 'zod';
import { CreateCareerDtoShared } from '../career/career';
import { CreateEducationDtoShared } from '../education/education';
import { CreateJobDto } from '../job';
import { UserInfoFromToken } from '../loginVerify';
import { ProjectDto } from '../project/project';
import { CreateSkillDto } from '../skill';

const userProfileSchema = z.object({
	qualifications: z
		.object({
			experience_level: z
				.array(z.string())
				.describe('工作经验水平关键词。例如：对于 "3-5年经验", 提炼为 ["3-5年", "中级"]'),
			education_degree: z.array(z.string()).describe('学历要求关键词。例如：["本科", "硕士优先"]'),
			education_majors: z
				.array(z.string())
				.describe('专业领域关键词。例如：["软件工程","信息安全"]'),
			language_proficiencies: z
				.array(z.string())
				.describe('语言能力要求关键词。例如：["英语 CET-6"]'),
			certifications: z
				.array(z.string())
				.describe('资格证书关键词。例如：["PMP", "CPA", "AWS认证架构师"]')
		})
		.describe('模块一：资历背景 (Qualifications) - 候选人的可量化、可验证的客观背景信息'),

	skills_matrix: z
		.object({
			domain_knowledge: z
				.array(z.string())
				.describe('领域/行业知识关键词。例如：["电商业务", "SaaS", "游戏行业"]'),
			programming_languages: z
				.array(z.string())
				.describe('硬技能 - 编程语言与技术栈关键词。例如：["Java", "Python", "C++"]'),
			frameworks_and_libraries: z
				.array(z.string())
				.describe('硬技能 - 框架、库、中间件关键词。例如：["Spring Boot", "React", "TensorFlow"]'),
			tools_and_platforms: z
				.array(z.string())
				.describe(
					'硬技能 - 工具、平台、系统关键词。例如：["Docker", "Kubernetes", "Jenkins", "Git"]'
				),
			soft_skills: z
				.array(z.string())
				.describe('软技能关键词。例如：["沟通能力", "逻辑思维", "抗压能力"]')
		})
		.describe('模块二：能力模型 (Skills Matrix) - 候选人完成工作所需掌握的知识和技能集合'),

	responsibilities: z
		.object({
			primary_duties: z
				.array(z.string())
				.describe(
					'核心职责关键词（动词+名词短语）。例如：["系统设计", "架构开发", "性能优化", "需求分析", "自动化测试"]'
				),
			work_methodologies: z
				.array(z.string())
				.describe(
					'工作/项目模式关键词。例如：["敏捷开发", "DevOps", "项目管理", "从0到1", "重构"]'
				),
			scope_and_impact: z
				.array(z.string())
				.describe(
					'经验范围与影响力关键词。例如：["高并发", "分布式系统", "主导项目", "跨团队协作", "带领团队"]'
				)
		})
		.describe('模块三：职责范围 (Responsibilities) - 候选人过往经历中应体现出的工作内容和项目特征')
});

const jobSeekDestinationSchema = z
	.object({
		jobType: z.array(z.string()).describe('职位方向，如前端、后端、全栈'),
		jobName: z.array(z.string()).describe('职位具体名称，如web前端开发工程师、游戏后端开发工程师'),
		industry: z.array(z.string()).describe('行业，如电商、流媒体、金融、游戏'),
		company: z.array(z.string()).describe('公司，如阿里巴巴、腾讯、字节跳动'),
		city: z.array(z.string()).describe('期望城市')
	})
	.describe('用户求职方向');

const userMemorySchema = z
	.object({
		userProfile: userProfileSchema,
		jobSeekDestination: jobSeekDestinationSchema
	})
	.describe('用户记忆 - 包含用户画像和求职方向的完整信息');

interface UserMemoryAction {
	userInfo: UserInfoFromToken;
	project?: ProjectDto | string;
	skill?: CreateSkillDto | string;
	career?: CreateCareerDtoShared | string;
	education?: CreateEducationDtoShared | string;
	job?: CreateJobDto | string;
}

type UserMemoryT = z.infer<typeof userMemorySchema>;
type jobSeekDestinationT = z.infer<typeof jobSeekDestinationSchema>;
type UserProfileT = z.infer<typeof userProfileSchema>;

export { jobSeekDestinationT, UserMemoryAction, userMemorySchema, UserMemoryT, UserProfileT };
