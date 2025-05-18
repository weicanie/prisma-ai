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
import { message } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuroraText } from '../../../components/magicui/aurora-text';
import { projectSchemaForm } from '../../../types/project.schema';

type PropsType = PropsWithChildren<{}>;

export function ProjectForm({}: PropsType) {
	const form = useForm<z.infer<typeof projectSchemaForm>>({
		resolver: zodResolver(projectSchemaForm),
		defaultValues: {
			info: {
				name: '',
				desc: {
					role: '',
					contribute: '',
					bgAndTarget: ''
				},
				techStack: []
			},
			lightspot: {
				team: [],
				skill: [],
				user: []
			}
		}
	});

	// 使用 useFieldArray 实现动态数组
	const techStackArray = useFieldArray({
		control: form.control,
		//内部类型体操失误导致误报, 实际没有问题
		//@ts-expect-error
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

	const navigate = useNavigate();

	// 项目描述字段配置
	const descriptionFields = [
		{
			key: 'role',
			label: '角色和职责',
			placeholder: '请描述您在项目中担任的角色和职责'
		},
		{
			key: 'contribute',
			label: '贡献和参与',
			placeholder: '请描述您对项目的主要贡献和参与'
		},
		{
			key: 'bgAndTarget',
			label: '背景与目标',
			placeholder: '请描述项目的背景与目标'
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

	async function onSubmit(values: z.infer<typeof projectSchemaForm>) {
		try {
			console.log('提交的项目数据:', values);
			message.success('项目信息保存成功');
			// 后续处理，如保存到后端
		} catch (e: any) {
			message.error(e.response?.data?.message || '系统繁忙，请稍后再试');
		}
	}
	//FIXME 动态数组项使用tooltip中的词会显示异常的白色背景且难以去除
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{/* 一、项目名称 */}
				<FormField
					control={form.control}
					name="info.name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<h3 className="text-2xl font-medium mb-2">
									<AuroraText>项目名称</AuroraText>
								</h3>
							</FormLabel>
							<FormControl>
								<Input placeholder="请输入项目名称" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* 二、项目描述 - 数组渲染 */}
				<div className="mt-4">
					<h3 className="text-2xl font-medium mb-2">
						<AuroraText>项目描述</AuroraText>
					</h3>

					{descriptionFields.map((field, index) => (
						<FormField
							key={field.key}
							control={form.control}
							name={`info.desc.${field.key}` as any}
							render={({ field: formField }) => (
								<FormItem className={index > 0 ? 'mt-2' : ''}>
									<FormLabel>
										<h3 className="text-lg font-medium mb-2">{field.label}</h3>
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

				{/* 三、技术栈 */}
				<div className="mt-4">
					<div className="flex justify-between items-center">
						<h3 className="text-2xl font-medium">
							<AuroraText>项目技术栈</AuroraText>
						</h3>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => techStackArray.append('')}
						>
							<Plus className="h-4 w-4 mr-1" /> 添加技术
						</Button>
					</div>

					<div className="space-y-2 mt-2">
						{techStackArray.fields.map((field, index) => (
							<div key={field.id} className="flex items-center gap-2">
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

				{/* 四、项目亮点 - 数组渲染 */}
				<h3 className="text-2xl font-medium mb-2">
					<AuroraText>项目亮点</AuroraText>
				</h3>

				{lightspotSections.map((section, sectionIndex) => (
					<div key={section.key} className={sectionIndex === 0 ? 'mt-2' : 'mt-4'}>
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">{section.label}</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => section.fieldArray.append('')}
							>
								<Plus className="h-4 w-4 mr-1" /> 添加亮点
							</Button>
						</div>

						<div className="space-y-2 mt-2">
							{section.fieldArray.fields.map((field, index) => (
								<div key={field.id} className="flex items-center gap-2">
									<FormField
										control={form.control}
										name={`lightspot.${section.key}.${index}` as any}
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

				{/*五、 按钮 */}
				<div className="flex justify-start space-x-5">
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						重置
					</Button>
					<Button type="submit" className="bg-blue-700 hover:bg-blue-800">
						保存项目
					</Button>
				</div>
			</form>
		</Form>
	);
}
