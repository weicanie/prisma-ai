import { ConfigProvider, theme } from 'antd';
import React from 'react';
import { useTheme } from '../utils/theme';

interface AntdThemeHocProps {
	children: React.ReactNode;
}

/**
 * Ant Design主题高阶组件
 * @description 用于辅助懒加载antd--用时才设置主题
 */
export const AntdThemeHoc: React.FC<AntdThemeHocProps> = ({ children }) => {
	const { resolvedTheme } = useTheme();

	return (
		<ConfigProvider
			theme={{
				algorithm: resolvedTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
				// 可以在这里添加更多主题配置
				token: {
					// 自定义主题token
					colorPrimary: '#1890ff',
					borderRadius: 6
				}
			}}
		>
			{children}
		</ConfigProvider>
	);
};

export default AntdThemeHoc;
