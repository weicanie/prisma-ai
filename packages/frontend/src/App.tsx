import '@ant-design/v5-patch-for-react-19';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRoutes } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import { routes } from './router/router';
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
			<Toaster />
			<ReactQueryDevtools initialIsOpen={false} />
			{/* <div className="flex max-[900px]:flex-col">{useRoutes(routes)}</div> */}

			<CopilotKit runtimeUrl={import.meta.env.VITE_API_BASE_URL + '/copilotkit' || '/api'}>
				<CopilotSidebar
					defaultOpen={false}
					instructions={
						'You are assisting the user as best as you can. Answer in the best way possible given the data you have.'
					}
					labels={{
						title: 'doro',
						initial: 'doro 为你效劳!'
					}}
				>
					<div className="flex max-[900px]:flex-col">{useRoutes(routes)}</div>
				</CopilotSidebar>
			</CopilotKit>
		</QueryClientProvider>
	);
}
export default APP;
