import type {
	LoginFormType,
	LoginResponse,
	RegistFormType,
	RegistResponse,
	ServerDataFormat as SDF
} from '@prisma-ai/shared';
import { instance } from './config';

//注册
async function register(userInfo: RegistFormType) {
	const res = await instance.post<RegistFormType, SDF<RegistResponse>>('/user/regist', userInfo);
	return res.data;
}

//验证码发送到邮箱
async function registerCaptcha(email: string) {
	const res = await instance.get<SDF<string>>(`/user/register-captcha?address=${email}`);
	return res.data;
}

//登录
async function login(userInfo: LoginFormType) {
	const res = await instance.post<LoginFormType, SDF<LoginResponse>>('/user/login', userInfo);
	return res.data;
}

export { login, register, registerCaptcha };
