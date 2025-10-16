# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.2.0-beta.1](https://github.com/weicanie/prisma-ai/compare/v5.1.0...v5.2.0-beta.1) (2025-10-16)

### Features

- 区分线上部署与本地部署 ([2b1f503](https://github.com/weicanie/prisma-ai/commit/2b1f5034e886270bc59d58288dce002e87f7ab14))
- 优化UI ([19d735c](https://github.com/weicanie/prisma-ai/commit/19d735c3de860a57277111851bbe8d39b696e35f))
- nginx配置https ([51d04a4](https://github.com/weicanie/prisma-ai/commit/51d04a48d395a17f565f85028a9a4ccdb54ec25b))

# [5.1.0](https://github.com/weicanie/prisma-ai/compare/v5.0.2...v5.1.0) (2025-10-16)

### Bug Fixes

- 拼写错误 ([c1b4099](https://github.com/weicanie/prisma-ai/commit/c1b40995ccf11d71a6b7998059f06e4c343e449c))
- bitnami/minio:2025.4.3镜像无法拉取 ([160d98e](https://github.com/weicanie/prisma-ai/commit/160d98eafcfd580d71c303410c0736423fb81381))
- build failed ([090a51d](https://github.com/weicanie/prisma-ai/commit/090a51de4b99632031b3ddf199cd7204ccd2137f))
- userMemory prompt注入 ([e798448](https://github.com/weicanie/prisma-ai/commit/e7984485b0d112dc235fac8b1ddd01eed25aa4eb))

### Features

- 单用户文件存储 -> 多用户文件存储 ([44696e1](https://github.com/weicanie/prisma-ai/commit/44696e13904be389d4cce1057ea27984825af203))
- 用户配置功能 ([41f7e0b](https://github.com/weicanie/prisma-ai/commit/41f7e0b791b38eae6686c2020bbacaab86532257))

## [5.0.2](https://github.com/weicanie/prisma-ai/compare/v5.0.1...v5.0.2) (2025-10-08)

### Bug Fixes

- 岗位数据保存前校验字段的hook ([d196c4d](https://github.com/weicanie/prisma-ai/commit/d196c4ddc8e063f5910ffc5a887d2c50c00e1b1d))

## [5.0.1](https://github.com/weicanie/prisma-ai/compare/v5.0.0...v5.0.1) (2025-10-08)

### Bug Fixes

- 没有创建项目经验就开启ai对话 ([c30745e](https://github.com/weicanie/prisma-ai/commit/c30745eab36076f65a3e6bf269d3aebb00600996))

# [5.0.0](https://github.com/weicanie/prisma-ai/compare/v4.2.1...v5.0.0) (2025-10-02)

### Bug Fixes

- 导入路径 ([6bde1d8](https://github.com/weicanie/prisma-ai/commit/6bde1d8fba2d268215088ce83629a59681225fb7))
- prompt ([6903f49](https://github.com/weicanie/prisma-ai/commit/6903f499fd78334172c6b3d7ddca3438ba6d4cdc))

### Features

- 根据用户情况进行简历优化、人岗匹配 ([eea9b1f](https://github.com/weicanie/prisma-ai/commit/eea9b1f15f60df83b74c7a9b67e12307f0c0ddd6))
- 基本的ai对话功能 ([17c2659](https://github.com/weicanie/prisma-ai/commit/17c2659a22b99ea87bb27b18b34253c38454e559))
- 基于项目经验、用户memory、RAG的AI助手 ([e27d159](https://github.com/weicanie/prisma-ai/commit/e27d15993762d0af64e8c5ed5c7d7c570c7982fa))
- 完善高可用模型客户端 ([6ce008d](https://github.com/weicanie/prisma-ai/commit/6ce008d3bbc4958f209ef74cef04166aeacfff95))
- 完善ai对话功能 ([6b6e020](https://github.com/weicanie/prisma-ai/commit/6b6e020c13ecf6275f5f7e578dea85f23bf1093d))
- 完善UI ([36d5d91](https://github.com/weicanie/prisma-ai/commit/36d5d9165f4232d15ba0a1810bce48042e5c353c))
- 完善UI ([f1e0220](https://github.com/weicanie/prisma-ai/commit/f1e02201ec1bd3404ba0529afd69151087f8739e))
- 完善UI ([86fa696](https://github.com/weicanie/prisma-ai/commit/86fa6961305fdc733f2226148661d4d8d7b1b560))
- 项目业务的分析与文档生成 ([a4208ac](https://github.com/weicanie/prisma-ai/commit/a4208acd3b8d8df2fe65259b973fdef924397871))
- 用户记忆的展示与用户手动修改功能 ([ebc0b98](https://github.com/weicanie/prisma-ai/commit/ebc0b989bfa9e8081b41945c74b5f9aea3561e20))
- 用户输入、项目数据召回到的文档和代码，按相似度分数进行过滤 ([d9a7d04](https://github.com/weicanie/prisma-ai/commit/d9a7d04c85fea5e0608b771f509042cd2dee26c6))
- 用户memory功能 ([5e71018](https://github.com/weicanie/prisma-ai/commit/5e710187c6c9adf9df5d0d02b45d4e07b37d230f))
- **backend:** 完善项目知识库检索功能 ([49dbd6a](https://github.com/weicanie/prisma-ai/commit/49dbd6ac076a419a57a29616e86a1c8f846d5aaa))
- **backend:** 项目知识检索做三级缓存 ([39a9a6a](https://github.com/weicanie/prisma-ai/commit/39a9a6af8bd6d61008604e7d21671eb8afa7ac38))
- **frontend:** 完善UI ([c1bcac5](https://github.com/weicanie/prisma-ai/commit/c1bcac531c96f04fd519150344caec7d2f3901d7))
- **frontend:** 完善UI ([8c68f95](https://github.com/weicanie/prisma-ai/commit/8c68f959f89939c833314421faa1ff22d4c012af))

## [4.2.1](https://github.com/weicanie/prisma-ai/compare/v4.2.0...v4.2.1) (2025-09-24)

### Bug Fixes

- workflow ([895500a](https://github.com/weicanie/prisma-ai/commit/895500a382f9a7a9903039705e757f331a7e5106))

# [4.2.0](https://github.com/weicanie/prisma-ai/compare/v4.1.7...v4.2.0) (2025-09-24)

### Bug Fixes

- **backend:** 脚本权限问题 ([8c9658a](https://github.com/weicanie/prisma-ai/commit/8c9658a1c7b8d62a5c8560a21b08d36eb652419b))
- **frontend:** 简历组装的工作经历、教育经历丢失 ([a3a3bee](https://github.com/weicanie/prisma-ai/commit/a3a3bee90d867276ebee70b9e58c482c2840d4cc))

### Features

- 更新前端接口、UI ([d7436ed](https://github.com/weicanie/prisma-ai/commit/d7436edbc41b6880339ae30ccd288a74d71a6e58))
- 脚本、类型定义 ([2142842](https://github.com/weicanie/prisma-ai/commit/21428424f1da5f1f12eb2c8f957c6203e87b3574))
- 完善deepwiki知识库集成功能 ([489a45b](https://github.com/weicanie/prisma-ai/commit/489a45b4e7c6c86f516c3f53a440902bd72f6510))
- 优化UI ([a5f9bb3](https://github.com/weicanie/prisma-ai/commit/a5f9bb33f11f283bda9f12234bc22a4aec8e5e06))
- **backend:** deepwiki站点的下载和知识库上传接口 ([1ee6aba](https://github.com/weicanie/prisma-ai/commit/1ee6abae9b33b99e892e62c07810a7c26615370a))
- **deepwiki-down:** 通过拦截rsc请求来将deepwiki站点转为md文件 ([dc0dfc8](https://github.com/weicanie/prisma-ai/commit/dc0dfc82d40b84e9bc8705d714549b6a7bd0643f))
- **deepwiki-down:** 优化生成的目录文件 ([8eadce1](https://github.com/weicanie/prisma-ai/commit/8eadce1498542f570bf2bc5acbb36dfcb149c800))
- deepwiki-get init ([6795b89](https://github.com/weicanie/prisma-ai/commit/6795b89e639d63ad35698e4275b4577c85155913))
- deepwiki-get镜像发布与调用脚本 ([7004340](https://github.com/weicanie/prisma-ai/commit/7004340ba55c7fbd01cba8295c33e6345316109e))
- **frontend:** 优化路由和UI ([5ce5a95](https://github.com/weicanie/prisma-ai/commit/5ce5a95472af36c03a0e81eb81aa2fcd08761b5c))
- **frontend:** deepwiki站点知识库集成 ([6e3a98d](https://github.com/weicanie/prisma-ai/commit/6e3a98dae28ae8d2b60af9cdc802b830c66d0e92))

### Performance Improvements

- 懒加载antd ([6d46bd9](https://github.com/weicanie/prisma-ai/commit/6d46bd98eaf444a1d6f1105771862f476f3f99bb))

## [4.1.7](https://github.com/weicanie/prisma-ai/compare/v4.1.6...v4.1.7) (2025-09-17)

### Bug Fixes

- type error ([153cdde](https://github.com/weicanie/prisma-ai/commit/153cdde0a0ea53a65052d5a413821e261c01cf18))

## [4.1.6](https://github.com/weicanie/prisma-ai/compare/v4.1.5...v4.1.6) (2025-09-17)

### Bug Fixes

- 工作流参数 ([eba5898](https://github.com/weicanie/prisma-ai/commit/eba5898f80ea6325172aeca48ec0127c76273a55))
- 简历编辑器微前端支持 ([542849e](https://github.com/weicanie/prisma-ai/commit/542849eb47accd84cd352c33f565ca5afc1730a9))

### Features

- iframe嵌入与路由支持 ([3c60b36](https://github.com/weicanie/prisma-ai/commit/3c60b36876fab15e856dec788b8ed2dedd62d03f))

## [4.8.6](https://github.com/weicanie/prisma-ai/compare/v4.1.5...v4.8.6) (2025-09-16)

### Bug Fixes

- 工作流参数 ([eba5898](https://github.com/weicanie/prisma-ai/commit/eba5898f80ea6325172aeca48ec0127c76273a55))
- 简历编辑器微前端支持 ([542849e](https://github.com/weicanie/prisma-ai/commit/542849eb47accd84cd352c33f565ca5afc1730a9))

### Features

- iframe嵌入与路由支持 ([3c60b36](https://github.com/weicanie/prisma-ai/commit/3c60b36876fab15e856dec788b8ed2dedd62d03f))

## [4.1.5](https://github.com/weicanie/prisma-ai/compare/v4.1.4...v4.1.5) (2025-09-16)

**Note:** Version bump only for package root

## [4.1.4](https://github.com/weicanie/prisma-ai/compare/v4.1.3...v4.1.4) (2025-09-16)

### Bug Fixes

- 后端容器文件 ([73d4080](https://github.com/weicanie/prisma-ai/commit/73d40802a886c06fe8c2f7544f4bacc0c1b2b813))

## [4.1.3](https://github.com/weicanie/prisma-ai/compare/v4.1.2...v4.1.3) (2025-09-16)

### Bug Fixes

- 后端容器依赖 ([be1581b](https://github.com/weicanie/prisma-ai/commit/be1581b17cd022bfe1bd23bd4230dd4f2dbbe107))

## [4.1.2](https://github.com/weicanie/prisma-ai/compare/v4.1.1...v4.1.2) (2025-09-15)

### Bug Fixes

- 修复CI ([af8a386](https://github.com/weicanie/prisma-ai/commit/af8a386de19ed228540d5f5a2e5845b34a938073))

## [4.1.1](https://github.com/weicanie/prisma-ai/compare/v4.1.0...v4.1.1) (2025-09-15)

### Bug Fixes

- 修复CI ([4a6c643](https://github.com/weicanie/prisma-ai/commit/4a6c64353dece65023bbe2e4a59cdf280a91e62d))

# [4.1.0](https://github.com/weicanie/prisma-ai/compare/v4.0.1...v4.1.0) (2025-09-15)

### Bug Fixes

- **frontend:** type errors ([cdbd027](https://github.com/weicanie/prisma-ai/commit/cdbd0270cd036f6c0749163dfcd072bbef7e0502))
- **magic-resume:** docker build ([96e5eaf](https://github.com/weicanie/prisma-ai/commit/96e5eaf8af2f59195cb07c2992e84094b0cfb016))

### Features

- 工作经历、教育经历的CRUD UI ([c68aa12](https://github.com/weicanie/prisma-ai/commit/c68aa12c946511bf3ae6c10c0fcb98ff9acc393f))
- 工作经历、教育经历的CRUD接口 ([fd979e4](https://github.com/weicanie/prisma-ai/commit/fd979e49a8e9104897a6c8b96bfffd8dfd1e3015))
- 简历数据的内容更新 ([325ee79](https://github.com/weicanie/prisma-ai/commit/325ee7984bb28e7450412d19c2a3db6ee32cf8dd))
- 前端在sse连接出错时失效当前会话状态 ([996530d](https://github.com/weicanie/prisma-ai/commit/996530db8ce69af846a19ff1cbdbe7701d5b31d3))
- 通过qiankun + iframe微前端接入magic-resume ([72b4fad](https://github.com/weicanie/prisma-ai/commit/72b4fad6d2235484fac23acc682227e7be4ec7ef))
- 完善会话清除功能 ([6cd5508](https://github.com/weicanie/prisma-ai/commit/6cd55084731e4cc0eac880aef7dd53fbcb83db01))
- **backend:** 后端提供简历json文件数据源 ([c69fbe9](https://github.com/weicanie/prisma-ai/commit/c69fbe96a4cffe0be20f568a079cfb25cca0eb13))
- **frontend:** 进一步完善UI ([f713ea5](https://github.com/weicanie/prisma-ai/commit/f713ea57d844a2f39ba8e8e97bee77aa9149ed73))
- **frontend:** 完善前端UI ([4f652dc](https://github.com/weicanie/prisma-ai/commit/4f652dcb3102ec863b814505da12deaa9b4dfec8))
- magic resume init ([5f7e5c9](https://github.com/weicanie/prisma-ai/commit/5f7e5c9f08e1e3073676d2c5099729d313a54865))
- **magic-resume:** 和主应用同步主题 ([be94069](https://github.com/weicanie/prisma-ai/commit/be9406903e6a4093106475d4396021f9279cc46b))
- **magic-resume:** 简历数据CRUD拓展支持文件系统和数据库 ([d7977ff](https://github.com/weicanie/prisma-ai/commit/d7977ff490bb5385514437fdb60e41651e186c66))
- **magic-resume:** 去掉多余功能、定制UI ([00dffb4](https://github.com/weicanie/prisma-ai/commit/00dffb4bdfba3f408d7ab6a88506ae03fa410c46))
- **magic-resume:** 完善外部简历数据源接入支持 ([242e7eb](https://github.com/weicanie/prisma-ai/commit/242e7eba8a21374732588f8c86dea931dfb52a12))
- **magic-resume:** 完善微前端接入支持 ([3405fe2](https://github.com/weicanie/prisma-ai/commit/3405fe291c6ff123e7f14c3e17982a22974ab664))

## [4.0.1](https://github.com/weicanie/prisma-ai/compare/v4.0.0...v4.0.1) (2025-08-27)

### Bug Fixes

- 知识添加表单内容过高时无法滚动 ([ae90cf2](https://github.com/weicanie/prisma-ai/commit/ae90cf276896fc0b36fd53db2264ae51c4868bc9))

### Features

- 知识添加表单按钮fixed定位 ([bfb6cdc](https://github.com/weicanie/prisma-ai/commit/bfb6cdcd5472d2fdae08208beba1c004461b94a4))

# [4.0.0](https://github.com/weicanie/prisma-ai/compare/v3.6.3...v4.0.0) (2025-08-25)

### Features

- 为hub更新anki配置文件 ([610a05b](https://github.com/weicanie/prisma-ai/commit/610a05bbfe395a2e08db3b2f3d5493540cd691c0))

**Note:** Version bump only for package root

## [3.6.3](https://github.com/weicanie/prisma-ai/compare/v3.6.2...v3.6.3) (2025-08-18)

### Bug Fixes

- 前端爬虫任务取消 ([6c3bdcb](https://github.com/weicanie/prisma-ai/commit/6c3bdcb3e0ed2097b1c858c82b3d93176ff56827))

## [3.6.2](https://github.com/weicanie/prisma-ai/compare/v3.6.1...v3.6.2) (2025-08-18)

### Bug Fixes

- add cors config ([cd9f25a](https://github.com/weicanie/prisma-ai/commit/cd9f25a34584e3dc041f18e800c26dff1b51f763))
- port ([2b82f5b](https://github.com/weicanie/prisma-ai/commit/2b82f5bff285fdcc89dc986006d9e977274a916a))
- port ([6d0e4fd](https://github.com/weicanie/prisma-ai/commit/6d0e4fd0a27f3cc383cf198f71980a1b38602d1b))

### Features

- 更新前端爬虫任务状态 ([5ac782b](https://github.com/weicanie/prisma-ai/commit/5ac782b7f383c0f2f16a2a0de20a7013e96d5d1e))
- 更新前端爬虫任务状态 ([385dd42](https://github.com/weicanie/prisma-ai/commit/385dd42d616ef939e485ef5affc89b0945f86d16))

## [3.6.1](https://github.com/weicanie/prisma-ai/compare/v3.6.0...v3.6.1) (2025-08-12)

### Bug Fixes

- frontend build ([2f793a4](https://github.com/weicanie/prisma-ai/commit/2f793a4478b854f12e425b086137b293c48297f3))

# [3.6.0](https://github.com/weicanie/prisma-ai/compare/v3.5.1...v3.6.0) (2025-08-12)

### Bug Fixes

- 登出时的react-query缓存遗留 ([4eb3faf](https://github.com/weicanie/prisma-ai/commit/4eb3faf0e75e2b2e6c16039b1bf64336c028bafd))
- 前端会话锁的释放 ([8336a0a](https://github.com/weicanie/prisma-ai/commit/8336a0a30e8f77fa284222f4845937bd95206630))
- 任务错误终止时前端阻塞 ([4fc8afe](https://github.com/weicanie/prisma-ai/commit/4fc8afef1e1d129acf348cc5eb79bc3bb32c39c9))
- 任务失败杀死线程 ([9e5f4af](https://github.com/weicanie/prisma-ai/commit/9e5f4aff4308d6f7af95f545cd3da3b0df28c6b0))

### Features

- 更新文本 ([324f75c](https://github.com/weicanie/prisma-ai/commit/324f75caa15505ceb26befc385c490860b11ebf5))
- 职业技能表单支持md编辑器 ([0792ab0](https://github.com/weicanie/prisma-ai/commit/0792ab0296ea6740a323a57c71e35e1e3064ff13))
- saas落地页与配套登录注册页 ([e7b1ed4](https://github.com/weicanie/prisma-ai/commit/e7b1ed4d952d23f354e48e4bb4aeed8e7976e630))

## [3.5.1](https://github.com/weicanie/prisma-ai/compare/v3.5.0...v3.5.1) (2025-08-01)

### Bug Fixes

- 修复了后端服务日志目录的权限问题 ([184356b](https://github.com/weicanie/prisma-ai/commit/184356b64f77a716010e6e0b59648747b0909f1d))

### Features

- 简化了Anki集成 ([5cb1633](https://github.com/weicanie/prisma-ai/commit/5cb1633a2000eebb3801a9d37da3ef96676f2d60))

# [3.5.0](https://github.com/weicanie/prisma-ai/compare/v3.4.0...v3.5.0) (2025-08-01)

### Bug Fixes

- add mirror to chrome image ([6ab2f26](https://github.com/weicanie/prisma-ai/commit/6ab2f26b59cf4504bc000bf05963e8e3adcf178d))
- 修复表格 ([854b0a8](https://github.com/weicanie/prisma-ai/commit/854b0a896c5ca2d70384eb093327f9bfd2276077))

### Features

- 面经的上传、处理 ([8e765e7](https://github.com/weicanie/prisma-ai/commit/8e765e796667d434b435d71cf99808a387f02788))
- 完善数据表格组件 ([e5c9c64](https://github.com/weicanie/prisma-ai/commit/e5c9c6461c073f4a2d90ad56ed3eaa688258621f))
- 完善hub文档 ([76a0d5d](https://github.com/weicanie/prisma-ai/commit/76a0d5dc7e3b23c867059cac12685e7364e94c1b))

# [3.4.0](https://github.com/weicanie/prisma-ai/compare/v3.3.5...v3.4.0) (2025-07-19)

### Features

- 完善、优化了人岗匹配和简历定制 ([7d71449](https://github.com/weicanie/prisma-ai/commit/7d714490ac62ece4ab2cbfc23fd0a9ccaee4c35d))

## [3.3.5](https://github.com/weicanie/prisma-ai/compare/v3.3.4...v3.3.5) (2025-07-18)

**Note:** Version bump only for package root

## [3.3.4](https://github.com/weicanie/prisma-ai/compare/v3.3.3...v3.3.4) (2025-07-18)

**Note:** Version bump only for package root

## [3.3.3](https://github.com/weicanie/prisma-ai/compare/v3.3.2...v3.3.3) (2025-07-18)

### Bug Fixes

- fix CI ([6b16cd8](https://github.com/weicanie/prisma-ai/commit/6b16cd8186a2c18eb040a16e4fb4aabe5757ff17))

## [3.3.2](https://github.com/weicanie/prisma-ai/compare/v3.3.1...v3.3.2) (2025-07-18)

### Bug Fixes

- 修复人岗匹配服务的一些错误 ([b358e59](https://github.com/weicanie/prisma-ai/commit/b358e598c63ad3d6a0986770f0a60f3a7460d9a2))

### Features

- 完善CI流程 ([e7ebab8](https://github.com/weicanie/prisma-ai/commit/e7ebab8780b4f3ebd07b8c288b0cb60825dabf99))

## [3.3.1](https://github.com/weicanie/prisma-ai/compare/v3.3.0...v3.3.1) (2025-07-17)

### Bug Fixes

- 修复CI/CD错误 ([fad6fb7](https://github.com/weicanie/prisma-ai/commit/fad6fb780c6573640fd784ce66a2d63f94f299bf))

# [3.3.0](https://github.com/weicanie/prisma-ai/compare/v3.2.0...v3.3.0) (2025-07-17)

### Features

- 优化CI/CD、镜像部署chrome ([af28314](https://github.com/weicanie/prisma-ai/commit/af28314d240ffb24fdfc3c946f9d907083f60825))

# [3.2.0](https://github.com/weicanie/prisma-ai/compare/v3.1.6...v3.2.0) (2025-07-16)

### Bug Fixes

- 修复了项目实现Agent的路由等错误 ([7d775cd](https://github.com/weicanie/prisma-ai/commit/7d775cdce28ebbfcc606a2ff929324abf1d5d145))

### Features

- 更新、完善了文档 ([157da65](https://github.com/weicanie/prisma-ai/commit/157da65f718df4666e1064f1a4d3bea5bbc8f900))
- 添加了gemini-2.5-pro、flash 的支持 ([b7ad6f9](https://github.com/weicanie/prisma-ai/commit/b7ad6f925772ae335a2de9178dee031ae70c8000))

## [3.1.6](https://github.com/weicanie/prisma-ai/compare/v3.1.5...v3.1.6) (2025-07-15)

### Bug Fixes

- clone脚本丢失导致的项目代码无法上传问题 ([798586c](https://github.com/weicanie/prisma-ai/commit/798586cd4f006b1fafe44a730710fccec11338dc))

### Features

- 自动release的workflow ([585b631](https://github.com/weicanie/prisma-ai/commit/585b6313c90f9afb4403ddac8ef14b1efb1d92b8))

## [3.1.5](https://github.com/weicanie/prisma-ai/compare/v3.1.4...v3.1.5) (2025-07-14)

### Bug Fixes

- 修复已知问题 ([5d7d7ef](https://github.com/weicanie/prisma-ai/commit/5d7d7efa2a6b08b8966ff200d14dc56dad3d146f))

### Features

- 添加版本更新命令 ([2acb48e](https://github.com/weicanie/prisma-ai/commit/2acb48e45882bfb2c81d722da8f3ae64f6aea572))

## [3.1.4](https://github.com/weicanie/prisma-ai/compare/v3.1.3...v3.1.4) (2025-07-14)

### Bug Fixes

- docker CI文件路径问题 ([1108c21](https://github.com/weicanie/prisma-ai/commit/1108c21b5e79a077302dc35511519bde9d566ff2))
- docker CI文件路径问题 ([c00c696](https://github.com/weicanie/prisma-ai/commit/c00c696aeb4a3adca1a129e5edac3478acfaa791))

## [3.1.3](https://github.com/weicanie/prisma-ai/compare/v3.1.2...v3.1.3) (2025-07-14)

### Bug Fixes

- nginx容器错误 ([6fa8e73](https://github.com/weicanie/prisma-ai/commit/6fa8e73b53f1f55be35bd0ef0a85a55a17bac731))

### Features

- 第三方模型的本地容器化部署 ([6efec70](https://github.com/weicanie/prisma-ai/commit/6efec7039c60a83f86f40c7c0185ca426cb01729))
- 简化部署，修复一些页面的黑屏问题 ([85c7882](https://github.com/weicanie/prisma-ai/commit/85c78827bc52fa8fd5bc0276694c78a35a31ab45))
- 简化jwt部署 ([ceba409](https://github.com/weicanie/prisma-ai/commit/ceba409fabe4b8d04a58f876baed9f9d946d8b49))
- 教程文档完善 ([d58a49d](https://github.com/weicanie/prisma-ai/commit/d58a49d3292d85abeb36eddb6fdf5e0cd70b35da))

## [3.1.2](https://github.com/weicanie/prisma-ai/compare/v3.1.1...v3.1.2) (2025-07-14)

### Bug Fixes

- docker test CI ([e0f6231](https://github.com/weicanie/prisma-ai/commit/e0f62316fe4d24eb65baacfb2ba7693cc7ae66fe))
- git windows大小写不区分与linux的兼容性问题\n\n导致docker test CI失败。开发环境git设置为区分大小写。 ([526b2d7](https://github.com/weicanie/prisma-ai/commit/526b2d7810ff78fefd2e73622ab2a7566672d08b))
- knowbase leftover ([1cc3666](https://github.com/weicanie/prisma-ai/commit/1cc3666983b1780deb15964a8a1aaf38000f20aa))

## [3.1.1](https://github.com/weicanie/prisma-ai/compare/v3.1.0...v3.1.1) (2025-07-14)

### Bug Fixes

- 修复docker CI和首页内容 ([a475140](https://github.com/weicanie/prisma-ai/commit/a475140b7f1c2b16628a741adf4e7e534904e3b9))

# [3.1.0](https://github.com/weicanie/prisma-ai/compare/v3.0.1...v3.1.0) (2025-07-13)

### Bug Fixes

- dockerfile for publish ([423d696](https://github.com/weicanie/prisma-ai/commit/423d696de05e4667d5f89517474d5efe2b527dba))
- dockerfile for publish ([c55e680](https://github.com/weicanie/prisma-ai/commit/c55e680ec391467d94ccb665c47ded52da63cf9e))
- fix CI ([7c887d9](https://github.com/weicanie/prisma-ai/commit/7c887d99332109a4875b1f55e521e21958188ff6))
- update CI_docker_image_build.yml ([9be4bac](https://github.com/weicanie/prisma-ai/commit/9be4baca30d1634cb0c9dae50d4edf718b76708b))

### Features

- 完善CI流程 ([bfdee36](https://github.com/weicanie/prisma-ai/commit/bfdee365ad8c7d3d44d9cee71f56c7ff99683ae1))
- 修复并升级项目的CI/CD ([39e4148](https://github.com/weicanie/prisma-ai/commit/39e4148b19c053ed040efee06a1dff868188f92c))

## [3.0.1](https://github.com/weicanie/prisma-ai/compare/v3.0.0...v3.0.1) (2025-07-13)

### Bug Fixes

- docker构建的要复制目录丢失问题 ([eeaeab4](https://github.com/weicanie/prisma-ai/commit/eeaeab490df9b5ea39dd1af684cc6da457930a44))
- docker构建的要复制目录丢失问题 ([fceeaac](https://github.com/weicanie/prisma-ai/commit/fceeaac145874553b53e7b58dc4b52c92f674d1e))
- tag v3.0.0 missed ([fbb9001](https://github.com/weicanie/prisma-ai/commit/fbb9001d089b80d655ef0930130b1f4e7f4d38d6))

### Features

- 完善文档和readme ([c76d584](https://github.com/weicanie/prisma-ai/commit/c76d5843ae7a4885faa3067dd4586269242da789))
- v3.0.1 ([d9c8794](https://github.com/weicanie/prisma-ai/commit/d9c87943e80becfd365a55470dd0aa74548fc7da))

**Note:** Version bump only for package root

# [3.0.0](https://github.com/weicanie/prisma-ai/compare/v2.1.0...v3.0.0) (2025-07-11)

### Features

- 集成 cursor agent的 mcp server初步实现 ([7c22acf](https://github.com/weicanie/prisma-ai/commit/7c22acf680197dfcf709c6dfc00c0650c1bf56fc))
- 集成面试题库和 anki ([ae52e1f](https://github.com/weicanie/prisma-ai/commit/ae52e1f2f9953c595c279b684d9c9c35625ccdeb))
- 项目代码知识库增量构建 ([56aaaa0](https://github.com/weicanie/prisma-ai/commit/56aaaa0c115dcb6b5c66ba47790125bf5b7a7857))
- 优化prompt、Agent CLI ([3d397e2](https://github.com/weicanie/prisma-ai/commit/3d397e23b1778e0938c85d277c1a67ca678f04e7))
- 重塑项目经验处理流程 ([899a624](https://github.com/weicanie/prisma-ai/commit/899a624c7a103070c0c394e1ddb335073271fbb3))

# [2.1.0](https://github.com/weicanie/prisma-ai/compare/v2.0.0...v2.1.0) (2025-06-30)

### Bug Fixes

- type error ([2f756ab](https://github.com/weicanie/prisma-ai/commit/2f756ab8a06d37470d65cb29e77ee3ff7c17485d))

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
- 项目经验处理流程升级的前端实现 ([529e43e](https://github.com/weicanie/prisma-ai/commit/529e43e3e485d1cbc3f51478513d275a942f6667))
- 优化了职业技能表单的交互 ([9a479d7](https://github.com/weicanie/prisma-ai/commit/9a479d78ccadfc87bd74c911723b47037b4fdc3d))
- 知识库、Agent完善 ([5d94151](https://github.com/weicanie/prisma-ai/commit/5d941517ed1e83c79a7cad0f399d32f65ee48115))
- ai聊天功能 ([5301f42](https://github.com/weicanie/prisma-ai/commit/5301f4293857ef7fa49d33b402d33b940bdce3ea))

# 1.0.0 (2025-06-15)

### Bug Fixes

- 解决docker容器内SBERT模型部署的依赖问题 ([81b8e22](https://github.com/weicanie/prisma-ai/commit/81b8e22129926c041d5c6ead87ca2166d959661d))
- 通过构建依赖图解决潜在的循环依赖问题、解决装饰器误用为Guard的问题 ([ebb7179](https://github.com/weicanie/prisma-ai/commit/ebb71790dd05439a32c16dee4fdb5fa976d0dec0))
- 消除stash冲突 ([e8b0bd0](https://github.com/weicanie/prisma-ai/commit/e8b0bd0f925c2bf1467177c28d0d97234beee332))
- 修正lint-staged配置问题 ([883fa23](https://github.com/weicanie/prisma-ai/commit/883fa239f09fe7abd297051ebd4df3f7c99e49cf))
- clean some waring ([dba5591](https://github.com/weicanie/prisma-ai/commit/dba5591c6eb3cee6af94b5cc3ca55a041efbe416))

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
- 人岗匹配前端 ([6596c33](https://github.com/weicanie/prisma-ai/commit/6596c33e3377f3c598311aa5924fdb51e3332094))
- 完成了生产环境人岗匹配服务的测试、完善 ([df8c3fb](https://github.com/weicanie/prisma-ai/commit/df8c3fb2d6a96a506e1988bf3f120871c0a0282a))
- 完成人岗匹配chain ([3917c69](https://github.com/weicanie/prisma-ai/commit/3917c6907dc4eccd798f4e1fc29c55f26a8d1553))
- 增强了一些类型，完善readme、添加英文readme ([f47c8f2](https://github.com/weicanie/prisma-ai/commit/f47c8f265f24d4c4d0507b6ae92b47334e0e83f4))
- 支持断点续传的SSE、会话管理、集成redis的任务队列, llm缓存层 ([38ecb20](https://github.com/weicanie/prisma-ai/commit/38ecb20941865c3a7053b436da901f08eee1f930))
- 重构sse模块 ([96ff902](https://github.com/weicanie/prisma-ai/commit/96ff902aabf58a6ad6080e86c1eb43f388b741ca))
- add license ([0428a52](https://github.com/weicanie/prisma-ai/commit/0428a529a2396e19c68da99a7555cf5dc7c675ae))
- add readme.md ([a34681d](https://github.com/weicanie/prisma-ai/commit/a34681d349c336e4ffc82ec1e1980b4d5e365292))
- docker支持、缓存配置 ([05d33f6](https://github.com/weicanie/prisma-ai/commit/05d33f62c144bf79c3559cd9d2a8bc22cf612ff5))
- docker支持完善 ([b810676](https://github.com/weicanie/prisma-ai/commit/b810676b95d3ecf8b96b81d8e09c0d31afc15440))
- dockerfile构建支持,prompt上传 ([7acd365](https://github.com/weicanie/prisma-ai/commit/7acd365eef40fa279da0d38f81816312f3e1c163))
- home page ([ed1506b](https://github.com/weicanie/prisma-ai/commit/ed1506bbb87167c323ec65e5c451a19dccd35900))
- mcp client、mcp server、agnent support mcp tool ([b68105e](https://github.com/weicanie/prisma-ai/commit/b68105e917d394f20b93e8af4e77844a85cf5cca))
- refactor: event bus and SSE ([45295a9](https://github.com/weicanie/prisma-ai/commit/45295a996eb2922ed5e2c68e9a035d87decd98ba))
- update readme ([eb5a6a4](https://github.com/weicanie/prisma-ai/commit/eb5a6a43216ac5aaf20554d364c5fe59f212be35))
