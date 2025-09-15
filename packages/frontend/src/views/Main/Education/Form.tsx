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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { educationSchemaForm, type EducationForm } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { EducationQueryKey } from '../../../query/keys';
import { createEducation, findOneEducation, updateEducation } from '../../../services/education';

interface EducationFormProps {
	id?: string; // 若存在则为编辑模式
}

const EducationForm = memo(({ id }: EducationFormProps) => {
	const queryClient = useQueryClient();
	const form = useForm<EducationForm>({
		resolver: zodResolver(educationSchemaForm),
		defaultValues: {
			school: '',
			major: '',
			degree: '本科',
			startDate: '',
			endDate: '',
			visible: true,
			gpa: '',
			description: ''
		}
	});

	const createMutation = useCustomMutation(createEducation, {
		onSuccess: () => {
			toast.success('创建成功');
			queryClient.invalidateQueries({ queryKey: [EducationQueryKey.Educations] });
			form.reset();
		}
	});
	const updateMutation = useCustomMutation(
		(payload: { id: string; body: Partial<EducationForm> }) =>
			updateEducation(payload.id, payload.body),
		{
			onSuccess: () => {
				toast.success('更新成功');
				queryClient.invalidateQueries({ queryKey: [EducationQueryKey.Educations] });
				form.reset();
			}
		}
	);

	//当id存在时，查询数据并设置为表格内容便于更新
	const { data, status } = useCustomQuery(
		[EducationQueryKey.Educations, id],
		() => findOneEducation(id as string),
		{
			enabled: Boolean(id)
		}
	);

	const edu = data?.data;
	useEffect(() => {
		if (status === 'pending') return;
		if (status === 'error') return;
		if (edu) {
			form.setValue('school', edu.school);
			form.setValue('major', edu.major);
			form.setValue('degree', edu.degree);
			form.setValue('startDate', edu.startDate);
			form.setValue('endDate', edu.endDate || '');
			form.setValue('visible', edu.visible);
			form.setValue('gpa', edu.gpa || '');
			form.setValue('description', edu.description || '');
		}
	}, [status]);

	const onSubmit = (values: EducationForm) => {
		if (id) {
			updateMutation.mutate({ id, body: values });
		} else {
			createMutation.mutate(values);
		}
	};

	return (
		<div className="w-full h-full sm:min-w-xl">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="school"
						render={({ field }) => (
							<FormItem>
								<FormLabel>学校</FormLabel>
								<FormControl>
									<Input placeholder="学校名称" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="major"
						render={({ field }) => (
							<FormItem>
								<FormLabel>专业</FormLabel>
								<FormControl>
									<Input placeholder="专业名称" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="degree"
						render={({ field }) => (
							<FormItem>
								<FormLabel>学历</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="请选择学历" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{['博士', '硕士', '本科', '大专', '高中', '其他'].map(v => (
											<SelectItem key={v} value={v}>
												{v}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>入学日期</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="endDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>毕业日期</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="gpa"
						render={({ field }) => (
							<FormItem>
								<FormLabel>绩点</FormLabel>
								<FormControl>
									<Input placeholder="绩点" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>描述</FormLabel>
								<FormControl>
									<Textarea
										className="min-h-[120px]"
										placeholder="课程、奖项、社团、项目等"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="fixed right-20 bottom-6 flex justify-end gap-2 ">
						<Button type="submit">保存</Button>
					</div>
				</form>
			</Form>
		</div>
	);
});

export default EducationForm;
