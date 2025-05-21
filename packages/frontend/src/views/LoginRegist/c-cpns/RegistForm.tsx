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
import { registformSchema } from '../../../../../shared/src/types/login_regist.schema';
import { register, registerCaptcha } from '../../../services/login_regist';

type PropsType = PropsWithChildren<{
	setIsLoginCard: Dispatch<SetStateAction<boolean>>;
}>;

export function RegistForm({ setIsLoginCard }: PropsType) {
	const form = useForm<z.infer<typeof registformSchema>>({
		resolver: zodResolver(registformSchema),
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
			if (res.data.code === '0') {
				message.success('发送成功');
			}
		} catch (e: any) {
			message.error(e.response?.data?.message || '系统繁忙，请稍后再试');
		}
	}
	async function onSubmit(values: z.infer<typeof registformSchema>) {
		if (values.password !== values.confirmPassword) {
			return message.error('两次密码不一致');
		}
		try {
			const res = await register(values);

			if (res.data.code === '0') {
				message.success('注册成功');
				setIsLoginCard(true);
			}
		} catch (e: any) {
			message.error(e.response?.data?.message || '系统繁忙，请稍后再试');
		}
	}

	const items: Array<{
		name: 'username' | 'password' | 'confirmPassword' | 'email' | 'captcha';
		label: string;
	}> = [
		{ name: 'username', label: 'username' },
		{ name: 'password', label: 'password' },
		{ name: 'confirmPassword', label: 'confirmPassword' },
		{ name: 'email', label: 'email' },
		{ name: 'captcha', label: 'captcha' }
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
