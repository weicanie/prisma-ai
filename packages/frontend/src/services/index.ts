import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const config = {
	baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
	timeout: 10000
};

const instance = axios.create(config);
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	//添加token
	const token = localStorage.getItem('token');
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});
interface ResponseData<T = any> {
	code: number;

	message: string;

	data: T;

	status?: number;
}
//@ts-ignore
instance.interceptors.response.use((response: AxiosResponse) => {
	const resdata: ResponseData = response.data;
	resdata.status = resdata.code; //兼容
	return resdata;
});

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

interface Article {
	title: string;

	content: string;

	gist: string;

	type: string;

	hard: number;
}

//上传题目
async function uploadArticle(article: Article) {
	return await instance.post('/article/add', article);
}

//注意使用按时间从旧到新的顺序收集题目,因为其它排序pc和移动端不一致
//不要重复提交题目（服务端校验、人员培训）

interface questionTask {
	type: string;
	count: number;
	finish_count: number;
}
type Task = questionTask[];
type TaskResponse = {
	code: number;
	message: string;
	data: Task;
};
//获取任务：题目类型列表、完成情况
async function getTask(): Promise<TaskResponse> {
	return await instance.get('/user/task');
}

export { getTask, login, register, registerCaptcha, uploadArticle };
