import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { userMemorySchema, type UserMemoryT } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { UserMemoryQueryKey } from '../../../query/keys';
import { getUserMemory, updateUserMemory } from '../../../services/user_memory';

interface UserMemoryFormProps {
	_?: string;
}

const UserMemoryForm = memo(() => {
	const queryClient = useQueryClient();
	const [isQualificationsOpen, setIsQualificationsOpen] = useState(true);
	const [isSkillsOpen, setIsSkillsOpen] = useState(true);
	const [isResponsibilitiesOpen, setIsResponsibilitiesOpen] = useState(true);
	const [isJobSeekOpen, setIsJobSeekOpen] = useState(true);

	const form = useForm<UserMemoryT>({
		resolver: zodResolver(userMemorySchema),
		defaultValues: {
			userProfile: {
				qualifications: {
					experience_level: [] as string[],
					education_degree: [] as string[],
					education_majors: [] as string[],
					language_proficiencies: [] as string[],
					certifications: [] as string[]
				},
				skills_matrix: {
					domain_knowledge: [] as string[],
					programming_languages: [] as string[],
					frameworks_and_libraries: [] as string[],
					tools_and_platforms: [] as string[],
					soft_skills: [] as string[]
				},
				responsibilities: {
					primary_duties: [] as string[],
					work_methodologies: [] as string[],
					scope_and_impact: [] as string[]
				}
			},
			jobSeekDestination: {
				jobType: [] as string[],
				jobName: [] as string[],
				industry: [] as string[],
				company: [] as string[],
				city: [] as string[]
			}
		}
	});

	const updateMutation = useCustomMutation(updateUserMemory, {
		onSuccess: () => {
			toast.success('用户记忆更新成功');
			queryClient.invalidateQueries({ queryKey: [UserMemoryQueryKey.UserMemory] });
		},
		onError: error => {
			toast.error('更新失败: ' + (error as Error).message);
		}
	});

	// 获取用户记忆数据
	const { data, status } = useCustomQuery([UserMemoryQueryKey.UserMemory], getUserMemory);

	const userMemoryData = data?.data;
	useEffect(() => {
		if (status === 'pending') return;
		if (status === 'error') return;
		if (userMemoryData) {
			form.reset(userMemoryData);
		}
	}, [status, userMemoryData, form]);

	// 动态数组字段管理
	const experienceLevelArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.qualifications.experience_level'
	});

	const educationDegreeArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.qualifications.education_degree'
	});

	const educationMajorsArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.qualifications.education_majors'
	});

	const languageProficienciesArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.qualifications.language_proficiencies'
	});

	const certificationsArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.qualifications.certifications'
	});

	const domainKnowledgeArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.skills_matrix.domain_knowledge'
	});

	const programmingLanguagesArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.skills_matrix.programming_languages'
	});

	const frameworksArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.skills_matrix.frameworks_and_libraries'
	});

	const toolsArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.skills_matrix.tools_and_platforms'
	});

	const softSkillsArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.skills_matrix.soft_skills'
	});

	const primaryDutiesArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.responsibilities.primary_duties'
	});

	const workMethodologiesArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.responsibilities.work_methodologies'
	});

	const scopeAndImpactArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'userProfile.responsibilities.scope_and_impact'
	});

	const jobTypeArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'jobSeekDestination.jobType'
	});

	const jobNameArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'jobSeekDestination.jobName'
	});

	const industryArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'jobSeekDestination.industry'
	});

	const companyArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'jobSeekDestination.company'
	});

	const cityArray = useFieldArray({
		control: form.control,
		//@ts-expect-error Type 'string' is not assignable to type 'never'.
		name: 'jobSeekDestination.city'
	});

	const onSubmit = (values: UserMemoryT) => {
		updateMutation.mutate(values);
	};

	// 复制JSON到剪贴板的函数
	const copyJsonToClipboard = async () => {
		try {
			const currentValues = form.getValues();
			const jsonString = JSON.stringify(currentValues, null, 2);
			await navigator.clipboard.writeText(jsonString);
			toast.success('JSON已复制到剪贴板');
		} catch (error) {
			toast.error('复制失败');
		}
	};

	// 渲染动态数组字段的通用组件
	const renderArrayField = (
		fieldArray: any,
		fieldName: string,
		label: string,
		placeholder: string
	) => (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<FormLabel className="text-sm font-medium">{label}</FormLabel>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => fieldArray.append('')}
					className="h-8 w-8 p-0"
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>
			{fieldArray.fields.map((field: any, index: number) => (
				<div key={field.id} className="flex items-center gap-2">
					<FormField
						control={form.control}
						name={`${fieldName}.${index}` as any}
						render={({ field }) => (
							<FormItem className="flex-1">
								<FormControl>
									<Input placeholder={placeholder} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => fieldArray.remove(index)}
						className="h-8 w-8 p-0 text-red-600"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			))}
		</div>
	);

	if (status === 'pending') return <div className="p-4">加载中...</div>;
	if (status === 'error') return <div className="p-4 text-red-600">加载失败</div>;

	return (
		<div className="w-full h-full max-w-4xl mx-auto">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* 用户画像部分 */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold">用户记忆</h2>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={copyJsonToClipboard}
								className="flex items-center gap-2"
							>
								<Copy className="h-4 w-4" />
								复制JSON
							</Button>
						</div>

						{/* 资历背景 */}
						<Collapsible open={isQualificationsOpen} onOpenChange={setIsQualificationsOpen}>
							<CollapsibleTrigger asChild>
								<Button variant="ghost" className="w-full justify-between p-0 h-auto">
									<h3 className="text-lg font-medium">资历背景 (Qualifications)</h3>
									{isQualificationsOpen ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="space-y-4 mt-4 pl-6">
								<div className="grid grid-cols-1 gap-4">
									{renderArrayField(
										experienceLevelArray,
										'userProfile.qualifications.experience_level',
										'工作经验水平',
										'如: 3-5年, 中级'
									)}
									{renderArrayField(
										educationDegreeArray,
										'userProfile.qualifications.education_degree',
										'学历要求',
										'如: 本科, 硕士优先'
									)}
									{renderArrayField(
										educationMajorsArray,
										'userProfile.qualifications.education_majors',
										'专业领域',
										'如: 软件工程, 信息安全'
									)}
									{renderArrayField(
										languageProficienciesArray,
										'userProfile.qualifications.language_proficiencies',
										'语言能力',
										'如: 英语 CET-6'
									)}
								</div>
								<div className="w-full">
									{renderArrayField(
										certificationsArray,
										'userProfile.qualifications.certifications',
										'资格证书',
										'如: PMP, CPA, AWS认证架构师'
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>

						{/* 能力模型 */}
						<Collapsible open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
							<CollapsibleTrigger asChild>
								<Button variant="ghost" className="w-full justify-between p-0 h-auto">
									<h3 className="text-lg font-medium">能力模型 (Skills Matrix)</h3>
									{isSkillsOpen ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="space-y-4 mt-4 pl-6">
								<div className="grid grid-cols-1 gap-4">
									{renderArrayField(
										domainKnowledgeArray,
										'userProfile.skills_matrix.domain_knowledge',
										'领域/行业知识',
										'如: 电商业务, SaaS, 游戏行业'
									)}
									{renderArrayField(
										programmingLanguagesArray,
										'userProfile.skills_matrix.programming_languages',
										'编程语言',
										'如: Java, Python, C++'
									)}
									{renderArrayField(
										frameworksArray,
										'userProfile.skills_matrix.frameworks_and_libraries',
										'框架和库',
										'如: Spring Boot, React, TensorFlow'
									)}
									{renderArrayField(
										toolsArray,
										'userProfile.skills_matrix.tools_and_platforms',
										'工具和平台',
										'如: Docker, Kubernetes, Jenkins'
									)}
								</div>
								<div className="w-full">
									{renderArrayField(
										softSkillsArray,
										'userProfile.skills_matrix.soft_skills',
										'软技能',
										'如: 沟通能力, 逻辑思维, 抗压能力'
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>

						{/* 职责范围 */}
						<Collapsible open={isResponsibilitiesOpen} onOpenChange={setIsResponsibilitiesOpen}>
							<CollapsibleTrigger asChild>
								<Button variant="ghost" className="w-full justify-between p-0 h-auto">
									<h3 className="text-lg font-medium">职责范围 (Responsibilities)</h3>
									{isResponsibilitiesOpen ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="space-y-4 mt-4 pl-6">
								<div className="grid grid-cols-1 gap-4">
									{renderArrayField(
										primaryDutiesArray,
										'userProfile.responsibilities.primary_duties',
										'核心职责',
										'如: 系统设计, 架构开发, 性能优化'
									)}
									{renderArrayField(
										workMethodologiesArray,
										'userProfile.responsibilities.work_methodologies',
										'工作/项目模式',
										'如: 敏捷开发, DevOps, 项目管理'
									)}
								</div>
								<div className="w-full">
									{renderArrayField(
										scopeAndImpactArray,
										'userProfile.responsibilities.scope_and_impact',
										'经验范围与影响力',
										'如: 高并发, 分布式系统, 主导项目'
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>
					</div>

					{/* 求职方向部分 */}
					<div className="space-y-4">
						<Collapsible open={isJobSeekOpen} onOpenChange={setIsJobSeekOpen}>
							<CollapsibleTrigger asChild>
								<Button variant="ghost" className="w-full justify-between p-0 h-auto">
									<h3 className="text-lg font-medium">求职方向 (Job Preferences)</h3>
									{isJobSeekOpen ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="space-y-4 mt-4 pl-6">
								<div className="grid grid-cols-1 gap-4">
									{renderArrayField(
										jobTypeArray,
										'jobSeekDestination.jobType',
										'职位方向',
										'如: 前端, 后端, 全栈'
									)}
									{renderArrayField(
										jobNameArray,
										'jobSeekDestination.jobName',
										'职位名称',
										'如: web前端开发工程师, 游戏后端开发工程师'
									)}
									{renderArrayField(
										industryArray,
										'jobSeekDestination.industry',
										'行业',
										'如: 电商, 流媒体, 金融, 游戏'
									)}
									{renderArrayField(
										companyArray,
										'jobSeekDestination.company',
										'公司',
										'如: 阿里巴巴, 腾讯, 字节跳动'
									)}
								</div>
								<div className="w-full">
									{renderArrayField(
										cityArray,
										'jobSeekDestination.city',
										'期望城市',
										'如: 北京, 上海, 深圳'
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>
					</div>

					<div className="fixed right-30 bottom-6 flex justify-end gap-2">
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? '保存中...' : '保存'}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
});

export default UserMemoryForm;
