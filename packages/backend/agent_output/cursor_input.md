

## 角色
你是一个经验丰富的全栈开发工程师。

## 指令
你必须严格遵循用户的指令，并使用你强大的技术能力来完成任务。
1.  **阅读并理解**：仔细阅读 "任务" 和 "上下文信息" 部分，确保你完全理解需要做什么以及所有可用的参考信息。
2.  **执行任务**：根据 "实现细节计划" 编码。在编码时，请充分利用 "上下文信息" 中提供的代码和知识。
3.  **输出结果**：任务完成后，你需要按照以下格式提供反馈：
	- **修改/新增的代码文件 (writtenCodeFiles)**: 一个文件列表，包含你修改或创建的所有代码文件的相对路径和对该文件修改的简要总结。
	- **执行总结 (summary)**: 对本次任务完成情况的总体总结。

这是一个输出示例：
```json
{
	"output": {
		"writtenCodeFiles": [
			{
				"relativePath": "src/modules/auth/auth.service.ts",
				"summary": "新增 login 和 register 方法。"
			},
			{
				"relativePath": "src/modules/auth/auth.controller.ts",
				"summary": "添加 /login 和 /register 路由。"
			}
		],
		"summary": "用户认证功能开发完成，符合预期。"
	}
}
```


## 任务：
根据下文提供的 "步骤需求分析" 和 "实现细节计划"，完成编码任务。

## 步骤需求分析:
### **需求分析：步骤一 - 后端简历数据持久化 API 实现**

**1. 核心目标**

本步骤的核心目标是使用 NestJS 框架构建一套稳定、可靠的 RESTful API，用于对简历数据进行完整的 CRUD (创建、读取、更新、删除) 操作。此 API 将作为整个重构项目中唯一的简历数据来源（Single Source of Truth），为后续的前端开发提供数据持久化服务。数据将存储在服务器本地的单个 `db.json` 文件中，以满足项目“个人使用”和快速开发的核心要求。

**2. 数据模型与存储**

*   **数据结构:** API 的核心数据模型（`ResumeData`）必须严格遵循原项目 `src/config/initialResumeData.ts` 中定义的 TypeScript 类型。这包括 `basic`, `education`, `experience`, `projects`, `skillContent` 等所有字段。这将作为后续定义 DTO (Data Transfer Object) 的基础。
*   **存储文件 (`db.json`):**
    *   **位置:** 该文件应存储在 NestJS 项目根目录下的 `data/db.json`。服务启动时若目录或文件不存在，应能自动创建。
    *   **内部结构:** `db.json` 的内容应为一个 JSON 对象，其结构为 `Record<string, ResumeData>`。其中，`key` 是简历的唯一ID (UUID)，`value` 是完整的简历数据对象。示例：
        ```json
        {
          "c8a9f3b2-b1e4-4a2d-8f6c-7e9b0d1a3c5d": { ...ResumeData object... },
          "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6": { ...ResumeData object... }
        }
        ```

**3. 功能性需求 (API 端点定义)**

**3.1. `POST /api/resumes` - 创建简历**

*   **描述:** 接收一份简历的初始数据，为其分配一个唯一的ID和时间戳，并将其存入 `db.json`。
*   **请求体 (Request Body):** 必须是一个符合 `ResumeData` 结构的 JSON 对象。前端发送时**不应**包含 `id`, `createdAt`, `updatedAt` 字段，即使包含，服务器也必须忽略并重新生成。
*   **处理流程:**
    1.  使用 `class-validator` 验证请求体数据的有效性（例如，`title` 字段不能为空）。
    2.  调用 `uuid` 库生成一个 V4 UUID作为简历的唯一 `id`。
    3.  获取当前服务器时间，生成 ISO 8601 格式的字符串作为 `createdAt` 和 `updatedAt` 的值。
    4.  将生成的 `id` 和时间戳与请求体数据合并，形成完整的 `ResumeData` 对象。
    5.  以原子方式读取并更新 `db.json`，将新的简历条目添加进去。
*   **成功响应 (Success):** `201 Created`。响应体必须包含完整且新创建的简历对象（包括服务器生成的 `id` 和时间戳）。
*   **失败响应 (Error):**
    *   `400 Bad Request`: 请求体验证失败。
    *   `500 Internal Server Error`: 文件读写操作失败。

**3.2. `GET /api/resumes` - 获取所有简历**

*   **描述:** 从 `db.json` 中读取所有简历数据，并以列表形式返回。
*   **处理流程:**
    1.  读取 `db.json` 文件。
    2.  将文件中的 JSON 对象（`Record<string, ResumeData>`）转换为一个 `ResumeData` 对象的数组。
    3.  返回该数组。
*   **成功响应 (Success):** `200 OK`。响应体为一个 JSON 数组。如果 `db.json` 为空或不存在，应返回一个空数组 `[]`。
*   **失败响应 (Error):** `500 Internal Server Error`: 文件读取操作失败。

**3.3. `GET /api/resumes/:id` - 获取单个简历**

*   **描述:** 根据提供的简历ID，返回对应的简历数据。
*   **URL 参数:** `id` (string) - 目标简历的 UUID。
*   **处理流程:**
    1.  读取 `db.json` 文件。
    2.  在数据中查找与 URL 参数 `id` 匹配的简历。
    3.  如果找到，返回该简历对象。
    4.  如果未找到，必须抛出 NestJS 的 `NotFoundException`。
*   **成功响应 (Success):** `200 OK`。响应体为找到的单个 `ResumeData` JSON 对象。
*   **失败响应 (Error):**
    *   `404 Not Found`: 未找到具有指定 `id` 的简历。
    *   `500 Internal Server Error`: 文件读取操作失败。

**3.4. `PUT /api/resumes/:id` - 更新简历**

*   **描述:** 使用请求体中的数据完全替换指定ID的简历内容。
*   **URL 参数:** `id` (string) - 目标简历的 UUID。
*   **请求体 (Request Body):** 必须是一个完整的、有效的 `ResumeData` 结构的对象。
*   **处理流程:**
    1.  `class-validator` 验证请求体。
    2.  原子性地读取 `db.json` 并查找指定 `id` 的简历。如果不存在，抛出 `NotFoundException`。
    3.  获取当前服务器时间，更新 `updatedAt` 字段。
    4.  用请求体中的数据替换原有的简历数据。**注意：** 必须保留原有的 `id` 和 `createdAt` 字段，不能被请求体覆盖。
    5.  将更新后的整个数据结构原子性地写回 `db.json`。
