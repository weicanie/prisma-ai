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
instance.interceptors.response.use((response: AxiosResponse) => {
	const resdata: ResponseData = response.data;
	resdata.status = resdata.code; //兼容
	return resdata as any;
});

export default instance;
