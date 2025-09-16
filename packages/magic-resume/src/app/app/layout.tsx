'use client';
import { useEffect } from 'react';
import { useThemeStore } from '../../store/theme';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const { setThemeOfStore } = useThemeStore();
	/* 微应用握手和token、theme消息接收 */
	useEffect(() => {
		let isReady = false;

		const handleMessage = (event: MessageEvent) => {
			if (event.data && event.data.type === 'HANDSHAKE') {
				// 回复握手，告知父应用微应用已准备就绪
				if (!isReady) {
					isReady = true;
					window.parent.postMessage(
						{
							type: 'MICRO_APP_READY'
						},
						'*'
					);
					console.log('微应用握手完成');
				}

				console.log('微应用接收到消息:', event.data);

				// 处理 token 和 theme
				if (event.data.payload.token) {
					localStorage.setItem('token', event.data.payload.token);
				}
				if (event.data.payload.theme) {
					setThemeOfStore(event.data.payload.theme);
				}
			} else if (event.data && event.data.type === 'SEND_MESSAGE') {
				console.log('微应用接收到消息:', event.data);

				// 处理 token 和 theme
				if (event.data.payload.token) {
					localStorage.setItem('token', event.data.payload.token);
				}
				if (event.data.payload.theme) {
					setThemeOfStore(event.data.payload.theme);
				}
			}
		};

		window.addEventListener('message', handleMessage);

		// 主动发送准备就绪消息（防止时机问题）
		const notifyReady = () => {
			if (!isReady) {
				isReady = true;
				window.parent.postMessage(
					{
						type: 'MICRO_APP_READY'
					},
					'*'
				);
			}
		};

		// 延迟发送，确保组件完全渲染
		notifyReady();

		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, []);
	return children;
}
