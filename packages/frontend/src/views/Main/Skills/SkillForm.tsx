import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
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
import { type CreateSkillDto, type SkillItem } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { memo, useEffect, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { SkillQueryKey } from '../../../query/keys';
import { createSkill, findOneUserSkill, updateSkill } from '../../../services/skill';
import { resetSkillData, selectSkillData, setSkillDataFromDto } from '../../../store/skills';

/* 定义表单schema

相比dto, content嵌套数组分解成 types 和 skills数组 来避免嵌套动态数组`
*/
const skillFormSchema = z.object({
	name: z.string().min(1, '技能清单名称不能为空'),
	types: z
		.array(z.string().min(1, '技能类型不能为空'))
		.min(1, '至少需要一个技能类型')
		.refine(items => new Set(items).size === items.length, {
			message: '技能类型不能重复'
		}),
	skills: z.array(
		z.object({
			skillTypeIndex: z.number(), //所属技能类型在技能类型数组中的索引
			name: z.string().min(1, '技能名称不能为空')
		})
	)
});

type SkillFormData = z.infer<typeof skillFormSchema>;

type SkillInputState = Record<string, string>;

type SkillInputAction =
	| { type: 'SET_INPUT'; payload: { fieldId: string; value: string } }
	| { type: 'CLEAR_INPUT'; payload: { fieldId: string } };
/**
 * 技能输入框的reducer, 用于管理各个技能类型下技能输入框的值
 * @param state 当前状态表, 技能类型的typeField.id -> 输入框的值
 * @param action 动作
 * @returns 新的状态
 */
const skillInputReducer = (state: SkillInputState, action: SkillInputAction): SkillInputState => {
	switch (action.type) {
		case 'SET_INPUT':
			return { ...state, [action.payload.fieldId]: action.payload.value };
		case 'CLEAR_INPUT': {
			const newState = { ...state };
			delete newState[action.payload.fieldId];
			return newState;
		}
		default:
			return state;
	}
};

// dto 转 表单数据
const convertToFormData = (data: CreateSkillDto): SkillFormData => {
	if (!data?.content || !Array.isArray(data.content)) {
		return { name: '', types: [''], skills: [] };
	}

	const types: string[] = [];
	const skills: { skillTypeIndex: number; name: string }[] = [];

	data.content.forEach((item: SkillItem, skillTypeIndex: number) => {
		if (item.type) {
			types.push(item.type);
			if (item.content && Array.isArray(item.content)) {
				item.content.forEach((skillName: string) => {
					if (skillName) {
						skills.push({ skillTypeIndex, name: skillName });
					}
				});
			}
		}
	});

	return { name: data.name, types: types.length > 0 ? types : [''], skills };
};

// 表单数据 转 dto
const convertToOriginalFormat = (formData: SkillFormData) => {
	const content = formData.types.map((type, skillTypeIndex) => ({
		type,
		content: formData.skills
			.filter(skill => skill.skillTypeIndex === skillTypeIndex)
			.map(skill => skill.name)
	}));

	return { name: formData.name, content };
};

interface SkillFormProps {
	setIsUseMdEditor?: React.Dispatch<React.SetStateAction<boolean>>;
	isUseMdEditor?: boolean;
	id?: string; // 若存在则为编辑模式
}

const SkillForm = memo((props: SkillFormProps) => {
	const { setIsUseMdEditor, id } = props;

	const values = useSelector(selectSkillData);

	const form = useForm<SkillFormData>({
		resolver: zodResolver(skillFormSchema),
		defaultValues: convertToFormData(values)
	});

	const dispatch = useDispatch();

	const queryClient = useQueryClient();
	const uploadSkillMutation = useCustomMutation(createSkill, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [SkillQueryKey.Skills] });
			dispatch(resetSkillData());
		}
	});

	const updateSkillMutation = useCustomMutation(updateSkill, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [SkillQueryKey.Skills] });
			dispatch(resetSkillData());
		}
	});
	const { data, status } = useCustomQuery(
		[SkillQueryKey.Skills, id],
		() => findOneUserSkill(id as string),
		{
			enabled: Boolean(id)
		}
	);
	const skill = data?.data;
	useEffect(() => {
		if (status === 'pending') return;
		if (status === 'error') return;
		if (skill) {
			const formData = convertToFormData(skill);
			form.setValue('name', skill.name);
			form.setValue('types', formData.types);
			form.setValue('skills', formData.skills);
		}
	}, [status]);

	const onSubmit = (data: SkillFormData) => {
		const convertedData = convertToOriginalFormat(data);
		console.log('通过表单提交的技能数据:', convertedData);
		if (id) {
			updateSkillMutation.mutate({ id, skillUpdateData: convertedData });
		} else {
			uploadSkillMutation.mutate(convertedData);
		}
	};

	// 管理技能类型数组
	//@ts-expect-error 内部体操的锅
	const skillTypeArray = useFieldArray<SkillFormData, 'types'>({
		control: form.control,
		name: 'types'
	});

	// 管理技能数组
	const skillsArray = useFieldArray({
		control: form.control,
		name: 'skills'
	});

	const [skillInputs, dispatchSkillInput] = useReducer(skillInputReducer, {});
	const { fields: skillFields, append: appendSkill } = skillsArray;
	const watchedSkills = form.watch('skills');

	const removeSkill = (skillIndex: number) => {
		skillsArray.remove(skillIndex);
		updateToStore();
	};
	// 添加技能
	const addSkill = (skillTypeIndex: number, fieldId: string) => {
		const skillName = skillInputs[fieldId]?.trim();
		if (skillName) {
			// 检查当前类型下技能是否重复
			const skillsForType = watchedSkills
				.filter(s => s.skillTypeIndex === skillTypeIndex)
				.map(s => s.name);
			if (!skillsForType.includes(skillName)) {
				appendSkill({ skillTypeIndex, name: skillName });
				dispatchSkillInput({ type: 'CLEAR_INPUT', payload: { fieldId } });
				updateToStore();
			} else {
				toast.error('技能已存在');
			}
		}
	};

	// 处理Enter键添加技能
	const handleSkillInputKeyDown = (
		e: React.KeyboardEvent,
		skillTypeIndex: number,
		fieldId: string
	) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addSkill(skillTypeIndex, fieldId);
		}
	};

	// 获取特定类型下的技能
	const getSkillsForType = (skillTypeIndex: number) => {
		return skillFields
			.map((skill, index) => ({ ...skill, originalIndex: index }))
			.filter((_, index) => watchedSkills[index]?.skillTypeIndex === skillTypeIndex);
	};

	// 删除技能类型（级联删除相关技能）
	const removeType = (skillTypeIndex: number) => {
		skillTypeArray.remove(skillTypeIndex);

		// 删除该类型下的所有技能
		const skillsToRemove: number[] = [];
		skillFields.forEach((_skill, index) => {
			if (watchedSkills[index]?.skillTypeIndex === skillTypeIndex) {
				skillsToRemove.push(index);
			}
		});

		// 从后往前删除，避免索引变化
		skillsToRemove.reverse().forEach(index => {
			skillsArray.remove(index);
		});

		// 更新剩余技能的skillTypeIndex
		const currentSkills = form.getValues('skills');
		const updatedSkills = currentSkills.map(skill =>
			skill.skillTypeIndex > skillTypeIndex
				? { ...skill, skillTypeIndex: skill.skillTypeIndex - 1 }
				: skill
		);

		form.setValue('skills', updatedSkills);
		updateToStore();
	};

	/**
	 * 将表单数据更新到store,以更新md显示
	 */
	const updateToStore = () => {
		const formData = form.getValues();
		const convertedData = convertToOriginalFormat(formData);
		dispatch(setSkillDataFromDto(convertedData));
	};

	return (
		<div className="flex justify-center items-center w-full">
			<div className="w-full h-full">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						onChange={() => updateToStore()}
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
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => skillTypeArray.append('技能类型1')}
								>
									<Plus className="h-4 w-4 mr-2" />
									添加技能类型
								</Button>
							</div>

							{/* 技能类型和对应技能列表 */}
							<div className="space-y-6">
								{skillTypeArray.fields.map((typeField, skillTypeIndex) => {
									const typeSkills = getSkillsForType(skillTypeIndex);

									return (
										<div key={typeField.id} className="border rounded-lg p-4 space-y-4">
											{/* 技能类型输入 */}
											<div className="flex items-center gap-3">
												<FormField
													control={form.control}
													name={`types.${skillTypeIndex}`}
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
													onClick={() => removeType(skillTypeIndex)}
													className="mt-8"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											{/* 该类型下的技能列表 */}
											<div className="space-y-3">
												<FormLabel>具体技能</FormLabel>
												<div className="space-y-2">
													<div className="flex gap-2">
														<Input
															placeholder="输入技能后按回车添加"
															value={skillInputs[typeField.id] || ''}
															onChange={e =>
																dispatchSkillInput({
																	type: 'SET_INPUT',
																	payload: { fieldId: typeField.id, value: e.target.value }
																})
															}
															onKeyDown={e =>
																handleSkillInputKeyDown(e, skillTypeIndex, typeField.id)
															}
														/>
														<Button
															type="button"
															onClick={() => addSkill(skillTypeIndex, typeField.id)}
															variant="outline"
														>
															添加
														</Button>
													</div>
													{typeSkills.length > 0 && (
														<div className="flex flex-wrap gap-2 pt-2">
															{typeSkills.map(skill => (
																<Badge
																	key={skill.id}
																	variant="secondary"
																	className="flex items-center gap-1"
																>
																	{watchedSkills[skill.originalIndex]?.name}
																	<span
																		onClick={() => removeSkill(skill.originalIndex)}
																		className="cursor-pointer"
																	>
																		<X className="h-3 w-3" />
																	</span>
																</Badge>
															))}
														</div>
													)}
												</div>

												{typeSkills.length === 0 && (
													<div className="text-gray-500 text-center py-4">
														暂无技能，请在上方输入框添加
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* 提交按钮 */}
						<div className="flex justify-between pt-8 border-t">
							<Button type="submit" className="flex items-center">
								保存技能
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsUseMdEditor?.(true)}
								className="group flex items-center"
							>
								使用md编辑器
								<ChevronRight className="h-4 w-4 ml-2  transition-transform duration-300 group-hover:translate-x-1" />
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
});

export default SkillForm;
