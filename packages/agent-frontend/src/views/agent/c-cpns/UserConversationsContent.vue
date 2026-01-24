<script setup lang="ts">
import ClickCollapsible from '@/components/ClickCollapsible.vue';
import { cn } from '@/utils/lib/utils';
import { EllipsisVerticalIcon } from '@heroicons/vue/20/solid';
import { ElButton, ElPopover, ElTag } from 'element-plus';
import { type VNode } from 'vue';
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
	class?: string;
	activeKey?: string;
	menu?: (conversation: Conversation) => { items: MenuItem[] };
	sortedGroups: string[];
	groupedConversations: Record<string, Conversation[]>;
	activeConversation?: Conversation;
}>();

// Emits 定义
const emit = defineEmits<{
	(e: 'active-change', key: string): void;
}>();
</script>

<template>
	<div :class="cn('relative z-50 max-h-[50vh] overflow-y-auto rounded-md p-3', props.class)">
		<div class="flex flex-col">
			<ClickCollapsible
				v-for="group in props.sortedGroups"
				:key="group"
				:title="group"
				:default-open="group === '今天' || group === props.activeConversation?.group"
				class="p-0"
			>
				<template #title>
					<ElTag effect="plain">{{ group }}</ElTag>
				</template>

				<div class="flex flex-col gap-1 py-1 pl-2">
					<div
						v-for="item in props.groupedConversations[group]"
						:key="item.key"
						class="group/item flex w-full items-center justify-between rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						<ElButton
							text
							:bg="item.key === props.activeKey"
							class="!h-8 !flex-1 !justify-start !truncate !px-2 !text-xs"
							@click="emit('active-change', item.key)"
						>
							<span class="truncate">{{ item.label }}</span>
						</ElButton>

						<!-- 会话操作菜单 -->
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
</template>
