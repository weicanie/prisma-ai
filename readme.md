![logo](images/readme/logo.png)

# prisma-ai: 一站式解决项目经验没亮点、简历石沉大海等痛点

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](...)

简体中文 | [English](i18n/README-EN.md)

<br/>

## ⚡快速开始

建议使用`docker`构建、启动本项目,除了你的 apikey 外零配置。

没有安装`docker`环境的可以按照[1分钟学会Win/Linux/Mac上安装Docker，零失败](https://www.bilibili.com/video/BV1vm421T7Kw/?spm_id_from=333.337.search-card.all.click&vd_source=fb073c2174b0ff1ae25a8042f5eaf690)来安装。

<br/>

### 🔑环境配置

[5分钟完成环境配置](</doc/教程：(一)环境配置.md>)

<br/>

### 🚀使用教程

[3分钟完成知识库构建](</doc/教程：(二)知识库构建.md>)

<br/>

[1分钟学会项目亮点实现](</doc/教程：(三)项目亮点实现.md>)

<br/>

[5分钟获取匹配自己的岗位](</doc/教程：(四)获取匹配自己的岗位.md>)

<br/>

### 🐳 Docker

```bash
# 克隆仓库
git clone https://github.com/weicanie/prisma-ai.git
```

然后打开`packages/backend`, 配置`.env、.env.production`对应的环境变量。
然后配置人岗匹配用到的模型：

```bash
# 下载模型到本地
git clone https://hf-mirror.com/moka-ai/m3e-base models/moka-ai/m3e-base
# 配置python环境
./python-setup.sh
# 获取模型onnx文件
./model-onnx.sh
```

注意：你需要先将本地模型配置完毕,以在容器中使用模型

```bash
# 构建服务,在仓库根目录执行
docker compose -f compose.yaml up --attach prisma-ai-backend --build
```

然后浏览器访问`localhost`即可使用!

<br/>

### 👨‍💻本地启动

```bash
# 克隆仓库
git clone https://github.com/weicanie/prisma-ai.git

# 安装依赖
pnpm install
```

然后打开`packages/backend`, 配置`.env、.env.development`对应的环境变量。
然后配置人岗匹配用到的模型：

```bash
# 下载模型到本地
git clone https://hf-mirror.com/moka-ai/m3e-base models/moka-ai/m3e-base
# 配置python环境
./python-setup.sh
# 获取模型onnx文件
./model-onnx.sh
```

```bash
# 启动项目,在仓库根目录执行
pnpm run dev
```

<br/>

## 1、项目的核心价值/解决的痛点

痛点1: 项目经验没亮点，只会罗列些常见技术和业务😤
解决:

- AI Agent 进行深度分析、改进，深度挖掘亮点👌
- AI Agent 进行项目亮点的需求分析、开发计划、代码**实现**👌

痛点2: 简历海投，岗位不匹配也摁投，海投几千，面试寥寥!😤

- 解决1: AI Agent 面向岗位定制简历，匹配化、契合化👌
- 解决2: 爬取招聘网站岗位数据、SBERT模型+相似度搜索进行人岗匹配,找到匹配你的岗位👌

<br/>

## 2、可以在下一秒用到吗？

docker一行命令构建、启动🥰。

当然也支持本地node环境启动。

有帮助的话点个star吧，这对我真的很重要😉。

欢迎提issue、提功能!

<br/>

## 3、痛点是如何解决的?

### 项目经验分析、优化、亮点挖掘

- 优秀的简历质量指标和流程设计，源自c开头的某位老师，专为it岗位的同学设计，我主要做了整个流程的prompt抽象和进一步的扩展🧐。
- 本地 OSS + pinecone 实现的强大知识库集成功能, 你提供的自己的项目信息、相关领域知识越丰富, ai 越强大
- 反思功能, 根据你的反馈进行实时调整

### 项目亮点的实现

- Planer_Executor架构 + CRAG + Human-in-the-loop 的 AI Agent

  - 多轮分析、计划
  - 需求分析评审、实现计划评审
  - 对Planer_Executor架构进行增强,更深、更细的思考、分析、规划
  - 对RAG进行增强的CRAG,更精准、更丰富的知识获取
  - 通过 prompt 集成cursor、windsurf将亮点自动落地

直接使用cursor、windsurf的工作流：

- 输入prompt
- ai 开始工作

使用本项目的工作流：

- 建立项目代码知识库、领域知识库
- 输入要实现的亮点(功能)
- 检索相关代码和知识，进行需求分析
- 你来评审需求分析
  - 想自己纠正？没问题,完全支持
  - 不满意想反馈？没问题,ai会根据你的反馈进行反思,然后做得更好
- 检索相关代码和知识，进行亮点实现的整体计划
- 你来评审整个计划，支持纠正、反馈
- 检索相关代码和知识，进行具体步骤的需求分析、评审、计划、评审
- 执行
- 反馈
- 根据执行结果进行重新分析、计划

### 面向岗位定制简历

- 内置爬虫爬取某boss实时岗位数据，本地部署SBERT双塔模型进行召回、llm进行重排🥴。
- 使用ai集成知识库,面向岗位将你的简历与岗位进行匹配化、契合化

<br/>

## 4、项目目前的进展

v1.0.0 开箱即用的流程llm

- √ 项目经验分析、优化、亮点挖掘
- √ 根据岗位定制简历
- √ 内置爬虫爬取岗位数据(测试爬了差不多两千条数据ip被封了一天😂，悲，现在大大改进了伪装但还没实测)
- √ 本地部署SBERT模型做岗位信息嵌入、pinecone数据库做岗位信息召回、llm做重排和分析
- √ 人岗匹配前端实现

v2.0.0 Planer_Executor + CRAG + Human-in-the-loop 的 AI Agent

- √ 领域知识库、项目代码知识库集成
- √ 项目亮点实现的 Agent, Human-in-the-loop、反思
- √ 原有项目经验处理流程的 Agent 增强, 知识库集成、反思

<br/>

## 5、接下来还会发生什么?

我所在的项目组(9个人，本硕都有)正在进行大量企业、个人走访和人岗数据收集及分析项目，在这个过程中获得的insight和数据会持续更新到这个项目中🧐。

<br/>

## 6、欢迎contribute

欢迎任何形式的contribute，欢迎star、issue、pr😉。

项目后端: nest(ts)，mysql、mongodb、redis，langchain、langgraph、copilotkit

项目前端: react(ts)、vite、react-query、redux、tailwind

1、monorepo + 全链路类型安全，清晰的dto、vo；
2、清晰统一的响应和错误处理；
3、清晰的模块划分、组件封装；

<br/>

## 7、声明

1、[项目](https://github.com/weicanie/prisma-ai)提供的爬虫工具和相关功能仅限爬取完全公开且未设访问限制的数据，且禁止用于：

- (1) 违反目标网站Robots协议或用户条款；
- (2) 商业竞争、数据转售等牟利行为；
- (3) 高频访问干扰网站正常运行。
- (4) 任何违反中华人民共和国相关法律法规的行为，包括但不限于违反《中华人民共和国刑法》第二百八十五条、《中华人民共和国刑法》第二百八十六条、《中华人民共和国刑法》第二百五十三条、《民法总则》第111条、《反不正当竞争法》、《网络安全法》的任何行为。

<br/>
使用者需自行承担法律风险，开发者概不负责。

<br/>

2、运行本项目产出的所有数据都应该只作为参考和学习用。

3、AI也会犯错, AI 生成结果请仔细甄别。

<br/>

## 8、欢迎加群交流

930291816

<img src="./images/readme/qq.jpg" alt="930291816" style="zoom: 25%;position:relative;left:0;" />
