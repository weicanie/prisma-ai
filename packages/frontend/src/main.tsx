import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import APP from './App';
import store from './store';
import { ThemeProviderDiy } from './utils/theme';
//TODO 去除css in js 和 antd
createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<Provider store={store}>
			<ThemeProviderDiy>
				<APP></APP>
			</ThemeProviderDiy>
		</Provider>
	</BrowserRouter>
);
