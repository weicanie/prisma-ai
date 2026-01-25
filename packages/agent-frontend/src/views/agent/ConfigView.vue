<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/20/solid';
import { AIChatLLM, initialUserConfig, type UserConfig } from '@prisma-ai/shared';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { getUserConfig, saveUserConfig } from '../../utils/userConfig';

const activeTab = ref('agent');

// 初始化表单数据
const form = reactive<UserConfig>(initialUserConfig);

// 模型选项
const llmOptions = Object.values(AIChatLLM).map(value => ({
	label: value,
	value: value
}));

// 加载配置
const loadConfig = () => {
	const config = getUserConfig();
	Object.assign(form, config);
};

// 保存配置
const saveConfig = () => {
	try {
		saveUserConfig(form);
		ElMessage.success('配置保存成功');
	} catch (error) {
		ElMessage.error('配置保存失败');
		console.error(error);
	}
};

// 重置配置
const resetConfig = () => {
	if (confirm('确定要重置为默认配置吗？这将清除所有已保存的设置。')) {
		Object.assign(form, initialUserConfig);
		saveConfig();
	}
};

onMounted(() => {
	loadConfig();
});
</script>

<template>
	<div class="w-screen h-screen bg-global">
		<div class="p-6 max-w-4xl mx-auto">
			<div class="flex justify-between items-center mb-6">
				<div class="relative left-5">
					<el-button type="icon" circle @click="$router.back()">
						<ChevronLeftIcon class="size-7" />
					</el-button>
				</div>

				<div class="space-x-4">
					<el-button @click="resetConfig" type="danger" plain>重置默认</el-button>
					<el-button type="primary" @click="saveConfig">保存配置</el-button>
				</div>
			</div>

			<el-tabs v-model="activeTab" class="p-6 rounded-lg shadow-sm">
				<!-- Agent 设置 -->
				<el-tab-pane label="Agent 设置" name="agent">
					<el-form :model="form" label-position="top">
						<!-- CRAG 开关 -->
						<div class="mb-6 p-4 rounded-lg">
							<el-form-item label="CRAG (Corrective RAG)">
								<div class="flex items-center justify-between w-full">
									<span class="text-gray-500 text-sm">启用修正性检索增强生成，提高回答准确性</span>
									<el-switch v-model="form.agent.CRAG" />
								</div>
							</el-form-item>
						</div>

						<!-- 模型选择 -->
						<div class="mb-6">
							<h3 class="text-lg font-medium mb-4 pb-2 border-b border-gray-200">模型选择</h3>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
								<el-form-item label="Plan (规划阶段)">
									<el-select v-model="form.agent.model.plan" placeholder="选择模型">
										<el-option
											v-for="item in llmOptions"
											:key="item.value"
											:label="item.label"
											:value="item.value"
										/>
									</el-select>
								</el-form-item>
								<el-form-item label="Plan Step (执行阶段)">
									<el-select v-model="form.agent.model.plan_step" placeholder="选择模型">
										<el-option
											v-for="item in llmOptions"
											:key="item.value"
											:label="item.label"
											:value="item.value"
										/>
									</el-select>
								</el-form-item>
								<el-form-item label="Replan (重规划阶段)">
									<el-select v-model="form.agent.model.replan" placeholder="选择模型">
										<el-option
											v-for="item in llmOptions"
											:key="item.value"
											:label="item.label"
											:value="item.value"
										/>
									</el-select>
								</el-form-item>
							</div>
						</div>

						<!-- 检索 TopK 设置 -->
						<div class="mb-6">
							<h3 class="text-lg font-medium mb-4 pb-2 border-b border-gray-200">检索 TopK 设置</h3>

							<!-- Plan TopK -->
							<div class="mb-4">
								<span class="text-sm font-semibold text-gray-700 block mb-2">Plan (规划阶段)</span>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-blue-100">
									<el-form-item label="Knowledge TopK">
										<el-input-number v-model="form.agent.topK.plan.knowledge" :min="1" :max="50" />
									</el-form-item>
									<el-form-item label="Project Code TopK">
										<el-input-number
											v-model="form.agent.topK.plan.projectCode"
											:min="1"
											:max="50"
										/>
									</el-form-item>
								</div>
							</div>

							<!-- Plan Step TopK -->
							<div class="mb-4">
								<span class="text-sm font-semibold text-gray-700 block mb-2"
									>Plan Step (执行阶段)</span
								>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-green-100">
									<el-form-item label="Knowledge TopK">
										<el-input-number
											v-model="form.agent.topK.plan_step.knowledge"
											:min="1"
											:max="50"
										/>
									</el-form-item>
									<el-form-item label="Project Code TopK">
										<el-input-number
											v-model="form.agent.topK.plan_step.projectCode"
											:min="1"
											:max="50"
										/>
									</el-form-item>
								</div>
							</div>

							<!-- Replan TopK -->
							<div class="mb-4">
								<span class="text-sm font-semibold text-gray-700 block mb-2"
									>Replan (重规划阶段)</span
								>
								<div
									class="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-orange-100"
								>
									<el-form-item label="Knowledge TopK">
										<el-input-number
											v-model="form.agent.topK.replan.knowledge"
											:min="1"
											:max="50"
										/>
									</el-form-item>
									<el-form-item label="Project Code TopK">
										<el-input-number
											v-model="form.agent.topK.replan.projectCode"
											:min="1"
											:max="50"
										/>
									</el-form-item>
								</div>
							</div>
						</div>
					</el-form>
				</el-tab-pane>

				<!-- API Keys 设置 -->
				<el-tab-pane label="API Keys" name="apikeys">
					<div class="text-sm my-3 text-gray-500 dark:text-gray-400">
						默认为用户配置，也可以在此设置 Agent 服务专门使用的API Keys
					</div>
					<el-form :model="form" label-position="top">
						<div class="mb-6">
							<h3 class="text-lg font-medium mb-4 pb-2 border-b border-gray-200">LLM 服务商</h3>

							<el-form-item label="DeepSeek API Key">
								<el-input
									v-model="form.llm.deepseek.apiKey"
									type="password"
									show-password
									placeholder="sk-..."
								/>
							</el-form-item>

							<el-form-item label="Google AI (Gemini) API Key">
								<el-input
									v-model="form.llm.googleai.apiKey"
									type="password"
									show-password
									placeholder="AIza..."
								/>
							</el-form-item>

							<el-form-item label="Zhipu (GLM) API Key">
								<el-input
									v-model="form.llm.zhipu.apiKey"
									type="password"
									show-password
									placeholder="key"
								/>
							</el-form-item>

							<el-form-item label="Qwen API Key">
								<el-input
									v-model="form.llm.qwen.apiKey"
									type="password"
									show-password
									placeholder="sk-..."
								/>
							</el-form-item>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<el-form-item label="OpenAI API Key (用于国内代理)">
									<el-input
										v-model="form.llm.openai.apiKey"
										type="password"
										show-password
										placeholder="sk-..."
									/>
								</el-form-item>
								<el-form-item label="OpenAI Base URL">
									<el-input
										v-model="form.llm.openai.baseUrl"
										placeholder="https://api.openai.com/v1"
									/>
								</el-form-item>
							</div>
						</div>

						<div class="mb-6">
							<h3 class="text-lg font-medium mb-4 pb-2 border-b border-gray-200">向量数据库</h3>
							<el-form-item label="Pinecone API Key" required>
								<el-input
									v-model="form.vectorDb.pinecone.apiKey"
									type="password"
									show-password
									placeholder="pc-..."
								/>
							</el-form-item>
						</div>

						<div class="mb-6">
							<h3 class="text-lg font-medium mb-4 pb-2 border-b border-gray-200">搜索服务</h3>
							<el-form-item label="SerpAPI Key">
								<el-input
									v-model="form.search.serpapi.apiKey"
									type="password"
									show-password
									placeholder="..."
								/>
							</el-form-item>
						</div>
					</el-form>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<style scoped>
:deep(.el-input-number) {
	width: 100%;
}
</style>
