import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode, UserInfoFromToken, VerifyMetaData } from '@prism-ai/shared';
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
    public jwtService: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const verify: VerifyMetaData = this.reflector.getAllAndOverride('verify', [
      context.getClass(),
      context.getHandler(),
    ]);
    if (!verify?.requireLogin) {
      return true;
    }
    // jwt鉴定token,并提取用户信息
    const request = context.switchToHttp().getRequest<UserRequest>();
    let token =
      request.headers.authorization ?? (request.query.token as string);
    if (!token) {
      throw new UnauthorizedException(ErrorCode.USER_TOKEN_NOT_CARRY);
    }
    token = token.replace('Bearer ', '');
    let userInfo: UserInfoFromToken;
    try {
      userInfo = this.jwtService.verify(token, {
        publicKey: this.configService.get('PUBLIC_KEY'),
      });
    } catch (error) {
      throw new UnauthorizedException('token解析失败,请重新登录');
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
        expiresIn: 24 * 60 * 60 * 7,
      },
    );
    const response = context.switchToHttp().getResponse<Response>();
    request.token = newToken;
    response.setHeader('token', newToken);

    return true;
  }
}
