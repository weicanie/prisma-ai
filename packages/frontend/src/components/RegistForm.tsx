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
import { register, registerCaptcha } from '../services';

const formSchema = z.object({
	username: z.string().min(2, {
		message: '用户名至少需要2个字符'
	}),
	password: z.string().min(6, {
		message: '密码至少需要6个字符'
	}),
	confirmPassword: z.string().min(6, {
		message: '请再次输入密码'
	}),
	email: z.string().email({
		message: '请输入正确的邮箱地址'
	}),
	captcha: z.string().min(6, {
		message: '请输入正确的验证码'
	})
});
type PropsType = PropsWithChildren<{
	setIsLoginCard: Dispatch<SetStateAction<boolean>>;
}>;
export function RegistForm({ setIsLoginCard }: PropsType) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: ''
		}
	});
	async function sendCaptcha() {
		const address = form.getValues('email');
		if (!address) {
			return message.error('请输入邮箱地址');
		}

		try {
			const res = await registerCaptcha(address);
			if (res.status === 201 || res.status === 200) {
				message.success('发送成功');
			}
		} catch (e: any) {
			message.error(e.response?.data?.message || '系统繁忙，请稍后再试');
		}
	}
	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (values.password !== values.confirmPassword) {
			return message.error('两次密码不一致');
		}
		try {
			const res = await register(values, true);

			if (res.status === 201 || res.status === 200) {
				message.success('注册成功');
				setTimeout(() => {
					//@ts-ignore
					document.getElementById('regist_modal').close();
					//@ts-ignore
					document.getElementById('login_modal').showModal();
				}, 1000);
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
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel
								style={{
									fontSize: '1.5rem',
									fontWeight: '600'
								}}
							>
								confirmPassword
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
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel
								style={{
									fontSize: '1.5rem',
									fontWeight: '600'
								}}
							>
								email
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
					name="captcha"
					render={({ field }) => (
						<FormItem>
							<FormLabel
								style={{
									fontSize: '1.5rem',
									fontWeight: '600'
								}}
							>
								captcha
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
						backgroundColor: 'rgb(34,179,71)',
						fontSize: '1.3rem',
						fontWeight: '600'
					}}
				>
					regist
				</Button>
			</form>
			<Button
				onClick={sendCaptcha}
				style={{
					color: 'rgba(236, 29, 39, 0.777)',
					backgroundColor: 'rgb(34,179,71)',
					fontSize: '1.3rem',
					fontWeight: '600'
				}}
			>
				send aptcha
			</Button>

			<Button
				onClick={() => setIsLoginCard(true)}
				style={{
					color: 'rgba(236, 29, 39, 0.777)',
					backgroundColor: 'rgb(28,160,188)',
					fontSize: '1.3rem',
					fontWeight: '600'
				}}
			>
				go to login
			</Button>
		</Form>
	);
}
