#!/bin/bash
# 这是一个自动化的模型设置脚本。
# 它会构建一个临时的 Docker 镜像，并在容器中运行模型转换脚本，
# 从而避免在用户本地安装 Python 环境。

# --- 配置 ---
IMAGE_NAME="prisma-ai-model-setup"
# 动态获取脚本所在的目录
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# 项目根目录被假定为脚本所在目录的上一级
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
DOCKERFILE_PATH="$SCRIPT_DIR/Dockerfile.model-setup"
MODELS_PATH="$PROJECT_ROOT/models"

# --- 脚本开始 ---
echo "开始自动化本地模型配置..."
echo "项目根目录: $PROJECT_ROOT"
echo "模型目录: $MODELS_PATH"

# 检查 Docker 是否已安装并运行
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装或未启动。"
    echo "请访问 https://www.docker.com/get-started 安装 Docker Desktop 后再运行此脚本。"
    exit 1
fi
if ! docker info >/dev/null 2>&1; then
    echo "错误: Docker Daemon 未运行。"
    echo "请先启动 Docker Desktop。"
    exit 1
fi

# --- 步骤 1: 构建 Docker 镜像 ---
echo "步骤 1/2: 正在构建模型设置环境 (Docker 镜像)..."
# -f: 指定 Dockerfile 路径
# -t: 为镜像打上标签（命名）
# context: 使用项目根目录作为构建上下文
docker build -f $DOCKERFILE_PATH -t $IMAGE_NAME $PROJECT_ROOT

if [ $? -ne 0 ]; then
    echo "错误: Docker 镜像构建失败。"
    exit 1
fi
echo "环境构建成功！"

# --- 步骤 2: 运行转换脚本 ---
echo "步骤 2/2: 正在运行模型转换脚本..."
# --rm: 容器运行结束后自动删除，保持系统整洁
# -v: 挂载 volume，将宿主机的目录映射到容器内
#    - "$MODELS_PATH:/models": 将项目根目录下的 models 文件夹映射到容器的 /models 目录
# 容器启动后会自动执行 Dockerfile 中定义的 CMD
docker run --rm \
    -v "$MODELS_PATH:/models" \
    $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "错误: 模型转换脚本在容器中运行失败。"
    exit 1
fi

echo "模型设置全部完成！" 