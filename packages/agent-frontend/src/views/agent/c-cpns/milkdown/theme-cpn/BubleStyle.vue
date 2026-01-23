<template>
	<div style="display: none"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import bubleStyle from './buble.css?inline';

let styleElement: HTMLStyleElement | null = null;

onMounted(() => {
	styleElement = document.createElement('style');
	styleElement.setAttribute('type', 'text/css');
	styleElement.textContent = bubleStyle;
	document.head.appendChild(styleElement);
});

onUnmounted(() => {
	if (styleElement && styleElement.parentNode) {
		styleElement.parentNode.removeChild(styleElement);
		styleElement = null;
	}
});
</script>
