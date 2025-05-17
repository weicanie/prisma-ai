//服务器数据返回格式
export interface ResponseData<T = any> {
	code: string;
	message: string;
	data: T;
}
