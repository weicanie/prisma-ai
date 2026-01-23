<template>
	<div style="display: none"></div>
</template>

<script lang="ts" setup>
import nordCss from '@milkdown/crepe/theme/nord.css?inline';
import { onMounted, onUnmounted } from 'vue';

let styleElement: HTMLStyleElement | null = null;

onMounted(() => {
	styleElement = document.createElement('style');
	styleElement.setAttribute('type', 'text/css');
	styleElement.setAttribute('data-theme', 'nord-light');
	styleElement.textContent = nordCss;
	document.head.appendChild(styleElement);
});

onUnmounted(() => {
	if (styleElement && styleElement.parentNode) {
		styleElement.parentNode.removeChild(styleElement);
		styleElement = null;
	}
});
</script>
