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
import type { CreateSkillDto, SkillItem } from '@prism-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { throttle } from 'lodash';
import { Plus, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCustomMutation } from '../../../query/config';
import { SkillQueryKey } from '../../../query/keys';
import { createSkill } from '../../../services/skill';
import { resetSkillData, selectSkillData, setSkillDataFromDto } from '../../../store/skills';

/* 定义表单schema

相比dto, content嵌套数组分解成 types 和 skills数组 来避免嵌套动态数组`
*/
const skillFormSchema = z.object({
	name: z.string().min(1, '技能清单名称不能为空'),
	types: z.array(z.string().min(1, '技能类型不能为空')).min(1, '至少需要一个技能类型'),
	skills: z.array(
		z.object({
			typeIndex: z.number(),
			name: z.string().min(1, '技能名称不能为空')
		})
	)
});

type SkillFormData = z.infer<typeof skillFormSchema>;

// dto 转 表单数据
const convertToFormData = (data: CreateSkillDto): SkillFormData => {
	if (!data?.content || !Array.isArray(data.content)) {
		return { name: '', types: [''], skills: [] };
	}

	const types: string[] = [];
	const skills: { typeIndex: number; name: string }[] = [];

	data.content.forEach((item: SkillItem, typeIndex: number) => {
		if (item.type) {
			types.push(item.type);
			if (item.content && Array.isArray(item.content)) {
				item.content.forEach((skillName: string) => {
					if (skillName) {
						skills.push({ typeIndex, name: skillName });
					}
				});
			}
		}
	});

	return { name: data.name, types: types.length > 0 ? types : [''], skills };
};

// 表单数据 转 dto
const convertToOriginalFormat = (formData: SkillFormData) => {
	const content = formData.types.map((type, typeIndex) => ({
		type,
		content: formData.skills.filter(skill => skill.typeIndex === typeIndex).map(skill => skill.name)
	}));

	return { name: formData.name, content };
};

export const SkillForm = memo(() => {
	const values = useSelector(selectSkillData);

	const form = useForm<SkillFormData>({
		resolver: zodResolver(skillFormSchema),
		defaultValues: convertToFormData(values)
	});

	const dispatch = useDispatch();
	const onChange = throttle((formData: SkillFormData) => {
		// 将表单数据转换回原格式
		const convertedData = convertToOriginalFormat(formData);
		dispatch(setSkillDataFromDto(convertedData));
	}, 1000);

	const queryClient = useQueryClient();
	const uploadSkillMutation = useCustomMutation(createSkill, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [SkillQueryKey.Skills] });
			dispatch(resetSkillData());
		}
	});

	const onSubmit = (data: SkillFormData) => {
		const convertedData = convertToOriginalFormat(data);
		console.log('通过表单提交的技能数据:', convertedData);
		uploadSkillMutation.mutate(convertedData);
	};

	// 管理技能类型数组
	//@ts-expect-error 内部体操的锅
	const typesArray = useFieldArray<SkillFormData, 'types'>({
		control: form.control,
		name: 'types'
	});

	// 管理技能数组
	const skillsArray = useFieldArray({
		control: form.control,
		name: 'skills'
	});

	// 添加技能类型
	const addType = () => {
		typesArray.append('技能类型1');
		typesArray.append('技能类型2');
		typesArray.append('技能类型3');
	};

	// 删除技能类型（级联删除相关技能）
	const removeType = (typeIndex: number) => {
		typesArray.remove(typeIndex);

		// 删除该类型下的所有技能
		const skillsToRemove: number[] = [];
		skillsArray.fields.forEach((skill, index) => {
			if (skill.typeIndex === typeIndex) {
				skillsToRemove.push(index);
			}
		});

		// 从后往前删除，避免索引变化
		skillsToRemove.reverse().forEach(index => {
			skillsArray.remove(index);
		});

		// 更新剩余技能的typeIndex
		const currentSkills = form.getValues('skills');
		const updatedSkills = currentSkills.map(skill =>
			skill.typeIndex > typeIndex ? { ...skill, typeIndex: skill.typeIndex - 1 } : skill
		);

		form.setValue('skills', updatedSkills);
		/* 不触发onChange,需要手动同步到store */
		const formData = form.getValues();
		const convertedData = convertToOriginalFormat(formData);
		dispatch(setSkillDataFromDto(convertedData));
	};

	// 添加技能
	const addSkill = (typeIndex: number) => {
		skillsArray.append({ typeIndex, name: `技能${typeIndex + 1}-1` });
		skillsArray.append({ typeIndex, name: `技能${typeIndex + 1}-2` });
		skillsArray.append({ typeIndex, name: `技能${typeIndex + 1}-3` });
	};

	// 删除技能
	const removeSkill = (skillIndex: number) => {
		skillsArray.remove(skillIndex);
	};

	// 获取特定类型下的技能
	const getSkillsForType = (typeIndex: number) => {
		return skillsArray.fields
			.map((skill, index) => ({ ...skill, originalIndex: index }))
			.filter(skill => skill.typeIndex === typeIndex);
	};

	return (
		<div className="flex justify-center items-center w-full">
			<div className="w-full h-full">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						onChange={() => onChange(form.getValues())}
						style={{ overflow: 'auto', padding: '2px' }}
						className="space-y-8"
					>
						<div className="space-y-8">
							<h3 className="text-2xl font-bold">职业技能</h3>

							{/* 简历名称输入 */}
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>清单名称</FormLabel>
											<FormControl>
												<Input placeholder="请输入清单名称" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* 添加技能类型按钮 */}
							<div className="flex justify-between items-center">
								<h4 className="text-lg font-semibold">技能分类</h4>
								<Button type="button" variant="outline" size="sm" onClick={addType}>
									<Plus className="h-4 w-4 mr-2" />
									添加技能类型
								</Button>
							</div>

							{/* 技能类型和对应技能列表 */}
							<div className="space-y-6">
								{typesArray.fields.map((typeField, typeIndex) => {
									const typeSkills = getSkillsForType(typeIndex);

									return (
										<div key={typeField.id} className="border rounded-lg p-4 space-y-4">
											{/* 技能类型输入 */}
											<div className="flex items-center gap-3">
												<FormField
													control={form.control}
													name={`types.${typeIndex}`}
													render={({ field }) => (
														<FormItem className="flex-1">
															<FormLabel>技能类型</FormLabel>
															<FormControl>
																<Input placeholder="如：框架、开发工具" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeType(typeIndex)}
													className="mt-8"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											{/* 该类型下的技能列表 */}
											<div className="space-y-3">
												<div className="flex justify-between items-center">
													<FormLabel>具体技能</FormLabel>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => addSkill(typeIndex)}
													>
														<Plus className="h-4 w-4 mr-2" />
														添加技能
													</Button>
												</div>

												{typeSkills.map(skill => (
													<div key={skill.id} className="flex items-center gap-3">
														<FormField
															control={form.control}
															name={`skills.${skill.originalIndex}.name`}
															render={({ field }) => (
																<FormItem className="flex-1">
																	<FormControl>
																		<Input placeholder="技能名称" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => removeSkill(skill.originalIndex)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												))}

												{typeSkills.length === 0 && (
													<div className="text-gray-500 text-center py-4">
														暂无技能，点击上方按钮添加
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* 提交按钮 */}
						<div className="flex justify-end pt-8 border-t">
							<Button type="submit" className="flex items-center">
								保存技能
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
});
