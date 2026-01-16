import type {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig
} from 'axios';
import axios from 'axios';

//RD: Request Data, SD: Response Data
export interface RequestConfig<RD, SD> extends AxiosRequestConfig<RD> {
	reqOKFn?: ((
		config: RequestConfig<RD, SD>
	) => Promise<RequestConfig<RD, SD>> | RequestConfig<RD, SD>)[];
	//不支持偷懒返回res.data,这是一种反模式, 因为会导致后续的其它拦截器拿到res.data,而不是res
	resOKFn?: ((
		res: AxiosResponse<SD, RD>
	) => Promise<AxiosResponse<SD, RD>> | AxiosResponse<SD, RD>)[];
	reqFailFn?: (error: AxiosError<SD, RD>) => Promise<AxiosResponse<SD, RD>> | AxiosResponse<SD, RD>;
	resFailFn?: (error: AxiosError<SD, RD>) => Promise<AxiosResponse<SD, RD>> | AxiosResponse<SD, RD>;
}

/**
 * axios 封装
 * 使用比axios更严格更清晰的类型要求：any爬~
 * 三级拦截器：支持全局、实例、单次请求响应的拦截器分层设置, 关注点分离~
 * 不锁死axios：方便渣~
 */
class Requester<TRD, TSD> {
	instance: AxiosInstance;
	//config：实例的默认配置
	constructor(config: RequestConfig<TRD, TSD>) {
		this.instance = axios.create(config);
		// 这里 设置并应用 全局拦截器（会给每个实例都设置）
		// this.instance.interceptors.request.use(onFulfilledCb,onRejectedCb);

		// 这里 应用 实例的拦截器
		this.instance.interceptors.request.use(async (config: InternalAxiosRequestConfig<TRD>) => {
			/* 
			实际上拿到的是加了 headers 属性的 RequestConfig ,
			同时也是属性只多不少的 InternalAxiosRequestConfig
			类型安全（鸭子类型）
			*/
			let configCustom = config as unknown as RequestConfig<TRD, TSD>;
			for (const fn of configCustom.reqOKFn || []) {
				configCustom = await fn(configCustom);
			}
			return configCustom as InternalAxiosRequestConfig<TRD>;
		}, config.reqFailFn);

		this.instance.interceptors.response.use(async (value: AxiosResponse<TSD, TRD>) => {
			for (const fn of config.resOKFn || []) {
				value = await fn(value);
			}
			return value;
		}, config.resFailFn);
	}

	async request<RD, SD>(config: RequestConfig<RD, SD>): Promise<AxiosResponse<SD, RD>> {
		// 这里 应用 单次请求和响应的拦截器
		try {
			for (const fn of config.reqOKFn || []) {
				config = await fn(config);
			}
			let res = await this.instance.request<SD, AxiosResponse<SD>, RD>(config);
			for (const fn of config.resOKFn || []) {
				res = await fn(res);
			}
			return res;
		} catch (error) {
			/* 拦截器执行顺序：实例级拦截器、单次请求级拦截器
				实例级拦截器处理通用错误,
				单次请求级拦截器处理特定业务错误
			*/
			if (axios.isAxiosError(error)) {
				if (error.response) {
					//响应错误
					if (config.resFailFn) {
						return config.resFailFn(error); // 拦截器返回值会成为请求的最终结果（提供fallback）
					}
				} else {
					//请求或者请求创建错误
					if (config.reqFailFn) {
						return config.reqFailFn(error);
					}
				}
			}

			throw error;
		}
	}

	async get<SD>(url: string, config?: RequestConfig<never, SD>) {
		return await this.request<never, SD>({
			url,
			method: 'GET',
			...config
		});
	}

	async post<RD, SD>(url: string, data: RD, config?: RequestConfig<RD, SD>) {
		return await this.request<RD, SD>({
			url,
			method: 'POST',
			data,
			...config
		});
	}

	async put<RD, SD>(url: string, data: RD, config?: RequestConfig<RD, SD>) {
		return await this.request<RD, SD>({
			url,
			method: 'PUT',
			data,
			...config
		});
	}

	async delete<SD>(url: string, config?: RequestConfig<never, SD>) {
		return await this.request<never, SD>({
			url,
			method: 'DELETE',
			...config
		});
	}

	async patch<RD, SD>(url: string, data: RD, config?: RequestConfig<RD, SD>) {
		return await this.request<RD, SD>({
			url,
			method: 'PATCH',
			data,
			...config
		});
	}
}

export { Requester };
