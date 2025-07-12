![logo](images/readme/logo.png)

<div align="center">

# Prisma-AI: 你的求职co-pilot

开源免费的求职co-pilot，自动化简历准备至offer到手的整个流程。优化您的项目、定制您的简历、为您匹配工作，并帮助您做好面试准备。

</div>

<p align="center">
  <a href="https://github.com/weicanie/prisma-ai/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License">
  </a>
  <a href="https://github.com/weicanie/prisma-ai/issues">
    <img src="https://img.shields.io/github/issues/weicanie/prisma-ai.svg" alt="Issues">
  </a>
  <a href="https://github.com/weicanie/prisma-ai/stargazers">
    <img src="https://img.shields.io/github/stars/weicanie/prisma-ai.svg" alt="Stars">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/QQ%20Group-930291816-green.svg" alt="QQ Group">
  </a>
</p>

<p align="center">
  <a href="README.md">简体中文</a> | <a href="i18n/README-EN.md">English</a>
</p>

---

## 🎯 核心价值

Prisma-AI 旨在解决求职者在准备简历和寻找工作时最头疼的**3个问题**：

1.  **项目经验平平无奇**：只会罗列技术和基础业务，缺乏深度和亮点。
    - **解决方案**：AI Agent不仅能深度分析、优化您的项目描述，挖掘潜在亮点，更能**直接为您规划并实现这些亮点**，让您的项目经验脱胎换骨。
2.  **简历与岗位不匹配**：海投简历如同石沉大海，面试机会寥寥无几。
    - **解决方案**：通过内置爬虫和本地AI模型，精准匹配最适合您的岗位，并**为每个岗位量身定制您的简历**，大幅提升面试成功率。
3.  **八股背了忘忘了背**：低效重复一遍又一遍，背了忘忘了背
    - **解决方案**：深度集成前后端专业题库、学习神器Anki、思维导图进行理解与记忆，让你融会贯通、笑傲八股。

---

## ✨ 功能特性

| 模块                  | 功能                                                                                   |
| :-------------------- | :------------------------------------------------------------------------------------- |
| **🤖 AI 核心 **       | 基于 `Planer-Executor` + `CRAG` + `Human-in-the-loop` 架构，具有卓越的复杂任务实现能力 |
|                       | 深度集成用户项目代码、领域知识库，提供精准上下文                                       |
|                       | 支持多轮用户反馈与反思，持续优化输出质量                                               |
| **📄 简历优化、落地** | AI进行深度分析、优化、亮点挖掘                                                         |
|                       | AI Agent **实现**项目亮点和功能                                                        |
| **💼岗位匹配、契合**  | 内置爬虫实时获取海量岗位数据                                                           |
|                       | AI 进行高效向量检索、重排和深度分析，精准找到匹配您的岗位                              |
|                       | AI 根据目标岗位优化和定制您的简历                                                      |
| **📚 高效学习、备战** | 集成专业前后端面试题库                                                                 |
|                       | 联动`Anki`与`思维导图`，打造最高效的面试学习路径                                       |
| **📦 便捷部署**       | 提供 `Docker` 一键部署，零配置启动                                                     |

---

## 📚 文档教程

我们为您准备了详细的文档，帮助您迅速掌握 Prisma-AI。

| 分类             | 文档                                                                                  |
| :--------------- | :------------------------------------------------------------------------------------ |
| **🚀快速上手**   | [5分钟完成环境配置](doc/教程：1、环境配置.md)                                         |
|                  | [3分钟构建个人知识库](doc/教程：2、知识库构建.md)                                     |
| **💡核心工作流** | [2分钟掌握项目经验分析、优化与亮点挖掘](doc/教程：3、项目经验分析、优化、亮点挖掘.md) |
|                  | [2分钟掌握AI Agent 协同实现项目亮点](doc/教程：4、项目亮点实现.md)                    |
|                  | [5分钟获取最匹配自己的岗位](doc/教程：5、获取匹配自己的岗位.md)                       |
|                  | [3分钟掌握面向目标岗位定制简历](doc/教程：6、面向岗位定制简历.md)                     |
|                  | [5分钟玩转面试题库与Anki集成](doc/教程：7、面试题库和%20anki集成教程.md)              |
| **🤔方法论**     | [如何写好一份技术简历](doc/方法论：1、简历应该怎么写.md)                              |
|                  | [为什么以及如何使用Anki进行高效学习](doc/方法论：2、为什么以及如何使用%20anki.md)     |
|                  | [curosr等AI工具的局限性、克服](doc/方法论：3、cursor等AI%20编程工具的局限性及克服.md) |

