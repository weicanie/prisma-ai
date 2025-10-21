#!/bin/bash
# start.sh

echo "设置目录权限..."

# 安全创建目录（已存在时静默成功）
mkdir -p ./projects ./models ./resumes ./user_data ./docker-data/nest-app/logs ./docker-data/nest-app/data_user_use/feedback_ai

# 授权给所有用户（可读/可写/可执行）
chmod 777 ./projects ./models ./resumes ./user_data ./docker-data/nest-app/logs ./docker-data/nest-app/data_user_use/feedback_ai

echo "✅ 设置目录权限"

echo "启动 Docker 服务..."
docker compose -f compose.yaml up --attach prisma-ai-backend --build