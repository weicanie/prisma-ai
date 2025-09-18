#!/bin/bash

# 获取命令行参数，默认值为原始URL
WIKI_URL=${1:-"https://deepwiki.com/weicanie/prisma-ai"}

echo "验证目录"

# 安全创建目录（已存在时静默成功）
mkdir -p ./project_wikis

# 授权给所有用户（可读/可写/可执行）
chmod 777 ./project_wikis

echo "✅ 验证目录"
echo "📥 目标URL: $WIKI_URL"

echo "启动 Docker 服务..."

# 使用 docker compose run 覆盖 command，--rm 表示运行完成后自动删除容器
docker compose -f ./scripts/compose-deepwiki-get.yaml run --rm deepwiki-get wiki "$WIKI_URL" -o /output