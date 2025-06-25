

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


## 上下文信息

### 相关代码文件:
```
packages\backend\src\chat-history\chat-history.service.ts
@Injectable()
export class ChatHistoryService {
	@Inject(DbService)
	private dbService: DbService;

	async list(chatroomId: number) {
		const history = await this.dbService.chatRecord.findMany({
			where: {
				chatroomId
			}
		});
		//为每条消息查询发送者
		const res: WeiSum<(typeof history)[0], { sender: typeof this.dbService.user.findUnique }>[] =
			[];
		for (let i = 0; i < history.length; i++) {
			const user = await this.dbService.user.findUnique({
				where: {
					id: history[i].senderId
				},
				select: {
					id: true,
					username: true,
					nickName: true,
					email: true,
					create_at: true,
					avatar_url: true
				}
			});
			res.push({
				...history[i],
				sender: user
			});
		}
		return res;
	}
	//查询房间最后一条聊天信息
	async last(chatroomId: number) {
		const lastMessage = await this.dbService.chatRecord.findFirst({
			where: {
				chatroomId: chatroomId
			},
			orderBy: {
				create_at: 'desc' // 按创建时间降序排列
			}
		});
		//房间内没有消息
		if (lastMessage === null) return;
		const user = await this.dbService.user.findUnique({
			where: {
				id: lastMessage.senderId
			},
			select: {
				id: true,
				username: true,
				nickName: true,
				email: true,
				create_at: true,
				avatar_url: true
			}
		});
		// console.log('lastMessage', lastMessage);
		return { ...lastMessage, sender: user };
	}

	async add(chatroomId: number, history: HistoryDto) {
		return await this.dbService.chatRecord.create({
			data: history
		});
	}
}
packages\backend\src\chain\chain.service.ts
const chatHistory = this.modelService.getChatHistory(); //使用自定义的chatHistory
		const memory = new ConversationSummaryMemory({
			chatHistory: chatHistory,
			memoryKey: 'history',
			llm: await this.modelService.getLLMOpenAI()
		});

		const llm = await this.modelService.getLLMOpenAI();
		const outputParser = new StringOutputParser();

		let lastInput = ''; //储存用户当前输入（以更新memory）
		const chain = RunnableSequence.from([
			{
				input: (input, options) => {
					lastInput = input;
					return input;
				},
				history: async (input: any, options: any) => {
					const vars = await memory.loadMemoryVariables({ input }); //EntityMemory需要传入input
					console.log('vars.entities', vars.entities);
					return vars.history || vars.summary || '';
				}
			},
			prompt,
			llm,
			outputParser,
			RunnableLambda.from(async input => {
				await memory.saveContext({ input: lastInput }, { output: input });
				return input;
			})
		]);
		return chain;
	}
}
packages\frontend\src\components\TopBar\searchBar.tsx
用户查询结果
				</li>
				{userResult.map((user, index) => (
					<li className="list-row" key={user.id} onClick={e => setUserIndex(index)}>
						<div className="avatar">
							<div className="w-10 h-10 rounded">
								<img src={user?.avatar_url!} />
							</div>
						</div>
						<div className="ml-3">{user.nickName}</div>
						<button
							className="btn btn-square btn-secondary"
							onClick={async () => {
								try {
									const res = await friendAdd({
										reason: '想添加你为好友',
										username: user.username
									});

									if (res.status === 201 || res.status === 200) {
										message.success('好友申请已发送');
									}
								} catch (e: any) {
									message.error(e.response?.data?.message || '系统繁忙，请稍后再试');
								}
							}}
						>
							添加
						</button>
					</li>
				))}
			</>
		) : (
			<>
				<li className="p-4 pb-2 text-xs opacity-60 tracking-wide" key={-1}>
					群聊查询结果
				</li>
				{groupResult.map((group, index) => (
					<li className="list-row" key={group.id} onClick={e => setGroupIndex(index)}>
						<div className=" bg-neutral text-neutral-content w-10">
							<span className="text-xl">{group.name.substring(0, 1)}</span>
						</div>
						<div className="ml-3">{group.name}</div>
						<button
							className="btn btn-square btn-secondary"
							onClick={async () => {
								try {
									const res = await addMember(group.id, wei_ls.getFromLS('userInfo')?.username);
packages\backend\src\chain\model\chat_history\chat_history.service.ts
class JSONChatHistory extends BaseListChatMessageHistory {
	lc_namespace = ['langchain', 'stores', 'message']; //为了序列化为JSON再反序列化时能匹配之前的类

	sessionId: string;
	dir: string;

	constructor(fields: JSONChatHistoryInput) {
		super(fields);
		this.sessionId = fields.sessionId;
		this.dir = fields.dir;
	}

	async getMessages(): Promise<BaseMessage[]> {
		const filePath = path.join(this.dir, `${this.sessionId}.json`);
		try {
			if (!fs.existsSync(filePath)) {
				this.saveMessagesToFile([]);
				return [];
			}

			const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
			const storedMessages = JSON.parse(data) as StoredMessage[];
			//反序列化
			return mapStoredMessagesToChatMessages(storedMessages);
		} catch (error) {
			console.error(`Failed to read chat history from ${filePath}`, error);
			return [];
		}
	}

	async addMessage(message: BaseMessage): Promise<void> {
		const messages = await this.getMessages();
		messages.push(message);
		await this.saveMessagesToFile(messages);
	}

	async addMessages(messages: BaseMessage[]): Promise<void> {
		const existingMessages = await this.getMessages();
		const allMessages = existingMessages.concat(messages);
		await this.saveMessagesToFile(allMessages);
	}

	async clear(): Promise<void> {
		const filePath = path.join(this.dir, `${this.sessionId}.json`);
		try {
			fs.unlinkSync(filePath);
		} catch (error) {
			console.error(`Failed to clear chat history from ${filePath}`, error);
packages\frontend\src\services\contact\index.ts
import axiosInstance from '..';
import { AddFriend } from '../../components/Friendship/AddFriendModal';

export async function friendshipList() {
	return axiosInstance.get(`/friendship/list`);
}
export async function getfriend(name: string) {
	return axiosInstance.get(`/friendship/one?name=${name}`);
}

export async function friendAdd(data: AddFriend) {
	return axiosInstance.post('/friendship/add', data);
}

export async function friendDel(id: number) {
	return axiosInstance.post(`/friendship/remove/${id}`);
}

export async function friendRequestList() {
	return axiosInstance.get('/friendship/request_list');
}

export async function agreeFriendRequest(id: number) {
	return axiosInstance.get(`/friendship/agree/${id}`);
}

export async function rejectFriendRequest(id: number) {
	return axiosInstance.get(`/friendship/reject/${id}`);
}

export async function chatroomList(name?: string) {
	//不传name（''）：查询用户所有聊天房间
	//传name：限制名字中带有name
	return axiosInstance.get(`/chatroom/list?name=${name ? name : ''}`);
}

export async function findChatroom(userId1: number, userId2: number) {
	return axiosInstance.get(`/chatroom/findChatroom`, {
		params: {
			userId1,
			userId2
		}
	});
}
export async function groupMembers(chatroomId: number) {
	return axiosInstance.get(`/chatroom/members`, {
		params: {
			chatroomId
		}
	});
}

export async function addMember(chatroomId: number, joinUsername: string) {
```

