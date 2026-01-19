<!-- 
 <ClickCollapsible title="非受控折叠">
		<div>折叠内容...</div>
	</ClickCollapsible>
		
	<ClickCollapsible :open="isOpen" title="受控折叠" enable-preload @click="handleClick">
		<div>重型组件内容...</div>
	</ClickCollapsible> 
-->
<script setup lang="ts">
import { cn } from '@/utils/lib/utils';
import { ChevronRightIcon } from '@heroicons/vue/20/solid';
import { computed, ref } from 'vue';

defineOptions({
	name: 'ClickCollapsible'
});

const props = withDefaults(
	defineProps<{
		defaultOpen?: boolean;
		open?: boolean | undefined; // 使用受控模式
		title?: string;
		class?: string;
		/* 是否在onMouseEnter时预渲染内容
       单独的ClickCollapsible时，enablePreload=true会提升性能
       嵌套的ClickCollapsible时，enablePreload=true反而会降低性能
    */
		enablePreload?: boolean;
	}>(),
	{
		defaultOpen: true,
		open: undefined,
		enablePreload: false
	}
);

const emit = defineEmits<{
	(e: 'click', event: MouseEvent): void;
	(e: 'mouseenter'): void;
	(e: 'mouseleave'): void;
	(e: 'update:open', value: boolean): void;
}>();

const internalOpen = ref(props.defaultOpen);
const preload = ref(false);

const isControlled = computed(() => props.open !== undefined);

const isOpen = computed(() => (isControlled.value ? props.open : internalOpen.value));

// 处理鼠标进入事件
const handleMouseEnter = () => {
	if (props.enablePreload && !preload.value) {
		preload.value = true;
	}
	emit('mouseenter');
};

const handleClick = (e: MouseEvent) => {
	emit('click', e);
	if (!isControlled.value) {
		internalOpen.value = !internalOpen.value;
	} else {
		emit('update:open', !props.open);
	}
};
</script>

<template>
	<!-- 预渲染内容（隐藏） -->
	<div v-if="enablePreload && preload" class="hidden">
		<slot />
	</div>

	<div
		:class="cn('group/collapsible flex flex-col w-full items-start gap-2', props.class)"
		:data-state="isOpen ? 'open' : 'closed'"
	>
		<div
			:class="
				cn('flex items-center w-full cursor-pointer', title ? 'justify-between' : 'justify-end')
			"
			@click="handleClick"
			@mouseenter="handleMouseEnter"
			@mouseleave="emit('mouseleave')"
		>
			<div class="flex items-center gap-2">
				<slot name="icon" />
				<span v-if="title" class="text-sm font-medium">{{ title }}</span>
				<slot v-else name="title" />
			</div>

			<button
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-8 shrink-0"
				type="button"
			>
				<ChevronRightIcon
					class="size-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
				/>
			</button>
		</div>

		<!-- 正常展开的内容 -->
		<div v-if="isOpen" class="w-full">
			<slot />
		</div>
	</div>
</template>
