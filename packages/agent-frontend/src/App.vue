<script setup lang="ts">
import ThemeProvider from '@/utils/ThemeProvider.vue';
import './index.css';
</script>

<template>
	<div class="w-screen h-screen">
		<ThemeProvider>
			<RouterView></RouterView>
		</ThemeProvider>
	</div>
</template>
