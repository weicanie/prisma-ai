#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cli_service_1 = require("./client/services/cli.service");
const log_util_1 = require("./client/utils/log.util");
async function bootstrap() {
    (0, log_util_1.clearLogs)();
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn'],
    });
    try {
        const cliService = app.get(cli_service_1.CLIService);
        await cliService.run();
    }
    catch (error) {
        console.error('Application error:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=main.js.map