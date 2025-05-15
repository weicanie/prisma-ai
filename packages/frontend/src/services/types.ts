export interface ResponseData<T = any> {
	code: string; // 0 | 错误代码

	message: string; //'ok' | 错误信息

	data: T; // 数据 | null
}
