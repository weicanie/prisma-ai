//统一的异常处理
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { errorMessage } from './types/error';
import { ResponseData } from './types/response-data';

@Catch()
export class GlobalFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		let code = exception.message;
		let message = errorMessage[code] || '服务器异常';
		let status = HttpStatus.OK;
		let data = null;

		//兼容ValidationPipe的格式错误信息
		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const res = exception.getResponse() as any;
			if (res?.message) {
				message = Array.isArray(res.message) ? res.message.join(',') : res.message;
			}
		}
		const result: ResponseData = {
			code,
			message,
			data
		};
		response.status(status).json(result);
	}
}
