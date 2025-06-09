# Redis ETag 缓存系统

这个缓存系统基于 Redis 实现了 ETag 缓存功能，支持多种缓存策略和自动 ETag 管理。

## 功能特性

- 🚀 **基于 Redis 的 ETag 缓存**: 使用 Redis 存储 ETag 和响应数据
- ⚡ **自动缓存管理**: 根据缓存策略自动设置 TTL
- 🔄 **HTTP 304 支持**: 智能处理 `If-None-Match` 头部，返回 304 Not Modified
- 🎯 **多种缓存策略**: 支持公共/私有、短期/中期/长期缓存
- 🔑 **智能缓存键**: 基于请求 URL、方法、用户 ID 和参数生成唯一缓存键

## 使用方式

### 1. 基本使用

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheStrategy, CacheStrategyEnum } from '../cache.decorator';
import { CacheInterceptor } from './cache.interceptor';

@Controller('api')
@UseInterceptors(CacheInterceptor) // 在控制器级别应用缓存拦截器
export class ApiController {
	@Get('data')
	@CacheStrategy(CacheStrategyEnum.PUBLIC_SHORT) // 应用缓存策略
	async getData() {
		// 你的业务逻辑
		return { message: 'Hello World', timestamp: Date.now() };
	}
}
```

### 2. 可用的缓存策略

```typescript
export enum CacheStrategyEnum {
	// 不缓存
	NO_CACHE = 'no-store, no-cache, must-revalidate, proxy-revalidate',

	// 私有缓存（用户特定数据）
	PRIVATE_SHORT = 'private, max-age=300', // 5分钟
	PRIVATE_MEDIUM = 'private, max-age=3600', // 1小时
	PRIVATE_LONG = 'private, max-age=86400', // 1天

	// 公共缓存（所有用户共享）
	PUBLIC_SHORT = 'public, max-age=300', // 5分钟
	PUBLIC_MEDIUM = 'public, max-age=3600', // 1小时
	PUBLIC_LONG = 'public, max-age=86400' // 1天
}
```

### 3. 在模块中配置

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from './cache/cache.module';

@Module({
	imports: [CacheModule] // 导入缓存模块
	// ...
})
export class YourModule {}
```

## 工作原理

### 缓存流程

1. **请求到达**: 拦截器检查是否有缓存策略
2. **生成缓存键**: 基于请求信息生成唯一的缓存键
3. **检查 Redis**: 查找现有的缓存数据
4. **ETag 比较**: 如果找到缓存，比较客户端的 `If-None-Match` 头部
5. **返回响应**:
   - 如果 ETag 匹配：返回 304 Not Modified
   - 如果有缓存但 ETag 不匹配：返回缓存的数据
   - 如果没有缓存：执行业务逻辑并缓存结果

### 缓存键生成

缓存键基于以下信息生成：

- HTTP 方法 (GET, POST, etc.)
- 请求 URL
- 用户 ID (如果有认证)
- 查询参数
- 请求体

### ETag 生成

ETag 基于响应数据的 MD5 哈希值生成，格式为 `W/"<hash>"`。

## 配置说明

### Redis 配置

确保 Redis 服务正在运行，并在环境变量中配置：

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### TTL 设置

TTL (Time To Live) 会根据缓存策略自动设置：

- 从 `Cache-Control` 头部的 `max-age` 值提取
- 默认为 1 小时 (3600 秒)

## 示例 API 端点

系统提供了示例端点用于测试：

- `GET /cache-example/public-short` - 公共短期缓存 (5分钟)
- `GET /cache-example/private-medium` - 私有中期缓存 (1小时)
- `GET /cache-example/public-long` - 公共长期缓存 (1天)
- `GET /cache-example/no-cache` - 不缓存

## 测试缓存效果

### 使用 curl 测试

```bash
# 第一次请求 - 返回完整数据和 ETag
curl -i http://localhost:3000/cache-example/public-short

# 第二次请求使用 ETag - 返回 304 Not Modified
curl -i -H "If-None-Match: W/\"abc123\"" http://localhost:3000/cache-example/public-short
```

### 在浏览器中测试

1. 打开开发者工具的 Network 面板
2. 访问缓存端点
3. 刷新页面查看 304 响应

## 注意事项

1. **用户认证**: 缓存键会包含用户 ID，确保不同用户的数据隔离
2. **数据一致性**: 当数据更新时，相关的缓存应该被清除
3. **内存使用**: 监控 Redis 内存使用情况，适当设置 TTL
4. **错误处理**: 即使 Redis 出错，系统也会继续正常工作，只是不会缓存

## 扩展功能

可以根据需要扩展以下功能：

- 缓存预热
- 缓存清除 API
- 缓存统计和监控
- 自定义缓存键策略
