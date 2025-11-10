import registAgreement from '@/assets/注册协议.md?raw';
import privacyAgreement from '@/assets/隐私协议.md?raw';
import { Logo } from '@/components/Logo';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { register } from '@/services/login_regist';
import MilkdownEditor from '@/views/Main/components/Editor';
import { Button } from '@/views/Saas/components/c-cpns/Button';
import { SlimLayout } from '@/views/Saas/components/c-cpns/SlimLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ErrorCode,
	registformSchema,
	type RegistFormType,
	type RegistResponse,
	type ServerDataFormat
} from '@prisma-ai/shared';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import Prism from '../../components/Prism';
import Wall from '../../components/Wall';
import { useCustomMutation } from '../../query/config';
import { registerCaptcha } from '../../services/login_regist';
import { setRegistrationInfo } from '../../store/login';
import { useTheme } from '../../utils/theme';
import { TextField } from '../Saas/components/c-cpns/Fields';
export default function Register() {
	const [isChecked, setIsChecked] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogContent, setDialogContent] = useState({ title: '', content: '' });
	const [countdown, setCountdown] = useState(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const form = useForm<z.infer<typeof registformSchema>>({
		resolver: zodResolver(registformSchema),
		defaultValues: {
			username: ''
		}
	});
	const dispatch = useDispatch();
	const navigate = useNavigate();

	//useCustomMutation会处理2006错误并忽略组件定义的处理逻辑，从而导致无法跳转登录页
	const registerMutation = useMutation<
		ServerDataFormat<RegistResponse>,
		RegistFormType,
		RegistFormType
	>({
		mutationFn: register,
		onSuccess: (res, values) => {
			if (res.code !== ErrorCode.SUCCESS) {
				return toast.error(res.message);
			}
			// 注册成功后，将用户名和密码保存到 Redux store
			dispatch(
				setRegistrationInfo({
					username: values.username,
					password: values.password
				})
			);
			toast.success('注册成功');
			navigate('/login');
		}
	});
	const registerCaptchaMutation = useCustomMutation<string, string>(registerCaptcha, {
		onSuccess: () => {
			toast.success('发送成功');
			setCountdown(20);
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
		if (!isChecked) {
			return toast.info('请先阅读并同意注册协议和隐私政策');
		}
		if (values.password !== values.confirmPassword) {
			return toast.error('两次密码不一致');
		}
		registerMutation.mutate(values);
	}

	const items: Array<{
		name: 'username' | 'password' | 'confirmPassword' | 'email' | 'captcha';
		label: string;
	}> = [
		{ name: 'username', label: '用户名' },
		{ name: 'password', label: '密码' },
		{ name: 'confirmPassword', label: '确认密码' },
		{ name: 'email', label: '邮箱' },
		{ name: 'captcha', label: '验证码' }
	];

	useEffect(() => {
		if (countdown > 0) {
			timerRef.current = setTimeout(() => {
				setCountdown(prev => prev - 1);
			}, 1000);
		} else if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [countdown]);

	const openAgreementDialog = (type: 'regist' | 'privacy') => {
		if (type === 'regist') {
			setDialogContent({ title: '注册协议', content: registAgreement });
		} else {
			setDialogContent({ title: '隐私政策', content: privacyAgreement });
		}
		setDialogOpen(true);
	};

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
				<h2 className="mt-20 text-lg font-semibold text-gray-900">免费开始</h2>
				<p className="mt-2 text-sm text-gray-700">
					已经注册？{' '}
					<Link to="/login" className="font-medium text-blue-600 hover:underline">
						登录
					</Link>{' '}
					您的账户。
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
											{item.name === 'captcha' ? (
												<div className="flex gap-3">
													<TextField {...field} label={item.label} className="flex-10" />
													{item.name === 'captcha' && (
														<Button
															type="button"
															variant="outline"
															onClick={sendCaptcha}
															disabled={countdown > 0}
															className="flex-2 h-1/2 relative top-1/2"
														>
															{countdown > 0 ? `${countdown}秒后重试` : '发送'}
														</Button>
													)}
												</div>
											) : (
												<TextField {...field} label={item.label} />
											)}
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
						<div className="flex items-center space-x-2">
							<Checkbox
								id="terms"
								className="border-gray-400"
								checked={isChecked}
								onCheckedChange={checked => setIsChecked(Boolean(checked))}
							/>
							<label
								htmlFor="terms"
								className="text-gray-500 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								我已阅读并同意
								<span
									className="cursor-pointer text-blue-500 hover:underline"
									onClick={() => openAgreementDialog('regist')}
								>
									《注册协议》
								</span>
								和
								<span
									className="cursor-pointer text-blue-500 hover:underline"
									onClick={() => openAgreementDialog('privacy')}
								>
									《隐私政策》
								</span>
							</label>
						</div>
						<div className="col-span-full">
							<Button type="submit" variant="solid" color="blue" className="w-full">
								<span>
									注册 <span aria-hidden="true">&rarr;</span>
								</span>
							</Button>
						</div>
					</form>
				</Form>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent className="max-w-3xl h-[80vh] flex flex-col">
						<DialogHeader>
							<DialogTitle>{dialogContent.title}</DialogTitle>
						</DialogHeader>
						<div className="overflow-y-auto scb-thin">
							<MilkdownEditor mdSelector={() => dialogContent.content} type="show" />
						</div>
					</DialogContent>
				</Dialog>
			</SlimLayout>
		</div>
	);
}
