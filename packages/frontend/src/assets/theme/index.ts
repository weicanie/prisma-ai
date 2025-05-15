//全局主题变量
const theme = {
	primary: '#0070f3',
	secondary: '#1db954',
	background: '#f0f0f0', //整个页面背景色
	text: '#333',
	border: '#ddd',
	shadow: 'rgba(0, 0, 0, 0.1)'
};
const lightTheme = { ...theme, background: '#fff', color: '#000' };
const darkTheme = { ...theme, background: '#000', color: '#fff' };
export { darkTheme, lightTheme };
export type ThemeType = typeof lightTheme;
