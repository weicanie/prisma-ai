<script setup lang="ts">
import { recoverAgent } from '@/services/agent';
import { cn } from '@/utils/lib/utils';
import { InterruptType, UserAction, type RecoverDto } from '@prisma-ai/shared';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { useAIChatStore } from '../../../stores/aichat';
import MilkdownEditorWrapper from './milkdown/MilkdownEditorWrapper.vue';

const props = defineProps<{
	type: InterruptType;
	class?: string;
	lastMessage?: string; // 最近一条ai消息
	addMessage: (content: string) => void;
}>();

const emit = defineEmits<{
	(e: 'success'): void;
}>();

const loading = ref(false);

// HumanReview 表单数据
const humanForm = reactive({
	action: UserAction.ACCEPT,
	content: ''
});

// Fixed content for 'fix' action
const fixedContent = ref('');

// ResultStep 表单数据 (占位，根据需求扩展)
const resultForm = reactive({
	userFeedback: '',
	summary: ''
});

const isHumanReview = computed(() => {
	return props.type === InterruptType.HumanReview;
});

const aiChatStore = useAIChatStore();

const submit = async () => {
	if (isHumanReview.value) {
		if (humanForm.action === UserAction.REDO && !humanForm.content.trim()) {
			ElMessage.warning('请填写反馈内容');
			return;
		}
		if (humanForm.action === UserAction.FIX && !fixedContent.value.trim()) {
			ElMessage.warning('请填写修正内容');
			return;
		}
	}

	loading.value = true;
	try {
		const curTask: { runId: string } = JSON.parse(
			window.localStorage.getItem('lastAgentTask') || '{}'
		);
		if (!curTask.runId) {
			ElMessage.error('请先启动Agent');
			return;
		}
		const dto: Partial<RecoverDto> = {
			runId: curTask.runId
		};

		if (isHumanReview.value) {
			dto.feedback = {
				action: humanForm.action,
				content: humanForm.content
			};
			if (humanForm.action === UserAction.FIX) {
				dto.fixedContent = fixedContent.value;
			}
		} else {
			dto.feedback = {
				output: {
					userFeedback: resultForm.userFeedback,
					writtenCodeFiles: [],
					summary: resultForm.summary
				}
			};
		}

		await recoverAgent(dto as RecoverDto);
		ElMessage.success('反馈成功，Prisma将继续执行');
		props.addMessage(
			isHumanReview.value
				? `### 人工审核
		- 指示：${humanForm.action}
		${humanForm.action === UserAction.FIX ? `- 修正后的内容：\`\`\`${dto.fixedContent}\`\`\`` : ''}
		${humanForm.action === UserAction.REDO ? `- 重做，反馈：\`\`\`${dto.fixedContent}\`\`\`` : ''}
		`
				: `### 步骤执行反馈
				#### 用户反馈
				${resultForm.userFeedback}
				#### 执行总结
				${resultForm.summary}`
		);
		emit('success');
	} catch (error) {
		console.error(error);
		ElMessage.error('提交失败，请重试');
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<div
		:class="
			cn(
				'p-4 border rounded-lg shadow-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800',
				props.class
			)
		"
	>
		<h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
			{{ isHumanReview ? '人工审核反馈' : '步骤执行反馈' }}
		</h3>

		<el-form v-if="isHumanReview" label-position="top">
			<el-form-item label="操作建议">
				<el-radio-group v-model="humanForm.action">
					<el-radio-button :label="UserAction.ACCEPT">接受 (Accept)</el-radio-button>
					<el-radio-button :label="UserAction.FIX">修正 (Fix)</el-radio-button>
					<el-radio-button :label="UserAction.REDO">重做 (Redo)</el-radio-button>
				</el-radio-group>
			</el-form-item>

			<el-form-item v-if="humanForm.action === UserAction.REDO" label="反馈意见" required>
				<el-input
					v-model="humanForm.content"
					type="textarea"
					:rows="3"
					placeholder="请告诉 Agent 需要改进的地方..."
				/>
			</el-form-item>

			<el-form-item
				v-if="humanForm.action === UserAction.FIX"
				label="手动修正内容（请输入修正后的完整内容）"
				required
			>
				<MilkdownEditorWrapper
					:editable="true"
					class="w-full"
					layout="default"
					:value="aiChatStore.fixedContent || props.lastMessage"
					:onValueUpdated="aiChatStore.setAIChatFixedContent"
				/>
			</el-form-item>

			<div class="flex justify-end mt-4">
				<el-button type="primary" :loading="loading" @click="submit"> 提交反馈 </el-button>
			</div>
		</el-form>

		<el-form v-else label-position="top">
			<el-form-item label="用户反馈">
				<el-input v-model="resultForm.userFeedback" type="textarea" placeholder="请输入反馈..." />
			</el-form-item>
			<el-form-item label="执行总结">
				<el-input v-model="resultForm.summary" type="textarea" placeholder="请输入执行总结..." />
			</el-form-item>
			<div class="flex justify-end mt-4">
				<el-button type="primary" :loading="loading" @click="submit"> 提交反馈 </el-button>
			</div>
		</el-form>
	</div>
</template>
