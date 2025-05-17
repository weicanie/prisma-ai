import type {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig
} from 'axios';

import axios from 'axios';

export interface RequestConfig<TRequestData, TResponseData>
	extends AxiosRequestConfig<TRequestData> {
	requestSuccessInterceptor?: (
		config: RequestConfig<TRequestData, TResponseData>
	) => RequestConfig<TRequestData, TResponseData>;
	responseSuccessInterceptor?: (res: AxiosResponse<TResponseData>) => AxiosResponse<TResponseData>; //不支持偷懒返回res.data,这是一种反模式, 因为会导致后续的其它拦截器拿到res.data,而不是res
	requestFailInterceptor?: (error: any) => any;
	responseFailInterceptor?: (error: any) => any;
}

export interface RequesterConfig<TRequestData, TResponseData>
	extends RequestConfig<TRequestData, TResponseData> {}

interface Instance extends AxiosInstance {}

/**
 * 封装 axios,支持全局、实例、单次请求响应的拦截器设置
 */
class Requester<TRequestData, TResponseData> {
	instance: Instance;

	constructor(config: RequesterConfig<TRequestData, TResponseData>) {
		this.instance = axios.create(config);

		// 这里 设置并应用 全局拦截器（给每个实例都设置）
		// this.instance.interceptors.request.use(onFulfilledCb,onRejectedCb);

		// 这里 应用 实例的拦截器
		this.instance.interceptors.request.use((config: InternalAxiosRequestConfig<TRequestData>) => {
			const customConfig = config as unknown as RequestConfig<TRequestData, TResponseData>;
			if (customConfig.requestSuccessInterceptor) {
				const modifiedConfig = customConfig.requestSuccessInterceptor(customConfig);
				return { ...config, ...modifiedConfig } as InternalAxiosRequestConfig<TRequestData>; //安全的断言: RequestConfig 相比 InternalAxiosRequestConfig 缺少的 headers 属性,已通过...config 添加
			}
			return config;
		}, config.requestFailInterceptor);

		this.instance.interceptors.response.use(
			config.responseSuccessInterceptor,
			config.responseFailInterceptor
		);
	}

	async request<TRequestData, TResponseData>(config: RequestConfig<TRequestData, TResponseData>) {
		// 这里应用单次请求的拦截器
		try {
			config = config.requestSuccessInterceptor ? config.requestSuccessInterceptor(config) : config;

			let res = await this.instance.request<
				TResponseData,
				AxiosResponse<TResponseData>,
				TRequestData
			>(config);

			if (config.responseSuccessInterceptor) res = config.responseSuccessInterceptor(res);
			return res;
		} catch (error) {
			if (config.requestFailInterceptor) {
				config.requestFailInterceptor(error);
			}
			throw error;
		}
	}

	async get<TResponseData>(url: string, config?: RequestConfig<never, TResponseData>) {
		return await this.request<never, TResponseData>({
			url,
			method: 'GET',
			...config
		});
	}

	async post<TRequestData, TResponseData>(
		url: string,
		data: TRequestData,
		config?: RequestConfig<TRequestData, TResponseData>
	) {
		return await this.request<TRequestData, TResponseData>({
			url,
			method: 'POST',
			data,
			...config
		});
	}
}

export { Requester };
