<p align="center">
<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/logo-v3.png" alt="Logo"/>
</p>

<div align="center">

# PrismaAI：你的求职AI co-pilot

开源免费，从简历到 offer，优化你的项目，定制你的简历，为你匹配工作，并帮助你做好面试准备。

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

<p align="center">
  <a href="https://www.douyin.com/video/7566259892604980530" target="_blank">
    <img src="https://raw.githubusercontent.com/weicanie/prisma-ai/main/images/readme/video-cover.png" alt="魔历, 简历变 offer的魔法" width="600"/>
  </a>
  <br/>
  <strong>点击图片观看项目介绍视频</strong>
</p>

---

## 🎯 为什么是PrismaAI

PrismaAI解决你求职时最头疼的 4 件事：

1.  **项目没亮点**：只会堆技术名词，干货说不明白。
    - 用 AI 深挖你的经历，自动产出“可落地”的亮点规划，并能协助你把亮点做出来。
2.  **简历不对路**：投了一圈，杳无音讯。
    - 内置岗位抓取 + 本地向量模型，精准筛到匹配岗位；内置针对岗位定制简历功能。
3.  **八股学不进**：背了忘，忘了背。
    - 题库 + 思维导图 + Anki 联动，边理解边记忆，稳扎稳打不焦虑。
4.  **面经无答案**：看完徒增焦虑。
    - AI 自动补全与结构化，提炼面试题和标准答案，支持版本管理与共建迭代。

---

## ✨ 你能获得什么

