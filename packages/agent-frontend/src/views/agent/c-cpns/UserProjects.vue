<script setup lang="ts">
import ClickCollapsible from '@/components/ClickCollapsible.vue';
import { useCustomQuery } from '@/query/config';
import { ProjectQueryKey } from '@/query/keys';
import { findAllProjects } from '@/services/project';
import { useAIChatStore } from '@/stores/aichat';
import { cn } from '@/utils/lib/utils';
import { EllipsisVerticalIcon, FolderOpenIcon, PlusIcon } from '@heroicons/vue/20/solid';
import { ElButton, ElMessage, ElPopover, ElTag } from 'element-plus';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch, type VNode } from 'vue';

// 类型定义
export type Project = {
	key: string;
	label: string;
	group: string;
	score?: number;
	status: string;
};

export type MenuItem = {
	key: string;
	label: string;
	icon?: VNode;
	danger?: boolean;
	onClick?: () => void;
};

// Props 定义
const props = withDefaults(
	defineProps<{
		class?: string;
		layout?: 'list' | 'popover';
		menu?: (project: Project) => { items: MenuItem[] };
	}>(),
	{
		layout: 'list'
	}
);

// Emits 定义
const emit = defineEmits<{
	(e: 'project-select', projectId: string): void;
}>();

const store = useAIChatStore();
const { project_id: activeProjectId } = storeToRefs(store);

// 控制悬浮卡片的显示和隐藏
const isOpen = ref(false);

// 获取项目经验数据
const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);

// 转换项目数据格式
const projects = computed<Project[]>(() => {
	if (status.value !== 'success' || !data.value?.data) return [];

	return data.value.data.map(project => ({
		key: project.id,
		label: project.name,
		group: '项目经验',
		score: project.lookupResult?.score,
		status: project.status
	}));
});

// 获取当前选中的项目
const activeProject = computed(() => projects.value.find(p => p.key === activeProjectId.value));

// 按group字段对项目进行分组
const groupedProjects = computed(() => {
	return projects.value.reduce(
		(acc, item) => {
			(acc[item.group] = acc[item.group] || []).push(item);
			return acc;
		},
		{} as Record<string, Project[]>
	);
});

// 对分组进行排序
const sortedGroups = computed(() => {
	return Object.keys(groupedProjects.value).sort((a, b) => {
		return a.localeCompare(b);
	});
});

let timer: number | undefined;

// 设置默认选中第一个项目
watch(
	[projects, activeProjectId],
	() => {
		if (projects.value.length > 0 && !activeProjectId.value) {
			// projects已处理status
			const firstProject = projects.value[0]!;
			store.setAIChatProjectId(firstProject.key);
			emit('project-select', firstProject.key);
		} else if (projects.value && projects.value.length === 0) {
			// 用户当前没有项目时，跳转创建项目经验页面
			if (timer) {
				clearTimeout(timer);
			}
			timer = window.setTimeout(() => {
				ElMessage.info('请先创建至少一个项目经验');
			}, 500);
		}
	},
	{ immediate: true }
);

onMounted(() => {
	// 清理定时器
	return () => {
		if (timer) clearTimeout(timer);
	};
});

// 处理项目选择
const handleProjectSelect = (projectId: string) => {
	store.setAIChatProjectId(projectId);
	emit('project-select', projectId);
	isOpen.value = false;
};

// 动画状态
const showContent = ref(false);
watch(isOpen, val => {
	if (val) {
		showContent.value = true;
	} else {
		setTimeout(() => {
			showContent.value = false;
		}, 200); // 等待动画结束
	}
});
</script>

