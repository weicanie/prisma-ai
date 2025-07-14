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
MODEL_REPO="https://hf-mirror.com/moka-ai/m3e-base"
TARGET_MODEL_DIR="$MODELS_PATH/moka-ai/m3e-base"

# --- 脚本开始 ---
echo "开始自动化本地模型配置..."
echo "项目根目录: $PROJECT_ROOT"
echo "模型目录: $MODELS_PATH"

# Docker Desktop on Windows with Git Bash/MSYS2 needs a special path format for volumes.
# We need to convert a path like /c/Users/user to //c/Users/user.
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    MODELS_PATH="/$MODELS_PATH"
fi

# --- 步骤 1: 检查并下载模型 ---
echo "步骤 1/3: 检查本地模型文件..."

# 检查 git-lfs 是否安装
if ! git lfs --version &> /dev/null; then
    echo "错误: Git LFS (Large File Storage) 未安装。"
    echo "此项目依赖 Git LFS 来下载大模型文件。"
    echo "请访问 https://git-lfs.com/ 并根据指引安装后再运行此脚本。"
    exit 1
fi

# 确保 Git LFS 已为当前用户初始化
# 这是一个幂等操作，可以安全地多次运行
git lfs install

if [ -d "$TARGET_MODEL_DIR" ]; then
    echo "模型目录 '$TARGET_MODEL_DIR' 已存在，跳过下载。"
else
    echo "本地模型未找到，正在从 Hugging Face 镜像克隆..."
    # 使用 git clone 下载模型
    git clone $MODEL_REPO $TARGET_MODEL_DIR
    if [ $? -ne 0 ]; then
        echo "错误: 模型下载失败。请检查网络连接和 Git 是否已安装。"
        exit 1
    fi
    echo "模型下载成功！"
fi

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

# --- 步骤 2: 构建 Docker 镜像 ---
echo "步骤 2/3: 正在构建模型设置环境 (Docker 镜像)..."
# -f: 指定 Dockerfile 路径
# -t: 为镜像打上标签（命名）
# context: 只使用 scripts 目录作为构建上下文，避免打包不必要的文件
docker build -f $DOCKERFILE_PATH -t $IMAGE_NAME $SCRIPT_DIR

if [ $? -ne 0 ]; then
    echo "错误: Docker 镜像构建失败。"
    exit 1
fi
echo "环境构建成功！"

# --- 步骤 3: 运行转换脚本 ---
echo "步骤 3/3: 正在运行模型转换脚本..."
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