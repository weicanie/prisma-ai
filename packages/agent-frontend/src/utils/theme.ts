import { inject, type InjectionKey, type Ref } from 'vue';

export type ThemeType = 'light' | 'dark' | 'system';

export interface ThemeContextProps {
	theme: Ref<ThemeType>; // 当前主题设置
	setTheme: (theme: ThemeType) => void; // 切换主题
	resolvedTheme: Ref<'light' | 'dark'>; // 实际应用的主题
	systemTheme: Ref<'light' | 'dark'>; // 系统主题
	themes: ThemeType[]; // 可用主题列表
}

export const THEME_KEY: InjectionKey<ThemeContextProps> = Symbol('ThemeContext');

export function useTheme() {
	const ctx = inject(THEME_KEY);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
}
