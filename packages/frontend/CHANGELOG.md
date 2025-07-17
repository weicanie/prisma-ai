# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.3.0](https://github.com/weicanie/prisma-ai/compare/v3.2.0...v3.3.0) (2025-07-17)

### Features

- 优化CI/CD、镜像部署chrome ([af28314](https://github.com/weicanie/prisma-ai/commit/af28314d240ffb24fdfc3c946f9d907083f60825))

# [3.2.0](https://github.com/weicanie/prisma-ai/compare/v3.1.6...v3.2.0) (2025-07-16)

### Features

- 添加了gemini-2.5-pro、flash 的支持 ([b7ad6f9](https://github.com/weicanie/prisma-ai/commit/b7ad6f925772ae335a2de9178dee031ae70c8000))

## [3.1.3](https://github.com/weicanie/prisma-ai/compare/v3.1.2...v3.1.3) (2025-07-14)

### Bug Fixes

- nginx容器错误 ([6fa8e73](https://github.com/weicanie/prisma-ai/commit/6fa8e73b53f1f55be35bd0ef0a85a55a17bac731))

### Features

- 第三方模型的本地容器化部署 ([6efec70](https://github.com/weicanie/prisma-ai/commit/6efec7039c60a83f86f40c7c0185ca426cb01729))
- 简化部署，修复一些页面的黑屏问题 ([85c7882](https://github.com/weicanie/prisma-ai/commit/85c78827bc52fa8fd5bc0276694c78a35a31ab45))

## [3.1.2](https://github.com/weicanie/prisma-ai/compare/v3.1.1...v3.1.2) (2025-07-14)

### Bug Fixes

- docker test CI ([e0f6231](https://github.com/weicanie/prisma-ai/commit/e0f62316fe4d24eb65baacfb2ba7693cc7ae66fe))
- git windows大小写不区分与linux的兼容性问题\n\n导致docker test CI失败。开发环境git设置为区分大小写。 ([526b2d7](https://github.com/weicanie/prisma-ai/commit/526b2d7810ff78fefd2e73622ab2a7566672d08b))
- knowbase leftover ([1cc3666](https://github.com/weicanie/prisma-ai/commit/1cc3666983b1780deb15964a8a1aaf38000f20aa))

## [3.1.1](https://github.com/weicanie/prisma-ai/compare/v3.1.0...v3.1.1) (2025-07-14)

### Bug Fixes

- 修复docker CI和首页内容 ([a475140](https://github.com/weicanie/prisma-ai/commit/a475140b7f1c2b16628a741adf4e7e534904e3b9))

# [3.1.0](https://github.com/weicanie/prisma-ai/compare/v3.0.1...v3.1.0) (2025-07-13)

### Features

- 修复并升级项目的CI/CD ([39e4148](https://github.com/weicanie/prisma-ai/commit/39e4148b19c053ed040efee06a1dff868188f92c))

## [3.0.1](https://github.com/weicanie/prisma-ai/compare/v3.0.0...v3.0.1) (2025-07-13)

**Note:** Version bump only for package frontend

**Note:** Version bump only for package frontend

# [3.0.0](https://github.com/weicanie/prisma-ai/compare/v2.1.0...v3.0.0) (2025-07-11)

### Features

- 集成面试题库和 anki ([ae52e1f](https://github.com/weicanie/prisma-ai/commit/ae52e1f2f9953c595c279b684d9c9c35625ccdeb))
- 优化prompt、Agent CLI ([3d397e2](https://github.com/weicanie/prisma-ai/commit/3d397e23b1778e0938c85d277c1a67ca678f04e7))
- 重塑项目经验处理流程 ([899a624](https://github.com/weicanie/prisma-ai/commit/899a624c7a103070c0c394e1ddb335073271fbb3))

# [2.1.0](https://github.com/weicanie/prisma-ai/compare/v2.0.0...v2.1.0) (2025-06-30)

### Bug Fixes

- type error ([2f756ab](https://github.com/weicanie/prisma-ai/commit/2f756ab8a06d37470d65cb29e77ee3ff7c17485d))

### Features

- v2更新、完善 ([c3337df](https://github.com/weicanie/prisma-ai/commit/c3337df125184f88b9b370fcf8493db85b965c59))

# [2.0.0](https://github.com/weicanie/prisma-ai/compare/v1.0.0...v2.0.0) (2025-06-28)

### Features

- 实现项目亮点实现Agent ([7f5bfd1](https://github.com/weicanie/prisma-ai/commit/7f5bfd1fbf2e2220f4679e5684e38b331e23cf73))
- 提供agent配置功能 ([fdc0a6f](https://github.com/weicanie/prisma-ai/commit/fdc0a6f624f7d8aef85bea76a0b74ecd20f79c46))
- 完善项目需求实现Agent ([81b79f2](https://github.com/weicanie/prisma-ai/commit/81b79f2369cda0c33d38fb1a837cb1b344388ceb))
- 项目经验处理流程升级的前端实现 ([529e43e](https://github.com/weicanie/prisma-ai/commit/529e43e3e485d1cbc3f51478513d275a942f6667))
- 优化了职业技能表单的交互 ([9a479d7](https://github.com/weicanie/prisma-ai/commit/9a479d78ccadfc87bd74c911723b47037b4fdc3d))
- 知识库、Agent完善 ([5d94151](https://github.com/weicanie/prisma-ai/commit/5d941517ed1e83c79a7cad0f399d32f65ee48115))
- ai聊天功能 ([5301f42](https://github.com/weicanie/prisma-ai/commit/5301f4293857ef7fa49d33b402d33b940bdce3ea))

# 1.0.0 (2025-06-15)

### Bug Fixes

- 通过构建依赖图解决潜在的循环依赖问题、解决装饰器误用为Guard的问题 ([ebb7179](https://github.com/weicanie/prisma-ai/commit/ebb71790dd05439a32c16dee4fdb5fa976d0dec0))
- 消除stash冲突 ([e8b0bd0](https://github.com/weicanie/prisma-ai/commit/e8b0bd0f925c2bf1467177c28d0d97234beee332))
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
- 前后端sse接通 ([11a8f22](https://github.com/weicanie/prisma-ai/commit/11a8f227659089bd3596cc209c0489979792ad4e))
- 人岗匹配、本地OSS ([24e04b4](https://github.com/weicanie/prisma-ai/commit/24e04b4860c597ea30977fe771f73a434c5d25ce))
- 人岗匹配前端 ([6596c33](https://github.com/weicanie/prisma-ai/commit/6596c33e3377f3c598311aa5924fdb51e3332094))
- 增强了一些类型，完善readme、添加英文readme ([f47c8f2](https://github.com/weicanie/prisma-ai/commit/f47c8f265f24d4c4d0507b6ae92b47334e0e83f4))
- 支持断点续传的SSE、会话管理、集成redis的任务队列, llm缓存层 ([38ecb20](https://github.com/weicanie/prisma-ai/commit/38ecb20941865c3a7053b436da901f08eee1f930))
- 重构sse模块 ([96ff902](https://github.com/weicanie/prisma-ai/commit/96ff902aabf58a6ad6080e86c1eb43f388b741ca))
- add license ([0428a52](https://github.com/weicanie/prisma-ai/commit/0428a529a2396e19c68da99a7555cf5dc7c675ae))
- add readme.md ([a34681d](https://github.com/weicanie/prisma-ai/commit/a34681d349c336e4ffc82ec1e1980b4d5e365292))
- home page ([ed1506b](https://github.com/weicanie/prisma-ai/commit/ed1506bbb87167c323ec65e5c451a19dccd35900))
- mcp client、mcp server、agnent support mcp tool ([b68105e](https://github.com/weicanie/prisma-ai/commit/b68105e917d394f20b93e8af4e77844a85cf5cca))
- refactor: event bus and SSE ([45295a9](https://github.com/weicanie/prisma-ai/commit/45295a996eb2922ed5e2c68e9a035d87decd98ba))
