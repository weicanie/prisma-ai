#!/bin/bash
# 这是一个用于将本地的 Hugging Face 模型转换为 ONNX 格式的脚本。

# --- 配置 ---
# VENV_DIR: 虚拟环境的文件夹名称
VENV_DIR=".venv"
# MODEL_PATH: 相对于项目根目录的本地模型路径
# **重要**: 请确保此路径指向您下载的原始模型文件夹
MODEL_BASE_PATH="../models"
MODEL_NAME="moka-ai/m3e-base"

# --- 脚本开始 ---
echo "开始 ONNX 模型转换..."

# 检查虚拟环境是否存在
if [ ! -d "$VENV_DIR" ]; then
    echo "错误: Python 虚拟环境 '$VENV_DIR' 未找到。"
    echo "请先在本目录下运行 'bash python-setup.sh' 来创建环境并安装依赖。"
    exit 1
fi

# 激活虚拟环境
echo "正在激活虚拟环境..."
# 根据操作系统选择不同的激活方式
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    source $VENV_DIR/bin/activate
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source $VENV_DIR/Scripts/activate
else
    echo "错误: 不支持的操作系统 '$OSTYPE'。请手动激活虚拟环境。"
    exit 1
fi

# 检查 optimum-cli 是否可用
if ! command -v optimum-cli &> /dev/null; then
    echo "错误: 'optimum-cli' 命令未找到。请确认依赖已正确安装。"
    exit 1
fi

# 定义模型输入和输出路径
INPUT_MODEL_PATH="$MODEL_BASE_PATH/$MODEL_NAME"
OUTPUT_ONNX_PATH="$INPUT_MODEL_PATH/onnx"

echo "模型输入路径: $INPUT_MODEL_PATH"
echo "模型输出路径: $OUTPUT_ONNX_PATH"

# 检查输入模型路径是否存在
if [ ! -d "$INPUT_MODEL_PATH" ]; then
    echo "错误: 输入模型路径 '$INPUT_MODEL_PATH' 不存在。"
    echo "请确认您已将 'm3e-base' 模型文件放置在 '$MODEL_BASE_PATH/moka-ai/' 目录下。"
    exit 1
fi

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
echo "转换后的模型文件位于: $OUTPUT_ONNX_PATH"
