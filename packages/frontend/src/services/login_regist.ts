import instance from '.';

interface UserInfo {
	username: string;

	password: string;

	email?: string;

	captcha?: string;
}
//注册
async function register(userInfo: UserInfo, isCommit: boolean) {
	let data;
	if (isCommit) {
		data = await instance.post('/user/regist', userInfo);
	} else {
		data = await instance.post('/user/login', userInfo);
	}
	return data;
}
async function login(userInfo: UserInfo) {
	return await instance.post('/user/login', userInfo);
}

//注册-获取验证码
async function registerCaptcha(email: string) {
	return await instance.get(`/user/register-captcha?address=${email}`);
}

export { login, register, registerCaptcha };
