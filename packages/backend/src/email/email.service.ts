import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
@Injectable()
export class EmailService {
	transporter: Transporter;

	constructor(private configService: ConfigService) {
		this.transporter = createTransport({
			host: 'smtp.qq.com',
			port: 587,
			secure: false,
			auth: {
				user: '2042365244@qq.com',
				pass: this.configService.get('EMAIL_PASS')
			}
		});
	}

	async sendMail({ to, subject, html }) {
		await this.transporter.sendMail({
			from: {
				name: '验证码',
				address: '2042365244@qq.com'
			},
			to,
			subject,
			html
		});
	}
}
