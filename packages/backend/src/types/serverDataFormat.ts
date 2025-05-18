//服务器数据返回格式
export interface ServerDataFormat<T = any> {
	code: string;
	message: string;
	data: T;
}
