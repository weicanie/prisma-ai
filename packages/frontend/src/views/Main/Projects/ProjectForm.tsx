import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { projectSchemaForm, type ProjectDto } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { throttle } from 'lodash';
import { CheckIcon, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import { createProject, findById, updateProject } from '../../../services/project';
import { resetProjectData, selectProjectData, setDataFromDto } from '../../../store/projects';

type PropsType = PropsWithChildren<{
	//用于父组件控制是否使用md编辑器
	isUseMdEditor?: boolean;
	setIsUseMdEditor?: React.Dispatch<React.SetStateAction<boolean>>;
	id?: string; //传入id时为编辑模式
}>;
const ProjectForm: React.FC<PropsType> = ({ setIsUseMdEditor, id }) => {
	const [currentStep, setCurrentStep] = useState(0);
	const totalSteps = 3;
	const stepTitles = ['项目信息', '技术栈', '项目亮点'];

	const values = useSelector(selectProjectData);

	const dispatch = useDispatch();
	const onChange = throttle((values: ProjectDto) => {
		// dispatch(setDataFromDto(structuredClone(values)));
		dispatch(setDataFromDto(JSON.parse(JSON.stringify(values))));
	}, 1000);

	const queryClient = useQueryClient();
	const uploadProjectMutation = useCustomMutation(createProject, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ProjectQueryKey.Projects] });
			dispatch(resetProjectData()); // 重置表单
			toast.success('项目创建成功');
		},
		onError: error => {
			toast.error('项目上传失败');
			console.error('项目上传失败:', error);
		}
	});

	const updateProjectMutation = useCustomMutation(updateProject, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ProjectQueryKey.Projects] });
			dispatch(resetProjectData()); // 重置表单
			toast.success('项目更新成功');
		},
		onError: error => {
			toast.error('项目更新失败');
			console.error('项目更新失败:', error);
		}
	});
	const form = useForm<z.infer<typeof projectSchemaForm>>({
		resolver: zodResolver(projectSchemaForm),
		defaultValues: values
	});
	const { data, status } = useCustomQuery(
		[ProjectQueryKey.Projects, id],
		() => findById(id as string),
		{
			enabled: Boolean(id)
		}
	);
	const projectData = data?.data;
	useEffect(() => {
		if (status === 'pending') return;
		if (status === 'error') return;
		if (projectData) {
			form.setValue('name', projectData.name);
			form.setValue('info.name', projectData.info.name);
			form.setValue('info.desc', projectData.info.desc);
			form.setValue('info.techStack', projectData.info.techStack);
			form.setValue('lightspot.team', projectData.lightspot.team);
			form.setValue('lightspot.skill', projectData.lightspot.skill);
			form.setValue('lightspot.user', projectData.lightspot.user);
		}
	}, [status]);

	//TODO 用type="submit"的提交按钮,到第二步时就会提交,此时提交按钮应该才刚渲染(分步表单支持有问题？)
	async function onSubmit(values: z.infer<typeof projectSchemaForm>) {
		// 只有点击了提交按钮才允许提交
		if (currentStep !== totalSteps) {
			return;
		}
		if (id) {
			updateProjectMutation.mutate({ id, ...values });
		} else {
			uploadProjectMutation.mutate(values);
		}
	}

	// 使用 useFieldArray 实现动态数组
	const techStackArray = useFieldArray({
		control: form.control,
		//@ts-expect-error 内部类型体操失误导致误报, 实际没有问题
		name: 'info.techStack'
	});

	const teamArray = useFieldArray({
		control: form.control,
		name: 'lightspot.team'
	});

	const skillArray = useFieldArray({
		control: form.control,
		name: 'lightspot.skill'
	});

	const userArray = useFieldArray({
		control: form.control,
		name: 'lightspot.user'
	});

	// 项目描述字段配置
	const descriptionFields = [
		{
			key: 'role',
			label: '角色和职责',
			placeholder: '请描述您在项目中的角色和职责'
		},
		{
			key: 'contribute',
			label: '贡献和参与',
			placeholder: '请突出您的核心贡献和参与程度 '
		},
		{
			key: 'bgAndTarget',
			label: '背景与目标',
			placeholder: '请简要介绍项目的背景和目的'
		}
	];

	// 亮点部分配置
	const lightspotSections = [
		{
			key: 'team',
			label: '团队贡献方面',
			fieldArray: teamArray
		},
		{
			key: 'skill',
			label: '技术亮点/难点方面',
			fieldArray: skillArray
		},
		{
			key: 'user',
			label: '用户体验/业务价值方面',
			fieldArray: userArray
		}
	];

	const handleNext = () => {
		// ===totalSteps --> 点击了提交按钮
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrev = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	// 渲染步骤指示器
	const renderStepIndicator = () => (
		<div className="flex items-center justify-center mb-8">
			{stepTitles.map((title, index) => (
				<div key={index} className="flex items-center">
					<div
						className={`w-7 h-7 rounded-sm flex items-center justify-center text-sm font-medium cursor-pointer ${
							index === currentStep
								? 'bg-primary text-primary-foreground'
								: index < currentStep
									? 'bg-green-500 text-white'
									: 'bg-gray-200 text-gray-500'
						}`}
						onClick={() => setCurrentStep(index)}
					>
						{index < currentStep ? <CheckIcon className="size-4" /> : index + 1}
					</div>
					<span
						className={`ml-2 text-sm ${index === currentStep ? 'font-medium' : 'text-gray-500'}`}
					>
						{title}
					</span>
					{index < stepTitles.length - 1 && (
						<div
							className={`w-16 h-0.5 mx-4 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}
						/>
					)}
				</div>
			))}
		</div>
	);

	// 渲染项目信息步骤
	const renderProjectInfo = () => (
		<div className="space-y-8">
			{/* 名称 */}
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							<h4 className="text-lg font-semibold mb-2">名称</h4>
						</FormLabel>
						<FormControl>
							<Input placeholder="请输入小写英文字母和-组成的名称" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<h3 className="text-2xl font-bold">项目信息</h3>
			{/* 项目名称 */}
			<FormField
				control={form.control}
				name="info.name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							<h4 className="text-lg font-semibold mb-2">项目名称</h4>
						</FormLabel>
						<FormControl>
							<Input placeholder="请输入小写英文字母和-组成的项目名称" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* 项目描述 */}
			<h4 className="text-lg font-semibold">项目描述</h4>
			<div className="mt-4 space-y-6">
				{descriptionFields.map(field => (
					<FormField
						key={field.key}
						control={form.control}
						//@ts-expect-error 内部类型体操失误导致误报, 实际没有问题
						name={`info.desc.${field.key}`}
						render={({ field: formField }) => (
							<FormItem>
								<FormLabel>
									<h5 className="text-base font-medium mb-2">{field.label}</h5>
								</FormLabel>
								<FormControl>
									<Textarea placeholder={field.placeholder} {...formField} rows={3} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
			</div>
		</div>
	);

	// const isEdit = !!id;

	// 渲染技术栈步骤
	const renderTechStack = () => (
		<div className="space-y-8">
			<h3 className="text-2xl font-bold">项目技术栈</h3>

			<div className="space-y-4">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => techStackArray.append('')}
					className="max-w-32"
				>
					<Plus className="h-4 w-4 mr-2" /> 添加技术
				</Button>

				<div className="space-y-3">
					{techStackArray.fields.map((field, index) => (
						<div key={field.id} className="flex items-center gap-3">
							<FormField
								control={form.control}
								name={`info.techStack.${index}`}
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormControl>
											<Input placeholder="技术名称" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => techStackArray.remove(index)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	// 渲染项目亮点步骤
	const renderProjectHighlights = () => (
		<div className="space-y-8">
			<h3 className="text-2xl font-bold">项目亮点</h3>

			{lightspotSections.map(section => (
				<div key={section.key} className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="text-lg font-semibold">{section.label}</h4>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => section.fieldArray.append('')}
							className="max-w-32"
						>
							<Plus className="h-4 w-4 mr-2" /> 添加亮点
						</Button>
					</div>

					<div className="space-y-3">
						{section.fieldArray.fields.map((field, index) => (
							<div key={field.id} className="flex items-start gap-3">
								<FormField
									control={form.control}
									//@ts-expect-error 内部类型体操失误导致误报, 实际没有问题
									name={`lightspot.${section.key}.${index}`}
									render={({ field: formField }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Textarea placeholder="亮点描述..." {...formField} rows={2} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => section.fieldArray.remove(index)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
	//使用分步后，没有在每一步结束时验证当前字段，而是在提交时验证，因此需要提示用户检查此前的输入是否合法
	const renderError = () => {
		return (
			<div className="text-center">
				<p>提交失败，请检查此前步骤的输入内容是否合法，或者检查网络状况</p>
			</div>
		);
	};

	// 渲染当前步骤内容
	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return renderProjectInfo();
			case 1:
				return renderTechStack();
			case 2:
				return renderProjectHighlights();
			case 3:
				return renderError();
			default:
				return null;
		}
	};

	return (
		<div className="flex justify-center items-center max-w-3xl">
			<div className="w-full h-full">
				<Form {...form}>
					<form
						onSubmit={e => {
							form.handleSubmit(onSubmit)(e);
						}}
						onChange={() => onChange(form.getValues())}
						style={{ overflow: 'auto', padding: '2px' }}
						className="space-y-8"
					>
						{/* 步骤指示器 */}
						{renderStepIndicator()}

						{/* 当前步骤内容 */}
						<div className="min-h-96">{renderStepContent()}</div>

						{/* 导航按钮 */}
						<div className="flex justify-between items-center pt-8 border-t">
							<div>
								{currentStep === 0 && (
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsUseMdEditor?.(true)}
										className="group flex items-center"
									>
										使用md编辑器
										<ChevronRight className="h-4 w-4 ml-2  transition-transform duration-300 group-hover:translate-x-1" />
									</Button>
								)}
								{currentStep > 0 && (
									<Button
										type="button"
										variant="outline"
										onClick={handlePrev}
										className="group flex items-center"
									>
										<ChevronLeft className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
										上一步
									</Button>
								)}
							</div>
							<div>
								{currentStep < totalSteps - 1 ? (
									<Button type="button" onClick={handleNext} className="group flex items-center">
										下一步
										<ChevronRight className="h-4 w-4 ml-2  transition-transform duration-300 group-hover:translate-x-1" />
									</Button>
								) : (
									<Button type="submit" className="flex items-center" onClick={handleNext}>
										<CheckIcon className="h-4 w-4 mr-2" />
										提交项目
									</Button>
								)}
							</div>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default ProjectForm;
