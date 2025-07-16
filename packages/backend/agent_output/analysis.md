{
  "version": "1.0",
  "status": "Draft",
  "date": "2024-05-24",
  "analyst": "[Your Name] - Senior Requirements Analyst",
  "projectName": "magic-resume Refactoring",
  "documentTitle": "需求分析报告：magic-resume 从 Next.js 到 Nest.js + React 架构重构",
  "sections": [
    {
      "id": "1.0",
      "title": "概述与核心目标 (Overview & Core Objective)",
      "content": "本文档旨在对 'magic-resume' 项目的架构重构进行详尽的需求分析。核心目标是将项目从现有的 Next.js 14 整体式应用，重构为前后端分离的现代化架构。该新架构将采用 React 18 作为前端单页应用（SPA），并由 NestJS 10 构建的后端服务器提供 API 服务。本次重构必须确保实现与原版本 100% 的功能对等（Full Feature Parity），但项目仅供个人使用，因此对高性能、高可用、日志监控等方面无硬性要求。"
    },
    {
      "id": "2.0",
      "title": "架构需求 (Architectural Requirements)",
      "subsections": [
        {
          "id": "2.1",
          "title": "前端 (Client - React SPA)",
          "content": "前端应为一个完全独立的、使用 React 18 构建的单页应用程序。它将负责所有用户界面的渲染、用户交互处理、客户端状态管理以及与后端 API 的通信。项目构建产物为静态文件（HTML, CSS, JS），可被任何静态文件服务器托管。"
        },
        {
          "id": "2.2",
          "title": "后端 (Server - NestJS API)",
          "content": "后端应为一个使用 NestJS 10 构建的无状态（Stateless）RESTful API 服务器。其职责包括处理业务逻辑、实现数据持久化，并提供诸如 PDF 生成等服务器端特有的能力。"
        },
        {
          "id": "2.3",
          "title": "通信协议 (Communication Protocol)",
          "content": "前后端之间应通过标准的 HTTP/S 协议进行通信。所有数据交换格式应统一采用 JSON。API 设计需遵循 RESTful 风格。"
        }
      ]
    },
    {
      "id": "3.0",
      "title": "功能性需求 - 后端 (Functional Requirements - Backend)",
      "subsections": [
        {
          "id": "3.1",
          "title": "FR-B.1: 简历数据持久化 API (Resume Data Persistence API)",
          "content": "后端必须提供一套完整的 CRUD API 用于管理简历数据。数据模型需与原 `initialResumeData.ts` 中定义的结构保持一致。",
          "requirements": [
            "`POST /api/resumes`：创建一份新简历。请求体(body)为完整的简历数据对象。成功后返回创建的简历对象（包含新生成的唯一 ID）。",
            "`GET /api/resumes`：获取所有已保存的简历列表（或单个简历，取决于个人使用场景下的设计）。",
            "`PUT /api/resumes/{id}`：根据简历 ID 更新一份已存在的简历。请求体为完整的简历数据对象。",
            "`DELETE /api/resumes/{id}`：根据简历 ID 删除一份简历。"
          ]
        },
        {
          "id": "3.2",
          "title": "FR-B.2: PDF 生成服务 (PDF Generation Service)",
          "content": "此功能已初步完成。后端需暴露一个专用的 API 端点，用于将前端发送的 HTML 内容转换为 PDF 文件。",
          "requirements": [
            "`POST /api/pdf/generate`：接收一个包含 HTML 字符串的请求体。",
            "使用 Puppeteer 将接收到的 HTML 渲染并导出为 PDF。",
            "将生成的 PDF 以文件流（Content-Type: application/pdf）的形式在响应中返回，以便前端进行下载。"
          ]
        }
      ]
    },
    {
      "id": "4.0",
      "title": "功能性需求 - 前端 (Functional Requirements - Frontend)",
      "subsections": [
        {
          "id": "4.1",
          "title": "FR-F.1: 核心框架与库的迁移 (Core Framework & Library Migration)",
          "content": "前端代码库需从 Next.js 框架中解耦，并迁移至一个标准的 React SPA 项目结构（如使用 Vite 或 Create React App 初始化）。",
          "requirements": [
            "所有位于 `src/components` 和 `src/app` 下的 React 组件、Hooks 和工具函数必须被迁移。",
            "路由系统：原 `next/navigation` 必须被替换为客户端路由库，推荐使用 `react-router-dom`。",
            "国际化(i18n)：原 `next-intl` 需替换为适用于 SPA 的库，如 `react-i18next`，并迁移现有的翻译资源文件。",
            "状态管理：`zustand` 的使用方式（`useResumeStore`）应保持不变，继续作为全局状态管理的核心。"
          ]
        },
        {
          "id": "4.2",
          "title": "FR-F.2: 简历工作台 (Resume Workbench)",
          "content": "复现原项目 `resumes/page.tsx` 的功能和界面，作为应用的入口和简历管理中心。",
          "requirements": [
            "应用加载时，通过调用 `GET /api/resumes` 从后端获取简历数据并初始化 Zustand store。",
            "提供“新建简历”功能，点击后使用 `initialResumeData.ts` 的默认值创建新简历状态，并调用 `POST /api/resumes` 进行首次保存。",
            "支持编辑和删除操作，分别触发对后端 `PUT` 和 `DELETE` API 的调用。"
          ]
        },
        {
          "id": "4.3",
          "title": "FR-F.3: 简历编辑器与预览 (Resume Editor & Preview)",
          "content": "确保简历的实时编辑和预览功能完整可用。",
          "requirements": [
            "保留基于 Tiptap 的富文本编辑器，其所有功能（如加粗、列表、颜色高亮等）必须正常工作。",
            "保留所有 UI 组件（基于 Radix UI 和 `lucide-react`）及其交互逻辑，如 `IconSelector`、弹窗、下拉菜单等。",
            "确保 Tailwind CSS 样式和 `framer-motion` 动画效果在新架构下与原项目表现一致。",
            "预览区域必须实时响应 Zustand store 中的数据变化。"
          ]
        },
        {
          "id": "4.4",
          "title": "FR-F.4: 导出功能 (Export Functionality)",
          "content": "迁移 `PdfExport.tsx` 组件中的导出逻辑，使其与新的后端服务集成。",
          "requirements": [
            "**PDF 导出**: 点击“下载PDF”按钮后，前端需获取当前预览面板渲染出的最终 HTML，将其作为请求体发送至后端的 `POST /api/pdf/generate` 接口，并处理返回的 PDF 文件流，触发浏览器下载。",
            "**JSON 导出**: 此功能为纯前端操作。点击后，将 Zustand store 中的当前简历数据序列化为 JSON 字符串，并触发浏览器下载为 `.json` 文件。"
          ]
        }
      ]
    },
    {
      "id": "5.0",
      "title": "非功能性需求 (Non-Functional Requirements)",
      "subsections": [
        {
          "id": "5.1",
          "title": "NFR-1: 数据存储 (Data Storage)",
          "content": "考虑到项目为个人使用，后端无需集成复杂的数据库。数据持久化应采用简单的文件系统存储方案，例如将每份简历存为一个独立的 JSON 文件，或将所有简历数据存储在单个 `db.json` 文件中。"
        },
        {
          "id": "5.2",
          "title": "NFR-2: 开发环境 (Development Environment)",
          "content": "需支持前后端服务的独立运行与调试。前端开发服务器（如 Vite dev server）应配置代理（Proxy），将 `/api` 请求转发至本地运行的 NestJS 后端服务，以解决跨域（CORS）问题。"
        }
      ]
    },
    {
      "id": "6.0",
      "title": "约束与范围排除 (Constraints & Exclusions)",
      "subsections": [
        {
          "id": "6.1",
          "title": "C-1: 技术栈约束 (Technology Constraints)",
          "content": "后端必须使用 NestJS 10，前端必须使用 React 18。其他从 `package.json` 中体现的核心库（如 Zustand, Tiptap, Radix UI）应尽量保留。"
        },
        {
          "id": "6.2",
          "title": "E-1: 范围排除 (Exclusions)",
          "content": "以下内容明确排除在本次重构范围之外：用户认证与授权系统、多租户支持、数据库集成、性能优化、高可用部署方案、日志聚合与监控系统。"
        }
      ]
    },
    {
      "id": "7.0",
      "title": "假设 (Assumptions)",
      "subsections": [
        {
          "id": "7.1",
          "title": "A-1: 组件模块化 (Component Modularity)",
          "content": "假设现有的 React 组件具有良好的封装性和较低的对 Next.js 框架的耦合度，可以顺利地迁移到新的 SPA 环境中。"
        },
        {
          "id": "7.2",
          "title": "A-2: 数据持久化方案 (Data Persistence Strategy)",
          "content": "假设基于文件的服务器端数据存储方案足以满足项目的“个人使用”需求。"
        }
      ]
    }
  ]
}