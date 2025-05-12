import { ThemeProvider } from 'next-themes';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import APP from './App';
createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<ThemeProvider attribute="class">
			<APP></APP>
		</ThemeProvider>
	</BrowserRouter>
);
