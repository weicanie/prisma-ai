<script setup lang="ts">
import ClickCollapsible from '@/components/ClickCollapsible.vue';
import { cn } from '@/utils/lib/utils';
import {
	ChatBubbleLeftRightIcon,
	EllipsisVerticalIcon,
	PencilSquareIcon
} from '@heroicons/vue/20/solid';
import { ElButton, ElPopover, ElTag } from 'element-plus';
import { computed, ref, watch, type VNode } from 'vue';

// 类型定义
export type Conversation = {
	key: string;
	label: string;
	group: string;
};

export type MenuItem = {
	key: string;
	label: string;
	icon?: VNode;
	danger?: boolean;
	onClick?: () => void;
};

// Props 定义
const props = defineProps<{
	items: Conversation[];
	activeKey?: string;
	class?: string;
	menu?: (conversation: Conversation) => { items: MenuItem[] };
}>();

// Emits 定义
const emit = defineEmits<{
	(e: 'active-change', key: string): void;
	(e: 'new-conversation'): void;
}>();

// 控制悬浮卡片的显示和隐藏
const isOpen = ref(false);

// 获取当前选中的会话
const activeConversation = computed(() => props.items.find(c => c.key === props.activeKey));

// 按group字段对会话进行分组
const groupedConversations = computed(() => {
	return props.items.reduce(
		(acc, item) => {
			(acc[item.group] = acc[item.group] || []).push(item);
			return acc;
		},
		{} as Record<string, Conversation[]>
	);
});

// 对分组进行排序，"今天"在最前面，其他按日期降序
const sortedGroups = computed(() => {
	return Object.keys(groupedConversations.value).sort((a, b) => {
		if (a === '今天') return -1;
		if (b === '今天') return 1;
		return b.localeCompare(a); // 日期字符串降序排序
	});
});

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
	<div :class="cn('relative w-full flex justify-center', props.class)">
		<div class="flex w-full items-center justify-between sm:justify-center sm:gap-7">
			<!-- 触发器：始终显示当前会话 -->
			<ElButton
				class="!w-fit !justify-start !items-center !text-left !h-9 !rounded-[50px] dark:!text-zinc-300"
				@click="isOpen = !isOpen"
			>
				<ChatBubbleLeftRightIcon class="size-4 mr-1 shrink-0 dark:text-zinc-300" />
				对话列表
			</ElButton>
			<!-- 添加会话 -->
			<ElButton class="!rounded-[50px] dark:!text-zinc-300" @click="emit('new-conversation')">
				<PencilSquareIcon class="size-4 mr-1 shrink-0 dark:text-zinc-300" />
				新建对话
			</ElButton>
		</div>

		<!-- 悬浮内容 -->
		<Teleport to="body">
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

					<!-- 弹窗内容 -->
					<div
						class="relative z-50 w-[min(500px,80vw)] max-h-[50vh] overflow-y-auto rounded-md border bg-white p-3 shadow-lg dark:bg-zinc-900"
						:style="{
							position: 'absolute',
							bottom: 'calc(60px)',
							left: '50%',
							transform: 'translateX(-50%)'
						}"
					>
						<div class="flex flex-col">
							<ClickCollapsible
								v-for="group in sortedGroups"
								:key="group"
								:title="group"
								:default-open="group === '今天' || group === activeConversation?.group"
								class="p-0"
							>
								<template #title>
									<ElTag effect="plain">{{ group }}</ElTag>
								</template>

								<div class="flex flex-col gap-1 py-1 pl-2">
									<div
										v-for="item in groupedConversations[group]"
										:key="item.key"
										class="group/item flex w-full items-center justify-between rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
									>
										<ElButton
											:type="item.key === activeKey ? 'primary' : ''"
											:text="item.key !== activeKey"
											class="!h-8 !flex-1 !justify-start !truncate !px-2 !text-xs"
											@click="emit('active-change', item.key)"
										>
											<span class="truncate">{{ item.label }}</span>
										</ElButton>

										<!-- 会话操作菜单 -->
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
	</div>
</template>
