import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/client';
@Injectable()
export class DbService extends PrismaClient implements OnModuleInit {
	// constructor() {
	// 	super({
	// 		log: [
	// 			{
	// 				emit: 'stdout',
	// 				level: 'query'
	// 			}
	// 		]
	// 	});
	// }
	private logger = new Logger();

	async onModuleInit() {
		try {
			await this.$connect();
			this.logger.log('mysql数据库连接成功', 'DbService');
		} catch (error) {
			this.logger.error(error, DbService);
			throw error;
		}
	}
}
