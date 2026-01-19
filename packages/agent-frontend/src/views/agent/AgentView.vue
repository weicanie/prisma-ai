<script setup lang="ts">
import ClickCollapsible from '@/components/ClickCollapsible.vue';
import { useCustomQuery } from '@/query/config';
import { ProjectQueryKey } from '@/query/keys';
import {
	getConversationList,
	startNewConversation,
	storeConversation
} from '@/services/agent/conversation';
import { findAllProjects } from '@/services/project';
import { useSseAnswer } from '@/services/sse/useSseAnswer';
import { useAIChatStore } from '@/stores/aichat';
import { cn } from '@/utils/lib/utils';
import { useIsMobile } from '@/utils/use-mobile';
import type { ChatMessage, ConversationDto } from '@prisma-ai/shared';
import { InterruptType } from '@prisma-ai/shared';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';
import { nextTick, onUnmounted, ref, watch } from 'vue';
import { deleteCurStream, hasCurStream, startAgent } from '../../services/agent';
import { useTheme } from '../../utils/theme';
import FeedBack from './c-cpns/FeedBack.vue';
import UserConversations from './c-cpns/UserConversations.vue';
import UserProjects from './c-cpns/UserProjects.vue';

// ==================== State ====================
const store = useAIChatStore();
const { project_id, model, lastConversation } = storeToRefs(store);

// 所有对话的历史记录
const messageHistory = ref<Record<string, ChatMessage[]>>({});
const conversations = ref<ConversationDto[]>([]);
const curConversation = ref<string>('');

const isFetchingHistory = ref(true);
const loading = ref(false);
const messages = ref<ChatMessage[]>([]);

const formToShow = ref<InterruptType | null>(null);
const setFormToShow = (type: InterruptType | null) => {
	formToShow.value = type;
};

// ==================== Event ====================
const { content, reasonContent, done, isReasoning, start } = useSseAnswer(true);

// 生成结束后更新消息历史记录
watch(done, newDone => {
	if (newDone) {
		const aiMessage: ChatMessage = {
			id: `assistant-${Date.now()}`,
			role: 'assistant',
			content: content.value,
			reasonContent: reasonContent.value,
			create_at: new Date()
		};
		const currentHistory = [...messages.value];
		messages.value = [...currentHistory, aiMessage];
	}
});

const longPull = async (runId: string) => {
	const { data: hasStream } = await hasCurStream(runId);
	if (hasStream.hasCurStream) {
		return hasStream;
	} else {
		return longPull(runId);
	}
};

const startAgentStream = async () => {
	// 恢复自动滚动
	userScrolled.value = false;
	const userMessage: ChatMessage = {
		id: `user-${Date.now()}`,
		role: 'user',
		content: '启动Agent'
	};
	const currentHistory = [...messages.value, userMessage];
	messages.value = currentHistory;

	// 启动Agent
	const { data: task } = await startAgent({
		projectId: '68f792df2855e78e91aff624',
		lightspot:
			'S: 组件开发流程不统一；T: 制定标准化开发规范；A: 主导制定组件开发规范和文档标准；R: 组件复用率提升40%',
		projectPath: 'prisma-chat'
	});

	// 循环长轮询，因为agent可能输出多次
	while (true) {
		const hasStream = await longPull(task.sessionId!);

		// agent执行已结束则不再检测
		if (hasStream.pollDone) break;

		if (!hasStream.hasCurStream) continue;

		try {
			await start({
				path: '/prisma_agent/stream',
				input: {
					input: { runId: task.sessionId! }
				},
				model: model.value
			});

			// 等待当前流结束（done转为true，可能是流成功接收完毕，也可能是出错了！）
			await new Promise<void>(resolve => {
				const unwatch = watch(done, newVal => {
					if (newVal) {
						unwatch();
						resolve();
					}
				});
			});
			// 流成功接收完毕后，报告后端当前流已结束，并展示反馈表单
			if (content) {
				setFormToShow(hasStream.interruptType);
				await deleteCurStream(task.sessionId!);
			}
		} catch (err) {
			console.error(err);
			ElMessage.error('没有得到AI的响应。');
			break;
		}
	}
};

