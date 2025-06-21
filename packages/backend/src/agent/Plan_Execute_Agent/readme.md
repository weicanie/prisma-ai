# Plan-and-Execute 架构

## 本实现

`Planner`模块采用
- plan出所有步骤
- 每完成一个步骤,replan
- prompt旨在完成简单的线性任务

`Executor`
- ReAct Agent进行执行
- 每次执行一步,然后replan

## 增强
- 计划复用机制
  - 任务匹配以存在的计划(RAG、llm判断)