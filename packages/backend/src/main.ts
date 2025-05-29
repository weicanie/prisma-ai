import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalInterceptor } from './dataFormat.interceptor';
import { MCPClientService } from './mcp-client/mcp-client.service';

//TODO 统一的错误处理,采用全局的exceptionFilter,{code,message,data}
//TODO 在适当的时候将业务与基建分离
//TODO 服务器本身的高可用（请求队列放服务器更好,而不是放模型客户端）

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalInterceptors(new GlobalInterceptor());

	// if (process.env.NODE_ENV === 'development')
	app.enableCors(); //TODO 易受 DNS rebinding 攻击
	const PORT = process.env.PORT ?? 3000;
	await app.listen(PORT);
	try {
		const clientService = app.get(MCPClientService);
		clientService.showUsage();
	} catch (error) {
		console.error('Application error:', error);
	}
	console.log(`Server with MCP support started on port ${PORT}`);
}
bootstrap();
