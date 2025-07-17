#!/bin/bash
# 该脚本用于拉取当前项目的最新 release, 并运行 start.sh 脚本来启动项目。

echo "ℹ️  正在从远程仓库获取最新的 tags..."
# --force 选项可以确保本地的 tags 与远程保持同步
git fetch --tags --force

# 找到最新的 git tag.
# `git rev-list --tags --max-count=1` 会找到最新的 tag 的 commit hash
# `git describe --tags <commit-hash>` 会返回 tag 的名字
latest_tag=$(git describe --tags $(git rev-list --tags --max-count=1) 2>/dev/null)

if [ -z "$latest_tag" ]; then
  echo "⚠️  警告: 没有找到任何 git tag。将尝试从 'main' 分支拉取最新代码。"
  git pull origin main
else
  echo "✅  找到最新 release: $latest_tag"
  echo "ℹ️  正在检出 (checkout) 该 release..."
  # 检出 tag 会使 HEAD 'detached', 这是正常的，代表您正工作在一个特定的、不变的版本上。
  git checkout "$latest_tag"

  COMPOSE_FILE="compose.yaml"
  if [ -f "$COMPOSE_FILE" ]; then
    # 从 tag 中移除 'v' 前缀，获取纯版本号
    # 例如: v3.2.0 -> 3.2.0
    version_number=$(echo "$latest_tag" | sed 's/^v//')
    
    echo "ℹ️  正在更新 $COMPOSE_FILE 文件中的镜像版本为 $version_number..."
    # 使用 sed 命令来查找所有 'onlyie/' 开头的镜像，并将它们的 tag 更新为版本号（不带 v 前缀）
    # -i.bak 会创建一个备份文件 compose.yaml.bak
    sed -i.bak "s|\(image:.*docker\.1ms\.run/onlyie/[^:]*\):.*|\1:$version_number|g" "$COMPOSE_FILE"
    echo "✅  $COMPOSE_FILE 文件更新完毕。镜像版本已更新为: $version_number"
  else
    echo "⚠️  警告: $COMPOSE_FILE 未找到，跳过镜像版本更新。"
  fi
fi

START_SCRIPT="scripts/start.sh"

# 检查 start.sh 脚本是否存在
if [ -f "$START_SCRIPT" ]; then
  echo "▶️  正在运行启动脚本: $START_SCRIPT..."
  # 赋予脚本执行权限
  chmod +x "$START_SCRIPT"
  # 执行脚本
  "./$START_SCRIPT"
else
  echo "❌  错误: 启动脚本 '$START_SCRIPT' 未找到!"
  exit 1
fi

echo "🎉  更新和启动流程完毕。请继续使用"
