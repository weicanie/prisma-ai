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
import type { RegistResponse } from '@prisma-ai/shared';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { toast } from 'sonner';
import {
	registformSchema,
	type RegistFormType
} from '../../../../../shared/src/types/login_regist.schema';
import { useCustomMutation } from '../../../query/config';
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
	const registerMutation = useCustomMutation<RegistResponse, RegistFormType>(register, {
		onSuccess: () => {
			toast.success('注册成功');
			setIsLoginCard(true);
		}
	});
	const registerCaptchaMutation = useCustomMutation<string, string>(registerCaptcha, {
		onSuccess: () => {
			toast.success('发送成功');
		}
	});
	async function sendCaptcha() {
		const address = form.getValues('email');
		if (!address) {
			return toast.error('请输入邮箱地址');
		}

		registerCaptchaMutation.mutate(address);
	}
	async function onSubmit(values: z.infer<typeof registformSchema>) {
		if (values.password !== values.confirmPassword) {
			return toast.error('两次密码不一致');
		}
		registerMutation.mutate(values);
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
				className="space-y-8 text-2xl text-[rgba(236,29,39,0.777)]"
			>
				{items.map(item => (
					<FormField
						key={item.name}
						control={form.control}
						name={item.name}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-2xl font-semibold">{item.label}</FormLabel>
								<FormControl>
									<Input placeholder="" {...field} className="text-2xl font-semibold" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
				<Button
					type="submit"
					className="bg-[rgb(34,179,71)] text-xl font-semibold text-[rgba(236,29,39,0.777)]"
				>
					regist
				</Button>
			</form>

			<Button
				onClick={sendCaptcha}
				className="bg-[rgb(34,179,71)] text-xl font-semibold text-[rgba(236,29,39,0.777)]"
			>
				send aptcha
			</Button>

			<Button
				onClick={() => setIsLoginCard(true)}
				className="bg-[rgb(28,160,188)] text-xl font-semibold text-[rgba(236,29,39,0.777)]"
			>
				go to login
			</Button>
		</Form>
	);
}