const handleNewConversation = async () => {
	if (loading.value) {
		ElMessage.error('消息正在请求中，您可以等待请求完成或立即创建新对话...');
		return;
	}

	const uuid = crypto.randomUUID();
	const newConversation: ConversationDto = {
		keyname: uuid,
		label: `对话-${uuid}`,
		id: -1, // Temporary id
		content: [],
		user_id: -1,
		create_at: new Date(),
		update_at: new Date(),
		project_id: project_id.value
	};

	// Add to UI immediately for better UX
	conversations.value = [newConversation, ...conversations.value];
	curConversation.value = uuid;
	store.setAIChatLastConversation(curConversation.value);

	messages.value = [];

	try {
		await startNewConversation(
			newConversation.keyname,
			newConversation.label,
			[],
			project_id.value
		);
		ElMessage.success('创建成功');
	} catch {
		ElMessage.error('创建新对话失败，请稍后重试...');
		// Revert state if API call fails
		conversations.value = conversations.value.filter(c => c.keyname !== uuid);
	}
};

// 监听消息变化,保存会话到数据库
let debounceSave: number | undefined;
watch(
	[messages, curConversation, conversations, loading, project_id],
	() => {
		const saveConversation = async () => {
			if (messages.value.length === 0 || !curConversation.value || loading.value) return;

			const currentConversation = conversations.value.find(
				c => c.keyname === curConversation.value
			);
			if (currentConversation) {
				try {
					await storeConversation(
						currentConversation.keyname,
						currentConversation.label,
						messages.value,
						project_id.value
					);
					// Update local history
					messageHistory.value = {
						...messageHistory.value,
						[curConversation.value]: messages.value
					};
				} catch {
					ElMessage.error('保存对话失败，请稍后重试...');
				}
			}
		};

		if (debounceSave) clearTimeout(debounceSave);
		debounceSave = window.setTimeout(saveConversation, 1000);
	},
	{ deep: true }
);

onUnmounted(() => {
	if (debounceSave) clearTimeout(debounceSave);
});

// 创建滚动容器的引用
const rollContainerRef = ref<HTMLDivElement | null>(null);
// 用户是否手动滚动的状态
const userScrolled = ref(false);

// 检测用户是否手动滚动了内容
const handleScroll = (e: Event) => {
	const element = e.target as HTMLDivElement;
	const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 35;
	userScrolled.value = !isAtBottom;
};

// 监听内容变化，自动滚动到底部
watch(
	[messages, content, reasonContent, userScrolled],
	() => {
		if (rollContainerRef.value && !userScrolled.value) {
			const element = rollContainerRef.value;
			// 使用 nextTick 确保DOM更新后再滚动
			nextTick(() => {
				element.scrollTop = element.scrollHeight;
			});
		}
	},
	{ deep: true }
);

// 切换到新的会话后自动滚动到底部
watch(curConversation, () => {
	setTimeout(() => {
		if (rollContainerRef.value) {
			rollContainerRef.value.scrollTop = rollContainerRef.value.scrollHeight;
		}
	}, 500);
});

const isMobile = useIsMobile();

// 获取项目经验数据
const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);

// 在project_id获取后，获取会话列表
watch(
	project_id,
	newProjectId => {
		const fetchHistory = async () => {
			isFetchingHistory.value = true;
			try {
				const res = await getConversationList(newProjectId);
				const historyConversations = res.data;
				conversations.value = historyConversations;

				if (historyConversations.length > 0) {
					const historyMap = historyConversations.reduce(
						(acc, curr) => {
							acc[curr.keyname] = curr.content;
							return acc;
						},
						{} as Record<string, ChatMessage[]>
					);

					messageHistory.value = historyMap;
					// 如果有上次对话记录且在列表中，恢复该对话，否则默认选第一个
					const targetConversation = historyConversations.find(
						c => c.keyname === lastConversation.value
					)
						? lastConversation.value
						: historyConversations[0]!.keyname;

					curConversation.value = targetConversation;
					store.setAIChatLastConversation(targetConversation);

					const firstMessages = historyMap[targetConversation] || [];
					messages.value = firstMessages;
				} else {
					// If no history, create a new conversation
					handleNewConversation();
				}
			} catch {
				ElMessage.error('获取对话历史失败，请稍后重试...');
			} finally {
				isFetchingHistory.value = false;
			}
		};
		if (newProjectId) {
			fetchHistory();
		}
	},
	{ immediate: true }
);

