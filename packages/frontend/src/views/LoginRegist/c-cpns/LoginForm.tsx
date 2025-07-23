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
import type { LoginFormType, LoginResponse } from '@prisma-ai/shared';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginformSchema } from '../../../../../shared/src/types/login_regist.schema';
import { useCustomMutation } from '../../../query/config';
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
	const loginMutation = useCustomMutation<LoginResponse, LoginFormType>(login, {
		onSuccess: res => {
			toast.success('登录成功');
			res.data.userId = res.data.id;
			localStorage.setItem('token', res.data.token);
			localStorage.setItem('userInfo', JSON.stringify(res.data));
			navigate('/');
		}
	});

	async function onSubmit(values: LoginFormType) {
		loginMutation.mutate({ username: values.username, password: values.password });
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
				className="space-y-8 text-2xl text-[var(--orange-prisma)]"
			>
				{items.map(item => (
					<FormField
						key={item.name}
						control={form.control}
						name={item.name}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-3xl font-semibold">{item.label}</FormLabel>
								<FormControl>
									<Input placeholder="" {...field} className="text-3xl font-semibold" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
				<div className="flex justify-between">
					<Button
						type="submit"
						className="bg-[rgb(28,160,188)] text-2xl font-semibold text-[var(--orange-prisma)]"
					>
						login
					</Button>
					<Button
						onClick={() => setIsLoginCard(false)}
						className="bg-[rgb(34,179,71)] text-2xl font-semibold text-[var(--orange-prisma)]"
					>
						go to regist
					</Button>
				</div>
			</form>
		</Form>
	);
}
