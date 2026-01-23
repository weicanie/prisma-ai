<template>
	<div style="display: none"></div>
</template>

<script lang="ts" setup>
import nordDarkCss from '@milkdown/crepe/theme/nord-dark.css?inline';
import { onMounted, onUnmounted } from 'vue';

let styleElement: HTMLStyleElement | null = null;

onMounted(() => {
	styleElement = document.createElement('style');
	styleElement.setAttribute('type', 'text/css');
	styleElement.setAttribute('data-theme', 'nord-dark');
	styleElement.textContent = nordDarkCss;
	document.head.appendChild(styleElement);
});

onUnmounted(() => {
	if (styleElement && styleElement.parentNode) {
		styleElement.parentNode.removeChild(styleElement);
		styleElement = null;
	}
});
</script>
