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