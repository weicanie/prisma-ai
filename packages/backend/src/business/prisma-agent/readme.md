## 流程可视化

![prisma-agent](../../../graph_img/prisma-agent.png)

![plan_agent](../../../graph_img/plan_agent.png)

![plan_step_agent](../../../graph_img/plan_step_agent.png)

![replan_agent](../../../graph_img/replan_agent.png)

## 领域知识库

存储：KnowledgeVDBService

- doc只支持pdf
- url只支持github仓库地址和html数据源（用的cheerio,不会去渲染js）

召回：CRetrieveAgentService

- 步骤更多token消耗更大,更可靠,适合工程实现这种低容错场景
