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
import { projectSchemaForm } from '@prism-ai/shared';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { CheckIcon, ChevronDown, ChevronRightIcon, Plus, Trash2 } from 'lucide-react';
import { memo, type PropsWithChildren } from 'react';
import { AnimatedSubscribeButton } from '../../../components/magicui/animated-subscribe-button';
import { useCustomMutation } from '../../../query/config';
import { createProject } from '../../../services/project';

type PropsType = PropsWithChildren<{}>;

export const ProjectForm = memo(({}: PropsType) => {
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
			label: '2.1 团队贡献方面',
			fieldArray: teamArray
		},
		{
			key: 'skill',
			label: '2.2 技术亮点/难点方面',
			fieldArray: skillArray
		},
		{
			key: 'user',
			label: '2.3 用户体验/业务价值方面',
			fieldArray: userArray
		}
	];

	const uploadProjectMutation = useCustomMutation(createProject);

	async function onSubmit(values: z.infer<typeof projectSchemaForm>) {
		console.log('提交的项目数据:', values);
		uploadProjectMutation.mutate(values);
	}
	//FIXME 动态数组项使用tooltip中的词会显示异常的白色背景且难以去除
	return (
		<div className="flex justify-center items-center w-full h-full">
			<div className="basis-170">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-15">
						<h3 className="text-2xl font-bold mb-13">
							<>1、项目信息</>
						</h3>
						{/* 一、项目名称 */}
						<FormField
							control={form.control}
							name="info.name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<h3 className="text-2xl font-bold mb-5">
											<>1.1 项目名称</>
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
						<Collapsible defaultOpen={true}>
							<CollapsibleTrigger className="flex items-center justify-around w-full">
								<h3 className="text-2xl font-bold mb-5">
									<>1.2 项目描述</>
								</h3>
								<ChevronDown className="ml-auto" />
							</CollapsibleTrigger>
							<CollapsibleContent>
								<div className="mt-4">
									{descriptionFields.map((field, index) => (
										<FormField
											key={field.key}
											control={form.control}
											name={`info.desc.${field.key}` as any}
											render={({ field: formField }) => (
												<FormItem className={index > 0 ? 'mt-10' : ''}>
													<FormLabel>
														<h3 className="text-lg font-bold mb-2">{field.label}</h3>
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
							</CollapsibleContent>
						</Collapsible>

						{/* 三、技术栈 */}
						<div className="mt-4">
							<div className="flex flex-col space-y-5">
								<h3 className="text-2xl font-bold">
									<>1.3 项目技术栈</>
								</h3>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => techStackArray.append('')}
									className="max-w-30"
								>
									<Plus className="h-4 w-4 mr-1" /> 添加技术
								</Button>
							</div>

							<div className="space-y-2 mt-2">
								{techStackArray.fields.map((field, index) => (
									<div key={field.id} className="inline-flex items-center gap-2">
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
						<h3 className="text-2xl font-bold mb-13">
							<>2、项目亮点</>
						</h3>

						{lightspotSections.map((section, sectionIndex) => (
							<div key={section.key} className={sectionIndex === 0 ? 'mt-2' : 'mt-4'}>
								<div className="flex flex-col space-y-5">
									<h3 className="text-lg font-bold">{section.label}</h3>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => section.fieldArray.append('')}
										className="max-w-30"
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
							{/* <Button type="button" variant="outline" onClick={() => form.reset()}>
						重置
					</Button> */}
							{/* 提交按钮 */}
							<div className="flex justify-start items-center">
								<AnimatedSubscribeButton className="w-36" type="submit">
									<span className="group inline-flex items-center">
										提交
										<ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
									</span>
									<span className="group inline-flex items-center">
										<CheckIcon className="mr-2 size-4" />
										提交成功
									</span>
								</AnimatedSubscribeButton>
							</div>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
});
