import { useTheme } from '@/utils/theme.tsx';
import '@ant-design/v5-patch-for-react-19';
import { useRoutes } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { AppWrapper } from './App.style';
import './index.css';
import { routes } from './router/router';

const GlobalStyle = createGlobalStyle`
	/* 编辑器 */
	.milkdown {
		height: 100vh;
		width: 100%;
	}
`;

function APP() {
	const { theme, setTheme } = useTheme();
	// TODO 主题切换按钮
	setTheme('dark');
	document.documentElement.setAttribute('class', theme); //tailwind相关组件消费
	return (
		<AppWrapper>
			<GlobalStyle></GlobalStyle>
			{useRoutes(routes)}
		</AppWrapper>
	);
}
export default APP;
