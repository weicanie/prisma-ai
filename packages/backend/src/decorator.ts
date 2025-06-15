import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { type UserRequest } from './isLogin.guard';

// 标识某个 handler 需要登录才能执行。
export const RequireLogin = () =>
  SetMetadata('verify', {
    requireLogin: true,
  });

// 获取 request 对象中通过 Guard 时储存的用户信息。
export const UserInfo = createParamDecorator(
  (param: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    if (!request.userInfo) {
      return null;
    }
    return param ? request.userInfo[param] : request.userInfo;
  },
);
