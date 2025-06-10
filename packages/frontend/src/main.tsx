import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import APP from './App';
import store from './store';
import { ThemeProviderDiy } from './utils/theme';
//TODO 去除css in js
//TODO 添加 错误捕获、展示组件
createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<Provider store={store}>
			<ThemeProviderDiy>
				<Suspense fallback={<div>Loading...</div>}>
					<APP></APP>
				</Suspense>
			</ThemeProviderDiy>
		</Provider>
	</BrowserRouter>
);
