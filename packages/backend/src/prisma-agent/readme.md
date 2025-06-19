
## 领域知识库
存储：KnowledgeVDBService
- doc只支持pdf
- url只支持github仓库地址和html数据源（用的cheerio,不会去渲染js）

召回：CRetrieveAgentService
- 步骤更多token消耗更大,更可靠,适合工程实现这种低容错场景