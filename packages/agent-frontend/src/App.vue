<script setup lang="ts">
import ThemeProvider from '@/utils/ThemeProvider.vue';
import './index.css';
import AgentView from './views/agent/AgentView.vue';
</script>

<template>
	<div class="w-screen h-screen">
		<ThemeProvider>
			<AgentView></AgentView>
		</ThemeProvider>
	</div>
</template>
