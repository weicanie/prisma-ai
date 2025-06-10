import '@copilotkit/react-ui/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRoutes } from 'react-router-dom';
import { Toaster } from 'sonner';
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
	p.poweredBy {
		display: none !important;
	}
	.copilotKitInput {
		margin-bottom:1rem;
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
	return (
		<QueryClientProvider client={queryClient}>
			{/* <CopilotKit runtimeUrl={import.meta.env.VITE_API_BASE_URL + '/copilotkit' || '/api'}> */}
			<GlobalStyle></GlobalStyle>
			<Toaster />
			{/* <CopilotSidebar
					defaultOpen={true}
					instructions={
						'You are assisting the user as best as you can. Answer in the best way possible given the data you have.'
					}
					labels={{
						title: 'Prisma',
						initial: '您好, 我是 Prisma, 我可以帮您优化简历、匹配岗位信息、提升面试表现等。'
					}}
				> */}
			<AppWrapper>{useRoutes(routes)}</AppWrapper>
			{/* </CopilotSidebar> */}

			<ReactQueryDevtools initialIsOpen={false} />
			{/* </CopilotKit> */}
		</QueryClientProvider>
	);
}
export default APP;
