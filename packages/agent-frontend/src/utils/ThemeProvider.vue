<script setup lang="ts">
/**
 * 基于 Vue Provide/Inject 实现主题设置、系统主题监听、实际应用主题查询
 *
 * 通过 localStorage 持久化存取当前主题，以在页面刷新后维持
 *
 * 通过给 html 根节点添加 'light' or 'dark' class，配合 tailwind 的 dark mode 使用
 */
import { onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { THEME_KEY, type ThemeContextProps, type ThemeType } from './theme';

const themes: ThemeType[] = ['light', 'dark', 'system'];

function getSystemTheme(): 'light' | 'dark' {
	if (
		typeof window !== 'undefined' &&
		window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)').matches
	) {
		return 'dark';
	}
	return 'light';
}

const theme = ref<ThemeType>((localStorage.getItem('theme') as ThemeType) || 'system');
const systemTheme = ref<'light' | 'dark'>(getSystemTheme());
const resolvedTheme = ref<'light' | 'dark'>('light');

// 计算并更新实际主题
const updateResolvedTheme = () => {
	resolvedTheme.value = theme.value === 'system' ? systemTheme.value : theme.value;
};

// 监听系统主题变化
let mql: MediaQueryList | null = null;
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
	systemTheme.value = e.matches ? 'dark' : 'light';
};

onMounted(() => {
	mql = window.matchMedia('(prefers-color-scheme: dark)');
	mql.addEventListener('change', handleSystemThemeChange);

	// 初始化
	updateResolvedTheme();
});

onUnmounted(() => {
	if (mql) {
		mql.removeEventListener('change', handleSystemThemeChange);
	}
});

// 切换主题并持久化
const setTheme = (t: ThemeType) => {
	theme.value = t;
	localStorage.setItem('theme', t);
};

// 监听 theme 或 systemTheme 变化，更新 resolvedTheme
watch([theme, systemTheme], () => {
	updateResolvedTheme();
});

// 监听 resolvedTheme 变化，更新 DOM 和发送事件
watch(
	resolvedTheme,
	newTheme => {
		if (typeof window !== 'undefined') {
			const root = window.document.documentElement;
			root.classList.remove('light', 'dark');
			root.classList.add(newTheme);
		}
	},
	{ immediate: true }
);

// 提供给子组件
provide(THEME_KEY, {
	theme,
	setTheme,
	resolvedTheme,
	systemTheme,
	themes
} as ThemeContextProps);
</script>

<template>
	<slot />
</template>
