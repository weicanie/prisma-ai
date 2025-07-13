#!/bin/bash
# 使用 -e 选项，确保脚本在任何命令失败时立即退出
set -e

echo "🚀 Starting backend service..."

# 运行数据库迁移
# 应用prisma/migrations中的迁移
echo "👟 Running database migrations..."
pnpm --filter backend exec prisma migrate deploy

# 启动生产环境的应用
# 使用 pnpm --filter backend start:prod 来运行在 package.json 中定义的 "start:prod" 脚本
echo "✅ Starting application in production mode..."
pnpm --filter backend start:prod
