<p align="center">
<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/logo.png" alt="Logo"/>
</p>

<div align="center">

# Prisma-AI：你的求职 AI co-pilot

开源免费，优化你的项目，定制你的简历，为你匹配工作，并帮助你做好面试准备。

</div>

<p align="center">
  <a href="https://github.com/weicanie/prisma-ai/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-AGPL--3.0-orangered.svg" alt="License">
  </a>
  <a href="https://github.com/weicanie/prisma-ai/issues">
    <img src="https://img.shields.io/github/issues/weicanie/prisma-ai.svg" alt="Issues">
  </a>
  <a href="https://github.com/weicanie/prisma-ai/stargazers">
    <img src="https://img.shields.io/github/stars/weicanie/prisma-ai.svg" alt="Stars">
  </a>
</p>

<p align="center">
  简体中文 | <a href="i18n/README-EN.md">English</a>
</p>

---

## 🎯 为什么是 Prisma‑AI

Prisma‑AI 解决你求职时最头疼的 4 件事：

1.  **项目没亮点**：只会堆技术名词，干货说不明白。
    - 用 AI 深挖你的经历，自动产出“可落地”的亮点规划，并能协作你把亮点做出来。
2.  **简历不对路**：投了一圈，杳无音讯。
    - 内置岗位抓取 + 本地向量模型，精准筛到匹配岗位；每个岗位都自动定制简历。
3.  **八股学不进**：背了忘，忘了背。
    - 题库 + 思维导图 + Anki 联动，边理解边记忆，稳扎稳打不焦虑。
4.  **面经无答案**：看完徒增焦虑。
    - AI 自动补全与结构化，提炼面试题和标准答案，支持版本管理与共建迭代。

---

## ✨ 你能获得什么

