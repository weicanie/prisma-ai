#!/bin/bash

# --- 自动重试 git push 脚本 ---

# 设置最大重试次数，以防止无限循环
MAX_RETRIES=20
# 设置每次重试之间的等待时间（秒）
RETRY_DELAY=5

# 初始化尝试计数器
count=0

# 开始一个无限循环，直到 push 成功或达到最大重试次数
while true; do
    # 增加尝试次数计数
    ((count++))

    # 打印当前尝试的信息
    echo "🚀 [尝试 #$count] 正在执行 git push..."

    # 执行 git push 命令
    # 我们将所有输出（标准输出和标准错误）都重定向，以便脚本可以捕获它们
    # 同时在屏幕上显示它们
    git push git@github.com:weicanie/prisma-ai.git
    # pnpm exec lerna publish --conventional-commits 3.0.0


    exit_code=$?

    # 检查退出码
    if [ $exit_code -eq 0 ]; then
        # 如果退出码为 0，表示 push 成功
        echo "✅ Git push 成功！"
        # 退出循环
        break
    else
        # 如果退出码非 0，表示 push 失败
        echo "❌ [尝试 #$count] Git push 失败，退出码: $exit_code"
        
        # 当重试次数为3时，（重新）设置代理
        if [ $count -eq 3 ]; then
            echo "🔄 [尝试 #3] 失败，尝试切换代理..."
            git config --global https.proxy https://ghfast.top
            echo "✅ 代理已切换至 https://ghfast.top"
        fi
        
        # 检查是否已达到最大重试次数
        if [ $count -ge $MAX_RETRIES ]; then
            echo "🚫 已达到最大重试次数 ($MAX_RETRIES)，停止脚本。"
            break
        fi

        # 打印重试提示信息
        echo "⏳ 将在 $RETRY_DELAY 秒后重试..."
        # 等待指定的秒数
        sleep $RETRY_DELAY
    fi
done

echo "脚本执行完毕。"
