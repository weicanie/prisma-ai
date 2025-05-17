import { type RequesterConfig, Requester } from './requester';
import type { ServerDataFormat } from './types';

const config: RequesterConfig<any, ServerDataFormat> = {
	baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
	timeout: 10000,
	//这里设置实例拦截器
	requestSuccessInterceptor: config => {
		console.log('实例拦截器 ~ config:', config);
		//添加token
		const token = localStorage.getItem('token');
		if (token && config.headers) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	responseSuccessInterceptor: response => {
		return response;
	}
};

const instance = new Requester<any, ServerDataFormat>(config);

export { instance };
