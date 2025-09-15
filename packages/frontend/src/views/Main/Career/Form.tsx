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
import { zodResolver } from '@hookform/resolvers/zod';
import { careerSchemaForm, type CareerForm } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { CareerQueryKey } from '../../../query/keys';
import { createCareer, findOneCareer, updateCareer } from '../../../services/career';

interface CareerFormProps {
	id?: string; // 若存在则为编辑模式
}

const CareerForm = memo(({ id }: CareerFormProps) => {
	const queryClient = useQueryClient();
	const form = useForm<CareerForm>({
		resolver: zodResolver(careerSchemaForm),
		defaultValues: {
			company: '',
			position: '',
			startDate: '',
			endDate: '',
			visible: true,
			details: ''
		}
	});

	const createMutation = useCustomMutation(createCareer, {
		onSuccess: () => {
			toast.success('创建成功');
			queryClient.invalidateQueries({ queryKey: [CareerQueryKey.Careers] });
			form.reset();
		}
	});
	const updateMutation = useCustomMutation(
		(payload: { id: string; body: Partial<CareerForm> }) => updateCareer(payload.id, payload.body),
		{
			onSuccess: () => {
				toast.success('更新成功');
				queryClient.invalidateQueries({ queryKey: [CareerQueryKey.Careers] });
				form.reset();
			}
		}
	);

	//当id存在时，查询数据并设置为表格内容便于更新
	const { data, status } = useCustomQuery(
		[CareerQueryKey.Careers, id],
		() => findOneCareer(id as string),
		{
			enabled: Boolean(id)
		}
	);

	const career = data?.data;
	useEffect(() => {
		if (status === 'pending') return;
		if (status === 'error') return;
		if (career) {
			form.setValue('company', career.company);
			form.setValue('position', career.position);
			form.setValue('startDate', career.startDate);
			form.setValue('endDate', career.endDate || '');
			form.setValue('visible', career.visible);
			form.setValue('details', career.details || '');
		}
	}, [status]);

	const onSubmit = (values: CareerForm) => {
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
						name="company"
						render={({ field }) => (
							<FormItem>
								<FormLabel>公司</FormLabel>
								<FormControl>
									<Input placeholder="公司名称" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="position"
						render={({ field }) => (
							<FormItem>
								<FormLabel>职位</FormLabel>
								<FormControl>
									<Input placeholder="职位名称" {...field} />
								</FormControl>
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
									<FormLabel>入职日期</FormLabel>
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
									<FormLabel>离职日期</FormLabel>
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
						name="details"
						render={({ field }) => (
							<FormItem>
								<FormLabel>工作描述</FormLabel>
								<FormControl>
									<Textarea
										className="min-h-[120px]"
										placeholder="工作职责、业绩、项目等"
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

export default CareerForm;