*   **成功响应 (Success):** `200 OK`。响应体为完整更新后的 `ResumeData` 对象。
*   **失败响应 (Error):**
    *   `400 Bad Request`: 请求体验证失败。
    *   `404 Not Found`: 未找到具有指定 `id` 的简历。
    *   `500 Internal Server Error`: 文件读写操作失败。

**3.5. `DELETE /api/resumes/:id` - 删除简历**

*   **描述:** 根据ID从 `db.json` 中永久删除一个简历条目。
*   **URL 参数:** `id` (string) - 目标简历的 UUID。
*   **处理流程:**
    1.  原子性地读取 `db.json` 并检查指定 `id` 是否存在。如果不存在，抛出 `NotFoundException`。
    2.  从数据结构中删除该 `id` 对应的键值对。
    3.  将更新后的数据结构原子性地写回 `db.json`。
*   **成功响应 (Success):** `204 No Content`。响应体为空。
*   **失败响应 (Error):**
    *   `404 Not Found`: 未找到具有指定 `id` 的简历。
    *   `500 Internal Server Error`: 文件读写操作失败。

**4. 非功能性需求**

*   **NFR-1: 原子文件操作:** 对 `db.json` 的所有写操作（创建、更新、删除）必须是原子的，以防止在并发请求（虽然概率低）或进程中断时导致数据文件损坏。必须采用“读取 -> 内存修改 -> 写入临时文件 -> 安全重命名”的策略。
*   **NFR-2: 输入验证:** 必须为 `POST` 和 `PUT` 请求创建 DTO，并使用 `class-validator` 和 `class-transformer` 库对所有传入数据进行严格的类型和内容校验。对于嵌套对象（如 `basic`, `education` 数组），必须使用 `@ValidateNested({ each: true })` 进行深度验证。
*   **NFR-3: 错误处理:** API 必须遵循标准的 HTTP 语义。使用 NestJS 内置的异常过滤器，为客户端错误（如400, 404）和服务器错误（500）返回统一、明确的 JSON 格式错误信息。

**5. 与项目中其他部分的关系**

*   **上游依赖:** 无。这是第一个被执行的后端开发步骤。
*   **下游消费者:** 此 API 是后续所有前端步骤（特别是步骤 5 和 6）的直接依赖。API 的 URL 结构、请求/响应体的数据模型以及错误处理机制一旦确定，将成为前后端之间的服务契约。任何对此契约的改动都需要与前端开发同步。

## 实现细节计划:

### 步骤 1: 步骤 1: 初始化 NestJS 项目并安装核心依赖。使用 NestJS CLI 创建一个新的后端项目，并安装 `uuid` 用于生成唯一ID，`class-validator` 和 `class-transformer` 用于数据校验与转换。
- **技术栈**: NestJS CLI, npm/yarn, TypeScript, uuid, class-validator, class-transformer
- **难点解决方案**: 
  - 使用 `nest new backend-api` 命令生成项目，此命令会自动安装 NestJS 核心库的兼容版本，从根源上解决版本兼容性问题。后续添加 `uuid`, `class-validator`, `class-transformer` 等依赖时，安装其最新的稳定版本即可。
  - NestJS CLI 生成的 `tsconfig.json` 默认已启用装饰器所需的 `experimentalDecorators` 和 `emitDecoratorMetadata` 选项。我们将验证这些配置的存在，并添加 `"strictPropertyInitialization": false` 以避免在 DTO 类中因未在构造函数中初始化所有属性而产生的 TypeScript 编译错误。
- **疑问澄清**:
  - 是的，项目必须遵循统一的代码规范。我们将使用项目初始化时自带的 ESLint 配置，并集成 Prettier 以强制代码格式化。具体操作：1. 安装 `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`。2. 创建 `.prettierrc` 配置文件。3. 配置 pre-commit 钩子（使用 Husky 和 lint-staged），在每次提交前自动格式化代码，确保所有提交到代码库的代码风格一致。

### 步骤 2: 步骤 2: 创建简历数据的 DTO (Data Transfer Objects)。根据 `src/config/initialResumeData.ts` 中的 `ResumeData` 类型，定义详细的 DTO 类。这将包括 `CreateResumeDto` 和 `UpdateResumeDto`，并为所有属性（包括嵌套对象和数组）添加 `class-validator` 装饰器以实现深度验证。
- **技术栈**: TypeScript, class-validator, class-transformer
- **难点解决方案**: 
  - 为每个嵌套对象（如 `basic`, `education`）创建独立的 DTO 类（如 `BasicDto`, `EducationDto`）。在主 DTO (`CreateResumeDto`) 中，使用 `@ValidateNested({ each: true })` 装饰器来校验数组中的每个对象，并必须配合使用 `@Type(() => EducationDto)` 以告知 `class-transformer` 在转换时应使用的具体类。
  - 对于富文本HTML字符串字段（如 `description`），将使用 `@IsString()` 装饰器进行基础类型验证。考虑到这是一个个人项目且输入源是可控的前端富文本编辑器，暂不实现复杂的XSS过滤，但会在代码注释中明确指出该字段内容应由前端进行净化处理，以备后续安全审计。
  - 为确保前后端类型一致，将在后端项目 `src/types` 目录下创建一个 `resume.types.ts` 文件，其内容将直接从前端 `src/types/resume.ts` 复制而来。所有 DTO 类将实现（implements）这些共享的接口。这是一种在非 Monorepo 架构下保持同步的务实策略，并将在文件中添加注释，提醒开发者手动同步。
- **疑问澄清**:
  - 已澄清：`PUT` 请求用于“完全替换”。因此，`UpdateResumeDto` 将包含简历中所有用户可编辑的字段，且所有字段均为必填（除非业务上允许为空），这与 `CreateResumeDto` 基本一致。该 DTO 不同于用于部分更新（PATCH）的 DTO，后者所有字段都将是可选的。