### 相关领域知识:
```

		### 代码参考
		当然，现在我们的 chatbot 还是没有历史对话的数据，接下来我们将学习 langchain 中的 Memory 类，让 chat bot 拥有记忆能力。
```ts
const answer = await ragChain.invoke({
    question: "详细描述原文中有什么跟直升机相关的场景"
  });

console.log(answer);
```

```ts
原文中描述了直升机试验的场景。在试验中，改进过的探杆防御系统被安装在一架直升机上。直升机编队起飞后，电弧在空中出现，当雷球熄灭时，探杆将自动弹出，牵引着一根直径不到半厘米的超导线接触目标位置。整个试验过程中，两架直升机成功地飞行并降落，展现出探杆防御系统的功能。
```

  


## 小结

通过将我们之前学到的知识连到一起，**我们就有了基于任意私域数据库来构建 rag chatbot 的能力**，这可以方便我们把 LLM 应用到任意**公司内已有的数据集**中，构建私域数据的对话机器人。这在应用中的想象力是无穷的，例如你可以把你**自己学习笔记**存储到 vector store 中，来构建专属于自己的对话机器人，基于自己学过的知识来回答问题。
console.log(result)
```

```ts
"“她都刻了些什么？”\r\n" +
  "　　“一个数学模型，全面描述宏原子的数学模型。”\r\n" +
  "　　“哦，我们真该带个数码相机来的。”\r\n" +
  "　　“没关系，我都记在脑子里了。”\r\n" +
  "　　“怎么可能呢？那么多？”\r\n" +
  "　　“其中的"... 1743 more characters
```

可以看到，我们已经能够根据用户的问题，来获取到原文中相关性比较高的上下文，并处理成纯文字形式

## 构建 Template

