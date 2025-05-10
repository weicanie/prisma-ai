import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
async function bootstrap() {
	await dotenv.config();
	console.log('dotenv 加载完毕');
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
