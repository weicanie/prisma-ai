import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PROT'),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_FROM'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: 'prismaAI-验证码',
        address: this.configService.get('EMAIL_FROM'),
      },
      to,
      subject,
      html,
    });
  }
}
