<script setup lang="ts">
import { getHasProjectCodeUpload } from '@/services/agent/other';
import { useAIChatStore } from '@/stores/aichat';
import type { ImplementDto } from '@prisma-ai/shared';
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import UserProjects from './UserProjects.vue';

const props = defineProps<{
	startAgent?: (dto: ImplementDto) => Promise<void>;
}>();

const emit = defineEmits<{
	(e: 'start', dto: ImplementDto): void;
}>();

const store = useAIChatStore();
const { implementDto } = storeToRefs(store);

const uploadStatus = ref<'checking' | 'uploaded' | 'not_uploaded' | 'error' | null>(null);
const statusMessage = ref('');

let timeoutId: number | undefined;

const checkUpload = async (path: string) => {
	if (!path) {
		uploadStatus.value = null;
		statusMessage.value = '';
		return;
	}
	uploadStatus.value = 'checking';
	statusMessage.value = '检查中...';
	try {
		const res = await getHasProjectCodeUpload(path);
		if (res.data) {
			uploadStatus.value = 'uploaded';
			statusMessage.value = '项目代码已上传';
		} else {
			uploadStatus.value = 'not_uploaded';
			statusMessage.value = '项目代码未上传';
		}
	} catch (e) {
		uploadStatus.value = 'error';
		statusMessage.value = `检查项目代码是否上传失败: ${e}`;
	}
};

watch(
	() => implementDto.value.projectPath,
	newVal => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => {
			checkUpload(newVal);
		}, 500);
	}
);

const handleStart = () => {
	if (!implementDto.value.projectId) {
		ElMessage.warning('请选择项目');
		return;
	}
	if (!implementDto.value.projectPath) {
		ElMessage.warning('请输入项目路径');
		return;
	}
	if (!implementDto.value.lightspot) {
		ElMessage.warning('请输入亮点');
		return;
	}

	const dto = { ...implementDto.value };

	if (props.startAgent) {
		props.startAgent(dto);
	} else {
		emit('start', dto);
	}
};
</script>

<template>
	<div
		class="flex flex-col gap-4 p-4 rounded-lg bg-white dark:bg-zinc-900 shadow-sm w-full max-w-[600px]"
	>
		<h3 class="text-lg font-bold">启动 Agent</h3>

		<!-- Project Selection -->
		<div class="flex flex-col gap-2">
			<label class="text-sm font-medium">选择项目</label>
			<UserProjects class="w-full" />
		</div>

		<!-- Project Path -->
		<div class="flex flex-col gap-2">
			<label class="text-sm font-medium">项目路径 (文件夹名称)</label>
			<div class="flex flex-col gap-1">
				<el-input
					v-model="implementDto.projectPath"
					placeholder="请输入项目文件夹名称 (例如: prisma-chat)"
					clearable
				/>
				<div class="text-xs h-5 flex items-center">
					<span v-if="uploadStatus === 'checking'" class="text-gray-500"> 检查中... </span>
					<span
						v-else-if="uploadStatus === 'uploaded'"
						class="text-green-600 flex items-center gap-1"
					>
						✅ 代码已上传
					</span>
					<span
						v-else-if="uploadStatus === 'not_uploaded'"
						class="text-red-500 flex items-center gap-1"
					>
						❌ 代码未上传
					</span>
					<span v-else-if="uploadStatus === 'error'" class="text-red-500 flex items-center gap-1">
						⚠️ 检查失败
					</span>
				</div>
			</div>
		</div>

		<!-- Lightspot -->
		<div class="flex flex-col gap-2">
			<label class="text-sm font-medium">要实现的亮点/需求</label>
			<el-input
				v-model="implementDto.lightspot"
				type="textarea"
				:rows="4"
				placeholder="亮点/需求"
			/>
		</div>

		<!-- Action -->
		<div class="flex justify-end pt-2">
			<el-button type="primary" @click="handleStart"> 开始运行 </el-button>
		</div>
	</div>
</template>