<template>
	<!-- 加载中 -->
	<div v-if="status === 'pending'" :class="cn('relative w-full flex justify-center', props.class)">
		<ElButton
			disabled
			class="!w-fit !justify-start !items-center !text-left !h-9 !rounded-[50px] dark:!text-zinc-300"
		>
			<FolderOpenIcon class="size-4 mr-1 shrink-0 dark:text-zinc-300" />
			加载中...
		</ElButton>
	</div>

	<!-- 加载失败 -->
	<div
		v-else-if="status === 'error'"
		:class="cn('relative w-full flex justify-center', props.class)"
	>
		<ElButton
			disabled
			class="!w-fit !justify-start !items-center !text-left !h-9 !rounded-[50px] !text-red-500"
		>
			<FolderOpenIcon class="size-4 mr-1 shrink-0" />
			加载失败
		</ElButton>
	</div>

	<!-- 无项目 -->
	<div
		v-else-if="projects.length === 0"
		:class="cn('relative w-full flex justify-center', props.class)"
	>
		<ElButton
			disabled
			class="!w-fit !justify-start !items-center !text-left !h-9 !rounded-[50px] dark:!text-zinc-300"
		>
			<PlusIcon class="size-4 mr-1 shrink-0 dark:text-zinc-300" />
			暂无项目
		</ElButton>
	</div>

	<!-- 正常显示 -->
	<template v-else>
		<!-- 触发器 -->
		<ElButton
			class="!w-fit !justify-start !items-center !text-left !h-9 !rounded-[50px] dark:!text-zinc-300"
			@click="isOpen = !isOpen"
		>
			<FolderOpenIcon class="size-4 mr-1 shrink-0 dark:text-zinc-300" />
			{{ activeProject ? activeProject.label : '选择项目' }}
		</ElButton>
		<!-- 内容 -->
		<div
			v-if="isOpen && props.layout === 'list'"
			class="relative z-50 w-[min(500px,80vw)] max-h-[50vh] overflow-y-auto rounded-md bg-white p-3 shadow-lg dark:bg-zinc-900"
		>
			<div class="flex flex-col">
				<ClickCollapsible
					v-for="group in sortedGroups"
					:key="group"
					:default-open="true"
					class="p-0"
				>
					<template #title>
						<ElTag effect="plain">{{ group }}</ElTag>
					</template>

					<div class="flex flex-col gap-1 py-1 pl-2">
						<div
							v-for="item in groupedProjects[group]"
							:key="item.key"
							class="group/item flex w-full items-center justify-between rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
						>
							<ElButton
								text
								:bg="item.key === activeProjectId"
								class="!h-8 !flex-1 !justify-start !truncate !px-2 !text-xs"
								@click="handleProjectSelect(item.key)"
							>
								<span class="truncate">{{ item.label }}</span>
								<ElTag v-if="item.score" type="info" size="small" class="ml-2 !text-xs">
									{{ item.score }}分
								</ElTag>
							</ElButton>

							<!-- 项目操作菜单 -->
							<ElPopover v-if="props.menu" placement="bottom-end" :width="150" trigger="click">
								<template #reference>
									<ElButton
										text
										circle
										size="small"
										class="!size-7 shrink-0 opacity-0 group-hover/item:opacity-100"
										@click.stop
									>
										<EllipsisVerticalIcon class="size-4" />
									</ElButton>
								</template>
								<div class="flex flex-col gap-1">
									<ElButton
										v-for="menuItem in props.menu(item).items"
										:key="menuItem.key"
										text
										:type="menuItem.danger ? 'danger' : ''"
										class="!h-8 !w-full !justify-start !px-2 !text-xs"
										@click="
											() => {
												menuItem.onClick?.();
											}
										"
									>
										<component :is="menuItem.icon" v-if="menuItem.icon" class="mr-2 size-4" />
										{{ menuItem.label }}
									</ElButton>
								</div>
							</ElPopover>
						</div>
					</div>
				</ClickCollapsible>
			</div>
		</div>

		<!-- 悬浮内容 -->
		<Teleport to="body" v-if="props.layout === 'popover'">
			<Transition
				enter-active-class="transition duration-200 ease-out"
				enter-from-class="opacity-0 translate-y-1"
				enter-to-class="opacity-100 translate-y-0"
				leave-active-class="transition duration-150 ease-in"
				leave-from-class="opacity-100 translate-y-0"
				leave-to-class="opacity-0 translate-y-1"
			>
				<div v-if="isOpen" class="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
					<!-- 蒙板 -->
					<div class="fixed inset-0 bg-black/50 transition-opacity" @click="isOpen = false" />

					<!-- 内容 -->
					<div
						class="relative z-50 w-[min(500px,80vw)] max-h-[50vh] overflow-y-auto rounded-md bg-white p-3 shadow-lg dark:bg-zinc-900"
						:style="{
							position: 'absolute',
							bottom: 'calc(80px)',
							left: '50%',
							transform: 'translateX(-50%)'
						}"
					>
						<div class="flex flex-col">
							<ClickCollapsible
								v-for="group in sortedGroups"
								:key="group"
								:default-open="true"
								class="p-0"
							>
								<template #title>
									<ElTag effect="plain">{{ group }}</ElTag>
								</template>

								<div class="flex flex-col gap-1 py-1 pl-2">
									<div
										v-for="item in groupedProjects[group]"
										:key="item.key"
										class="group/item flex w-full items-center justify-between rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
									>
										<ElButton
											text
											:bg="item.key === activeProjectId"
											class="!h-8 !flex-1 !justify-start !truncate !px-2 !text-xs"
											@click="handleProjectSelect(item.key)"
										>
											<span class="truncate">{{ item.label }}</span>
											<ElTag v-if="item.score" type="info" size="small" class="ml-2 !text-xs">
												{{ item.score }}分
											</ElTag>
										</ElButton>

										<!-- 项目操作菜单 -->
										<ElPopover
											v-if="props.menu"
											placement="bottom-end"
											:width="150"
											trigger="click"
										>
											<template #reference>
												<ElButton
													text
													circle
													size="small"
													class="!size-7 shrink-0 opacity-0 group-hover/item:opacity-100"
													@click.stop
												>
													<EllipsisVerticalIcon class="size-4" />
												</ElButton>
											</template>
											<div class="flex flex-col gap-1">
												<ElButton
													v-for="menuItem in props.menu(item).items"
													:key="menuItem.key"
													text
													:type="menuItem.danger ? 'danger' : ''"
													class="!h-8 !w-full !justify-start !px-2 !text-xs"
													@click="
														() => {
															menuItem.onClick?.();
														}
													"
												>
													<component :is="menuItem.icon" v-if="menuItem.icon" class="mr-2 size-4" />
													{{ menuItem.label }}
												</ElButton>
											</div>
										</ElPopover>
									</div>
								</div>
							</ClickCollapsible>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</template>
</template>
