<script setup lang="ts">
import { cn } from '@/utils/lib/utils';
import { ChatBubbleLeftRightIcon, PencilSquareIcon } from '@heroicons/vue/20/solid';
import { ElButton } from 'element-plus';
import { computed, ref, watch, type VNode } from 'vue';
import UserConversationsContent from './UserConversationsContent.vue';

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
const props = withDefaults(
	defineProps<{
		items: Conversation[];
		layout?: 'list' | 'popover';
		activeKey?: string;
		class?: string;
		menu?: (conversation: Conversation) => { items: MenuItem[] };
	}>(),
	{
		layout: 'list'
	}
);

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
	<div
		:class="
			cn('relative flex justify-center', props.layout === 'list' ? 'flex-col' : '', props.class)
		"
	>
		<!-- 触发器：始终显示当前会话 -->
		<ElButton
			class="!w-fit !justify-start !items-center !text-left !h-9 !rounded-[50px] dark:!text-zinc-300"
			@click="isOpen = !isOpen"
			v-if="props.layout === 'popover'"
		>
			<ChatBubbleLeftRightIcon class="size-4 mr-1 shrink-0 dark:text-zinc-300" />
			对话列表
		</ElButton>
		<!-- 添加会话 -->
		<ElButton
			text
			bg
			class="mt-3 !rounded-[50px] dark:!text-zinc-300"
			@click="emit('new-conversation')"
		>
			<PencilSquareIcon class="size-4 mr-1 shrink-0 dark:text-zinc-300" />
			新建对话
		</ElButton>

		<UserConversationsContent
			class="top-3"
			v-if="props.layout === 'list'"
			:active-key="props.activeKey"
			:active-conversation="activeConversation"
			:grouped-conversations="groupedConversations"
			:sorted-groups="sortedGroups"
			@active-change="
				itemKey => {
					emit('active-change', itemKey);
				}
			"
		/>

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

					<!-- 弹窗内容 -->
					<UserConversationsContent
						:active-key="props.activeKey"
						:active-conversation="activeConversation"
						:grouped-conversations="groupedConversations"
						:sorted-groups="sortedGroups"
						@active-change="
							itemKey => {
								emit('active-change', itemKey);
							}
						"
					/>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>
