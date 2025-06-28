import { NestFactory } from '@nestjs/core';
import * as figlet from 'figlet';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { TaskQueueService } from './task-queue/task-queue.service';
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ZodValidationPipe());
	if (process.env.NODE_ENV !== 'production') {
		app.enableCors();
	}
	const PORT = process.env.PORT ?? 3000;
	await app.listen(PORT);

	try {
		const taskQueueService = app.get(TaskQueueService);
		// 启动时恢复队列状态 (暂时关闭，直到任务中止和去重功能实现)
		// taskQueueService.initialize();
	} catch (error) {
		console.error('Application error:', error);
	}

	try {
		figlet.text(
			'PrismaAI',
			{
				font: 'miniwi',
				horizontalLayout: 'default',
				verticalLayout: 'default',
				width: 80,
				whitespaceBreak: true
			},
			function (err, data) {
				if (err) {
					console.log('Something went wrong...');
					console.dir(err);
					return;
				}
				console.log(data);
			}
		);
		// figlet.fonts(function (err, fonts) {
		// 	if (err) {
		// 		console.log('something went wrong...');
		// 		console.dir(err);
		// 		return;
		// 	}
		// 	console.dir(fonts);
		// });
	} catch (error) {
		console.error('figlet error:', error);
	}

	console.log(`Server started on port ${PORT}~`);
}
bootstrap();
