import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { type UserRequest } from './isLogin.guard';

export enum Role {
	user = 'user',
	admin = 'admin'
}

// 标识某个 handler 需要登录才能执行。
// 默认需要 user 或 admin 角色权限
export const RequireLogin = (roles: Role[] = [Role.user, Role.admin]) =>
	SetMetadata('verify', {
		requireLogin: true,
		roles
	});

// 获取 request 对象中通过 Guard 时储存的用户信息。
export const UserInfo = createParamDecorator((param: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<UserRequest>();
	if (!request.userInfo) {
		return null;
	}
	return param ? request.userInfo[param] : request.userInfo;
});
