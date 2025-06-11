import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';

//TODO 测试oss功能是否正常
//TODO 编写说明文档,尤其是accessKey、secretKey的获取和设置
@Module({
	controllers: [OssController],
	providers: [
		{
			provide: 'OSS-CLIENT',
			inject: [ConfigService],
			async useFactory(configService: ConfigService) {
				const client = new Minio.Client({
					endPoint: configService.get('OSS_ENDPOINT') || 'localhost',
					port: Number(configService.get('OSS_PORT')) || 9000,
					useSSL: false,
					accessKey: configService.get('OSS_ACCESSKEY'),
					secretKey: configService.get('OSS_SECRETKEY')
				});
				return client;
			}
		},
		OssService
	],
	exports: ['OSS-CLIENT', OssService]
})
export class OssModule {}
