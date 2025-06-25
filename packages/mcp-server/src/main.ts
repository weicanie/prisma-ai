import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//chain出结果, agent 协作
/**
 * 启动 NestJS 应用
 * 包含 MCP Server 服务，支持无状态模式处理请求
 */
async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors();

	const PORT = process.env.PORT ?? 3000;
	await app.listen(PORT);
	console.log(`Server with MCP support started on port ${PORT}`);
	console.log(`MCP 请求入口: http://localhost:${PORT}/mcp`);
}

bootstrap();
