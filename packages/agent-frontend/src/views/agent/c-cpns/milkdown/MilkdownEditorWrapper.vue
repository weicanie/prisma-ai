<template>
	<div :class="props.class">
		<MilkdownProvider>
			<MilkdownEditor
				:value="props.value"
				:layout="props.layout"
				:autoAddJsonBlock="props.autoAddJsonBlock"
				:editable="props.editable"
				:onvalueUpdated="props.onValueUpdated"
			/>
		</MilkdownProvider>
	</div>
</template>

<script lang="ts" setup>
import { MilkdownProvider } from '@milkdown/vue';
import MilkdownEditor from './MilkdownEditor.vue';
const props = withDefaults(
	defineProps<{
		class?: string;
		value?: string;
		onValueUpdated?: (value: string) => void;
		autoAddJsonBlock?: boolean;
		layout?: 'default' | 'buble';
		editable?: boolean;
	}>(),
	{
		autoAddJsonBlock: true,
		layout: 'default',
		editable: true
	}
);
</script>
