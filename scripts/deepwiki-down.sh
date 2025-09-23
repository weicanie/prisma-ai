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

echo "🔧 更新 Docker Compose 配置..."

# 创建新的command行
NEW_COMMAND="    command: wiki $WIKI_URL -o /output"

# 使用sed替换yaml文件中的command行
# 在Windows Git Bash中，需要使用双引号和适当的转义
sed -i "s|^[[:space:]]*command:.*|$NEW_COMMAND|" ./scripts/compose-deepwiki-down.yaml

echo "✅ 配置已更新，目标URL: $WIKI_URL"
echo "启动 Docker 服务..."

# 使用更新后的compose文件启动服务
docker compose -f ./scripts/compose-deepwiki-down.yaml up --build