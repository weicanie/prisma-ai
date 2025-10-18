<p align="center">
<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/logo.png" alt="Logo"/>
</p>

<div align="center">

# Prisma-AI: Your AI Co-pilot for Job Hunting

Open-source and free, it optimizes your projects, customizes your resume, matches you with jobs, and helps you prepare for interviews.

</div>

<p align="center">
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

## 🎯 Why Prisma-AI

Prisma-AI solves the 4 biggest headaches in your job search:

1.  **Projects lack highlights**: You can only list technical terms but can't explain the substance.
    - Use AI to delve into your experience, automatically generate "actionable" highlight plans, and collaborate with you to implement them.
2.  **Resume doesn't fit**: You've sent out many applications with no response.
    - Built-in job scraping + local vector model for precise filtering of matching positions; automatically customizes your resume for each job.
3.  **Can't learn interview questions**: You memorize, forget, and repeat.
    - A combination of question banks, mind maps, and Anki helps you understand and remember, ensuring steady progress without anxiety.
4.  **Interview experiences have no answers**: Reading them only increases anxiety.
    - AI automatically completes and structures information, extracts interview questions and standard answers, and supports version control and collaborative iteration.

---

## ✨ What You Get

| Module                                                        | Feature                                                                                                                                       |
| :------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **🤖 AI Core**                                                | Based on a `Planer-Executor` + `CRAG` + `Human-in-the-loop` architecture, it can turn "ideas" into "executable plans".                        |
|                                                               | Deeply integrates with user project code and domain knowledge bases to provide precise context.                                               |
|                                                               | Supports multiple rounds of user feedback and reflection to continuously optimize output quality.                                             |
| **📄 Resume Optimization & Implementation**                   | Deeply analyzes projects, automatically polishes text, and uncovers actionable highlights.                                                    |
|                                                               | AI Agent **implements** project highlights and features.                                                                                      |
| **💼 Job Matching & Fit**                                     | Real-time job scraping → local vector search and re-ranking → find "more suitable" jobs for you with one click.                               |
|                                                               | Automatically rewrites your resume for target positions, increasing your chances of getting an interview.                                     |
| **📚 Efficient Learning & Preparation**                       | Front-end and back-end question banks + mind maps + Anki, for both understanding and memorization.                                            |
| **📚 Interview Experience Database (Collaborative & Shared)** | Automatic completion of interview experiences, standard answers, mind maps, and source tracing; build it together, it gets stronger with use. |
|                                                               | [www.pinkprisma.com](https://www.pinkprisma.com)                                                                                              |
| **📦 Convenient Deployment**                                  | Provides one-click deployment with `Docker`, zero-configuration startup.                                                                      |

---

## 🔎 Real User Cases

See what `prisma-ai` has brought to its users.

| Category                                                                 | Document                                                          |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Project Experience Analysis, Optimization, and Highlight Mining          | [Project Experience Case](doc-en/use-case-1-project-experience.md)         |
| Integrated Anki + Mind Maps + Professional Front/Back-end Question Banks | [Learning for an Offer Case](doc-en/use-case-3-anki-plus-mindmap.md) |
| Continuously updating...                                                 |                                                                   |

---

## 📚 Documentation & Tutorials

We have prepared detailed documentation to help you quickly master Prisma-AI.

| Category                  | Document                                                                                                                               |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| **🚀 Quick Start**        | [5-Minute Environment Setup](doc-en/tutorial-1-environment-setup.md)                                                                           |
|                           | [3-Minute Personal Knowledge Base Construction](doc-en/tutorial-2-build-knowledge-base.md)                                                      |
|                           | [Quickly Create a Project Knowledge Base with DeepWiki](doc-en/tutorial-10-deepwiki-integration.md)                                     |
| **💡 Core Workflow**      | [Master Project Experience Analysis, Optimization & Highlight Mining in 2 Minutes](doc-en/tutorial-3-project-experience-analysis-optimization-highlights.md) |
|                           | [Master AI Agent Collaborative Implementation of Project Highlights in 2 Minutes](doc-en/tutorial-4-implementing-project-highlights.md)                  |
|                           | [Get the Best Matching Jobs in 5 Minutes](doc-en/tutorial-5-find-matching-roles.md)                                                    |
|                           | [Master Customizing Your Resume for a Target Job in 3 Minutes](doc-en/tutorial-6-tailor-resume-to-role.md)                                 |
|                           | [Master Interview Question Banks & Anki Integration in 5 Minutes](doc-en/tutorial-7-interview-bank-anki-integration.md)                     |
|                           | [Resume Editor User Guide](doc-en/tutorial-9-resume-editor.md)                                                                           |
| **🤔 Methodology**        | [How to Write a Good Technical Resume](doc-en/methodology-1-how-to-write-a-resume.md)                                                         |
|                           | [Why and How to Use Anki for Efficient Learning](doc-en/methodology-2-why-and-how-anki.md)                                    |
|                           | [Limitations of AI Tools like Cursor and How to Overcome Them](doc-en/methodology-3-limitations-of-cursor-and-remedies.md)            |
| **📚 Interview Database** | [Import Question Banks from the Hub to Local Anki](doc-en/hub/tutorial-1-anki-setup.md)                                                 |
|                           | [Provide Feedback on Errors in the Hub's Question Banks](doc-en/hub/tutorial-2-report-bank-errors.md)                                   |

---

## 🚀 Quick Start

### 🐳 Docker (Recommended)

1.  **Clone the repository**

    ```bash
    git clone https://github.com/weicanie/prisma-ai.git && cd prisma-ai
    ```

2.  **Configure the environment**

    - [5-Minute Environment Setup](doc-en/tutorial-1-environment-setup.md)

3.  **Start the service**

    ```bash
    # Execute in the prisma-ai directory
    ./scripts/start.sh
    ```

4.  Access `http://localhost` in your browser to use it!

### 👨‍💻 Local Development

1.  **Clone and install dependencies**
    ```bash
    git clone https://github.com/weicanie/prisma-ai.git && cd prisma-ai && pnpm install
    ```
2.  **Configure the environment**
    [5-Minute Environment Setup](doc-en/tutorial-1-environment-setup.md)
3.  Ensure the following are provided via local or containerized methods:

- mysql (latest container)
- redis (latest container)
- mongodb (latest container)
- minio (2025.4.3 bitnamilegacy/minio container)

And configure them according to the port numbers and MySQL database name set in the backend environment variable file.

4.  **Start the project**
    ```bash
    # Execute in the repository root directory
    pnpm run dev
    ```

---

Version Update:

```bash
# Execute in the repository root directory
./scripts/update.sh
```

## 🆕 What's New

### v4.1.7: Added PDF Resume Editing and Exporting

<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/v4.1.7.png" alt="Resume Editor"/>

### v4.2.1: Support for DeepWiki Integration as a Project Knowledge Base

> DeepWiki is an AI tool that automatically generates interactive, conversational documentation for GitHub repositories.
> Prisma-AI's DeepWiki: https://deepwiki.com/weicanie/prisma-ai

<img width="2355" height="1546" alt="image" src="https://github.com/user-attachments/assets/7bc8aed7-459e-4523-96e5-85e87f68d24a" />

### v5.0.0: AI Assistant Prisma

The AI can optimize resumes and match jobs based on user memory.
Provides AI assistant Prisma, which understands you and your projects through user memory, project business research, and better knowledge base retrieval.
With user memory, users can now find suitable interview experiences and questions on the prisma-ai hub for targeted learning.
Optimized knowledge base retrieval.

<img src="https://github.com/weicanie/prisma-ai/blob/main/images/readme/Prisma.png" alt="Prisma"/>

---

## 🛠️ Tech Stack

| Category             | Technology                                          |
| :------------------- | :-------------------------------------------------- |
| **Project Frontend** | `React ` `Vite` `React-Query` `Redux` `TailwindCSS` |
| **Project Backend**  | `Nest.js ` `MySQL` `MongoDB` `Redis`                |
| **AI Core**          | `LangChain` `LangGraph` `fastmcp` `CopilotKit`      |
| **DevOps**           | `Docker` `Nginx` `Github Action`                    |

---

## 🤝 Contributions Welcome

Any form of contribution is welcome!

- ⭐ Give the project a **Star**!
- 🤔 Ask questions or make suggestions in **Issues**.
- 💡 Submit a **Pull Request** to improve code or documentation.

---

## 📜 Copyright and License

### Main Project License

The main code of this project (Prisma-AI) follows a custom copyright agreement, with copyright belonging to weicanie. For details, please refer to the [LICENSE](../../LICENSE) file in the root directory.

### Third-Party Component Licenses

This project includes the following third-party open-source components, which follow their respective licenses:

| Component           | Path                     | Original Project                                                | License                               |
| ------------------- | ------------------------ | --------------------------------------------------------------- | ------------------------------------- |
| Magic Resume Editor | `packages/magic-resume/` | [JOYCEQL/magic-resume](https://github.com/JOYCEQL/magic-resume) | Apache License 2.0 + Commercial Terms |

**Important Notes**:

- Each third-party component retains its original LICENSE file and copyright notice.
- When using these components, please adhere to their respective license terms.
- For commercial use involving third-party components, please check the license requirements of the corresponding component.

### Copyright Attribution

- **Prisma-AI Core Functionality**: Copyright © 2025 - Present. weicanie <weicanie@outlook.com>
- **Magic Resume Component**: Based on Apache License 2.0, original author is JOYCEQL.

---

## ⚖️ Disclaimer

1.  All data generated by running this project should be used for reference and learning purposes only.
2.  AI can make mistakes; please carefully verify the accuracy of its generated results.
3.  The web scraping tools and related functions provided by the [project](https://github.com/weicanie/prisma-ai) are limited to crawling publicly available data without access restrictions. Users are solely responsible for any legal risks arising from improper use, and the developers assume no liability. It is prohibited to use them for:

- (1) Violating the target website's Robots.txt protocol or terms of use;
- (2) Commercial competition, data resale, or other profit-making activities;
- (3) High-frequency access that interferes with the normal operation of the website.
- (4) Any act that violates the relevant laws and regulations of the People's Republic of China, including but not limited to any violation of the "Criminal Law of the People's Republic of China", "General Principles of the Civil Law", "Anti-Unfair Competition Law", and "Cybersecurity Law".
