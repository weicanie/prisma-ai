import { BadRequestException, Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { RedisService } from '../../redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
	@Inject(EmailService)
	private emailService: EmailService;

	@Inject(RedisService)
	private redisService: RedisService;

	constructor(private readonly userService: UserService) {}

	@Post('regist')
	async regist(@Body() registerUser: RegisterUserDto) {
		return await this.userService.regist(registerUser);
	}
	@Get('register-captcha')
	async captcha(@Query('address') address: string) {
		if (!address) {
			throw new BadRequestException('邮箱地址不能为空');
		}
		const code = Math.random().toString().slice(2, 8);
		await this.redisService.set(`captcha_${address}`, code, 5 * 60);
		if (process.env.DIRECT_CAPTCHA === 'true') {
			return {
				message: `你的验证码是${code}，请在5分钟内使用`,
				data: code
			};
		}
		await this.emailService.sendMail({
			to: address,
			subject: '注册验证码',
			html: `<p>你的注册验证码是 ${code}</p>`
		});
		return '发送成功';
	}

	@Post('login')
	async login(@Body() loginUser: LoginUserDto) {
		return await this.userService.login(loginUser);
	}

	@Post('logout')
	async logout(@Body('username') username: string) {
		return await this.userService.logout(username);
	}
}
