# 人岗匹配 (Human-Job Match) 模块

本模块提供了一套先进的人岗智能匹配解决方案，利用 AI 技术精准地从海量岗位数据中为指定简历筛选出最合适的职位。

## 核心特性

- **智能语义匹配**: 超越传统关键词匹配，深入理解简历内容和岗位描述的内在含义。
- **混合分层架构**: 结合 SBERT 向量检索和大型语言模型（LLM）的优势，实现速度与精度的完美平衡。
- **高可扩展性**: 能够高效处理十万、百万级别的岗位数据。
- **结果可解释**: 不仅返回匹配的岗位，还提供具体的匹配理由，提升用户信任度。

## 技术架构：召回 + 重排 (Recall + Rerank)

为了在庞大的岗位库中实现既快又准的匹配，我们采用了业界领先的混合分层架构。

### 1. 召回层 (Recall Layer)

**目标**: 快速从全量岗位数据（上万条）中，初步筛选出一个小而精的候选集（例如 Top 20）。

- **技术选型**: **SBERT (Sentence-BERT) 双塔模型** + **Pinecone 向量数据库**。
- **工作流程**:

  1.  **离线向量化 (Embedding)**:
      - 系统管理员通过 `POST /api/hjm/sync-jobs` 接口，触发一个后台任务。
      - 该任务会读取 MongoDB 中所有状态为 `committed` 的岗位数据。
      - 使用本地运行的 SBERT 模型 (`moka-ai/m3e-base`) 将每个岗位的核心描述（职位名称、公司、职责要求）转换成一个 768 维的**语义向量**。
      - 将这些向量连同岗位 `ID` 等元数据存入 Pinecone 向量数据库的 `jobs-index` 索引中。
  2.  **在线查询 (Query)**:
      - 当用户发起匹配请求时 (`GET /api/hjm/match/:resumeId`)，系统会获取目标简历。
      - 实时地将简历的关键信息（技能、项目经验）也用**同一个 SBERT 模型**转换成一个查询向量。
      - 使用此查询向量去 Pinecone 中执行高效的**近似最近邻 (ANN) 搜索**，拉取向量空间上最相似的 `Top K` 个岗位。

- **优势**:
  - **快**: 向量检索的速度极快，即使在百万级数据上也能在毫秒内返回结果。
  - **高效**: 将复杂的语义比较前置到离线计算阶段，在线匹配的计算开销极低。
  - **广**: SBERT 模型能捕捉到关键词匹配无法覆盖的深层语义关联，保证了召回的全面性。

### 2. 重排层 (Rerank Layer)

**目标**: 对召回层返回的候选集（Top 20）进行更精细、更深度的分析，并给出最终的排序和理由。

- **技术选型**: **大型语言模型 (LLM)**, 例如 DeepSeek 或 OpenAI 的 GPT 系列。
- **工作流程**:

  1.  **构建提示 (Prompting)**:
      - 将用户的完整简历信息和召回的 `Top K` 个岗位的详细描述，共同构建成一个结构化的 Prompt。
      - 该 Prompt 指导 LLM 扮演一名资深 IT 猎头的角色，进行深度分析。
  2.  **LLM 推理**:
      - 调用 `ChainService`中的 `hjmRerankChain`，将 Prompt 发送给 LLM。
      - LLM 会综合分析简历和所有候选岗位，评估每个岗位的匹配度，并生成具体的匹配理由。
  3.  **解析与输出**:
      - LLM 返回一个严格按照预设 JSON 格式排列的、按匹配度从高到低排序的岗位列表。
      - 系统解析该 JSON，整合岗位详细信息和匹配理由，形成最终结果返回给前端。

- **优势**:
  - **准**: LLM 具备强大的上下文理解和推理能力，能洞察简历和岗位之间更复杂、更微妙的关联（如软实力、项目影响力等）。
  - **可解释**: LLM 生成的匹配理由让用户明白"为什么匹配"，极大提升了产品的透明度和用户体验。
  - **灵活**: 通过调整 Prompt，可以轻松地改变模型的分析角度和输出风格。

## 如何使用

### 1. 同步岗位数据 (必要步骤)

在使用匹配功能前，必须先将你的岗位数据向量化。

- **Endpoint**: `POST /api/hjm/sync-jobs`
- **认证**: 需要提供有效的用户 Token。
- **描述**: 此接口会遍历当前用户下所有未处理的岗位，将它们转换为向量并存入 Pinecone。建议在有大量岗位更新后调用此接口。

### 2. 为简历匹配岗位

- **Endpoint**: `GET /api/hjm/match/:resumeId`
- **认证**: 需要提供有效的用户 Token。
- **参数**:
  - `resumeId` (路径参数): 你想要进行匹配的简历的 ID。
  - `topK` (查询参数, 可选, 默认 `20`): 召回阶段获取的候选岗位数量。
  - `rerankTopN` (查询参数, 可选, 默认 `5`): 最终返回给用户的、经过 LLM 重排后的岗位数量。
- **成功响应 (200 OK)**:
  ```json
  [
  	{
  		"id": "job-id-123",
  		"jobName": "高级前端工程师",
  		"companyName": "未来科技",
  		"description": "...",
  		"reason": "候选人在项目中广泛使用 React 和 TypeScript，与该岗位的核心技术栈高度一致。其组件库开发经验对于构建我们的设计系统非常有价值。"
  	},
  	{
  		"id": "job-id-456",
  		"jobName": "Web专家",
  		"companyName": "创新互联",
  		"description": "...",
  		"reason": "简历中提到的性能优化和 PWA 的实践，精准命中了该岗位的 '极致用户体验' 要求。"
  	}
  ]
  ```

## 模块依赖

- `VectorStoreModule`: 提供与 Pinecone 向量数据库的交互能力。
- `JobModule`: 提供岗位的 CRUD 操作。
- `ResumeModule`: 提供简历的 CRUD 操作。
- `ChainModule`: 封装了与 LLM 的交互逻辑。

通过这套精心设计的架构，我们得以兼顾大规模数据处理的性能与 AI 深度分析的精度，为用户提供真正智能和可靠的人岗匹配服务。