// 在project_id获取后，设置默认选中第一个项目
watch(
	data,
	newData => {
		const projects = newData?.data;
		if (projects && projects.length > 0 && !project_id.value) {
			store.setAIChatProjectId(projects[0]!.id);
		}
	},
	{ immediate: true }
);
//TODO 主题和主应用同步
const { setTheme } = useTheme();
setTheme('system');
</script>

<template>
	<div class="w-full h-[calc(100vh-100px)]! bg-white dark:bg-zinc-950 font-sans">
		<div class="flex gap-4 p-4">
			<el-button type="primary" round @click="startAgentStream">启动Agent</el-button>
			<el-button type="info" round @click="$router.push('/config')">系统设置</el-button>
		</div>
		<FeedBack
			v-if="formToShow === InterruptType.HumanReview"
			runId="123"
			:type="InterruptType.HumanReview"
			@submit="setFormToShow(null)"
		/>
		<FeedBack
			v-if="formToShow === InterruptType.ExecuteStep"
			runId="1234"
			:type="InterruptType.ExecuteStep"
			@submit="setFormToShow(null)"
		/>
		<div class="h-full w-full flex flex-col justify-center items-center box-border gap-4 relative">
			<div v-if="status === 'pending'"></div>
			<div v-else-if="status === 'error'">错误:{{ data?.message }}</div>
			<template v-else>
				<div v-if="isFetchingHistory">加载对话历史中...</div>
				<div
					v-else
					class="overflow-auto h-[calc(100vh-200px)]! w-full scb-thin bg-white dark:bg-zinc-950"
					ref="rollContainerRef"
					@scroll="handleScroll"
				>
					<div
						v-if="messages?.length"
						:class="cn('flex flex-col gap-5', isMobile ? 'px-1' : 'px-10')"
					>
						<template v-for="(item, index) in messages" :key="item.id || index">
							<div v-if="item.reasonContent && item.role !== 'user'">
								<ClickCollapsible
									title="思考过程"
									:default-open="false"
									class="border-blue-400 border-l-1 pl-2"
								>
									{{ item.reasonContent }}
								</ClickCollapsible>
							</div>
							<div>{{ item.content }}</div>
						</template>
						<!-- 当前正在生成的AI消息 -->
						<template v-if="done === false || isReasoning">
							<div v-if="reasonContent">
								<ClickCollapsible
									title="思考过程"
									:default-open="false"
									class="border-blue-400 border-l-1 pl-2"
								>
									{{ reasonContent }}
								</ClickCollapsible>
							</div>
							<div>{{ content }}</div>
						</template>
					</div>
					<div v-else class="w-full flex justify-center items-center">暂无对话记录</div>
				</div>

				<!-- 底部面板 -->
				<div class="w-full flex flex-col justify-center items-center gap-3">
					<!-- 项目选择 -->
					<div class="flex justify-between w-full max-w-[700px] relative top-1 z-1">
						<UserProjects
							class="relative"
							@project-select="
								projectId => {
									console.log('选中项目:', projectId);
								}
							"
						/>
					</div>
				</div>

				<!-- 会话管理 -->
				<div class="bg-white dark:bg-zinc-950 w-full px-3">
					<UserConversations
						class="relative"
						:active-key="curConversation"
						:items="
							conversations.map(c => ({
								key: c.keyname,
								label:
									messageHistory[c.keyname]?.length! > 0
										? messageHistory?.[c.keyname]?.[0]?.content.slice(0, 15)! + `...`
										: `新对话 ${
												dayjs(c.create_at).isSame(dayjs(), 'day')
													? '今天'
													: dayjs(c.create_at).format('YYYY-MM-DD')
											}`,
								group: dayjs(c.create_at).isSame(dayjs(), 'day')
									? '今天'
									: dayjs(c.create_at).format('YYYY-MM-DD')
							}))
						"
						@new-conversation="handleNewConversation"
						@active-change="
							async val => {
								if (loading) {
									// abortController logic needed if supported by start/useSseAnswer
								}
								const newMessages = messageHistory?.[val] || [];
								messages = newMessages;
								curConversation = val;
								store.setAIChatLastConversation(val);
							}
						"
						:menu="
							conversation => ({
								items: []
							})
						"
					/>
				</div>
			</template>
		</div>
	</div>
</template>
