import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';

@Module({
	controllers: [OssController],
	providers: [
		OssService,
		//用于后端和minio通信的客户端
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
		//用于前端上传文件前预签名的客户端
		{
			provide: 'OSS-PRESIGN-CLIENT',
			inject: [ConfigService],
			async useFactory(configService: ConfigService) {
				const client = new Minio.Client({
					// 必须指向 Nginx 容器，因为它是内部通信的下一跳
					endPoint: 'nginx-container',
					port: 80,
					useSSL: false,
					accessKey: configService.get('OSS_ACCESSKEY'),
					secretKey: configService.get('OSS_SECRETKEY'),
					// 当通过子路径代理时，必须使用 path-style
					pathStyle: true
				});
				return client;
			}
		}
	],
	exports: ['OSS-CLIENT', OssService]
})
export class OssModule {}
