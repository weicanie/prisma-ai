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
import { message } from 'antd';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { login } from '../services';

const formSchema = z.object({
	username: z.string().min(2, {
		message: '用户名至少需要2个字符'
	}),
	password: z.string().min(6, {
		message: '密码至少需要6个字符'
	})
});

type PropsType = PropsWithChildren<{
	setIsLoginCard: Dispatch<SetStateAction<boolean>>;
}>;

export function LoginForm({ setIsLoginCard }: PropsType) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: ''
		}
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const res = await login({ username: values.username, password: values.password });
			if (res.status === 201 || res.status === 200) {
				message.success('登录成功');
				res.data.userId = res.data.id;
				localStorage.setItem('token', res.data.token);
				localStorage.setItem('userInfo', JSON.stringify(res.data));
				// setTimeout(() => {
				// 	document.getElementById('login_modal').close();
				// }, 500);
			}
		} catch (e: any) {
			message.error(e.response?.data?.message || '系统繁忙，请稍后再试');
		}
	}

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
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel
								style={{
									fontSize: '1.5rem',
									fontWeight: '600'
								}}
							>
								username
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
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel
								style={{
									fontSize: '1.5rem',
									fontWeight: '600'
								}}
							>
								password
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
