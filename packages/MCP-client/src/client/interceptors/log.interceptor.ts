import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logType } from '../types';
import { addLogs } from '../utils/log.util';

@Injectable()
export class LogInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const methodName = context.getHandler().name;
		const className = context.getClass().name;
		const startTime = Date.now();

		return next.handle().pipe(
			tap({
				next: data => {
					addLogs(
						{
							type: 'Success',
							class: className,
							method: methodName,
							data,
							duration: `${Date.now() - startTime}ms`
						},
						logType.ServiceCall
					);
				},
				error: error => {
					addLogs(
						{
							type: 'Error',
							class: className,
							method: methodName,
							error: error.message,
							stack: error.stack,
							duration: `${Date.now() - startTime}ms`
						},
						logType.ServiceError
					);
				}
			})
		);
	}
}
