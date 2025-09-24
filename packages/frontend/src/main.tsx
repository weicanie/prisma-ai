import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import APP from './App';
import store from './store';
import { ThemeProviderDiy } from './utils/theme';

createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<Provider store={store}>
			<ThemeProviderDiy>
				<Suspense fallback={<div></div>}>
					<APP></APP>
				</Suspense>
			</ThemeProviderDiy>
		</Provider>
	</BrowserRouter>
);

// 注册 Next 微应用，激活规则为 /resume-editor，挂载到 #magic-resume-container
// registerMicroApps([
// 	{
// 		name: 'magic-resume',
// 		// Next 微应用地址
// 		// 使用同源路径并配合 Vite 代理，避免跨域与重定向导致的 CORS(Cross-Origin Resource Sharing) 问题
// 		entry: '/resume-editor/',
// 		container: '#magic-resume-container', // 挂载容器
// 		activeRule: '/main/resume-editor', // 当路由以 /main/resume-editor 开头时激活
// 		props: {} // 传递给微应用的属性
// 	}
// ]);

// start({
// 	prefetch: 'all', // 预加载提升切换性能
// 	sandbox: { experimentalStyleIsolation: true } // 样式隔离，降低全局样式冲突风险
// });