| 模块                          | 功能                                                                                   |
| :---------------------------- | :------------------------------------------------------------------------------------- |
| **🤖 AI 核心**                | 基于 `Planer-Executor` + `CRAG` + `Human-in-the-loop` 架构，能把“想法”变成“可执行计划” |
|                               | 深度集成用户项目代码、领域知识库，提供精准上下文                                       |
|                               | 支持多轮用户反馈与反思，持续优化输出质量                                               |
| **📄 简历优化、落地**         | 深度分析项目、自动打磨文案、挖掘可落地亮点                                             |
|                               | AI Agent **实现**项目亮点和功能                                                        |
| **💼 岗位匹配、契合**         | 实时抓取岗位 → 本地向量检索重排 → 一键找到“更适合你”的岗位                             |
|                               | 针对目标岗位自动改写简历，投递更有把握                                                 |
| **📚 高效学习、备战**         | 前后端题库 + 思维导图 + Anki，理解与记忆两手抓                                         |
| **📚 面经数据库（共建共享）** | 面经自动补全、标准答案、思维导图、溯源；一起共建，越用越强                             |
|                               | [www.pinkprisma.com](https://www.pinkprisma.com)                                       |
| **📦 便捷部署**               | 提供 `Docker` 一键部署，零配置启动                                                     |

---

## 🔎 真实用户案例

看看`prisma-ai`给用户带来了什么

| 分类                                 | 文档                                               |
| ------------------------------------ | -------------------------------------------------- |
| 项目经验分析、优化、亮点挖掘         | [项目经验案例](doc/用例：1、项目经验.md)           |
| 集成Anki + 思维导图 + 专业前后端题库 | [面向offer学习案例](doc/用例：3、anki+思维导图.md) |
| 持续更新中...                        |                                                    |

---

## 📚 文档教程

我们为您准备了详细的文档，帮助您迅速掌握 Prisma-AI。

| 分类             | 文档                                                                                  |
| :--------------- | :------------------------------------------------------------------------------------ |
| **🚀快速上手**   | [5分钟完成环境配置](doc/教程：1、环境配置.md)                                         |
|                  | [3分钟构建个人知识库](doc/教程：2、知识库构建.md)                                     |
|                  | [通过deepwiki快速创建项目知识库](doc/教程：10、deepwiki知识库集成.md)                 |
| **💡核心工作流** | [2分钟掌握项目经验分析、优化与亮点挖掘](doc/教程：3、项目经验分析、优化、亮点挖掘.md) |
|                  | [2分钟掌握AI Agent 协同实现项目亮点](doc/教程：4、项目亮点实现.md)                    |
|                  | [5分钟获取最匹配自己的岗位](doc/教程：5、获取匹配自己的岗位.md)                       |
|                  | [3分钟掌握面向目标岗位定制简历](doc/教程：6、面向岗位定制简历.md)                     |
|                  | [5分钟玩转面试题库与Anki集成](doc/教程：7、面试题库和%20anki集成教程.md)              |
|                  | [简历编辑器使用指南](doc/教程：9、简历编辑器.md)                                      |
| **🤔方法论**     | [如何写好一份技术简历](doc/方法论：1、简历应该怎么写.md)                              |
|                  | [为什么以及如何使用Anki进行高效学习](doc/方法论：2、为什么以及如何使用%20anki.md)     |
|                  | [curosr等AI工具的局限性、克服](doc/方法论：3、cursor等AI%20编程工具的局限性及克服.md) |
| **📚面经数据库** | [将hub中的题库导入本地Anki](doc/hub/教程：1、anki配置.md)                             |
|                  | [反馈hub题库中的错误](doc/hub/教程：2、反馈题库中的错误.md)                           |

---

## 🚀 快速启动

### 🐳 Docker (推荐)

1.  **克隆仓库**

    ```bash
    git clone https://github.com/weicanie/prisma-ai.git && cd prisma-ai
    ```

2.  **配置环境**

    - [5分钟完成环境配置](doc/教程：1、环境配置.md)

3.  **启动服务**

    ```bash
    # 在prisma-ai目录执行
    ./scripts/start.sh

    ```

4.  浏览器访问 `http://localhost` 即可使用!

### 👨‍💻 本地开发

1.  **克隆并安装依赖**
    ```bash
    git clone https://github.com/weicanie/prisma-ai.git && cd prisma-ai && pnpm install
    ```
2.  **配置环境**
    [5分钟完成环境配置](doc/教程：1、环境配置.md)
3.  确保通过本地或容器方式提供

- mysql（latest容器）
- redis（latest容器）
- mongodb（latest容器）
- minio（2025.4.3 bitnamilegacy/minio容器）

并按照后端环境变量文件中设置的端口号、mysql数据库名称进行配置。

4.  **启动项目**
    ```bash
    # 在仓库根目录执行
    pnpm run dev
    ```

---

版本更新：

```bash
# 在仓库根目录执行
./scripts/update.sh
```

## 🆕 最新动态

### v4.1.7：新增简历pdf编辑与导出功能

<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/v4.1.7.png" alt="简历编辑器"/>

### v4.2.1：支持集成deepwiki作为项目知识库

> DeepWiki 是一款AI工具，为GitHub上的代码库自动生成交互式、可对话的文档。
> prisma-ai 的 deepwiki: https://deepwiki.com/weicanie/prisma-ai

<img width="2355" height="1546" alt="image" src="https://github.com/user-attachments/assets/7bc8aed7-459e-4523-96e5-85e87f68d24a" />

### v5.0.0：ai助手 Prisma

通过用户记忆来使ai能根据用户情况进行简历优化、人岗匹配。
提供ai助手 Prisma，通过用户记忆、项目业务研究、更好的知识库检索，ai助手懂你和你的项目。
通过用户记忆，用户现在可以在prisma-ai hub匹配适合自己的面经和面试题，来进行针对性学习。
优化了知识库检索。

<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/Prisma.png" alt="Prisma"/>

---

## 🛠️ 技术栈

| 类别         | 技术                                                |
| :----------- | :-------------------------------------------------- |
| **项目前端** | `React ` `Vite` `React-Query` `Redux` `TailwindCSS` |
| **项目后端** | `Nest.js ` `MySQL` `MongoDB` `Redis`                |
| **AI 核心**  | `LangChain` `LangGraph` `fastmcp` `CopilotKit`      |
| **DevOps**   | `Docker` `Nginx` `Github Action`                    |

---

## 🤝 欢迎贡献

欢迎任何形式的贡献！

- ⭐ 给项目一个 **Star**！
- 🤔 在 **Issues** 中提出问题或建议。
- 💡 提交 **Pull Request** 改进代码或文档。

---

## 📜 版权声明与许可证

### 主项目许可证

本项目（Prisma-AI）的主要代码遵循AGPL-3.0协议，版权归 weicanie 所有。详细信息请参阅根目录下的 [LICENSE](LICENSE) 文件。

### 第三方组件许可证

本项目包含以下第三方开源组件，它们各自遵循不同的许可证：

| 组件                    | 路径                     | 原项目                                                          | 许可证                        |
| ----------------------- | ------------------------ | --------------------------------------------------------------- | ----------------------------- |
| Magic Resume 简历编辑器 | `packages/magic-resume/` | [JOYCEQL/magic-resume](https://github.com/JOYCEQL/magic-resume) | Apache License 2.0 + 商业条款 |

**重要提示**：

- 每个第三方组件都保留了其原始的 LICENSE 文件和版权声明
- 使用这些组件时，请遵循其各自的许可证条款
- 如需商业使用涉及第三方组件的功能，请查阅对应组件的许可证要求

### 版权归属

- **Prisma-AI 核心功能**：Copyright © 2025 - Present. weicanie <weicanie@outlook.com>
- **Magic Resume 组件**：基于 Apache License 2.0，原作者为 JOYCEQL

---

## ⚖️ 声明

1.  运行本项目产出的所有数据都应只作为参考和学习使用。
2.  AI亦会犯错，请仔细甄别其生成结果的准确性。
3.  [项目](https://github.com/weicanie/prisma-ai)提供的爬虫工具和相关功能仅限爬取完全公开且未设访问限制的数据，使用者需自行承担因使用不当而产生的任何法律风险，开发者概不负责。且禁止用于：

- (1) 违反目标网站Robots协议或用户条款；
- (2) 商业竞争、数据转售等牟利行为；
- (3) 高频访问干扰网站正常运行。
- (4) 任何违反中华人民共和国相关法律法规的行为，包括但不限于违反《中华人民共和国刑法》、《民法总则》、《反不正当竞争法》、《网络安全法》的任何行为。
