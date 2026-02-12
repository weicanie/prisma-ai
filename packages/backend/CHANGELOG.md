# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.3.5](https://github.com/weicanie/prisma-ai/compare/v5.3.4...v5.3.5) (2026-02-12)

### Bug Fixes

- adjust OSS and email configs for environment-specific deployments ([5208463](https://github.com/weicanie/prisma-ai/commit/52084634fc535156266ccc923ab2d3b71fda71b9))

### Features

- **code-embedding:** add C# support and switch to langchain text splitter ([9928150](https://github.com/weicanie/prisma-ai/commit/99281501f3f46b2b655b3857945a689dc4f358d5))

## [5.3.3](https://github.com/weicanie/prisma-ai/compare/v5.3.2...v5.3.3) (2026-01-25)

### Features

- include runId in agent start response for feedback correlation ([ea637bc](https://github.com/weicanie/prisma-ai/commit/ea637bcfcce35c02e2254cc7d45b512807a5a9b0))

# [5.3.0](https://github.com/weicanie/prisma-ai/compare/v5.2.3...v5.3.0) (2026-01-24)

### Bug Fixes

- **uploadcode:** remove the remaining and incorrect logical judgments ([2a30e20](https://github.com/weicanie/prisma-ai/commit/2a30e20dbbf6a08f65a6f3f80d8bf82b1f9898b5))

### Features

- add jsonMode parameter to LLM initialization methods ([f798576](https://github.com/weicanie/prisma-ai/commit/f7985768d8484e30bee493ff2be3837e2f5bb10c))
- **agent:** refactor agent config and add settings UI ([06c10e1](https://github.com/weicanie/prisma-ai/commit/06c10e1b128e22cdfac0332965c66db5166197d1))
- **ai-conversation:** add who field to distinguish llm/agent conversations ([e9cea4e](https://github.com/weicanie/prisma-ai/commit/e9cea4e4bc3214aacb535a60c9c44c5e9f84f428))
- **aichat:** add who field to ai conversation queries ([95047bc](https://github.com/weicanie/prisma-ai/commit/95047bcc63f43c9d17b9887d29ad6fb040a54c20))
- **crawler:** enhance crawler reliability with stealth plugin and retry logic ([004fe27](https://github.com/weicanie/prisma-ai/commit/004fe27afe58111a0442fd6e84be7a63f0397b74))
- **crawler:** inject script to bypass history-based anti-crawler defenses ([6cc62e2](https://github.com/weicanie/prisma-ai/commit/6cc62e2b908d530ce19bf71c4d90d4aa26b8533e))
- **knowledge-base:** add endpoint to check project code upload status ([051498d](https://github.com/weicanie/prisma-ai/commit/051498dc97fae371ee2550af192f0ab5f45e58b6))
- **prisma-agent:** add event types and schemas for agent workflow ([5a5e92e](https://github.com/weicanie/prisma-ai/commit/5a5e92e49b0e44e1866c002d7d469ff6e1213c88))
- **prisma-agent:** add streaming support and web UI integration ([ea93eb0](https://github.com/weicanie/prisma-ai/commit/ea93eb0ed898cdb21330db840ab0f40deec0471b))

## [5.2.3](https://github.com/weicanie/prisma-ai/compare/v5.2.2...v5.2.3) (2025-11-21)

**Note:** Version bump only for package backend

## [5.2.2](https://github.com/weicanie/prisma-ai/compare/v5.2.1...v5.2.2) (2025-11-10)

### Bug Fixes

- **resume-repo:** use dynamic import function to avoid cjs require esm issue ([b007743](https://github.com/weicanie/prisma-ai/commit/b0077436733da3f03a4b1e83b0345b1946738840))

## [5.2.1](https://github.com/weicanie/prisma-ai/compare/v5.2.0...v5.2.1) (2025-11-10)

### Bug Fixes

- **swc:** set ignoreDynamic to true to support esm packages in cjs output ([44c5d98](https://github.com/weicanie/prisma-ai/commit/44c5d987d0af64c477c16787f245720b66c7367e))

# [5.2.0](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.15...v5.2.0) (2025-11-10)

**Note:** Version bump only for package backend

# [5.2.0-beta.15](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.14...v5.2.0-beta.15) (2025-11-03)

### Bug Fixes

- build ([20f3c21](https://github.com/weicanie/prisma-ai/commit/20f3c21c367dfc716880c6a7659c85ecda9a79cb))

# [5.2.0-beta.14](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.13...v5.2.0-beta.14) (2025-11-02)

### Features

- 在AI对话中实现SSE流式生成 ([7e68def](https://github.com/weicanie/prisma-ai/commit/7e68defb042198dee15c1c7eb3656065b8052c1b))

# [5.2.0-beta.13](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.12...v5.2.0-beta.13) (2025-10-29)

### Bug Fixes

- 反思agent ([8057dd1](https://github.com/weicanie/prisma-ai/commit/8057dd1afa2c1aea274f0c8df1a152205d0b77c3))
- 修复已知问题 ([cadc942](https://github.com/weicanie/prisma-ai/commit/cadc942295f4194c5189f7199d56e103f9113569))

# [5.2.0-beta.12](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.11...v5.2.0-beta.12) (2025-10-26)

### Bug Fixes

- 无法创建用户记忆 ([f5c1efb](https://github.com/weicanie/prisma-ai/commit/f5c1efb6d184b8860a0b42c1c062587c6233957f))

### Performance Improvements

- **frontend:** chunk预加载 ([5886253](https://github.com/weicanie/prisma-ai/commit/588625391bc49983d28e72a0402c34ebe5c1ba98))

# [5.2.0-beta.11](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.10...v5.2.0-beta.11) (2025-10-21)

**Note:** Version bump only for package backend

# [5.2.0-beta.10](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.9...v5.2.0-beta.10) (2025-10-21)

### Features

- 启用json mode进行结构化输出 ([321a02e](https://github.com/weicanie/prisma-ai/commit/321a02e8143778fbe9b74757d542cc4bdff11163))
- 收集用户反馈以改进服务 ([8b7ed0c](https://github.com/weicanie/prisma-ai/commit/8b7ed0cb91f8b6fc3d94045194107acc94260051))
- 支持glm 4.6 ([f4eee83](https://github.com/weicanie/prisma-ai/commit/f4eee83f2170c6781fa9d4419288070827dc808d))

# [5.2.0-beta.9](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.8...v5.2.0-beta.9) (2025-10-18)

### Bug Fixes

- build ([ceed23e](https://github.com/weicanie/prisma-ai/commit/ceed23efd713a59295c490a52bcbe47f86430b4f))

# [5.2.0-beta.8](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.7...v5.2.0-beta.8) (2025-10-18)

### Bug Fixes

- pinecone客户端根据用户配置创建 ([d84d96d](https://github.com/weicanie/prisma-ai/commit/d84d96d616509f1c9edc9a0ff6347f14397b91bc))

### Features

- deepwiki-down服务 ([a95623f](https://github.com/weicanie/prisma-ai/commit/a95623f1b94bb263bb60596f2b1a5e9060137f2d))

# [5.2.0-beta.7](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.6...v5.2.0-beta.7) (2025-10-17)

### Bug Fixes

- 参数传递 ([47205b9](https://github.com/weicanie/prisma-ai/commit/47205b93e3aed82d7502c80c701ad2c367d1d480))
- 参数类型 ([3dfe3c7](https://github.com/weicanie/prisma-ai/commit/3dfe3c7c7ed6d9b9f51efc5fad47cfd294486581))

# [5.2.0-beta.6](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.5...v5.2.0-beta.6) (2025-10-17)

### Bug Fixes

- 简历json数据存储失败 ([0251369](https://github.com/weicanie/prisma-ai/commit/02513691537e1fa74452a2d6bcc7aea906ccbec6))

# [5.2.0-beta.5](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.4...v5.2.0-beta.5) (2025-10-17)

**Note:** Version bump only for package backend

# [5.2.0-beta.4](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.3...v5.2.0-beta.4) (2025-10-16)

### Bug Fixes

- 第三方嵌入模型兼容用户配置方式 ([4ebe0bf](https://github.com/weicanie/prisma-ai/commit/4ebe0bfaaf6b67980f982cb67d629e9c0887c9c0))
- 线上部署时不要求初始化模型池 ([aa321fa](https://github.com/weicanie/prisma-ai/commit/aa321facbffe99371d6e1c16be84d7b1265d1b16))

# [5.2.0-beta.3](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.2...v5.2.0-beta.3) (2025-10-16)

### Bug Fixes

- 完善线上部署 ([99223b2](https://github.com/weicanie/prisma-ai/commit/99223b2d3918e2c662fa9a1096744f4da073e895))

### Features

- 后台管理和通知中心 ([ef755ba](https://github.com/weicanie/prisma-ai/commit/ef755ba7d8b4d3947837867e3d03dda948652d47))

# [5.2.0-beta.2](https://github.com/weicanie/prisma-ai/compare/v5.2.0-beta.1...v5.2.0-beta.2) (2025-10-16)

### Bug Fixes

- 线上不初始化pinecone客户端 ([e3033d6](https://github.com/weicanie/prisma-ai/commit/e3033d6c9c53e498de6e1dc8602e021621b781a0))
- 项目知识缓存用户间的隔离 ([482ba2f](https://github.com/weicanie/prisma-ai/commit/482ba2f72f5adf9402b331f0c474b6f330d7bb52))

# [5.2.0-beta.1](https://github.com/weicanie/prisma-ai/compare/v5.1.0...v5.2.0-beta.1) (2025-10-16)

### Features

- 区分线上部署与本地部署 ([2b1f503](https://github.com/weicanie/prisma-ai/commit/2b1f5034e886270bc59d58288dce002e87f7ab14))

# [5.1.0](https://github.com/weicanie/prisma-ai/compare/v5.0.2...v5.1.0) (2025-10-16)

### Bug Fixes

- 拼写错误 ([c1b4099](https://github.com/weicanie/prisma-ai/commit/c1b40995ccf11d71a6b7998059f06e4c343e449c))
- userMemory prompt注入 ([e798448](https://github.com/weicanie/prisma-ai/commit/e7984485b0d112dc235fac8b1ddd01eed25aa4eb))

### Features

- 单用户文件存储 -> 多用户文件存储 ([44696e1](https://github.com/weicanie/prisma-ai/commit/44696e13904be389d4cce1057ea27984825af203))
- 用户配置功能 ([41f7e0b](https://github.com/weicanie/prisma-ai/commit/41f7e0b791b38eae6686c2020bbacaab86532257))

## [5.0.2](https://github.com/weicanie/prisma-ai/compare/v5.0.1...v5.0.2) (2025-10-08)

### Bug Fixes

- 岗位数据保存前校验字段的hook ([d196c4d](https://github.com/weicanie/prisma-ai/commit/d196c4ddc8e063f5910ffc5a887d2c50c00e1b1d))

# [5.0.0](https://github.com/weicanie/prisma-ai/compare/v4.2.1...v5.0.0) (2025-10-02)

### Bug Fixes

- prompt ([6903f49](https://github.com/weicanie/prisma-ai/commit/6903f499fd78334172c6b3d7ddca3438ba6d4cdc))

### Features

- 根据用户情况进行简历优化、人岗匹配 ([eea9b1f](https://github.com/weicanie/prisma-ai/commit/eea9b1f15f60df83b74c7a9b67e12307f0c0ddd6))
- 基本的ai对话功能 ([17c2659](https://github.com/weicanie/prisma-ai/commit/17c2659a22b99ea87bb27b18b34253c38454e559))
- 基于项目经验、用户memory、RAG的AI助手 ([e27d159](https://github.com/weicanie/prisma-ai/commit/e27d15993762d0af64e8c5ed5c7d7c570c7982fa))
- 完善高可用模型客户端 ([6ce008d](https://github.com/weicanie/prisma-ai/commit/6ce008d3bbc4958f209ef74cef04166aeacfff95))
- 完善ai对话功能 ([6b6e020](https://github.com/weicanie/prisma-ai/commit/6b6e020c13ecf6275f5f7e578dea85f23bf1093d))
- 项目业务的分析与文档生成 ([a4208ac](https://github.com/weicanie/prisma-ai/commit/a4208acd3b8d8df2fe65259b973fdef924397871))
- 用户记忆的展示与用户手动修改功能 ([ebc0b98](https://github.com/weicanie/prisma-ai/commit/ebc0b989bfa9e8081b41945c74b5f9aea3561e20))
- 用户输入、项目数据召回到的文档和代码，按相似度分数进行过滤 ([d9a7d04](https://github.com/weicanie/prisma-ai/commit/d9a7d04c85fea5e0608b771f509042cd2dee26c6))
- 用户memory功能 ([5e71018](https://github.com/weicanie/prisma-ai/commit/5e710187c6c9adf9df5d0d02b45d4e07b37d230f))
- **backend:** 完善项目知识库检索功能 ([49dbd6a](https://github.com/weicanie/prisma-ai/commit/49dbd6ac076a419a57a29616e86a1c8f846d5aaa))
- **backend:** 项目知识检索做三级缓存 ([39a9a6a](https://github.com/weicanie/prisma-ai/commit/39a9a6af8bd6d61008604e7d21671eb8afa7ac38))

# [4.2.0](https://github.com/weicanie/prisma-ai/compare/v4.1.7...v4.2.0) (2025-09-24)

### Bug Fixes

- **backend:** 脚本权限问题 ([8c9658a](https://github.com/weicanie/prisma-ai/commit/8c9658a1c7b8d62a5c8560a21b08d36eb652419b))

### Features

- 更新前端接口、UI ([d7436ed](https://github.com/weicanie/prisma-ai/commit/d7436edbc41b6880339ae30ccd288a74d71a6e58))
- 完善deepwiki知识库集成功能 ([489a45b](https://github.com/weicanie/prisma-ai/commit/489a45b4e7c6c86f516c3f53a440902bd72f6510))
- **backend:** deepwiki站点的下载和知识库上传接口 ([1ee6aba](https://github.com/weicanie/prisma-ai/commit/1ee6abae9b33b99e892e62c07810a7c26615370a))
- **deepwiki-down:** 通过拦截rsc请求来将deepwiki站点转为md文件 ([dc0dfc8](https://github.com/weicanie/prisma-ai/commit/dc0dfc82d40b84e9bc8705d714549b6a7bd0643f))

## [4.1.6](https://github.com/weicanie/prisma-ai/compare/v4.1.5...v4.1.6) (2025-09-17)

### Features

- iframe嵌入与路由支持 ([3c60b36](https://github.com/weicanie/prisma-ai/commit/3c60b36876fab15e856dec788b8ed2dedd62d03f))

## [4.8.6](https://github.com/weicanie/prisma-ai/compare/v4.1.5...v4.8.6) (2025-09-16)

### Features

- iframe嵌入与路由支持 ([3c60b36](https://github.com/weicanie/prisma-ai/commit/3c60b36876fab15e856dec788b8ed2dedd62d03f))

## [4.1.4](https://github.com/weicanie/prisma-ai/compare/v4.1.3...v4.1.4) (2025-09-16)

### Bug Fixes

- 后端容器文件 ([73d4080](https://github.com/weicanie/prisma-ai/commit/73d40802a886c06fe8c2f7544f4bacc0c1b2b813))

## [4.1.3](https://github.com/weicanie/prisma-ai/compare/v4.1.2...v4.1.3) (2025-09-16)

### Bug Fixes

- 后端容器依赖 ([be1581b](https://github.com/weicanie/prisma-ai/commit/be1581b17cd022bfe1bd23bd4230dd4f2dbbe107))

# [4.1.0](https://github.com/weicanie/prisma-ai/compare/v4.0.1...v4.1.0) (2025-09-15)

### Features

- 工作经历、教育经历的CRUD UI ([c68aa12](https://github.com/weicanie/prisma-ai/commit/c68aa12c946511bf3ae6c10c0fcb98ff9acc393f))
- 工作经历、教育经历的CRUD接口 ([fd979e4](https://github.com/weicanie/prisma-ai/commit/fd979e49a8e9104897a6c8b96bfffd8dfd1e3015))
- 简历数据的内容更新 ([325ee79](https://github.com/weicanie/prisma-ai/commit/325ee7984bb28e7450412d19c2a3db6ee32cf8dd))
- 完善会话清除功能 ([6cd5508](https://github.com/weicanie/prisma-ai/commit/6cd55084731e4cc0eac880aef7dd53fbcb83db01))
- **backend:** 后端提供简历json文件数据源 ([c69fbe9](https://github.com/weicanie/prisma-ai/commit/c69fbe96a4cffe0be20f568a079cfb25cca0eb13))

# [4.0.0](https://github.com/weicanie/prisma-ai/compare/v3.6.3...v4.0.0) (2025-08-25)

**Note:** Version bump only for package backend

**Note:** Version bump only for package backend

## [3.6.2](https://github.com/weicanie/prisma-ai/compare/v3.6.1...v3.6.2) (2025-08-18)

### Bug Fixes

- port ([6d0e4fd](https://github.com/weicanie/prisma-ai/commit/6d0e4fd0a27f3cc383cf198f71980a1b38602d1b))

# [3.6.0](https://github.com/weicanie/prisma-ai/compare/v3.5.1...v3.6.0) (2025-08-12)

### Bug Fixes

- 前端会话锁的释放 ([8336a0a](https://github.com/weicanie/prisma-ai/commit/8336a0a30e8f77fa284222f4845937bd95206630))
- 任务错误终止时前端阻塞 ([4fc8afe](https://github.com/weicanie/prisma-ai/commit/4fc8afef1e1d129acf348cc5eb79bc3bb32c39c9))
- 任务失败杀死线程 ([9e5f4af](https://github.com/weicanie/prisma-ai/commit/9e5f4aff4308d6f7af95f545cd3da3b0df28c6b0))

### Features

- 职业技能表单支持md编辑器 ([0792ab0](https://github.com/weicanie/prisma-ai/commit/0792ab0296ea6740a323a57c71e35e1e3064ff13))
- saas落地页与配套登录注册页 ([e7b1ed4](https://github.com/weicanie/prisma-ai/commit/e7b1ed4d952d23f354e48e4bb4aeed8e7976e630))

## [3.5.1](https://github.com/weicanie/prisma-ai/compare/v3.5.0...v3.5.1) (2025-08-01)

**Note:** Version bump only for package backend

# [3.5.0](https://github.com/weicanie/prisma-ai/compare/v3.4.0...v3.5.0) (2025-08-01)

### Features

- 面经的上传、处理 ([8e765e7](https://github.com/weicanie/prisma-ai/commit/8e765e796667d434b435d71cf99808a387f02788))

# [3.4.0](https://github.com/weicanie/prisma-ai/compare/v3.3.5...v3.4.0) (2025-07-19)

### Features

- 完善、优化了人岗匹配和简历定制 ([7d71449](https://github.com/weicanie/prisma-ai/commit/7d714490ac62ece4ab2cbfc23fd0a9ccaee4c35d))

## [3.3.5](https://github.com/weicanie/prisma-ai/compare/v3.3.4...v3.3.5) (2025-07-18)

**Note:** Version bump only for package backend

## [3.3.4](https://github.com/weicanie/prisma-ai/compare/v3.3.3...v3.3.4) (2025-07-18)

**Note:** Version bump only for package backend

## [3.3.3](https://github.com/weicanie/prisma-ai/compare/v3.3.2...v3.3.3) (2025-07-18)

**Note:** Version bump only for package backend

## [3.3.2](https://github.com/weicanie/prisma-ai/compare/v3.3.1...v3.3.2) (2025-07-18)

### Bug Fixes

- 修复人岗匹配服务的一些错误 ([b358e59](https://github.com/weicanie/prisma-ai/commit/b358e598c63ad3d6a0986770f0a60f3a7460d9a2))

## [3.3.1](https://github.com/weicanie/prisma-ai/compare/v3.3.0...v3.3.1) (2025-07-17)

**Note:** Version bump only for package backend

# [3.3.0](https://github.com/weicanie/prisma-ai/compare/v3.2.0...v3.3.0) (2025-07-17)

### Features

- 优化CI/CD、镜像部署chrome ([af28314](https://github.com/weicanie/prisma-ai/commit/af28314d240ffb24fdfc3c946f9d907083f60825))

# [3.2.0](https://github.com/weicanie/prisma-ai/compare/v3.1.6...v3.2.0) (2025-07-16)

### Bug Fixes

- 修复了项目实现Agent的路由等错误 ([7d775cd](https://github.com/weicanie/prisma-ai/commit/7d775cdce28ebbfcc606a2ff929324abf1d5d145))

### Features

- 添加了gemini-2.5-pro、flash 的支持 ([b7ad6f9](https://github.com/weicanie/prisma-ai/commit/b7ad6f925772ae335a2de9178dee031ae70c8000))

## [3.1.6](https://github.com/weicanie/prisma-ai/compare/v3.1.5...v3.1.6) (2025-07-15)

### Bug Fixes

- clone脚本丢失导致的项目代码无法上传问题 ([798586c](https://github.com/weicanie/prisma-ai/commit/798586cd4f006b1fafe44a730710fccec11338dc))

## [3.1.5](https://github.com/weicanie/prisma-ai/compare/v3.1.4...v3.1.5) (2025-07-14)

### Bug Fixes

- 修复已知问题 ([5d7d7ef](https://github.com/weicanie/prisma-ai/commit/5d7d7efa2a6b08b8966ff200d14dc56dad3d146f))

## [3.1.4](https://github.com/weicanie/prisma-ai/compare/v3.1.3...v3.1.4) (2025-07-14)

**Note:** Version bump only for package backend

## [3.1.3](https://github.com/weicanie/prisma-ai/compare/v3.1.2...v3.1.3) (2025-07-14)

### Bug Fixes

- nginx容器错误 ([6fa8e73](https://github.com/weicanie/prisma-ai/commit/6fa8e73b53f1f55be35bd0ef0a85a55a17bac731))

### Features

- 简化部署，修复一些页面的黑屏问题 ([85c7882](https://github.com/weicanie/prisma-ai/commit/85c78827bc52fa8fd5bc0276694c78a35a31ab45))

## [3.1.1](https://github.com/weicanie/prisma-ai/compare/v3.1.0...v3.1.1) (2025-07-14)

### Bug Fixes

- 修复docker CI和首页内容 ([a475140](https://github.com/weicanie/prisma-ai/commit/a475140b7f1c2b16628a741adf4e7e534904e3b9))

# [3.1.0](https://github.com/weicanie/prisma-ai/compare/v3.0.1...v3.1.0) (2025-07-13)

### Bug Fixes

- dockerfile for publish ([c55e680](https://github.com/weicanie/prisma-ai/commit/c55e680ec391467d94ccb665c47ded52da63cf9e))
- fix CI ([7c887d9](https://github.com/weicanie/prisma-ai/commit/7c887d99332109a4875b1f55e521e21958188ff6))

### Features

- 完善CI流程 ([bfdee36](https://github.com/weicanie/prisma-ai/commit/bfdee365ad8c7d3d44d9cee71f56c7ff99683ae1))
- 修复并升级项目的CI/CD ([39e4148](https://github.com/weicanie/prisma-ai/commit/39e4148b19c053ed040efee06a1dff868188f92c))

## [3.0.1](https://github.com/weicanie/prisma-ai/compare/v3.0.0...v3.0.1) (2025-07-13)

### Bug Fixes

- docker构建的要复制目录丢失问题 ([eeaeab4](https://github.com/weicanie/prisma-ai/commit/eeaeab490df9b5ea39dd1af684cc6da457930a44))

### Features

- 完善文档和readme ([c76d584](https://github.com/weicanie/prisma-ai/commit/c76d5843ae7a4885faa3067dd4586269242da789))

**Note:** Version bump only for package backend

# [3.0.0](https://github.com/weicanie/prisma-ai/compare/v2.1.0...v3.0.0) (2025-07-11)

### Features

- 集成面试题库和 anki ([ae52e1f](https://github.com/weicanie/prisma-ai/commit/ae52e1f2f9953c595c279b684d9c9c35625ccdeb))
- 项目代码知识库增量构建 ([56aaaa0](https://github.com/weicanie/prisma-ai/commit/56aaaa0c115dcb6b5c66ba47790125bf5b7a7857))
- 优化prompt、Agent CLI ([3d397e2](https://github.com/weicanie/prisma-ai/commit/3d397e23b1778e0938c85d277c1a67ca678f04e7))

# [2.1.0](https://github.com/weicanie/prisma-ai/compare/v2.0.0...v2.1.0) (2025-06-30)

### Features

- v2更新、完善 ([c3337df](https://github.com/weicanie/prisma-ai/commit/c3337df125184f88b9b370fcf8493db85b965c59))

# [2.0.0](https://github.com/weicanie/prisma-ai/compare/v1.0.0...v2.0.0) (2025-06-28)

### Bug Fixes

- 循环依赖治理 ([0d6286a](https://github.com/weicanie/prisma-ai/commit/0d6286a0c52547df9f4d10e9129034f36b0157db))

### Features

- 升级原来的项目经验处理流程 ([663213e](https://github.com/weicanie/prisma-ai/commit/663213ea4e24f504ee40084f611cc7ab85a6bca6))
- 实现项目亮点实现Agent ([7f5bfd1](https://github.com/weicanie/prisma-ai/commit/7f5bfd1fbf2e2220f4679e5684e38b331e23cf73))
- 数据源集成、agent基建 ([644c972](https://github.com/weicanie/prisma-ai/commit/644c9726026eca15fc1747a7ecba92ee1b27ae60))
- 提供agent配置功能 ([fdc0a6f](https://github.com/weicanie/prisma-ai/commit/fdc0a6f624f7d8aef85bea76a0b74ecd20f79c46))
- 完善项目需求实现Agent ([81b79f2](https://github.com/weicanie/prisma-ai/commit/81b79f2369cda0c33d38fb1a837cb1b344388ceb))
- 下一步 ([c33c455](https://github.com/weicanie/prisma-ai/commit/c33c455beb21536cccdf49e1fd6bdcbcee743095))
- 知识库、Agent完善 ([5d94151](https://github.com/weicanie/prisma-ai/commit/5d941517ed1e83c79a7cad0f399d32f65ee48115))
- ai聊天功能 ([5301f42](https://github.com/weicanie/prisma-ai/commit/5301f4293857ef7fa49d33b402d33b940bdce3ea))

# 1.0.0 (2025-06-15)

### Bug Fixes

- 解决docker容器内SBERT模型部署的依赖问题 ([81b8e22](https://github.com/weicanie/prisma-ai/commit/81b8e22129926c041d5c6ead87ca2166d959661d))
- 通过构建依赖图解决潜在的循环依赖问题、解决装饰器误用为Guard的问题 ([ebb7179](https://github.com/weicanie/prisma-ai/commit/ebb71790dd05439a32c16dee4fdb5fa976d0dec0))
- 消除stash冲突 ([e8b0bd0](https://github.com/weicanie/prisma-ai/commit/e8b0bd0f925c2bf1467177c28d0d97234beee332))

### Features

- 本地嵌入模型部署 ([b35391e](https://github.com/weicanie/prisma-ai/commit/b35391eb7abe64cf6fd11314ade10fb9e5a2d2ac))
- 后端完善 graph 基建、注册登录功能实现、统一错误处理 ([3344212](https://github.com/weicanie/prisma-ai/commit/3344212a5d00a4c35d95777bbd023f99faad414f))
- 后端CRUD接口实现、数据库索引优化、前后端通信优化 ([aafd688](https://github.com/weicanie/prisma-ai/commit/aafd688695c357ca1c40049ea4aeb826e848754d))
- 后端graph相关基建完善、前端登录注册页设计实现 ([e095163](https://github.com/weicanie/prisma-ai/commit/e095163d1edfdc6c5b5abaa6c942dae86e2b22e9))
- 基建、基础业务 ([abc2cdf](https://github.com/weicanie/prisma-ai/commit/abc2cdf12b4619e65224f8d60f1ac07d0b845c8d))
- 简历匹配岗位服务后端 ([8c39559](https://github.com/weicanie/prisma-ai/commit/8c395597e8ae5ac8e4a6bb7b6cc903ebe65ea4e6))
- 简历匹配岗位服务前后端完善 ([b727e6b](https://github.com/weicanie/prisma-ai/commit/b727e6beccc47178b0f3fcbff8b8be0b57f620d1))
- 进一步完善接口、开始构建共享库 ([dadba37](https://github.com/weicanie/prisma-ai/commit/dadba378c5cd4adffda80a01656d0a374cdd8206))
- 进一步完善前后端 ([38c3412](https://github.com/weicanie/prisma-ai/commit/38c341273e784cb1eee3d813a1c57b8311da1ed4))
- 前端axios、react-query基建 ([7ad611e](https://github.com/weicanie/prisma-ai/commit/7ad611eeabbe2aeb0dcee29390f03a6202656f8d))
- 前端md编辑器、项目经验提交表单实现、后端错误处理完善 ([8ede5c0](https://github.com/weicanie/prisma-ai/commit/8ede5c0e3aede4f53fd47124e918613118349c3e))
- 前后端完善 ([acf0373](https://github.com/weicanie/prisma-ai/commit/acf037337657975c364fd0190a4f8b3db4a44655))
- 前后端完善 ([801d4a6](https://github.com/weicanie/prisma-ai/commit/801d4a6925c8eba387412d0d92c1b273a2d012c2))
- 前后端sse接通 ([11a8f22](https://github.com/weicanie/prisma-ai/commit/11a8f227659089bd3596cc209c0489979792ad4e))
- 人岗匹配、本地OSS ([24e04b4](https://github.com/weicanie/prisma-ai/commit/24e04b4860c597ea30977fe771f73a434c5d25ce))
- 人岗匹配服务后端完成 ([3ce6876](https://github.com/weicanie/prisma-ai/commit/3ce68764d430ceb4c442520967927bf6e56a3f2a))
- 人岗匹配后端完善、 CI/CD初步配置 ([4df991b](https://github.com/weicanie/prisma-ai/commit/4df991bb7c63235c88b28b7a3567b8a7d6d71bee))
- 完成人岗匹配chain ([3917c69](https://github.com/weicanie/prisma-ai/commit/3917c6907dc4eccd798f4e1fc29c55f26a8d1553))
- 增强了一些类型，完善readme、添加英文readme ([f47c8f2](https://github.com/weicanie/prisma-ai/commit/f47c8f265f24d4c4d0507b6ae92b47334e0e83f4))
- 支持断点续传的SSE、会话管理、集成redis的任务队列, llm缓存层 ([38ecb20](https://github.com/weicanie/prisma-ai/commit/38ecb20941865c3a7053b436da901f08eee1f930))
- 重构sse模块 ([96ff902](https://github.com/weicanie/prisma-ai/commit/96ff902aabf58a6ad6080e86c1eb43f388b741ca))
- add license ([0428a52](https://github.com/weicanie/prisma-ai/commit/0428a529a2396e19c68da99a7555cf5dc7c675ae))
- add readme.md ([a34681d](https://github.com/weicanie/prisma-ai/commit/a34681d349c336e4ffc82ec1e1980b4d5e365292))
- docker支持、缓存配置 ([05d33f6](https://github.com/weicanie/prisma-ai/commit/05d33f62c144bf79c3559cd9d2a8bc22cf612ff5))
- dockerfile构建支持,prompt上传 ([7acd365](https://github.com/weicanie/prisma-ai/commit/7acd365eef40fa279da0d38f81816312f3e1c163))
- mcp client、mcp server、agnent support mcp tool ([b68105e](https://github.com/weicanie/prisma-ai/commit/b68105e917d394f20b93e8af4e77844a85cf5cca))
- refactor: event bus and SSE ([45295a9](https://github.com/weicanie/prisma-ai/commit/45295a996eb2922ed5e2c68e9a035d87decd98ba))