### 步骤 3: 步骤 3: 实现原子化的 JSON 文件存储服务。创建一个可注入的 `JsonStorageService`，专门负责对 `data/db.json` 文件的读写。写操作必须遵循“读取 -> 内存修改 -> 写入临时文件 -> 重命名”的原子模式，以防止数据损坏。服务启动时需检查并创建 `data` 目录和 `db.json` 文件。
- **技术栈**: Node.js `fs/promises` API, NestJS Dependency Injection
- **难点解决方案**: 
  - 原子写入将通过 `fs/promises` 实现：1. 将新内容用 `JSON.stringify` 转换后写入一个临时文件，例如 `db.json.tmp.{timestamp}`。2. 写入成功后，使用 `fs.rename` 将临时文件重命名为 `db.json`。`rename` 操作在大多数操作系统上是原子性的，能保证不会读到写了一半的损坏文件。所有步骤都将包含在 `try/catch/finally` 块中，确保即使操作失败也能清理临时文件。
  - 为确保路径的准确性，将使用 Node.js 的 `path` 模块和 `process.cwd()` 来构造绝对路径，例如 `path.resolve(process.cwd(), 'data', 'db.json')`。这可以避免因服务启动目录不同而导致的文件路径错误。在服务实例化时，会异步检查目录是否存在，若不存在则使用 `fs.mkdir(path, { recursive: true })` 创建。
  - 所有文件I/O操作将严格使用 `fs/promises` 模块提供的异步方法，例如 `readFile`, `writeFile`, `rename`。服务中的所有方法都将定义为 `async`，返回 `Promise`，以避免阻塞事件循环，保证应用的高性能。
- **疑问澄清**:
  - 已澄清：本项目场景下无需复杂的并发锁定。Node.js 的单线程事件循环模型会依次处理收到的请求。结合文件重命名的原子性，可以有效防止在单个节点内的并发写入冲突和数据损坏。因此，我们将不实现额外的文件锁或内存锁机制，以保持实现的简洁性。

### 步骤 4: 步骤 4: 创建 `Resumes` 模块、控制器和服务。使用 NestJS CLI 生成 `ResumesModule`, `ResumesController`, 和 `ResumesService`。在模块中正确组织和声明这些组件，并注入 `JsonStorageService` 到 `ResumesService` 中。
- **技术栈**: NestJS CLI, NestJS Modules
- **难点解决方案**: 
  - 为保证依赖注入的正确配置和模块化，`JsonStorageService` 将被封装在一个独立的 `StorageModule` 中，并从该模块中导出。`ResumesModule` 将在其 `imports` 数组中导入 `StorageModule`。然后，`ResumesService` 就可以通过构造函数 `constructor(private readonly storageService: JsonStorageService)` 安全地注入并使用 `JsonStorageService` 的实例。
- **疑问澄清**:


### 步骤 5: 步骤 5: 实现创建简历 (POST /api/resumes) 的逻辑。在 `ResumesService` 中创建 `create` 方法，该方法接收 `CreateResumeDto`，生成 `id` (UUID V4)、`createdAt` 和 `updatedAt` 时间戳，组合成完整的简历对象，然后调用 `JsonStorageService` 持久化。控制器方法应返回 `201 Created` 状态码和新创建的完整简历对象。
- **技术栈**: NestJS (@Post, @Body), uuid, JsonStorageService
- **难点解决方案**: 
  - 在 `ResumesService` 的 `create` 方法中，将通过解构 DTO 并显式赋值来构建新的简历对象：`const newResume = { ...createResumeDto, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };`。这种方式可以确保无论客户端是否在请求体中附带 `id` 或时间戳字段，它们都将被服务器生成的权威值覆盖。
  - 将始终使用 JavaScript 的 `new Date().toISOString()` 方法来生成时间戳。该方法返回的字符串严格遵循 ISO 8601 格式 (例如 `YYYY-MM-DDTHH:mm:ss.sssZ`)，满足需求规范。
- **疑问澄清**:


### 步骤 6: 步骤 6: 实现获取简历 (GET /api/resumes, GET /api/resumes/:id) 的逻辑。在 `ResumesService` 中实现 `findAll` 和 `findOne` 方法。`findAll` 返回所有简历的数组。`findOne` 根据 ID 查找简历，如果未找到，则必须抛出 NestJS 的 `NotFoundException` 以自动触发 `404 Not Found` 响应。
- **技术栈**: NestJS (@Get, @Param, NotFoundException)
- **难点解决方案**: 
  - 在 `findAll` 方法中，从 `JsonStorageService` 获取 `Record<string, ResumeData>` 类型的简历数据后，将使用 `Object.values()` 方法将其高效地转换为 `ResumeData[]` 数组，然后返回。
  - `JsonStorageService` 的 `readData` 方法将内置错误处理逻辑：如果 `db.json` 文件不存在或内容为空/格式错误，它将捕获异常并返回一个空对象 `{}`。这样，`ResumesService` 的 `findAll` 方法在调用 `Object.values({})` 时会自然地得到一个空数组 `[]`，无需在服务层添加额外的检查。
- **疑问澄清**:


### 步骤 7: 步骤 7: 实现更新简历 (PUT /api/resumes/:id) 的逻辑。在 `ResumesService` 中实现 `update` 方法。该方法首先验证简历是否存在，若不存在则抛出 `NotFoundException`。然后，使用请求体中的数据完全替换原简历数据，但保留原有的 `id` 和 `createdAt`，并更新 `updatedAt` 字段。最后，调用 `JsonStorageService` 保存更改。
- **技术栈**: NestJS (@Put, @Param, @Body)
- **难点解决方案**: 
  - 更新逻辑将通过先读取现有数据，然后构造一个全新的更新对象来保证不可变字段的完整性。代码实现将类似于：`const updatedResume = { ...updateResumeDto, id: existingResume.id, createdAt: existingResume.createdAt, updatedAt: new Date().toISOString() };`。这确保了客户端请求无法修改 `id` 和 `createdAt`。
  - 更新操作的原子性完全由 `JsonStorageService` 负责。`ResumesService` 的 `update` 方法只需在内存中构建好完整的、更新后的所有简历数据对象，然后单次调用 `storageService.writeData(allResumes)` 即可。底层的“写入临时文件并重命名”机制会确保整个更新操作的原子性。
- **疑问澄清**:


### 步骤 8: 步骤 8: 实现删除简历 (DELETE /api/resumes/:id) 的逻辑。在 `ResumesService` 中实现 `remove` 方法。该方法先验证简历是否存在，不存在则抛出 `NotFoundException`。若存在，则从内存中的数据结构里删除该条目，并调用 `JsonStorageService` 将更新后的数据写回文件。控制器方法需配置为成功时返回 `204 No Content`。
- **技术栈**: NestJS (@Delete, @Param, @HttpCode(204))
- **难点解决方案**: 
  - 在 `ResumesController` 中，删除端点的处理函数将使用 `@HttpCode(204)` 装饰器。当 `ResumesService` 的 `remove` 方法成功执行（即没有抛出异常）并返回后，NestJS 框架将自动发送一个状态码为 `204` 且响应体为空的 HTTP 响应，无需在控制器或服务中进行任何特殊返回处理。
- **疑问澄清**:


