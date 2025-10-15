import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
	ErrorCode,
	initialUserConfig,
	UserConfig,
	UserConfigSchema,
	UserInfoFromToken,
	VerifyMetaData
} from '@prisma-ai/shared';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

export interface UserRequest extends Request {
	userInfo: UserInfoFromToken;
	token: string;
}
// 如果没有设置@RequireLogin(),则接口调用不需要登录,直接放行
// 如果设置了@RequireLogin(),则需要登录,并且验证token、续token、获取token中的用户信息
@Injectable()
export class IsLoginGuard implements CanActivate {
	@Inject(ConfigService)
	private configService: ConfigService;
	constructor(
		public reflector: Reflector,
		public jwtService: JwtService
	) {}
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const verify: VerifyMetaData = this.reflector.getAllAndOverride('verify', [
			context.getClass(),
			context.getHandler()
		]);
		if (!verify?.requireLogin) {
			return true;
		}
		// jwt鉴定token,并提取用户信息
		const request = context.switchToHttp().getRequest<UserRequest>();
		let token = request.headers.authorization ?? (request.query.token as string);
		if (!token) {
			throw new Error(ErrorCode.USER_TOKEN_NOT_CARRY);
		}
		token = token.replace('Bearer ', '');
		let userInfo: UserInfoFromToken;
		try {
			userInfo = this.jwtService.verify(token, {
				publicKey: this.configService.get('PUBLIC_KEY')
			});
		} catch (error) {
			throw new Error(ErrorCode.USER_TOKEN_INVALID);
		}

		// 从请求头解析用户配置 (由前端通过 X-User-Config 传入，Base64 + URI 编码)
		const rawUserConfig = request.headers['x-user-config'];
		let headerUserConfig: UserConfig | undefined;
		try {
			const encoded = Array.isArray(rawUserConfig) ? rawUserConfig[0] : rawUserConfig;
			if (encoded && typeof encoded === 'string') {
				const decodedStr = decodeURIComponent(Buffer.from(encoded, 'base64').toString('utf-8'));
				headerUserConfig = JSON.parse(decodedStr) as UserConfig;
			}
			UserConfigSchema.parse(headerUserConfig);
		} catch {
			// 解析失败不影响主流程
			headerUserConfig = initialUserConfig;
		}

		// 合并用户信息
		if (headerUserConfig) {
			userInfo = { ...userInfo, userConfig: headerUserConfig } as UserInfoFromToken;
		}

		// 存储用户信息
		request.userInfo = userInfo;
		// 无感续token
		const { userId, username } = userInfo;
		const newToken = this.jwtService.sign(
			{ userId, username },
			{
				privateKey: this.configService.get('PRIVATE_KEY'),
				algorithm: 'RS256',
				expiresIn: 24 * 60 * 60 * 7
			}
		);
		const response = context.switchToHttp().getResponse<Response>();
		request.token = newToken;
		response.setHeader('token', newToken);

		return true;
	}
}
