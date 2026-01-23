<template>
	<Milkdown />
	<NordDark v-if="theme.resolvedTheme.value === 'dark'" />
	<NordLight v-else />
	<BubleStyle v-if="props.layout === 'buble'" />
</template>

<script lang="ts" setup>
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import { replaceAll } from '@milkdown/utils';
import { Milkdown, useEditor } from '@milkdown/vue';
import { throttle } from 'lodash';
import { watch } from 'vue';
import { useTheme } from '../../../../utils/theme';
import BubleStyle from './theme-cpn/BubleStyle.vue';
import NordDark from './theme-cpn/NordDark.vue';
import NordLight from './theme-cpn/NordLight.vue';
const props = withDefaults(
	defineProps<{
		value?: string;
		onvalueUpdated?: (value: string) => void;
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

function addJsonBlock(content: string) {
	if (props.autoAddJsonBlock && content.trim().startsWith('{')) {
		return `\`\`\`json\n${content}\n\`\`\``;
	}
	return content;
}

function removeJsonBlock(content: string) {
	return content.replace(/^```(json|JSON)\n|\n```$/g, '');
}

const updateText = throttle((content: string) => {
	//@ts-expect-error ...
	crepe.get()?.action(replaceAll(addJsonBlock(content), true));
}, 300);

watch(
	() => props.value,
	newValue => {
		if (newValue) {
			updateText(newValue);
		}
	}
);

//@ts-expect-error ...
const crepe = useEditor(root => {
	const crepe = new Crepe({ root, defaultValue: addJsonBlock(props.value || '未输入文本') });
	crepe.on(listener => {
		listener.markdownUpdated((_, markdown: string) => {
			props.onvalueUpdated?.(removeJsonBlock(markdown));
		});
	});
	if (!props.editable) {
		crepe.setReadonly(true);
	} else {
		crepe.setReadonly(false);
	}
	// const editor = crepe.editor;
	return crepe;
});
const theme = useTheme();
defineExpose({
	crepe
});
</script>
