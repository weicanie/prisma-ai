export interface ResponseData<T = any> {
	code: string;
	message: string;
	data: T;
}
