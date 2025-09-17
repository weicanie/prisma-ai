<p align="center">
<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/logo.png" alt="Logo"/>
</p>

<div align="center">

# Prisma-AI: Your AI Career Co-pilot

An open-source, free AI Career co-pilot that automates the entire process from resume preparation to receiving an offer. It optimizes your projects, customizes your resume, matches you with jobs, and helps you prepare for interviews.

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
</p>

<p align="center">
  <a href="../README.md">简体中文</a> | <a href="README-EN.md">English</a>
</p>

---

## 🎯 Core Value

Prisma-AI aims to solve the **3 biggest headaches** job seekers face when preparing resumes and searching for jobs:

1.  **Mediocre Project Experience**: Merely listing technologies and basic business logic, lacking depth and highlights.
    - **Solution**: The AI Agent not only deeply analyzes and optimizes your project descriptions to unearth potential highlights but can also **directly plan and implement these highlights for you**, transforming your project experience.
2.  **Resume-Job Mismatch**: Sending out generic resumes feels like casting a net into the ocean, resulting in few interview opportunities.
    - **Solution**: Using a built-in crawler and local AI models, it accurately matches you with the most suitable positions and **tailors your resume for each job**, significantly increasing your interview success rate.
3.  **Endless Rote Memorization**: Inefficiently cramming and forgetting technical interview questions.
    - **Solution**: Deep integration with professional front-end and back-end question banks, the learning tool Anki, and mind maps to facilitate true understanding and retention, helping you master the key concepts.

---

## ✨ Features

| Module                                      | Functionality                                                                                                    |
| :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| **🤖 AI Core**                              | Built on a `Planer-Executor` + `CRAG` + `Human-in-the-loop` architecture for exceptional complex task execution. |
|                                             | Deeply integrates with user's project code and domain knowledge bases to provide precise context.                |
|                                             | Supports multiple rounds of user feedback and reflection to continuously improve output quality.                 |
| **📄 Resume Optimization & Implementation** | AI performs in-depth analysis, optimization, and highlight mining.                                               |
|                                             | AI Agent **implements** project highlights and features.                                                         |
| **💼 Job Matching & Tailoring**             | Built-in crawler gathers massive job data in real-time.                                                          |
|                                             | AI uses efficient vector search, reranking, and deep analysis to find jobs that perfectly match your profile.    |
|                                             | AI optimizes and customizes your resume for target positions.                                                    |
| **📚 Efficient Learning & Interview Prep**  | Integrated with professional front-end and back-end interview question banks.                                    |
|                                             | Works with `Anki` and `Mind Maps` to create the most efficient learning path for interviews.                     |
| **📦 Easy Deployment**                      | Provides one-click deployment with `Docker` for a zero-configuration start.                                      |

---

## 📚 Documentation

We have prepared detailed documentation to help you get started with Prisma-AI quickly.

| Category              | Document                                                                                                                          |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **🚀 Quick Start**    | [5-Minute Environment Setup](../doc/教程：1、环境配置.md)                                                                         |
|                       | [3-Minute Personal Knowledge Base Setup](../doc/教程：2、知识库构建.md)                                                           |
| **💡 Core Workflows** | [2-Minute Guide to Project Experience Analysis, Optimization & Highlight Mining](../doc/教程：3、项目经验分析、优化、亮点挖掘.md) |
|                       | [2-Minute Guide to Implementing Project Highlights with AI Agent](../doc/教程：4、项目亮点实现.md)                                |
|                       | [5-Minute Guide to Finding Your Perfect Job Match](../doc/教程：5、获取匹配自己的岗位.md)                                         |
|                       | [3-Minute Guide to Customizing Your Resume for Target Jobs](../doc/教程：6、面向岗位定制简历.md)                                  |
|                       | [5-Minute Guide to Using the Interview Bank with Anki Integration](../doc/教程：7、面试题库和%20anki集成教程.md)                  |
| **🤔 Methodology**    | [How to Write a Great Technical Resume](../doc/方法论：1、简历应该怎么写.md)                                                      |
|                       | [Why and How to Use Anki for Efficient Learning](../doc/方法论：2、为什么以及如何使用%20anki.md)                                  |
|                       | [Limitations of AI Tools like Cursor and How to Overcome Them](../doc/方法论：3、cursor等AI%20编程工具的局限性及克服.md)          |

