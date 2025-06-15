import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MCPClientService } from './mcp-client/mcp-client.service';
import { TaskQueueService } from './task-queue/task-queue.service';

//TODO 服务器本身的高可用（请求队列放服务器更好,而不是放模型客户端）

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  try {
    const clientService = app.get(MCPClientService);
    clientService.showUsage();
    const taskQueueService = app.get(TaskQueueService);
    // 启动时恢复队列状态
    taskQueueService.initialize();
  } catch (error) {
    console.error('Application error:', error);
  }
  console.log(`Server started on port ${PORT}`);
}
bootstrap();