然后，我们就可以构建用户提问的 template，这里我们使用 ChatPromptTemplate 来构建我们的 prompt，使用简单的 prompt 技巧，并在其中定义两个变量 context 和 question

```ts
import { ChatPromptTemplate } from "@langchain/core/prompts";

const TEMPLATE = `
> 本节对应源代码：https://github.com/RealKai42/langchainjs-juejin/blob/main/rag.ipynb

经过了前述的学习后，我们已经掌握了构建一个基于私域数据回答问题的 RAG bot 的所有碎片：

- 我们掌握了如何使用 `Prompt Template` 来构建可复用的 prompt 模板
- 我们掌握了使用如何根据私域数据的类型来对数据进行分块（splitter） 
- 我们掌握了构建私域数据的 vector db
- 我们掌握了根据相似性去查询 vector db 中最相关的上下文

我们现在终于可以连点成线，把所有的知识组合在一起，来做一个 RAG bot。本章，我们选择一本小说作为我们的私域数据集，做一个可以根据用户的问题查找原著中相关性最高的片段，并基于该片段进行回答的 bot。考虑到大家阅读小册时可能是隔几天读几章，所以我们也会在这个完整的实战中穿插一些对过去知识的回顾。
## 构建 vector store 和 retriever

有了切割后的数据后，我们需要将每个数据块构建成 vector，然后存出来 vector store 中，这里我们使用 OpenAI 的 text-embedding-ada-002 模型。

我们先创建一个 embedding 对象，得益于 langchain 的自由性，我们可以在这里使用任何 embedding 模型，包括一些自部署的开源 embedding 模型来节约成本。为了方便起见，我们使用 openai 提供的模型

```ts
import { OpenAIEmbeddings } from "@langchain/openai";


const embeddings = new OpenAIEmbeddings();
```
		### 项目文档参考
		undefined
		### 技术文档参考
		undefined
		
