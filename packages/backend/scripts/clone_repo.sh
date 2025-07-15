#!/bin/bash

# 脚本功能：克隆一个 Git 仓库到指定目录
# 用法: ./clone_repo.sh <仓库URL> <目标路径>

# 从命令行参数获取仓库 URL 和目标路径
REPO_URL=$1
DEST_PATH=$2

# 检查参数是否存在
if [ -z "$REPO_URL" ] || [ -z "$DEST_PATH" ]; then
  echo "错误: 请提供仓库 URL 和目标路径。"
  echo "用法: $0 <仓库URL> <目标路径>"
  exit 1
fi

# 打印将要执行的操作
echo "正在从 $REPO_URL 克隆仓库到 $DEST_PATH..."

# 执行 git clone 命令
# --depth 1 只克隆最新的提交，可以加快速度，对于很多场景来说足够了
git clone --depth 1 "$REPO_URL" "$DEST_PATH"

# 检查 git clone 命令是否成功
if [ $? -eq 0 ]; then
  echo "仓库克隆成功。"
else
  echo "错误: 仓库克隆失败。"
  exit 1
fi 