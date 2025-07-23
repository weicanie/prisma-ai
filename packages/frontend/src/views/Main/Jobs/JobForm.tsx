import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { JobOpenStatus, type CreateJobDto } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { throttle } from 'lodash';
import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCustomMutation } from '../../../query/config';
import { JobQueryKey } from '../../../query/keys';
import { createJob } from '../../../services/job';
import { reset, selectJobData, setData } from '../../../store/jobs';

// 定义表单schema
const jobFormSchema = z.object({
	jobName: z.string().min(1, '职位名称不能为空'),
	companyName: z.string().min(1, '公司名称不能为空'),
	description: z.string().min(1, '职位描述不能为空'),
	location: z.string().optional(),
	salary: z.string().optional(),
	link: z.string().url('请输入有效的URL').or(z.literal('')),
	job_status: z.enum(['open', 'closed']).optional()
});

type JobFormData = z.infer<typeof jobFormSchema>;

export const JobForm = memo(() => {
	const values = useSelector(selectJobData);

	const form = useForm<JobFormData>({
		resolver: zodResolver(jobFormSchema),
		defaultValues: {
			jobName: values.jobName || '',
			companyName: values.companyName || '',
			description: values.description || '',
			location: values.location || '',
			salary: values.salary || '',
			link: values.link || '',
			job_status: values.job_status || JobOpenStatus.OPEN
		}
	});

	const dispatch = useDispatch();
	const onChange = throttle((formData: JobFormData) => {
		dispatch(setData(formData as CreateJobDto));
	}, 1000);

	const queryClient = useQueryClient();
	const uploadJobMutation = useCustomMutation(createJob, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [JobQueryKey.Jobs] });
			dispatch(reset());
		}
	});

	const onSubmit = (data: JobFormData) => {
		console.log('通过表单提交的岗位数据:', data);
		uploadJobMutation.mutate(data as CreateJobDto);
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
							<h3 className="text-2xl font-bold">岗位信息</h3>

							{/* 基本信息 */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="jobName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>职位名称 *</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="companyName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>公司名称 *</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem>
											<FormLabel>工作地点</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="salary"
									render={({ field }) => (
										<FormItem>
											<FormLabel>薪资范围</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* 职位链接和状态 */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="link"
									render={({ field }) => (
										<FormItem>
											<FormLabel>职位链接</FormLabel>
											<FormControl>
												<Input placeholder="https://..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="job_status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>状态</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="选择状态" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="open" className="cursor-pointer hover:bg-gray-700">
														招聘中
													</SelectItem>
													<SelectItem value="closed" className="cursor-pointer hover:bg-gray-700">
														停止招聘
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* 职位描述 */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>职位描述 *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="请输入职位描述、要求等信息..."
												className="min-h-[120px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* 提交按钮 */}
						<div className="flex justify-end pt-8 border-t">
							<Button type="submit" className="flex items-center">
								保存岗位
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
});
