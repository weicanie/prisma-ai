//统一返回数据的格式
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ErrorCode, ServerDataFormat } from '@prism-ai/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			map(data => {
				// 如果已经是ServerDataFormat格式则直接返回（以自定义message）
				if (
					data &&
					typeof data === 'object' &&
					'code' in data &&
					'message' in data &&
					'data' in data
				) {
					return data;
				}
				const result: ServerDataFormat = {
					code: ErrorCode.SUCCESS,
					message: 'ok',
					data
				};
				return result;
			})
		);
	}
}
