<script setup lang="ts">
import { useTheme } from '@/utils/theme';
import { onMounted, onUnmounted } from 'vue';
import { saveUserConfig } from '../utils/userConfig';
let isReady = false;
const theme = useTheme();

const handleMessage = (event: MessageEvent) => {
	if (event.data && event.data.type === 'HANDSHAKE') {
		// 回复握手，告知父应用微应用已准备就绪
		if (!isReady) {
			isReady = true;
			window.parent.postMessage(
				{
					type: 'MICRO_APP_READY'
				},
				'*'
			);
			console.log('微应用握手完成');
		}

		console.log('微应用接收到消息:', event.data);

		// 处理 token 、 theme、userConfig
		if (event.data.payload.token) {
			localStorage.setItem('token', event.data.payload.token);
		}
		if (event.data.payload.theme) {
			theme.setTheme(event.data.payload.theme);
		}
		if (event.data.payload.userConfig) {
			saveUserConfig(event.data.payload.userConfig);
		}
	} else if (event.data && event.data.type === 'SEND_MESSAGE') {
		console.log('微应用接收到消息:', event.data);

		// 处理 token 和 theme
		if (event.data.payload.token) {
			localStorage.setItem('token', event.data.payload.token);
		}
		if (event.data.payload.theme) {
			theme.setTheme(event.data.payload.theme);
		}
	}
};

/* 微应用握手和token、theme消息接收 */
onMounted(() => {
	window.addEventListener('message', handleMessage);

	// 主动发送准备就绪消息（防止时机问题）
	const notifyReady = () => {
		if (!isReady) {
			isReady = true;
			window.parent.postMessage(
				{
					type: 'MICRO_APP_READY'
				},
				'*'
			);
		}
	};

	// 延迟发送，确保组件完全渲染
	notifyReady();
});

onUnmounted(() => {
	window.removeEventListener('message', handleMessage);
});
</script>

<template>
	<div class="none"></div>
</template>
