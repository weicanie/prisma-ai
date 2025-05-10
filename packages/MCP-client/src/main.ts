#!/usr/bin/env node
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { CLIService } from './client/services/cli.service';
import { setTodayDir } from './client/utils/log.util';

async function bootstrap() {
	await dotenv.config(); // Load environment variables from .env file
	// Initialize logs directory for today
	setTodayDir();

	// Create NestJS application without HTTP server
	const app = await NestFactory.createApplicationContext(AppModule, {
		logger: ['error', 'warn'] // Minimize NestJS internal logging
	});

	try {
		// Get CLI service and start the application
		const cliService = app.get(CLIService);
		await cliService.run();
	} catch (error) {
		console.error('Application error:', error);
	} finally {
		await app.close();
	}
}

// Start the application
bootstrap();
