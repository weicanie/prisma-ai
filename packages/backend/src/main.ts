import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalFilter } from './global.filter';
import { GlobalInterceptor } from './global.interceptor';

//TODO 统一的错误处理,采用全局的exceptionFilter,{code,message,data}
//TODO 在适当的时候将业务与基建分离
//TODO 服务器本身的高可用（请求队列放服务器更好,而不是放模型客户端）
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalFilters(new GlobalFilter());
	app.useGlobalInterceptors(new GlobalInterceptor());
	process.env.NODE_ENV === 'development' && (await app.enableCors());
	await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
