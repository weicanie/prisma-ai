import { UserConfigSchema, type ServerDataFormat } from '@prisma-ai/shared';
import { toast } from 'sonner';
import { getUserConfig } from '../localstorage/userConfig';
import { Requester, type RequestConfig } from './requester';

const config: RequestConfig<unknown, ServerDataFormat> = {
	baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
	timeout: 100000,
	//这里设置实例拦截器
	reqOKFn: [
		config => {
			//添加token
			const token = localStorage.getItem('token');
			if (token && config.headers) {
				config.headers['Authorization'] = `Bearer ${token}`;
			}

			//添加用户配置信息到请求头
			try {
				const userConfig = getUserConfig();
				//校验用户配置是否符合格式
				UserConfigSchema.parse(userConfig);
				if (config.headers) {
					//将用户配置转换为JSON字符串并编码，避免特殊字符问题
					const configStr = JSON.stringify(userConfig);
					const encodedConfig = btoa(encodeURIComponent(configStr));
					config.headers['X-User-Config'] = encodedConfig;
				}
			} catch (error) {
				toast.error('非法的用户配置');
				console.error('用户配置非法:', error);
			}
			return config;
		}
	],
	resOKFn: [
		response => {
			return response;
		}
	]
};

const instance = new Requester<unknown, ServerDataFormat>(config);

export { instance };
