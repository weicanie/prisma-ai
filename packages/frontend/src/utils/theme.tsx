/* 
  基于 React Context 实现主题设置、系统主题监听、实际应用主题查询、当前主题列表

  通过localStorage持久化存取当前主题, 以在页面刷新后维持

  通过给html根节点添加 'light' or 'dark' class,配合tailwind的dark mode使用

	theme名字 -> 提供的主题对象
*/
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextProps {
	theme: ThemeType; // 当前主题设置
	setTheme: (theme: ThemeType) => void; // 切换主题
	resolvedTheme: 'light' | 'dark'; // 实际应用的主题
	systemTheme: 'light' | 'dark'; // 系统主题
	themes: ThemeType[]; // 可用主题列表
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}
	return 'light';
}
export const ThemeProviderDiy: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [theme, setThemeState] = useState<ThemeType>(() => {
		// 从localStorage读取
		return (localStorage.getItem('theme') as ThemeType) || 'system';
	});
	const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme());

	// 监听系统主题变化
	useEffect(() => {
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	}, []);

	// 切换主题并持久化
	const setTheme = useCallback((t: ThemeType) => {
		setThemeState(t);
		localStorage.setItem('theme', t);
	}, []);

	// 计算实际主题
	const resolvedTheme = theme === 'system' ? systemTheme : theme; //不设置时默认使用系统主题

	//页面刷新后重新设置主题
	useEffect(() => {
		//即给html设置class
		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(resolvedTheme);
	}, [resolvedTheme]);

	return (
		<ThemeContext.Provider
			value={{
				theme,
				setTheme,
				resolvedTheme, //实际主题, theme==='system'? systemTheme : theme
				systemTheme, // 用户浏览器的偏好设置,'light' | 'dark'
				themes: ['light', 'dark', 'system']
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
};
// 封装为hook,方便在组件中使用（like next-theme）
export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
}
