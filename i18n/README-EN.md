![logo](../images/readme/logo.png)

# prisma-ai: Free & Open Source, One-Stop Solution for Resume Optimization and Job Matching

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](...)

[简体中文](../README.md) | English

## ⚡Quick Start

```bash
# Clone the repository
git clone https://github.com/weicanie/prisma-ai.git

# Install dependencies
pnpm install
```

Then navigate to packages/backend and configure the environment variables in .env and .env.development.
Next, configure the models for job matching:

```bash
# Download models locally
git clone https://hf-mirror.com/moka-ai/m3e-base models/moka-ai/m3e-base
# Set up Python environment
./python-setup.sh
# Get model ONNX files
./model-onnx.sh
```

```bash
# Start the project (run from repository root)
pnpm run dev
```

## 🐳 Docker

```bash
# Clone the repository
git clone https://github.com/weicanie/prisma-ai.git
```

Then navigate to packages/backend and configure the environment variables in .env and .env.production.
Next, configure the models for job matching:

```bash
# Download models locally
git clone https://hf-mirror.com/moka-ai/m3e-base models/moka-ai/m3e-base
# Set up Python environment
./python-setup.sh
# Get model ONNX files
./model-onnx.sh
```

Note: You need to configure the local models first to use them in the container

```bash
# Build and start services (run from repository root)
docker compose -f compose.yaml up --build
```

Then visit localhost in your browser to start using the application!

## 1. Core Value & Pain Points Solved

**Pain Point 1**: Project experience lacks highlights, only lists common technologies and business logic 😤  
**Solution**: DeepSeek-R1 performs in-depth analysis and improvement, deeply mining highlights 👌

**Pain Point 2**: Mass resume submissions without job matching, sending thousands with few interviews! 😤  
**Solution 1**: DeepSeek-R1 customizes resumes for specific positions, making them more targeted and relevant 👌  
**Solution 2**: Crawl job data from recruitment websites, use SBERT model + DeepSeek-V3 for job-candidate matching 👌

**Pain Point 3**: Too many interview questions to memorize, forget after learning, learn after forgetting 😤  
**Solution 1**: Crawl interview question data, extend details based on resume, match relevant questions 👌 (since interviewers usually chat based on your resume, though basic knowledge must be solid)  
**Solution 2**: Anki-style scientific review system, Feynman learning method to tackle difficult concepts 👌 (with LLM assistance)

## 2. Can You Use It Right Now?

Yes, absolutely yes.

Free and open source, continuously updated.  
Project repository: [GitHub Link]

Demo website: ICP filing approved, currently undergoing public security filing.

One-command Docker build and start 🥰.  
Zero configuration except for your DeepSeek and other API keys.

Also supports local Node.js environment startup.

If this helps you, please give it a star, it really means a lot to me 😉.

Welcome to submit issues and feature requests, I'll implement anything 🥺.

## 3. How Is the Core Value Implemented?

1. Excellent resume quality metrics and process design, inspired by a teacher whose name starts with 'C', specifically designed for IT positions. I mainly abstracted the entire process into prompts and further extended it 🧐.

2. Primarily based on DeepSeek R1 5/28, high-quality prompts, full-process data structuring, high-quality output 🤩.

3. Built-in crawler to scrape job data from Boss Zhipin, using SBERT dual-tower model for recall and LLM for reranking 🥴.

4. Learning path generation (offer-oriented learning), project highlight implementation (current approach reads your codebase, understands it, then generates solutions as prompts and context for professional code generation tools like Cursor and Windsurf - specialization and no reinventing the wheel)

## 4. Current Project Progress

1. (✓) Project experience analysis, optimization, and highlight mining
2. (✓) Resume customization based on job requirements
3. (✓) Built-in crawler for job data scraping (tested with ~2000 entries, IP got blocked for a day 😂, sad, now greatly improved disguise but not yet tested)
4. (✓) Local deployment of SBERT model for job information embedding, Pinecone database for job information recall, LLM for reranking and analysis
5. ( ) Frontend implementation for job matching
   ...

## 5. What's Coming Next?

My project team (9 people, both undergrad and grad students) is conducting extensive enterprise and individual interviews and job-candidate data collection and analysis. The insights and data gained from this process will be continuously updated to this project 🧐.

## 6. Welcome to Contribute

Welcome any form of contribution, welcome stars, issues, and PRs 😉.

**Backend**: Nest.js (TypeScript), MySQL, MongoDB, Redis, LangChain, CopilotKit

**Frontend**: React (TypeScript), Vite, React-Query, Redux, Tailwind

1. Full-stack type safety with DTOs and VOs
2. Clear and unified response handling and full-stack error handling
3. Clear module separation and component encapsulation

## 7. Welcome to Join Our Discussion Group

QQ Group: 930291816

<img src="../images/readme/qq.jpg" alt="930291816" style="zoom: 25%;position:relative;left:0;" />

## 8. Disclaimer

I oppose any form of resume fraud. Any data generated by running this project should only be used for reference and learning path planning.

## 9. F&Q

**Q1: What's the project's goal?**  
The most effective one-stop IT employment solution.

The project will add more customization features in the future, such as integrating Flowise for visual workflow customization. Also MCP functionality (which is already well-supported).
