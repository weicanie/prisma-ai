<script setup lang="ts">
import MicroApp from '@/components/MicroApp.vue';
import ThemeProvider from '@/utils/ThemeProvider.vue';
import './index.css';
</script>

<template>
	<div class="w-screen h-screen">
		<ThemeProvider>
			<MicroApp></MicroApp>
			<RouterView></RouterView>
		</ThemeProvider>
	</div>
</template>
