#!/bin/bash

# deepwiki-to-md Dockerイメージビルドスクリプト

# デフォルト設定
IMAGE_NAME="suwash/deepwiki-to-md"
VERSION=$(git rev-parse --short HEAD)

echo "Dockerイメージをビルドしています..."
echo "イメージ名: $IMAGE_NAME:$VERSION"

# Dockerイメージのビルド
docker build -t "$IMAGE_NAME:$VERSION" .
if [ $? -ne 0 ]; then
  echo "エラー: Dockerイメージのビルドに失敗しました。"
  exit 1
fi
echo "Dockerイメージのビルドが完了しました: $IMAGE_NAME:$VERSION"

# タグ付け（latestタグが指定されていない場合）
if [ "$VERSION" != "latest" ]; then
  echo "latestタグも付与します..."
  docker tag "$IMAGE_NAME:$VERSION" "$IMAGE_NAME:latest"
fi

echo ""
echo "Docker Hubにプッシュしています..."
docker push $IMAGE_NAME:$VERSION
docker push $IMAGE_NAME:latest
