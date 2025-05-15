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

instance.interceptors.response.use((response: AxiosResponse) => {
	const resdata = response.data;
	console.log('🚀 ~ instance.interceptors.response.use ~ resdata:', resdata);
	return resdata as any;
});

export default instance;
