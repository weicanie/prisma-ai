import { useTheme } from '@/utils/theme.tsx';
import '@ant-design/v5-patch-for-react-19';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRoutes } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { AppWrapper } from './App.style';
import './index.css';
import { routes } from './router/router';
const GlobalStyle = createGlobalStyle`
	/* 编辑器 */
	.milkdown {
		height: 100%;
		width: 100%;
	}
`;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 3,
			// retryDelay: 1000,
			staleTime: 5 * 60 * 1000, // 5分钟
			gcTime: 10 * 60 * 1000, // 10分钟
			refetchOnWindowFocus: true,
			refetchOnMount: true,
			refetchOnReconnect: true
		},
		mutations: {
			retry: 1
			// retryDelay: 1000
		}
	}
});

function APP() {
	const { theme, setTheme } = useTheme();
	// TODO 主题切换按钮
	setTheme('dark');
	document.documentElement.setAttribute('class', theme); //tailwind相关组件消费
	return (
		<QueryClientProvider client={queryClient}>
			<AppWrapper>
				<GlobalStyle></GlobalStyle>
				{useRoutes(routes)}
			</AppWrapper>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
export default APP;