```


## 任务：
根据下文提供的 "步骤需求分析" 和 "实现细节计划"，完成编码任务。

## 步骤需求分析:
当前步骤是设计并实现数据收集模块，用于从聊天记录、好友备注和互动历史中提取数据。该模块是构建RAG知识库的基础，需要高效、安全地从多个数据源收集数据。具体需求如下：

1. **输入**：
   - 聊天记录：从MySQL数据库中的chatRecord表获取
   - 好友备注：从用户表的nickName字段获取
   - 互动历史：包括好友添加记录、聊天频率等
   - 用户信息：包括用户ID、用户名、头像等

2. **处理**：
   - 使用Prisma ORM高效查询MySQL数据库
   - 实现分页查询机制处理大数据量
   - 对敏感信息进行脱敏处理
   - 使用Redis缓存频繁访问的数据
   - 确保数据实时同步，建立数据变更监听机制

3. **输出**：
   - 结构化的用户社交数据集合
   - 数据质量报告（完整性、准确性）
   - 数据隐私处理日志

4. **技术实现**：
   - 使用NestJS框架构建模块化服务
   - 通过Prisma实现高效数据库查询
   - 利用Redis缓存优化性能
   - 实现JWT鉴权确保数据安全

5. **与其他模块的关系**：
   - 为数据预处理模块提供原始数据
   - 依赖用户认证服务获取合法访问权限
   - 为RAG系统提供知识库基础数据

6. **关键考量**：
   - 性能：大数据量下的查询优化
   - 安全：用户隐私数据保护
   - 实时性：数据变更的及时同步
   - 可扩展性：支持未来新增数据源

7. **验收标准**：
   - 能完整收集所有指定数据源的信息
   - 在100万条记录下查询响应时间<500ms
   - 敏感字段100%脱敏处理
   - 数据变更能在5分钟内同步到知识库

## 实现细节计划:

### 步骤 1: 设计数据收集模块的数据库查询接口
- **技术栈**: NestJS, Prisma ORM, MySQL
- **难点解决方案**: 
  - 使用Prisma的批量查询和关联查询优化性能，减少数据库往返次数
  - 实现基于JWT的接口鉴权，结合RBAC模型控制访问权限
  - 采用游标分页替代偏移分页，提升大数据量下的分页效率
- **疑问澄清**:
  - 性能与内存平衡：使用流式查询处理大数据，避免全量加载到内存
  - 查询策略：为实时性要求高的数据源实现增量查询，历史数据采用批量查询

### 步骤 2: 实现敏感数据脱敏处理机制
- **技术栈**: Node.js, Lodash, Crypto
- **难点解决方案**: 
  - 建立敏感字段注册表，通过注解方式标记实体类中的敏感字段
  - 采用部分遮蔽(如手机号中间四位*)和哈希(如邮箱)相结合的脱敏策略
  - 实现递归式对象遍历处理器，自动处理嵌套结构中的敏感数据
- **疑问澄清**:
  - 数据关联性：脱敏时保留关键ID字段，通过关联表维护关系
  - 可逆性：仅对展示层数据脱敏，存储层保留原始加密数据

### 步骤 3: 构建Redis缓存层
- **技术栈**: Redis, Node.js, ioredis
- **难点解决方案**: 
  - 设计复合缓存键：prefix:entityType:id:version，避免键冲突
  - 实现双写一致性策略，数据库变更后通过事件触发缓存失效
  - 动态TTL设置：高频数据设置较长TTL(24h)，低频数据较短TTL(1h)
- **疑问澄清**:
  - 监控方案：使用Redis自带的INFO命令采集命中率指标
  - 失效策略：采用主动失效+被动过期结合的方式

### 步骤 4: 实现数据变更监听机制
- **技术栈**: MySQL Binlog, Debezium, Kafka
- **难点解决方案**: 
  - 使用Debezium捕获binlog事件，转换为Avro格式写入Kafka
  - 实现批量事件处理器，合并短时间内的连续变更事件
  - 在消费者端维护事件序列号，确保顺序处理
- **疑问澄清**:
  - 性能影响：从库读取binlog，避免影响主库性能
  - 中断恢复：定期持久化消费位移，重启后从检查点恢复

### 步骤 5: 开发数据质量检查功能
- **技术栈**: Node.js, Joi, Lodash
- **难点解决方案**: 
  - 定义完整性(非空字段)、准确性(格式校验)、一致性(跨表关联)三类指标
  - 对不符合质量要求的数据打标隔离，进入人工审核流程
  - 生成可视化质量报告，包含通过率趋势图和问题分类统计
- **疑问澄清**:
  - 量化方法：采用百分制评分，各项指标加权计算
  - 检查频率：实时数据流中嵌入检查，全量数据每日定时扫描

### 步骤 6: 集成JWT鉴权机制
- **技术栈**: NestJS, Passport.js, JWT
- **难点解决方案**: 
  - 实现全局鉴权守卫，结合元数据定义接口权限级别
  - 使用refreshToken自动续期机制，减少重复登录
  - 基于资源ID实现细粒度权限控制，如user:read:{userId}
- **疑问澄清**:
  - 安全平衡：敏感操作需二次验证，普通查询放宽限制
  - 多因素认证：初期不需要，预留扩展接口

### 步骤 7: 设计模块API接口
- **技术栈**: NestJS, Swagger, RESTful
- **难点解决方案**: 
  - 采用/v{version}/{module}/资源路径的版本控制策略
  - 实现请求队列和速率限制中间件，防止突发流量
  - 使用Swagger插件自动生成文档，保持代码同步
- **疑问澄清**:
  - 响应格式：标准化为{code,data,message,timestamp}结构
  - 限流策略：基于令牌桶算法，区分API重要性设置不同阈值

### 步骤 8: 实现性能监控和日志记录
- **技术栈**: Winston, Prometheus, Grafana
- **难点解决方案**: 
  - 定义关键指标：QPS、响应时间、错误率、缓存命中率
  - 采用ELK架构处理日志，按服务/日期分索引存储
  - 设置三级告警：Warning(邮件)、Error(短信)、Critical(电话)
- **疑问澄清**:
  - 粒度控制：核心链路全量监控，辅助功能采样收集
  - 日志保留：生产环境保留30天，测试环境保留7天

### 步骤 9: 编写单元测试和集成测试
- **技术栈**: Jest, Supertest, Mock Service Worker
- **难点解决方案**: 
  - 使用Faker.js生成测试数据，覆盖边界条件
  - 实现容器化测试环境，模拟真实数据量
  - 设置覆盖率阈值：单元测试>80%，集成测试>60%
- **疑问澄清**:
  - 性能测试：使用Artillery模拟并发场景
  - 数据管理：每个测试用例独立事务，自动回滚

### 步骤 10: 文档编写和API发布
- **技术栈**: Swagger UI, Markdown, Postman
- **难点解决方案**: 
  - 集成Swagger UI到CI流程，自动发布最新文档
  - 提供Postman集合文件，包含典型使用场景
  - 文档中明确标注接口限制、QPS配额和错误码规范
- **疑问澄清**:
  - 文档结构：按功能模块划分，包含快速入门和高级指南
  - 多语言：初期仅中文，预留i18n扩展点