### 步骤 9: 步骤 9: 全局配置和最终验证。在 `main.ts` 中，全局启用 `ValidationPipe`，并配置 `whitelist: true` 和 `forbidNonWhitelisted: true` 选项以增强安全性。设置全局 API 路由前缀为 `/api`。最后，通过 Postman 或类似的工具对所有 API 端点进行手动测试，确保其行为完全符合需求文档。
- **技术栈**: NestJS (`app.useGlobalPipes`, `app.setGlobalPrefix`), Postman/Insomnia
- **难点解决方案**: 
  - 在 `main.ts` 文件中，将通过 `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))` 进行全局管道配置。`whitelist: true` 会自动剥离 DTO 中未定义的属性，而 `forbidNonWhitelisted: true` 会在发现未定义属性时直接抛出 400 错误，提供更严格的安全性。
  - 将创建并维护一个 Postman 集合，该集合将包含对所有 API 端点的完整测试用例，覆盖：1) 所有成功的CRUD操作；2) 各种输入验证失败（400 Bad Request）场景，如字段缺失、类型错误；3) 资源未找到（404 Not Found）场景；4) 模拟文件权限问题以测试服务器错误（500）的响应。此集合将作为项目交付物的一部分，确保 API 质量。
- **疑问澄清**:




## 上下文信息
以下信息可能与任务相关，也可能无关，你需要自行判断。
```markdown

### 相关代码文件:
```
src\store\useResumeStore.ts
updateResumeTitle: (title: string) => void;
  updateBasicInfo: (data: Partial<BasicInfo>) => void;
  updateEducation: (data: Education) => void;
  updateEducationBatch: (educations: Education[]) => void;
  deleteEducation: (id: string) => void;
  updateExperience: (data: Experience) => void;
  updateExperienceBatch: (experiences: Experience[]) => void;
  deleteExperience: (id: string) => void;
  updateProjects: (project: Project) => void;
  updateProjectsBatch: (projects: Project[]) => void;
  deleteProject: (id: string) => void;
  setDraggingProjectId: (id: string | null) => void;
  updateSkillContent: (skillContent: string) => void;
  reorderSections: (newOrder: ResumeData["menuSections"]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  setActiveSection: (sectionId: string) => void;
  updateMenuSections: (sections: ResumeData["menuSections"]) => void;
  addCustomData: (sectionId: string) => void;
  updateCustomData: (sectionId: string, items: CustomItem[]) => void;
  removeCustomData: (sectionId: string) => void;
  addCustomItem: (sectionId: string) => void;
  updateCustomItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomItem>
  ) => void;
  removeCustomItem: (sectionId: string, itemId: string) => void;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  setThemeColor: (color: string) => void;
  setTemplate: (templateId: string) => void;
  addResume: (resume: ResumeData) => string;
}

