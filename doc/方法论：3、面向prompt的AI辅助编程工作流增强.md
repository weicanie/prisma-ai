# 面向prompt的AI辅助编程工作流增强

本项目内置的项目亮点实现Agent，实现了面向prompt的AI辅助编程工作流增强。

术语：

- prompt：用户输入的文本，用于指导AI生成特定的输出
- AI IDE：集成了AI辅助编程功能的开发环境

## 使用AI IDE的典型工作流

- 输入prompt

- 生成代码
- review结果
- 循环`prompt-生成-review`这个过程，直到任务完成

## 面向prompt的工作流增强

- **prompt**
  - 建立项目代码知识库、领域知识库
  
    - AI 不会 tailwind v4？没问题添加官方迁移文档到知识库，然后在需求里加句话“使用tailwind v4”
    - AI 生成的一坨你不禁怀疑其降了智？没问题检索项目代码知识库进行缜密的需求分析和计划
  
  - 输入要实现的亮点/功能
  
  - Agent生成实现当前步骤的prompt
    - 检索相关代码和知识，进行需求分析
    - 检索相关代码和知识，进行整体计划
    - 检索相关代码和知识，进行具体步骤的需求分析与计划
    - 生成最终的方案和高质量的prompt
  
- **生成**
- **review**
- **prompt**

  - 把生成结果反馈给agent

    - 根据反馈调整计划

  - Agent生成实现下一步骤的prompt

- **生成**
- **review**
- ...

### 价值

1、分析工作流，可以得知AI辅助编程的三大门槛

- prompt质量
- review能力：判断AI生成的代码的正确性和质量
- 根据AI生成结果迭代prompt的能力

<br>

2、克服这些门槛的抓手

- prompt质量：`提示词工程`
- review能力：没有捷径
- 根据AI生成结果迭代prompt的能力：以review能力为前提，最终靠的是完整的工程能力

<br>

3、本工具提供的价值

本工具主要针对prompt质量和迭代prompt。

可以规范流程、提供参考、提高效率。

> 值得一提的是，这种思想在`kiro`（AI IDE之一）大量体现。

<br>



### 项目 Agent 架构

- Planer_Executor架构 + CRAG + Human-in-the-loop
  - Planer_Executor架构
    - 多轮思考、持续迭代
  - CRAG
    - 对RAG进行增强的CRAG，更精准、更丰富的知识获取
  - Human-in-the-loop
    - 将关键输出拿给你review
    - 可以反馈重做
    - 可以手动修改