| 模块                  | 功能                                                                                   |
| :-------------------- | :------------------------------------------------------------------------------------- |
| **🤖 AI 核心**        | 基于 `Planer-Executor` + `CRAG` + `Human-in-the-loop` 架构，能把“想法”变成“可执行计划” |
|                       | 深度集成用户项目代码、领域知识库，提供精准上下文                                       |
|                       | 支持多轮用户反馈与反思，持续优化输出质量                                               |
| **📄 简历优化、落地** | 深度分析项目、自动打磨文案、挖掘可落地亮点                                             |
|                       | AI Agent **实现**项目亮点和功能                                                        |
| **💼 岗位匹配、契合** | 实时抓取岗位 → 本地向量检索重排 → 一键找到“更适合你”的岗位                             |
|                       | 内置针对岗位定制简历功能，投递更有把握                                                 |
| **📚 高效学习、备战** | 前后端题库 + 思维导图 + Anki，理解与记忆两手抓                                         |
| **📚 万篇最新面经**   | 面经数据库，面经自动补全、标准答案、思维导图、文档溯源，共建共享                       |
|                       | [www.pinkprisma.com](https://www.pinkprisma.com)                                       |
| **📦 便捷部署**       | 提供 `Docker` 一键部署，零配置启动                                                     |

---

## 📚 文档教程

我们为您准备了详细的文档，帮助您迅速掌握PrismaAI。

| 分类                    | 文档                                                                                   |
| :---------------------- | :------------------------------------------------------------------------------------- |
| **🚀快速上手**          | [5分钟完成环境配置](doc/教程：1、环境配置.md)                                          |
|                         | [3分钟构建个人知识库](doc/教程：2、知识库构建.md)                                      |
|                         | [通过deepwiki快速创建项目知识库](doc/教程：10、deepwiki知识库集成.md)                  |
| **💡核心工作流**        | [2分钟掌握项目经验分析、优化与亮点挖掘](doc/教程：3、项目经验分析、优化、亮点挖掘.md)  |
|                         | [2分钟掌握AI Agent 协同实现项目亮点](doc/教程：4、项目亮点实现.md)                     |
|                         | [5分钟获取最匹配自己的岗位](doc/教程：5、获取匹配自己的岗位.md)                        |
|                         | [3分钟掌握面向目标岗位定制简历](doc/教程：6、面向岗位定制简历.md)                      |
|                         | [5分钟玩转面试题库与Anki集成](doc/教程：7、面试题库和%20anki集成教程.md)               |
|                         | [简历编辑器使用指南](doc/教程：9、简历编辑器.md)                                       |
| **🤔方法论**            | [如何写好一份技术简历](doc/方法论：1、简历应该怎么写.md)                               |
|                         | [为什么以及如何使用Anki进行高效学习](doc/方法论：2、为什么以及如何使用%20anki.md)      |
|                         | [面向prompt的AI辅助编程工作流增强](doc/方法论：3、面向prompt的AI辅助编程工作流增强.md) |
| **📚面室-万篇真实面经** | [介绍](doc/hub/介绍.md)                                                                |
|                         | [将面室中的题库导入本地Anki](doc/hub/教程：1、anki配置.md)                             |
|                         | [反馈面室题库中的错误](doc/hub/教程：2、反馈题库中的错误.md)                           |

---

## 🚀 快速启动

### 🌐 在线使用

您可以在 [www.ai.pinkprisma.com](https://www.pinkprisma.com) 上在线免费使用PrismaAI。

> 岗位爬取与匹配、题库导入与anki集成，目前只能在本地部署使用，其它所有功能都可以在线使用。

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
- chrome浏览器

4.  **启动项目**

    ```bash
    # 在仓库根目录执行
    pnpm run dev
    ```

## 🆕 最新动态

### v4.1.7：新增简历pdf编辑与导出功能

<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/v4.1.7.png" alt="简历编辑器"/>

### v4.2.1：支持集成deepwiki作为项目知识库

> DeepWiki 是一款AI工具，为GitHub上的代码库自动生成交互式、可对话的文档。
> prisma-ai 的 deepwiki: https://deepwiki.com/weicanie/prisma-ai

### v5.0.0：用户记忆

通过维护用户记忆，来使ai能更好地根据用户情况进行简历优化、人岗匹配。
用户现在可以匹配适合自己的面经和面试题，来进行针对性学习。

### v5.3.3：项目亮点实现agent 的GUI

> 项目亮点实现agent基于`plan-executer`架构，深度集成用户项目代码和文档知识库，支持人工审核、反思，多轮迭代，致力于帮助用户将项目亮点落地到实际项目中。

<img width="2077" height="1549" alt="image" src="https://github.com/user-attachments/assets/62aab69e-865c-4faa-a1ee-e9879848b021" />

<img width="1791" height="1417" alt="image" src="https://github.com/user-attachments/assets/5eb9866f-097b-4591-b57a-3a40e3c34446" />

---

## 🛠️ 技术栈

| 类别         | 技术                                                                     |
| :----------- | :----------------------------------------------------------------------- |
| **项目前端** | `React、Vue ` `qiankun` `Vite` `React-Query、Redux、Pinia` `TailwindCSS` |
| **项目后端** | `Nest.js、Next.js、FastAPI ` `Prisma` `MySQL` `MongoDB` `Redis` `Minio`  |
| **AI 核心**  | `LangChain` `LangGraph` `fastmcp`                                        |
| **DevOps**   | `Docker` `Nginx` `Github Action`                                         |

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

| 组件                    | 路径                     | 原项目                                                          | 许可证       |
| ----------------------- | ------------------------ | --------------------------------------------------------------- | ------------ |
| Magic Resume 简历编辑器 | `packages/magic-resume/` | [JOYCEQL/magic-resume](https://github.com/JOYCEQL/magic-resume) | 自定义许可证 |

**重要提示**：

- 每个第三方组件都保留了其原始的 LICENSE 文件和版权声明
- 使用这些组件时，请遵循其各自的许可证条款
- 如需商业使用涉及第三方组件的功能，请查阅对应组件的许可证要求

---

## ⚖️ 声明

1.  AI亦会犯错，请仔细甄别其生成结果的准确性。
2.  [项目](https://github.com/weicanie/prisma-ai)提供的爬虫工具和相关功能仅限爬取完全公开且未设访问限制的数据，使用者需自行承担因使用不当而产生的任何法律风险，开发者概不负责。且禁止用于：

- (1) 违反目标网站Robots协议或用户条款；
- (2) 商业竞争、数据转售等牟利行为；
- (3) 高频访问干扰网站正常运行；
- (4) 任何违反中华人民共和国相关法律法规的行为。
