import type {
	LoginFormType,
	LoginResponse,
	RegistFormType,
	RegistResponse,
	ServerDataFormat as SDF
} from '@prism-ai/shared';
import { instance } from './config';

//注册
async function register(userInfo: RegistFormType) {
	return await instance.post<RegistFormType, SDF<RegistResponse>>('/user/regist', userInfo);
}

//验证码发送到邮箱
async function registerCaptcha(email: string) {
	return await instance.get<SDF<string>>(`/user/register-captcha?address=${email}`);
}

//登录
async function login(userInfo: LoginFormType) {
	return await instance.post<LoginFormType, SDF<LoginResponse>>('/user/login', userInfo);
}

export { login, register, registerCaptcha };
