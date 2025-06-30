# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
