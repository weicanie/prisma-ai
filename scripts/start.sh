#!/bin/bash
# start.sh

echo "设置目录权限..."
chmod 777 ./projects ./models

mkdir -p ./docker-data/nest-app/logs
chmod 777 ./docker-data/nest-app/logs

echo "✅ 设置目录权限"

echo "启动 Docker 服务..."
docker compose -f compose.yaml up --attach prisma-ai-backend --build