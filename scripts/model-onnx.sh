#!/bin/bash
# 这是一个用于将本地的 Hugging Face 模型转换为 ONNX 格式的脚本。
# 此脚本设计在 Docker 容器内运行，该容器已预装所有必要的 Python 依赖。

# --- 配置 ---
# MODEL_BASE_PATH: 容器内的模型基础路径
# **重要**: 此路径通过 Docker volume 映射到宿主机的 './models' 目录
MODEL_BASE_PATH="/models"
MODEL_NAME="moka-ai/m3e-base"

# --- 脚本开始 ---
echo "开始 ONNX 模型转换..."

# 检查 optimum-cli 是否可用
if ! command -v optimum-cli &> /dev/null; then
    echo "错误: 'optimum-cli' 命令未找到。"
    echo "请确认 Docker 镜像已正确构建，并且 Python 依赖已安装。"
    exit 1
fi

# 定义模型输入和输出路径
INPUT_MODEL_PATH="$MODEL_BASE_PATH/$MODEL_NAME"
OUTPUT_ONNX_PATH="$INPUT_MODEL_PATH/onnx"

echo "模型输入路径 (容器内): $INPUT_MODEL_PATH"
echo "模型输出路径 (容器内): $OUTPUT_ONNX_PATH"

# 检查输入模型路径是否存在
# if [ ! -d "$INPUT_MODEL_PATH" ]; then
#     echo "错误: 输入模型路径 '$INPUT_MODEL_PATH' 不存在。"
#     echo "请确认您已将 'm3e-base' 模型文件放置在项目根目录下的 'models/moka-ai/' 目录中。"
#     exit 1
# fi

# 创建输出目录（如果不存在）
mkdir -p $OUTPUT_ONNX_PATH

# 执行 ONNX 转换命令
echo "正在执行 optimum-cli 转换..."
optimum-cli export onnx \
    --model $INPUT_MODEL_PATH \
    --task feature-extraction \
    $OUTPUT_ONNX_PATH

if [ $? -ne 0 ]; then
    echo "错误: ONNX 模型转换失败。"
    exit 1
fi

echo "ONNX 模型转换成功！"
echo "转换后的模型文件位于您的项目 'models' 文件夹下。"
