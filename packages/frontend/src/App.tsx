import '@ant-design/v5-patch-for-react-19';
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
			{useRoutes(routes)}
		</QueryClientProvider>
	);
}
export default APP;
