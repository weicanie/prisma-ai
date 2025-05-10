"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const log_util_1 = require("../utils/log.util");
const types_1 = require("../types");
let LogInterceptor = class LogInterceptor {
    intercept(context, next) {
        const methodName = context.getHandler().name;
        const className = context.getClass().name;
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                (0, log_util_1.addLogs)({
                    type: 'Success',
                    class: className,
                    method: methodName,
                    data,
                    duration: `${Date.now() - startTime}ms`,
                }, types_1.logType.ServiceCall);
            },
            error: (error) => {
                (0, log_util_1.addLogs)({
                    type: 'Error',
                    class: className,
                    method: methodName,
                    error: error.message,
                    stack: error.stack,
                    duration: `${Date.now() - startTime}ms`,
                }, types_1.logType.ServiceError);
            },
        }));
    }
};
exports.LogInterceptor = LogInterceptor;
exports.LogInterceptor = LogInterceptor = __decorate([
    (0, common_1.Injectable)()
], LogInterceptor);
//# sourceMappingURL=log.interceptor.js.map