import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { KnowledgeTypeEnum, type_content_Map, type CreateKnowledgeDto } from '@prism-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { throttle } from 'lodash';
import { X } from 'lucide-react';
import { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCustomMutation } from '../../../query/config';
import { KnowledgeQueryKey } from '../../../query/keys';
import { createKnowledge } from '../../../services/knowbase';
import {
	resetKnowledgeData,
	selectKnowledgeData,
	setKnowledgeDataFromDto
} from '../../../store/knowbase';

const knowledgeFormSchema = z.object({
	name: z.string().min(1, '知识名称不能为空').max(100, '知识名称不能超过100个字符'),
	fileType: z.enum(['txt', 'url', 'doc'], {
		required_error: '请选择文件类型'
	}),
	tag: z.array(z.string()).min(1, '至少需要添加一个标签'),
	type: z.enum(
		[
			'userProjectDoc',
			// 'userProjectRepo',
			'openSourceProjectDoc',
			'openSourceProjectRepo',
			'techDoc',
			'interviewQuestion',
			'other'
		],
		{
			required_error: '请选择知识类型'
		}
	),
	content: z.string().min(1, '知识内容不能为空')
});

type KnowledgeFormData = z.infer<typeof knowledgeFormSchema>;

export const KnowledgeForm = memo(() => {
	const values = useSelector(selectKnowledgeData);
	const knowledgeData = useSelector(selectKnowledgeData);
	const form = useForm<KnowledgeFormData>({
		resolver: zodResolver(knowledgeFormSchema),
		defaultValues: {
			name: knowledgeData.name || '',
			fileType: knowledgeData.fileType || 'txt',
			tag: knowledgeData.tag || [],
			type: knowledgeData.type as `${KnowledgeTypeEnum}`,
			content: knowledgeData.content || ''
		}
	});

	const [tagInput, setTagInput] = useState('');

	const dispatch = useDispatch();
	const onChange = throttle((formData: KnowledgeFormData) => {
		const knowledgeData: CreateKnowledgeDto = {
			...values,
			name: formData.name,
			content: formData.content
		};
		dispatch(setKnowledgeDataFromDto(knowledgeData));
	}, 1000);

	const queryClient = useQueryClient();
	const uploadKnowledgeMutation = useCustomMutation(createKnowledge, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KnowledgeQueryKey.Knowledges] });
			dispatch(resetKnowledgeData());
		}
	});

	const onSubmit = (data: KnowledgeFormData) => {
		console.log('通过表单提交的知识库数据:', data);
		uploadKnowledgeMutation.mutate(data);
	};

	// 添加标签
	const addTag = () => {
		if (tagInput.trim() && !form.getValues('tag').includes(tagInput.trim())) {
			const currentTags = form.getValues('tag');
			form.setValue('tag', [...currentTags, tagInput.trim()]);
			setTagInput('');
		}
	};

	// 删除标签
	const removeTag = (tagToRemove: string) => {
		const currentTags = form.getValues('tag');
		form.setValue(
			'tag',
			currentTags.filter(tag => tag !== tagToRemove)
		);
	};

	// 处理Enter键添加标签
	const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag();
		}
	};

	// 文件类型选项
	const fileTypeOptions = [
		{ value: 'txt', label: '文本' },
		{ value: 'url', label: 'URL链接' }
		// { value: 'doc', label: '文档文件' }
	];

	return (
		<div className="w-full h-full sm:min-w-xl">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					onChange={() => onChange(form.getValues())}
					className="space-y-10"
				>
					{/* 知识名称 */}
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>知识名称</FormLabel>
								<FormControl>
									<Input placeholder="请输入知识库名称" {...field} />
								</FormControl>
								<FormDescription>为您的知识条目起一个描述性的名称</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 文件类型 */}
					<FormField
						control={form.control}
						name="fileType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>文件类型</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="请选择文件类型" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{fileTypeOptions.map(option => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>选择知识内容的文件类型</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 知识类型 */}
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>知识类型</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="请选择知识类型" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Object.entries(type_content_Map).map(([key, label]) => (
											<SelectItem key={key} value={key}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>选择最符合您知识内容的类型</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 标签 */}
					<FormField
						control={form.control}
						name="tag"
						render={({ field }) => (
							<FormItem>
								<FormLabel>标签</FormLabel>
								<FormControl>
									<div className="space-y-2">
										<div className="flex gap-2">
											<Input
												placeholder="输入标签后按回车添加"
												value={tagInput}
												onChange={e => setTagInput(e.target.value)}
												onKeyDown={handleTagInputKeyDown}
											/>
											<Button type="button" onClick={addTag} variant="outline">
												添加
											</Button>
										</div>
										{field.value.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{field.value.map((tag, index) => (
													<Badge
														key={index}
														variant="secondary"
														className="flex items-center gap-1"
													>
														{tag}
														<X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
													</Badge>
												))}
											</div>
										)}
									</div>
								</FormControl>
								<FormDescription>添加标签以便更好地分类和搜索您的知识库</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 知识内容 */}
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem>
								<FormLabel>知识内容</FormLabel>
								<FormControl>
									<Textarea
										placeholder="请输入知识内容..."
										className="min-h-[200px] resize-y"
										{...field}
									/>
								</FormControl>
								<FormDescription>输入详细的知识内容或URL链接</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline">
							取消
						</Button>
						<Button type="submit">保存知识</Button>
					</div>
				</form>
			</Form>
		</div>
	);
});