// 同步简历到文件系统
src\config\initialResumeData.ts
export const initialResumeState = {
  title: "新建简历",
  basic: {
    name: "魔方",
    title: "高级前端工程师",
    employementStatus: "离职",
    email: "zhangsan@example.com",
    phone: "13800138000",
    location: "北京市朝阳区",
    birthDate: "1995-01",
    fieldOrder: DEFAULT_FIELD_ORDER,
    icons: {
      email: "Mail",
      phone: "Phone",
      birthDate: "CalendarRange",
      employementStatus: "Briefcase",
      location: "MapPin",
    },
    photoConfig: DEFAULT_CONFIG,
    customFields: [
      {
        id: "personal",
        label: "个人网站",
        value: "https://zhangsan.dev",
        icon: "Globe",
      },
    ],
    photo: "/avatar.png",
    githubKey: "",
    githubUseName: "",
    githubContributionsVisible: false,
  },
  education: [
    {
      id: "1",
      school: "北京大学",
      major: "计算机科学与技术",
      degree: "本科",
      startDate: "2013-09",
      endDate: "2017-06",
      visible: true,
      gpa: "",
      description: `<ul class="custom-list">
        <li>主修课程：数据结构、算法设计、操作系统、计算机网络、Web开发技术</li>
        <li>专业排名前 5%，连续三年获得一等奖学金</li>
        <li>担任计算机协会技术部部长，组织多次技术分享会</li>
        <li>参与开源项目贡献，获得 GitHub Campus Expert 认证</li>
      </ul>`,
    },
  ],
  skillContent: `<div class="skill-content">
  <ul class="custom-list">
    <li>前端框架：熟悉 React、Vue.js，熟悉 Next.js、Nuxt.js 等 SSR 框架</li>
    <li>开发语言：TypeScript、JavaScript(ES6+)、HTML5、CSS3</li>
    <li>UI/样式：熟悉 TailwindCSS、Sass/Less、CSS Module、Styled-components</li>
src\store\useResumeStore.ts
(async () => {
          try {
            const handle = await getFileHandle("syncDirectory");
            if (!handle) return;

            const hasPermission = await verifyPermission(handle);
            if (!hasPermission) return;

            const dirHandle = handle as FileSystemDirectoryHandle;
            try {
              await dirHandle.removeEntry(`${resume.title}.json`);
            } catch (error) {}
          } catch (error) {
            console.error("Error deleting resume file:", error);
          }
        })();
      },

      duplicateResume: (resumeId) => {
        const newId = generateUUID();
        const originalResume = get().resumes[resumeId];

        // 获取当前语言环境
        const locale =
          typeof document !== "undefined"
            ? document.cookie
                .split("; ")
                .find((row) => row.startsWith("NEXT_LOCALE="))
                ?.split("=")[1] || "zh"
            : "zh";

        const duplicatedResume = {
          ...originalResume,
          id: newId,
          title: `${originalResume.title} (${
            locale === "en" ? "Copy" : "复制"
          })`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          resumes: {
            ...state.resumes,
            [newId]: duplicatedResume,
          },
          activeResumeId: newId,
          activeResume: duplicatedResume,
        }));
src\store\useResumeStore.ts
export const useResumeStore = create(
  persist<ResumeStore>(
    (set, get) => ({
      resumes: {},
      activeResumeId: null,
      activeResume: null,

      createResume: (templateId = null) => {
        const locale =
          typeof document !== "undefined"
            ? document.cookie
                .split("; ")
                .find((row) => row.startsWith("NEXT_LOCALE="))
                ?.split("=")[1] || "zh"
            : "zh";

        const initialResumeData =
          locale === "en" ? initialResumeStateEn : initialResumeState;

        const id = generateUUID();
        const template = templateId
          ? DEFAULT_TEMPLATES.find((t) => t.id === templateId)
          : DEFAULT_TEMPLATES[0];

        const newResume: ResumeData = {
          ...initialResumeData,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateId: template?.id,
          title: `${locale === "en" ? "New Resume" : "新建简历"} ${id.slice(
            0,
            6
          )}`,
        };

        set((state) => ({
          resumes: {
            ...state.resumes,
            [id]: newResume,
          },
          activeResumeId: id,
          activeResume: newResume,
        }));

        syncResumeToFile(newResume);

        return id;
      },

      updateResume: (resumeId, data) => {
        set((state) => {
          const resume = state.resumes[resumeId];
          if (!resume) return state;
src\app\app\dashboard\resumes\page.tsx
if (Object.keys(resumes).length === 0) {
      syncResumesFromFiles();
    }
  }, [resumes, updateResume]);

  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        const handle = await getFileHandle("syncDirectory");
        const path = await getConfig("syncDirectoryPath");
        if (handle && path) {
          setHasConfiguredFolder(true);
        }
      } catch (error) {
        console.error("Error loading saved config:", error);
      }
    };

    loadSavedConfig();
  }, []);

  const handleCreateResume = () => {
    const newId = createResume(null);
    setActiveResume(newId);
  };

  const handleImportJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const config = JSON.parse(content);

        const newResume = {
          ...initialResumeState,
          ...config,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        addResume(newResume);
        toast.success(t("dashboard.resumes.importSuccess"));
      } catch (error) {
        console.error("Import error:", error);
        toast.error(t("dashboard.resumes.importError"));
      }
    };

    input.click();
  };
src\store\useResumeStore.ts
return id;
      },

      updateResume: (resumeId, data) => {
        set((state) => {
          const resume = state.resumes[resumeId];
          if (!resume) return state;

          const updatedResume = {
            ...resume,
            ...data,
          };

          syncResumeToFile(updatedResume, resume);

          return {
            resumes: {
              ...state.resumes,
              [resumeId]: updatedResume,
            },
            activeResume:
              state.activeResumeId === resumeId
                ? updatedResume
                : state.activeResume,
          };
        });
      },

      // 从文件更新，直接更新resumes
      updateResumeFromFile: (resume) => {
        set((state) => ({
          resumes: {
            ...state.resumes,
            [resume.id]: resume,
          },
        }));
      },

      updateResumeTitle: (title) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { title });
        }
      },

      deleteResume: (resume) => {
        const resumeId = resume.id;
        set((state) => {
          const { [resumeId]: _, activeResume, ...rest } = state.resumes;
          return {
            resumes: rest,
            activeResumeId: null,
            activeResume: null,
          };
        });

        (async () => {
          try {
            const handle = await getFileHandle("syncDirectory");
            if (!handle) return;
src\store\useResumeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getFileHandle, verifyPermission } from "@/utils/fileSystem";
import {
  BasicInfo,
  Education,
  Experience,
  GlobalSettings,
  Project,
  CustomItem,
  ResumeData,
  MenuSection,
} from "../types/resume";
import { DEFAULT_TEMPLATES } from "@/config";
import {
  initialResumeState,
  initialResumeStateEn,
} from "@/config/initialResumeData";
import { generateUUID } from "@/utils/uuid";
interface ResumeStore {
  resumes: Record<string, ResumeData>;
  activeResumeId: string | null;
  activeResume: ResumeData | null;

  createResume: (templateId: string | null) => string;
  deleteResume: (resume: ResumeData) => void;
  duplicateResume: (resumeId: string) => string;
  updateResume: (resumeId: string, data: Partial<ResumeData>) => void;
  setActiveResume: (resumeId: string) => void;
  updateResumeFromFile: (resume: ResumeData) => void;
src\config\initialResumeData.ts
export const initialResumeStateEn = {
  title: "New Resume",
  basic: {
    name: "John Smith",
    title: "Senior Frontend Engineer",
    employementStatus: "Available",
    email: "john.smith@123.com",
    phone: "555-123-4567",
    location: "San Francisco, CA",
    birthDate: "",
    fieldOrder: DEFAULT_FIELD_ORDER,
    icons: {
      email: "Mail",
      phone: "Phone",
      birthDate: "CalendarRange",
      employementStatus: "Briefcase",
      location: "MapPin",
    },
    photoConfig: DEFAULT_CONFIG,
    customFields: [],
    photo: "/avatar.png",
    githubKey: "",
    githubUseName: "",
    githubContributionsVisible: false,
  },
  education: [
    {
      id: "1",
      school: "Stanford University",
      major: "Computer Science",
      degree: "",
      startDate: "2013-09",
      endDate: "2017-06",
      visible: true,
      gpa: "",
      description: `<ul class="custom-list">
        <li>Core courses: Data Structures, Algorithms, Operating Systems, Computer Networks, Web Development</li>
        <li>Top 5% of class, received Dean's List honors for three consecutive years</li>
        <li>Served as Technical Director of the Computer Science Association, organized multiple tech workshops</li>
        <li>Contributed to open-source projects, earned GitHub Campus Expert certification</li>
      </ul>`,
    },
  ],
  skillContent: `<div class="skill-content">
  <ul class="custom-list">
src\i18n\locales\zh.json
{
  "common": {
    "title": "魔方简历",
    "subtitle": "AI 驱动简历编辑器",
    "description": "魔方简历是一款开源的简历编辑器，免费，隐私优先。无需注册登录，数据完全存储在本地，支持数据导出备份，确保您的简历数据随时可用。",
    "dashboard": "仪表盘",
    "edit": "编辑",
    "delete": "删除",
    "newResume": "新建简历",
    "copy": "复制"
  },
  "home": {
    "header": {
      "title": "魔方简历",
      "startButton": "开始使用",
      "features": "功能特点",
      "pricing": "定价",
      "about": "关于我们",
      "login": "登录",
      "register": "注册",
      "dashboard": "控制台"
    },
    "hero": {
      "badge": "免费简历创作",
      "title": "让简历创作变得简单而智能",
      "subtitle": "魔方简历利用 AI 技术，帮助您快速创建专业的简历。无需注册，免费使用，数据安全存储。",
      "cta": "立即开始",
      "secondary": "浏览模板"
    },
    "features": {
      "title": "为什么选择魔方简历？",
      "subtitle": "我们提供一站式简历解决方案，让您的求职之路更加顺畅",
      "ai": {
        "badge": "AI 智能纠错",
        "title": "智能识别，专业建议",
        "description": "内置智能语法检查，自动识别不恰当的表达，提供专业的修改建议，让您的简历更加出色。",
        "item1": "智能润色",
        "item1_description": "AI 自动优化文案表达，让简历更专业",
        "item2": "语法检查",
        "item2_description": "自动检测并修正语法和拼写错误"
      },
      "storage": {
        "badge": "本地存储",
        "title": "数据安全，隐私优先",
        "description": "所有简历数据完全存储在您的本地设备中，无需担心隐私泄露。支持数据导出备份，确保您的简历数据随时可用。",
        "item1": "本地文件存储",
        "item1_description": "简历数据安全存储在您的电脑硬盘中",
        "item2": "多种导出格式",
        "item2_description": "支持PDF和JSON格式导出",
        "item3": "支持数据导出备份"
      },
      "preview": {
        "badge": "实时预览",
        "title": "所见即所得",
        "description": "边编辑边预览，实时查看简历效果。支持多种专业模板，让您的简历既美观又规范。快速导出PDF，随时投递简历。",
        "item1": "实时预览编辑效果",
        "item2": "多种导出格式支持"
      }
    },
    "news": {
      "label": "新闻",
      "content": " 全新的 AI 简历优化功能已上线"
    },
    "cta": {
      "title": "开启你的新职业篇章",
      "description": "立即使用魔方简历，创建一份令人印象深刻的简历",
      "button": "免费开始使用"
    },
    "footer": {
      "copyright": " 2025 魔方简历. 保留所有权利."
    },
    "changelog": "更新日志",
    "faq": {
      "title": "常见问题",
      "items": [
        {
          "question": "使用魔方简历需要付费吗？",
          "answer": "魔方简历目前是免费的，满足基础简历制作需求，开源版本的功能不会变更，导出PDF功能也永远不会收费。"
        },
        {
          "question": "我的简历数据安全吗？",
          "answer": "是的，非常安全。魔方简历采用本地存储方式，您的所有数据都保存在您自己的设备上，不存在云存储，完全保护您的隐私。"
        },
        {
          "question": "支持哪些简历格式导出？",
          "answer": "目前支持导出PDF格式，确保您的简历在任何设备上都能保持一致的排版效果。未来我们还将支持更多导出格式。"
        },
        {
          "question": "多设备如何同步",
          "answer": "我们提供了导出JSON配置，您可以将简历的配置以JSON格式保存，随时随地，任何设备上都可以打开查看。"
        },
        {
          "question": "自定义程度如何？",
          "answer": "我们提供丰富的自定义操作，包括颜色、布局等，让您能够根据个人喜好和行业特点调整简历风格。"
        }
      ]
    }
  },
  "dashboard": {
    "sidebar": {
      "resumes": "我的简历",
      "settings": "通用设置",
      "templates": "简历模板",
      "ai": "AI服务商"
    },
    "resumes": {
      "created": "创建于",
      "synced": "已备份文件夹",
      "view": "去查看",
      "myResume": "我的简历",
      "create": "新建简历",
      "newResume": "新建简历",
      "newResumeDescription": "创建一个新简历以开始。",
      "import": "导入 JSON 配置",
      "untitled": "未命名简历",
      "importSuccess": "配置导入成功",
      "importError": "配置导入失败，请检查文件格式",
      "notice": {
        "title": "注意",
        "description": "建议在设置里中配置简历备份文件夹，防止您的数据可能会在浏览器清除缓存后丢失",
        "goToSettings": "前往设置"
      }
    },
    "settings": {
      "title": "设置",
      "syncDirectory": {
        "title": "同步目录",
        "description": "选择一个文件夹来同步和备份您的简历。",
        "currentSyncFolder": "当前同步文件夹",
        "noFolderConfigured": "尚未配置同步文件夹",
        "changeFolder": "更改文件夹",
        "selectFolder": "选择文件夹"
      },
      "sync": {
        "title": "同步目录",
        "description": "选择一个文件夹来同步和备份您的简历。",
        "select": "选择文件夹"
      },
      "ai": {
        "title": "AI 配置",
        "currentModel": "当前使用的模型",
        "selectModel": "选择模型",
        "getApiKey": "获取 API Key",
        "doubao": {
          "title": "豆包",
          "description": "在火山引擎获取 API 密钥",
          "apiKey": "API Key",
          "modelId": "模型 ID"
        },
        "deepseek": {
          "title": "DeepSeek",
          "description": "在 DeepSeek 开放平台获取 API 密钥",
          "apiKey": "API Key"
        },
        "openai": {
          "title": "OpenAI",
          "description": "在 OpenAI 或兼容 OpenAI 格式的开放平台获取 API 密钥",
          "apiKey": "API Key",
          "modelId": "模型 ID",
          "apiEndpoint": "API 端点，如：https://openai.example.org/v1"
        }
      }
    },
    "templates": {
      "title": "模板",
      "useTemplate": "使用此模板",
      "preview": "预览",
      "switchTemplate": "切换模版",
      "classic": {
        "name": "经典模板",
        "description": "传统简约的简历布局，适合大多数求职场景"
      },
      "modern": {
        "name": "两栏布局",
        "description": "经典两栏，突出个人特色"
      },
      "leftRight": {
        "name": "模块标题背景色",
        "description": "模块标题背景鲜明，突出美观特色"
      },
      "timeline": {
        "name": "时间轴布局",
        "description": "时间轴风格，突出经历的时间顺序"
      }
    }
  },
  "pdfExport": {
    "button": {
      "export": "导出",
      "exportPdf": "PDF(服务端)",
      "exportJson": "JSON配置",
      "exporting": "导出中...",
      "exportingJson": "导出中...",
      "print": "PDF(浏览器打印)"
    },
    "toast": {
      "success": "PDF导出成功",
      "error": "PDF导出失败",
      "jsonSuccess": "配置导出成功",
      "jsonError": "配置导出失败"
    }
  },
  "workbench": {
    "sidePanel": {
      "layout": {
        "title": "布局",
        "addCustomSection": "添加自定义模块"
      },
      "theme": {
        "title": "主题色",
        "custom": "自定义"
      },
      "typography": {
        "title": "排版",
        "font": {
          "title": "字体",
          "sans": "无衬线体",
          "serif": "衬线体",
          "mono": "等宽体"
        },
        "lineHeight": {
          "title": "行高",
          "normal": "默认",
          "relaxed": "适中",
          "loose": "宽松"
        },
        "baseFontSize": {
          "title": "基础字号"
        },
        "headerSize": {
          "title": "模块标题字号"
        },
        "subheaderSize": {
          "title": "模块项一级标题字号"
        }
      },
      "spacing": {
        "title": "间距",
        "pagePadding": {
          "title": "页边距"
        },
        "sectionSpacing": {
          "title": "模块间距"
        },
        "paragraphSpacing": {
          "title": "段落间距"
        }
      },
      "mode": {
        "title": "模式",
        "useIconMode": {
          "title": "图标模式"
        },
        "centerSubtitle": {
          "title": "副标题居中"
        }
      }
    },
    "basicPanel": {
      "title": "资料",
      "basicField": "基础字段",
      "customField": "自定义字段",
      "githubContributions": "Github贡献",
      "layout": "布局",
      "layoutLeft": "居左",
      "layoutCenter": "居中",
      "layoutRight": "居右",
      "avatar": "头像",
      "customFields": {
        "placeholders": {
          "label": "标签",
          "value": "值"
        },
        "addButton": "添加自定义字段"
      },
      "basicFields": {
        "name": "姓名",
        "title": "职位",
        "email": "邮箱",
        "phone": "电话",
        "website": "个人网站",
        "location": "地址",
        "birthDate": "生日",
        "employementStatus": "状态"
      },
      "fieldVisibility": {
        "show": "显示",
        "hide": "隐藏"
      }
    },
    "experiencePanel": {
      "title": "工作经历",
      "addButton": "添加工作经历",
      "defaultProject": {
        "company": "某科技有限公司",
        "position": "高级前端工程师",
        "date": "2020-至今",
        "details": "负责公司核心产品..."
      },
      "placeholders": {
        "company": "请输入公司名称",
        "position": "请输入职位",
        "date": "请输入工作时间",
        "details": "请输入工作职责和成就"
      }
    },
    "experienceItem": {
      "labels": {
        "company": "公司名称",
        "position": "岗位",
        "date": "工作时间",
        "details": "工作职责"
      },
      "placeholders": {
        "company": "请输入公司名称",
        "position": "如：前端工程师",
        "date": "如：2020-至今",
        "details": "描述你在这份工作中的职责和成就"
      },
      "buttons": {
        "edit": "编辑",
        "save": "保存",
        "cancel": "取消",
        "delete": "删除"
      },
      "visibility": {
        "show": "显示",
        "hide": "隐藏"
      }
    },
    "projectPanel": {
      "title": "项目经历",
      "addButton": "添加项目",
      "defaultProject": {
        "name": "个人项目",
        "description": "项目描述",
        "role": "负责内容",
        "technologies": "技术栈",
        "date": "2023.01 - 2023.06"
      },
      "placeholders": {
        "name": "项目名称",
        "description": "简要描述项目背景和目标",
        "role": "你在项目中的角色和职责",
        "technologies": "使用的技术和工具",
        "date": "项目时间范围",
        "link": "项目链接"
      }
    },
    "projectItem": {
      "labels": {
        "name": "项目名称",
        "role": "项目角色",
        "date": "项目时间",
        "description": "项目描述",
        "link": "项目链接"
      },
      "placeholders": {
        "name": "请输入项目名称",
        "role": "你在项目中的角色",
        "date": "项目时间范围",
        "description": "简要描述项目背景和目标",
        "link": "项目链接（可选）"
      },
      "buttons": {
        "edit": "编辑",
        "save": "保存",
        "cancel": "取消",
        "delete": "删除"
      },
      "visibility": {
        "show": "显示",
        "hide": "隐藏"
      }
    },
    "educationPanel": {
      "title": "教育背景",
      "addButton": "添加教育经历",
      "defaultProject": {
        "school": "学校名称",
        "degree": "学历",
        "major": "专业",
        "date": "2020.09 - 2024.06"
      },
      "placeholders": {
        "school": "请输入学校名称",
        "degree": "请选择学历",
        "major": "请输入专业名称",
        "date": "请输入就读时间范围"
      }
    },
    "educationItem": {
      "labels": {
        "school": "学校名称",
        "degree": "学历",
        "major": "专业",
        "date": "就读时间",
        "description": "学校简介",
        "gpa": "GPA",
        "startDate": "开始时间",
        "endDate": "结束时间"
      },
      "placeholders": {
        "school": "请输入学校名称",
        "degree": "请选择学历",
        "major": "请输入专业名称",
        "date": "请输入就读时间范围",
        "description": "请输入学校简介",
        "gpa": "请输入GPA"
      },
      "buttons": {
        "edit": "编辑",
        "save": "保存",
        "cancel": "取消",
        "delete": "删除"
      },
      "visibility": {
        "show": "显示",
        "hide": "隐藏"
      }
    }
  },
  "field": {
    "selectDate": "选择日期",
    "enterYear": "输入年份"
  },
  "richEditor": {
    "bold": "加粗",
    "italic": "斜体",
    "underline": "下划线",
    "textColor": "文字颜色",
    "backgroundColor": "背景颜色",
    "alignLeft": "左对齐",
    "alignCenter": "居中对齐",
    "alignRight": "右对齐",
    "alignJustify": "两端对齐",
    "bulletList": "无序列表",
    "orderedList": "有序列表",
    "undo": "撤销",
    "redo": "重做",
    "aiPolish": "AI 润色",
    "paragraph": "正文",
    "heading1": "标题 1",
    "heading2": "标题 2",
    "heading3": "标题 3",
    "colors": {
      "black": "黑色",
      "darkGray": "深灰",
      "gray": "灰色",
      "red": "红色",
      "orange": "橙色",
      "orangeYellow": "橙黄",
      "yellow": "黄色",
      "yellowGreen": "黄绿",
      "green": "绿色",
      "cyan": "青色",
      "lightBlue": "浅蓝",
      "blue": "蓝色",
      "purple": "紫色",
      "magenta": "紫红",
      "pink": "粉色"
    }
  },
  "iconSelector": {
    "all": "全部",
    "searchPlaceholder": "搜索图标...",
    "noMatchingIcons": "未找到匹配的图标",
    "tryOtherKeywords": "请尝试其他搜索关键词",
    "selectOtherCategory": "请选择其他分类",
    "categories": {
      "personal": "个人信息",
      "education": "教育背景",
      "experience": "工作经验",
      "skills": "技能",
      "languages": "语言",
      "projects": "项目",
      "achievements": "成就证书",
      "hobbies": "兴趣爱好",
      "social": "社交媒体",
      "others": "其他"
    },
    "icons": {
      "user": "用户",
      "email": "邮箱",
      "phone": "电话",
      "address": "地址",
      "website": "网站",
      "mobile": "手机",
      "education": "学历",
      "school": "学校",
      "major": "专业",
      "library": "图书馆",
      "scholarship": "奖学金",
      "work": "工作",
      "company": "公司",
      "office": "办公室",
      "dateRange": "日期范围",
      "workTime": "工作时间",
      "programming": "编程",
      "system": "系统",
      "database": "数据库",
      "terminal": "终端",
      "techStack": "技术栈",
      "language": "语言",
      "speaking": "口语",
      "communication": "交流",
      "project": "项目",
      "branch": "分支",
      "release": "发布",
      "target": "目标",
      "trophy": "奖杯",
      "medal": "奖牌",
      "star": "星级",
      "interest": "兴趣",
      "music": "音乐",
      "art": "艺术",
      "photography": "摄影",
      "linkedin": "领英",
      "twitter": "推特",
      "facebook": "脸书",
      "instagram": "照片",
      "profile": "简介",
      "review": "审核",
      "filter": "筛选",
      "link": "链接",
      "salary": "薪资",
      "idea": "创意",
      "send": "发送",
      "share": "分享",
      "settings": "设置",
      "search": "搜索",
      "flag": "标记",
      "bookmark": "收藏",
      "thumbsUp": "点赞",
      "skill": "技能"
    }
  },
  "photoConfig": {
    "title": "头像设置",
    "description": "自定义您的简历头像",
    "upload": {
      "title": "在线链接",
      "dragHint": "拖拽或点击上传图片",
      "sizeLimit": "图片大小不能超过2MB",
      "typeLimit": "请上传图片文件",
      "urlPlaceholder": "输入图片链接",
      "invalidUrl": "图片链接无效或无法访问，请尝试使用其他图片链接",
      "timeout": "加载超时",
      "loadError": "图片加载失败"
    },
    "config": {
      "aspectRatio": "宽高比",
      "size": "尺寸",
      "width": "宽度",
      "height": "高度",
      "border-radius": "圆角",
      "widthPlaceholder": "宽度",
      "heightPlaceholder": "高度",
      "ratios": {
        "1:1": "1:1 正方形",
        "4:3": "4:3 横版",
        "3:4": "3:4 竖版",
        "16:9": "16:9 宽屏",
        "custom": "自定义"
      },
      "borderRadius": {
        "none": "无",
        "medium": "中等",
        "full": "圆形",
        "custom": "自定义",
        "customPlaceholder": "自定义圆角大小"
      }
    },
    "actions": {
      "reset": "重置",
      "close": "关闭",
      "cancel": "取消",
      "removePhoto": "删除头像"
    }
  },
  "previewDock": {
    "switchTemplate": "切换模版",
    "grammarCheck": {
      "idle": "AI语法纠错",
      "checking": "检查中...",
      "configurePrompt": "请先配置 ApiKey 和 模型Id",
      "configureButton": "去配置",
      "errorToast": "语法检查失败，请重试"
    },
    "sidePanel": {
      "expand": "展开侧边栏",
      "collapse": "收起侧边栏"
    },
    "editPanel": {
      "expand": "展开编辑面板",
      "collapse": "收起编辑面板"
    },
    "github": "GitHub",
    "backToDashboard": "返回仪表盘",
    "copyResume": {
      "tooltip": "复制简历",
      "success": "简历复制成功",
      "error": "简历复制失败"
    }
  },
  "aiPolishDialog": {
    "title": "AI 润色",
    "description": {
      "polishing": "正在为您润色内容...",
      "finished": "已经为您优化了内容，请查看效果"
    },
    "error": {
      "configRequired": "请先配置 AI 模型",
      "polishFailed": "润色失败",
      "applied": "已应用润色内容"
    },
    "content": {
      "original": "原始内容",
      "polished": "润色后的内容"
    },
    "button": {
      "regenerate": "重新生成",
      "generating": "生成中...",
      "apply": "应用内容"
    }
  },
  "templates": {
    "switchTemplate": "切换模板"
  },
  "themeModal": {
    "delete": {
      "title": "确定要删除吗",
      "description": "您确定要删除{title}吗？",
      "confirmText": "删除",
      "cancelText": "取消"
    }
  }
}

src\config\initialResumeData.ts
<li>前端框架：熟悉 React、Vue.js，熟悉 Next.js、Nuxt.js 等 SSR 框架</li>
    <li>开发语言：TypeScript、JavaScript(ES6+)、HTML5、CSS3</li>
    <li>UI/样式：熟悉 TailwindCSS、Sass/Less、CSS Module、Styled-components</li>
    <li>状态管理：Redux、Vuex、Zustand、Jotai、React Query</li>
    <li>工程化工具：Webpack、Vite、Rollup、Babel、ESLint</li>
    <li>测试工具：Jest、React Testing Library、Cypress</li>
    <li>性能优化：熟悉浏览器渲染原理、性能指标监控、代码分割、懒加载等优化技术</li>
    <li>版本控制：Git、SVN</li>
    <li>技术管理：具备团队管理经验，主导过多个大型项目的技术选型和架构设计</li>
  </ul>
</div>`,
  experience: [
    {
      id: "1",
      company: "字节跳动",
      position: "高级前端工程师",
      date: "2021/7 - 至今",
      visible: true,
      details: `<ul class="custom-list">
      <li>负责抖音创作者平台的开发与维护，主导多个核心功能的技术方案设计</li>
      <li>优化项目工程化配置，将构建时间从 8 分钟优化至 2 分钟，提升团队开发效率</li>
      <li>设计并实现组件库，提升代码复用率达 70%，显著减少开发时间</li>
      <li>主导性能优化项目，使平台首屏加载时间减少 50%，接入 APM 监控系统</li>
      <li>指导初级工程师，组织技术分享会，提升团队整体技术水平</li>
    </ul>`,
    },
  ],
  draggingProjectId: null,
  projects: [
    {
      id: "p1",
      name: "抖音创作者中台",
      role: "前端负责人",
      date: "2022/6 - 2023/12",
      description: `<ul class="custom-list">
        <li>基于 React 开发的创作者数据分析和内容管理平台，服务百万级创作者群体</li>
        <li>包含数据分析、内容管理、收益管理等多个子系统</li>
        <li>使用 Redux 进行状态管理，实现复杂数据流的高效处理</li>
        <li>采用 Ant Design 组件库，确保界面设计的一致性和用户体验</li>
        <li>实施代码分割和懒加载策略，优化大规模应用的加载性能</li>
      </ul>`,
      visible: true,
    },
    {
      id: "p2",
      name: "微信小程序开发者工具",
      role: "核心开发者",
      date: "2020/3 - 2021/6",
```

### 相关领域知识:
```

		### 项目文档参考
		
		
		### 技术文档参考
		
		
```
```

