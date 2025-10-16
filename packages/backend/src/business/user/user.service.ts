import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode, RegistResponse } from '@prisma-ai/shared';

import { DbService } from '../../DB/db.service';
import { RedisService } from '../../redis/redis.service';
import { user_data_dir } from '../../utils/constants';
import { addLogs, logType } from '../../utils/log.utils';
import { createHashedPassword, verifyPassword } from '../../utils/passwordEncrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
type UserInfo = RegistResponse;

@Injectable()
export class UserService {
	@Inject(RedisService)
	private redisService: RedisService;
	private logger = new Logger();
	constructor(
		@Inject(DbService)
		private readonly dbService: DbService,
		@Inject(JwtService)
		private readonly JwtService: JwtService
	) {}

	async regist(user: RegisterUserDto) {
		const captcha = await this.redisService.get(`captcha_${user.email}`);

		if (!captcha) {
			throw new Error(ErrorCode.CAPTCHAEXPIRED);
		}

		if (user.captcha !== captcha) {
			throw new Error(ErrorCode.CAPTCHAWRONG);
		}

		const userInfo = await this.dbService.user.findUnique({
			where: {
				username: user.username
			}
		});

		if (userInfo) {
			throw new Error(ErrorCode.USER_ALREADY_EXISTS);
		}
		user.password = createHashedPassword(user.password);
		try {
			const userRes = await this.dbService.user.create({
				data: {
					username: user.username,
					password: user.password,
					email: user.email
				},
				select: {
					id: true,
					username: true,
					email: true,
					create_at: true
				}
			});
			addLogs(userRes, logType.Regist);
			//初始化用户数据目录
			user_data_dir.initUserDir(`${userRes.id}`);
			return userRes;
		} catch (e) {
			this.logger.error(e, UserService);
			return null;
		}
	}

	async login(loginUserDto: LoginUserDto) {
		const userInfo = await this.dbService.user.findUnique({
			where: {
				username: loginUserDto.username
			}
		});

		if (!userInfo) {
			throw new Error(ErrorCode.USER_NOT_FOUND);
		}
		await this.pwdVerify(userInfo, loginUserDto.password);
		const token = await this.tokenDispatch(userInfo, userInfo.id);
		const userRes = await this.dbService.user.findUnique({
			where: {
				id: userInfo.id
			}
		});
		const { password, ...userWithoutPwd } = userRes!;

		//迁移用户数据目录
		if (process.env.IS_ONLINE !== 'true') {
			user_data_dir.migrateUserDir(`${userInfo.id}`);
		}

		addLogs(userWithoutPwd, logType.Login);

		return { ...userWithoutPwd, token };
	}

	async logout(username: string) {
		const userInfo = await this.dbService.user.findUnique({
			where: {
				username
			}
		});

		if (!userInfo) {
			throw new Error(ErrorCode.USER_NOT_FOUND);
		}
		return '已退出登录';
	}

	async pwdVerify(userInfo: UserInfo & { password: string }, password: string) {
		if (!verifyPassword(password, userInfo.password)) {
			throw new Error(ErrorCode.USER_PASSWORD_WRONG);
		}
	}
	//* 改用双token方案? 前端再使用队列处理refresh token请求的并发
	async tokenDispatch(userInfo: UserInfo, userId: number) {
		const { username } = userInfo;
		const token = this.JwtService.sign(
			{ userId, username },
			{
				privateKey: process.env.PRIVATE_KEY,
				algorithm: 'RS256',
				expiresIn: 24 * 60 * 60 * 7
			}
		);
		return token;
	}
}