---

## 🚀 快速启动

### 🐳 Docker (推荐)

1.  **克隆仓库**
    ```bash
    git clone https://github.com/weicanie/prisma-ai.git
    cd prisma-ai
    ```
2.  **配置环境**
    - [5分钟完成环境配置](doc/教程：1、环境配置.md)
3.  **配置本地模型** (用于人岗匹配)
    ```bash
    # 下载模型到本地
    git clone https://hf-mirror.com/moka-ai/m3e-base models/moka-ai/m3e-base
    # 配置python环境
    ./python-setup.sh
    # 获取模型onnx文件
    ./model-onnx.sh
    ```
    > **注意**：您需要先将本地模型配置完毕,以在容器中使用模型。
4.  **启动服务**
    ```bash
    # 在仓库根目录执行
    docker compose -f compose.yaml up --build
    ```
5.  浏览器访问 `http://localhost` 即可使用!

### 👨‍💻 本地开发

1.  **克隆并安装依赖**
    ```bash
    git clone https://github.com/weicanie/prisma-ai.git
    cd prisma-ai
    pnpm install
    ```
2.  **配置环境**
    [5分钟完成环境配置](doc/教程：1、环境配置.md)
3.  **配置本地模型** (同Docker步骤)
4.  确保通过本地或容器方式提供

- mysql（latest容器）
- redis（latest容器）
- mongodb（latest容器）
- minio（2025.4.3 bitbami/minio容器）

5.  **启动项目**
    ```bash
    # 在仓库根目录执行
    pnpm run dev
    ```

---

## 🗺️ 路线图

- [ ] **Agent 深度集成**：深度集成 `Cursor`，实现信息搜索、代码检索等工具和模型的复用。
- [ ] **AI 模拟面试**：以费曼学习法为核心方法论，以掌握目标岗位、自身简历对应面试题、项目亮点、岗位考察点为目的，基于Agent和知识库的模拟面试。

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

我们热烈欢迎任何形式的贡献！如果您对这个项目感兴趣，可以通过以下方式参与：

- ⭐ 给项目一个 **Star**！
- 🤔 在 **Issues** 中提出问题或建议。
- 💡 提交 **Pull Request** 改进代码或文档。

我们相信，通过社区的力量，可以让 Prisma-AI 变得更加强大。

---

## 💬 加入社区

欢迎加入我们的QQ群，一起交流、讨论和进步！

**群号：930291816**

<img src="./images/readme/qq.jpg" alt="QQ交流群：930291816" style="width:200px;" />

---

## ⚖️ 声明

1.  运行本项目产出的所有数据都应只作为参考和学习使用。
2.  AI亦会犯错，请仔细甄别其生成结果的准确性。
3.  [项目](https://github.com/weicanie/prisma-ai)提供的爬虫工具和相关功能仅限爬取完全公开且未设访问限制的数据，使用者需自行承担因使用不当而产生的任何法律风险，开发者概不负责。且禁止用于：

- (1) 违反目标网站Robots协议或用户条款；
- (2) 商业竞争、数据转售等牟利行为；
- (3) 高频访问干扰网站正常运行。
- (4) 任何违反中华人民共和国相关法律法规的行为，包括但不限于违反《中华人民共和国刑法》、《民法总则》、《反不正当竞争法》、《网络安全法》的任何行为。
