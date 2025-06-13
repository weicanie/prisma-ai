#!/bin/bash
# 这是一个用于设置 Python 虚拟环境并安装依赖的脚本。

# --- 配置 ---
# VENV_DIR: 虚拟环境的文件夹名称
VENV_DIR=".venv"

# --- 脚本开始 ---
echo "开始设置 Python 环境..."

# 检查 requirements.txt 文件是否存在
if [ ! -f "requirements.txt" ]; then
    echo "错误: requirements.txt 未找到！请确保该文件与脚本在同一目录下。"
    exit 1
fi

# 检查是否已存在虚拟环境
if [ -d "$VENV_DIR" ]; then
    echo "检测到已存在的虚拟环境 '$VENV_DIR'。"
else
    echo "正在创建 Python 虚拟环境..."
    python -m venv $VENV_DIR
    if [ $? -ne 0 ]; then
        echo "错误: 创建虚拟环境失败。请确保您已正确安装 Python。"
        exit 1
    fi
    echo "虚拟环境 '$VENV_DIR' 创建成功。"
fi

# 激活虚拟环境并安装/更新依赖
echo "正在激活虚拟环境并安装依赖..."

# 根据操作系统选择不同的激活方式
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    source $VENV_DIR/bin/activate
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source $VENV_DIR/Scripts/activate
else
    echo "错误: 不支持的操作系统 '$OSTYPE'。请手动激活虚拟环境并运行 'pip install -r requirements.txt'。"
    exit 1
fi

# 使用 pip 安装依赖
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败。请检查 'requirements.txt' 文件内容和网络连接。"
    exit 1
fi

echo "Python 环境设置完毕！依赖已成功安装。"
echo "您可以随时通过运行 'source $VENV_DIR/bin/activate' (Linux/macOS) 或 'source $VENV_DIR/Scripts/activate' (Windows) 来激活此环境。"
