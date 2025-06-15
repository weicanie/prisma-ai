import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ErrorCode, ServerDataFormat } from '@prism-ai/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
//统一返回数据的格式

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const result: ServerDataFormat = {
          code: data?.code ?? ErrorCode.SUCCESS,
          message: data?.message ?? 'ok',
          data,
        };
        return result;
      }),
    );
  }
}
