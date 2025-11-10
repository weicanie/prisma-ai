import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Logo } from '@/components/Logo';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/views/Saas/components/c-cpns/Button';
import { SlimLayout } from '@/views/Saas/components/c-cpns/SlimLayout';
import { loginformSchema, type LoginFormType, type LoginResponse } from '@prisma-ai/shared';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Prism from '../../components/Prism';
import Wall from '../../components/Wall';
import { useCustomMutation } from '../../query/config';
import { login } from '../../services/login_regist';
import { loginSuccess, selectIsAutoFill, selectPassword, selectUsername } from '../../store/login';
import { eventBusService, EventList } from '../../utils/EventBus/event-bus.service';
import { useTheme } from '../../utils/theme';
import { TextField } from '../Saas/components/c-cpns/Fields';

export default function Login() {
	const form = useForm<z.infer<typeof loginformSchema>>({
		resolver: zodResolver(loginformSchema),
		defaultValues: {
			username: ''
		}
	});

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const loginMutation = useCustomMutation<LoginResponse, LoginFormType>(login, {
		onSuccess: async res => {
			toast.success('登录成功');
			res.data.userId = res.data.id;
			localStorage.setItem('token', res.data.token);
			localStorage.setItem('userInfo', JSON.stringify(res.data));
			//发送token更新事件，以便微应用更新token
			eventBusService.emit(EventList.tokenUpdated);
			// 登录成功后清除自动填写信息
			dispatch(loginSuccess());
			navigate('/main');
		}
	});

	// 自动填写表单
	const username = useSelector(selectUsername);
	const password = useSelector(selectPassword);
	const isAutoFill = useSelector(selectIsAutoFill);
	useEffect(() => {
		if (isAutoFill && username && password) {
			form.setValue('username', username);
			form.setValue('password', password);
		}
	}, [isAutoFill, username, password, form]);

	async function onSubmit(values: LoginFormType) {
		loginMutation.mutate({ username: values.username, password: values.password });
	}

	const items: Array<{
		name: 'username' | 'password';
		label: string;
		type: string;
	}> = [
		{ name: 'username', label: '用户名', type: 'text' },
		{ name: 'password', label: '密码', type: 'password' }
	];

	const { resolvedTheme } = useTheme();

	const [isLight, setIsLight] = useState(false);
	useEffect(() => {
		setTimeout(() => {
			setIsLight(true);
		}, 500);
	}, []);

	const background = (
		<div className="flex h-screen w-full flex-col items-center justify-center bg-background z-0 lg:flex-row">
			<div className="w-full lg:max-w-[40rem] lg:flex-1 relative bottom-2">
				<Prism light={isLight} className="z-[2]" />
				<div className="w-full relative bottom-20 text-center text-3xl text-white font-serif  z-[2]">
					PrismaAI
				</div>
			</div>

			{resolvedTheme === 'light' && (
				<Wall play={isLight} duration={1500} delay={1500} className="z-[1]"></Wall>
			)}
		</div>
	);

	return (
		<div className="h-screen">
			<SlimLayout background={background}>
				<div className="flex">
					<Link to="/" aria-label="Home">
						<Logo className="h-10 w-auto" />
					</Link>
				</div>
				<h2 className="mt-20 text-lg font-semibold text-gray-900">登录您的账户</h2>
				<p className="mt-2 text-sm text-gray-700">
					还没有账户？{' '}
					<Link to="/register" className="font-medium text-blue-600 hover:underline">
						免费注册
					</Link>
				</p>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 grid grid-cols-1 gap-y-8">
						{items.map(item => (
							<FormField
								key={item.name}
								control={form.control}
								name={item.name}
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<TextField {...field} type={item.type} label={item.label} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
						<div className="col-span-full">
							<Button type="submit" variant="solid" color="blue" className="w-full">
								<span>
									登录 <span aria-hidden="true">&rarr;</span>
								</span>
							</Button>
						</div>
					</form>
				</Form>
			</SlimLayout>
		</div>
	);
}
