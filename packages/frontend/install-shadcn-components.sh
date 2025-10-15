#!/bin/bash

# shadcn/ui 组件批量安装脚本
# 使用方法: bash install-shadcn-components.sh

echo "开始批量安装 shadcn/ui 组件..."

# 基础组件
components=(
  "button"
  "input" 
  "label"
  "textarea"
  "select"
  "checkbox"
  "radio-group"
  "switch"
  "slider"
  "progress"
  "badge"
  "avatar"
  "separator"
  "skeleton"
  "spinner"
  
  # 布局组件
  "card"
  "sheet"
  "dialog"
  "alert-dialog"
  "drawer"
  "resizable"
  
  # 导航组件
  "tabs"
  "accordion"
  "breadcrumb"
  "navigation-menu"
  "pagination"
  "menubar"
  "context-menu"
  "dropdown-menu"
  
  # 反馈组件
  "alert"
  "toast"
  "tooltip"
  "popover"
  "hover-card"
  
  # 表单组件
  "form"
  "calendar"
  "date-picker"
  "command"
  "combobox"
  
  # 数据展示
  "table"
  "data-table"
  "chart"
  "carousel"
  "collapsible"
  
  # 其他
  "aspect-ratio"
  "scroll-area"
  "toggle"
  "toggle-group"
  "sonner"
)

# 逐个安装组件
for component in "${components[@]}"; do
  echo "正在安装: $component"
  pnpm dlx shadcn@latest add "$component" --yes
  
  # 检查安装结果
  if [ $? -eq 0 ]; then
    echo "✅ $component 安装成功"
  else
    echo "❌ $component 安装失败"
  fi
  
  # 短暂延迟避免并发问题
  sleep 1
done

echo "🎉 shadcn/ui 组件批量安装完成！"