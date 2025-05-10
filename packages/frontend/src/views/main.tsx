import { ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import APP from './App';

createRoot(document.getElementById('root')!).render(
	<ConfigProvider
		theme={{
			components: {
				Menu: {
					/* 这里是你的组件 token */
					subMenuItemSelectedColor: 'black',
					itemSelectedColor: 'black',
					itemSelectedBg: 'rgb(235,235,235)',
					itemHoverBg: 'rgb(242,242,242)',
					itemBorderRadius: 0,
					itemMarginInline: 0,
					itemMarginBlock: 0
				}
			}
		}}
	>
		<APP></APP>
	</ConfigProvider>
);
