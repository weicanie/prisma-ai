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
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginformSchema } from '../../../../../shared/src/types/login_regist.schema';
import { login } from '../../../services/login_regist';

type PropsType = PropsWithChildren<{
	setIsLoginCard: Dispatch<SetStateAction<boolean>>;
}>;

export function LoginForm({ setIsLoginCard }: PropsType) {
	const form = useForm<z.infer<typeof loginformSchema>>({
		resolver: zodResolver(loginformSchema),
		defaultValues: {
			username: ''
		}
	});

	const navigate = useNavigate();

	async function onSubmit(values: z.infer<typeof loginformSchema>) {
		try {
			const res = await login({ username: values.username, password: values.password });
			if (res.data.code === '0') {
				toast.success('登录成功');
				res.data.data.userId = res.data.data.id;
				localStorage.setItem('token', res.data.data.token);
				localStorage.setItem('userInfo', JSON.stringify(res.data));
				navigate('/');
			}
		} catch (e: any) {
			toast.error(e.response?.data?.message || '系统繁忙，请稍后再试');
		}
	}

	const items: Array<{
		name: 'username' | 'password';
		label: string;
	}> = [
		{ name: 'username', label: 'username' },
		{ name: 'password', label: 'password' }
	];

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
				style={{
					color: 'rgba(236, 29, 39, 0.777)',
					fontSize: '2rem'
				}}
			>
				{items.map(item => (
					<FormField
						key={item.name}
						control={form.control}
						name={item.name}
						render={({ field }) => (
							<FormItem>
								<FormLabel
									style={{
										fontSize: '1.5rem',
										fontWeight: '600'
									}}
								>
									{item.label}
								</FormLabel>
								<FormControl>
									<Input
										placeholder=""
										{...field}
										style={{
											fontSize: '1.5rem',
											fontWeight: '600'
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
				<Button
					type="submit"
					style={{
						color: 'rgba(236, 29, 39, 0.777)',
						backgroundColor: 'rgb(28,160,188)',
						fontSize: '1.3rem',
						fontWeight: '600'
					}}
				>
					login
				</Button>
			</form>
			<Button
				onClick={() => setIsLoginCard(false)}
				style={{
					color: 'rgba(236, 29, 39, 0.777)',
					backgroundColor: 'rgb(34,179,71)',
					fontSize: '1.3rem',
					fontWeight: '600'
				}}
			>
				go to regist
			</Button>
		</Form>
	);
}
