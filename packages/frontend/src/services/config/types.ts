//服务器返回的数据格式
export interface ServerDataFormat<TData = unknown> {
	code: string; // 0 | 错误代码

	message: string; //'ok' | 错误信息

	data: TData; // 数据 | null
}
