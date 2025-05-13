import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import APP from './App';
import { ThemeProviderDiy } from './utils/theme';

createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<ThemeProviderDiy>
			<APP></APP>
		</ThemeProviderDiy>
	</BrowserRouter>
);
