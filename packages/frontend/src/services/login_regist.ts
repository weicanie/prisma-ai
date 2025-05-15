import instance from '.';
import type { ResponseData } from './types';

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
async function register(
	userInfo: UserInfo,
	isCommit: boolean
): Promise<ResponseData<UserInfoResponse>> {
	let data;
	if (isCommit) {
		data = await instance.post('/user/regist', userInfo);
	} else {
		data = await instance.post('/user/login', userInfo);
	}
	return data as any;
}

//验证码发送到邮箱
async function registerCaptcha(email: string): Promise<ResponseData<string>> {
	return await instance.get(`/user/register-captcha?address=${email}`);
}

interface LoginResponse {
	id: number;
	username: string;
	create_at: Date | null;
	update_at: Date | null;
	email: string;
	token: string;
	userId?: number;
}
async function login(userInfo: UserInfo): Promise<ResponseData<LoginResponse>> {
	return await instance.post('/user/login', userInfo);
}

export { login, register, registerCaptcha };
