#!/bin/bash

# Docker镜像构建和推送脚本
# 用法: ./scripts/docker-publish.sh [版本号]
# 例如: ./scripts/docker-publish.sh v1.0.0

set -e

# 配置变量
DOCKER_USERNAME="weicanie"
IMAGE_NAME="prisma-ai-backend"
VERSION=${1:-"latest"}

echo "🔧 开始构建和推送 Docker 镜像..."
echo "用户名: $DOCKER_USERNAME"
echo "镜像名: $IMAGE_NAME"
echo "版本: $VERSION"

# 检查是否已登录 Docker Hub
echo "📝 检查 Docker Hub 登录状态..."
if ! docker info | grep -q "Username: $DOCKER_USERNAME"; then
    echo "⚠️  请先登录 Docker Hub:"
    echo "   docker login"
    exit 1
fi

# 构建镜像
echo "🏗️  构建 Docker 镜像..."
docker build -f packages/backend/Dockerfile -t $DOCKER_USERNAME/$IMAGE_NAME:$VERSION .

# 如果不是 latest 版本，也打上 latest 标签
if [ "$VERSION" != "latest" ]; then
    echo "🏷️  为镜像添加 latest 标签..."
    docker tag $DOCKER_USERNAME/$IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest
fi

# 推送镜像到 Docker Hub
echo "📤 推送镜像到 Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION

if [ "$VERSION" != "latest" ]; then
    docker push $DOCKER_USERNAME/$IMAGE_NAME:latest
fi

echo "✅ 镜像推送完成！"
echo "📋 使用以下命令拉取镜像:"
echo "   docker pull $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
if [ "$VERSION" != "latest" ]; then
    echo "   docker pull $DOCKER_USERNAME/$IMAGE_NAME:latest"
fi

echo ""
echo "🔄 要在生产环境使用，请确保 compose.yaml 中的镜像配置为:"
echo "   image: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION" 