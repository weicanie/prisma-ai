//统一的异常处理
//throw new Error('1001' + '错误信息') 1001为错误码，后面为错误信息
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, errorMessage, ServerDataFormat } from '@prism-ai/shared';
import { Response } from 'express';

@Catch()
export class GlobalFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		console.error(exception);
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let code = '';
		let message = '';

		const codeTry = exception.message.substring(0, 4);
		if (ErrorCode.hasOwnProperty(codeTry)) {
			//分配了错误码的错误
			code = codeTry;
			message += errorMessage[code] + ':' + exception.message.substring(4);
		} else {
			//没有分配错误码的错误
			code = ErrorCode.UNNAMED;
			message = exception.message || '服务器异常';
		}

		//兼容ValidationPipe的格式错误信息（加上）
		if (exception instanceof HttpException) {
			const res = exception.getResponse() as any;
			if (res?.message) {
				message += Array.isArray(res.message) ? res.message.join(',') : res.message;
			}
		}

		let data = null;
		const result: ServerDataFormat = {
			code,
			message,
			data
		};
		response.status(HttpStatus.OK).json(result);
	}
}
