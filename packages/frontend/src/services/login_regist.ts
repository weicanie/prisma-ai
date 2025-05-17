import { instance } from './config';
import type { ServerDataFormat as SDF } from './config/types';

interface UserInfo {
	username: string;

	password: string;

	email?: string;

	captcha?: string;
}
interface UserInfoResponse {
	id: number;
	username: string;
	email: string;
	create_at: Date | null;
}
//注册
async function register(userInfo: UserInfo) {
	return await instance.post<UserInfo, SDF<UserInfoResponse>>('/user/regist', userInfo);
}

//验证码发送到邮箱
async function registerCaptcha(email: string) {
	return await instance.get<SDF<string>>(`/user/register-captcha?address=${email}`);
}

interface LoginResponse {
	id: number;
	username: string;
	create_at: Date | null;
	update_at: Date | null;
	email: string;
	token: string;
	userId?: number; //前端添加
}
//登录
async function login(userInfo: UserInfo) {
	return await instance.post<UserInfo, SDF<LoginResponse>>('/user/login', userInfo);
}

export { login, register, registerCaptcha };