---

## 🚀 Quick Start

### 🐳 Docker (Recommended)

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/weicanie/prisma-ai.git
    cd prisma-ai
    ```
2.  **Configure Environment**
    - [5-Minute Environment Setup](../doc/教程：1、环境配置.md)
3.  **Configure Local Model** (for job matching)
    ```bash
    # Download the model locally
    git clone https://hf-mirror.com/moka-ai/m3e-base models/moka-ai/m3e-base
    # Set up the Python environment
    ./scripts/python-setup.sh
    # Get the model's ONNX file
    ./scripts/model-onnx.sh
    ```
    > **Note**: You need to configure the local model before using it inside the container.
4.  **Start the Services**
    ```bash
    # Execute from the repository root
    docker compose -f compose.prod.yaml up --build
    ```
5.  Open your browser and navigate to `http://localhost` to start using it!

### 👨‍💻 Local Development

1.  **Clone and Install Dependencies**
    ```bash
    git clone https://github.com/weicanie/prisma-ai.git
    cd prisma-ai
    pnpm install
    ```
2.  **Configure Environment**
    [5-Minute Environment Setup](../doc/教程：1、环境配置.md)
3.  **Configure Local Model** (Same as Docker steps)
4.  Ensure the following services are available locally or via containers:
    - mysql (latest container)
    - redis (latest container)
    - mongodb (latest container)
    - minio (2025.4.3 bitnami/minio container)
5.  **Start the Project**
    ```bash
    # Execute from the repository root
    pnpm run dev
    ```

---

## 🗺️ Roadmap

- [ ] **Deeper Agent Integration**: Deep integration with `Cursor` to reuse tools and models for information search, code retrieval, etc.
- [ ] **AI Mock Interviews**: Based on the Feynman learning technique, conduct mock interviews using the Agent and knowledge base, focusing on mastering interview questions, project highlights, and key assessment points for target positions.

---

## 🛠️ Tech Stack

| Category     | Technology                                          |
| :----------- | :-------------------------------------------------- |
| **Frontend** | `React ` `Vite` `React-Query` `Redux` `TailwindCSS` |
| **Backend**  | `Nest.js ` `MySQL` `MongoDB` `Redis`                |
| **AI Core**  | `LangChain` `LangGraph` `fastmcp` `CopilotKit`      |
| **DevOps**   | `Docker` `Nginx` `Github Action`                    |

---

## 🤝 Contributing

We warmly welcome all forms of contributions! If you are interested in this project, you can get involved in the following ways:

- ⭐ Give the project a **Star**!
- 🤔 Ask questions or make suggestions in **Issues**.
- 💡 Submit a **Pull Request** to improve the code or documentation.

We believe that with the power of the community, we can make Prisma-AI even better.

---

## ⚖️ Disclaimer

1.  All data generated by this project should be used for reference and learning purposes only.
2.  AI can make mistakes. Please carefully verify the accuracy of its generated results.
3.  The crawler tools and related functions provided by the [project](https://github.com/weicanie/prisma-ai) are intended only for crawling publicly available data without access restrictions. Users are solely responsible for any legal risks arising from improper use; the developers assume no liability. It is prohibited to use them for:
    - (1) Violating the target website's Robots protocol or user terms;
    - (2) Commercial competition, data resale, or other profit-seeking activities;
    - (3) High-frequency access that interferes with the normal operation of the website.
    - (4) Any behavior that violates the relevant laws and regulations of the People's Republic of China.

