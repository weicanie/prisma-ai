import type { MicroApp, MicroAppStateActions } from 'qiankun';
import { initGlobalState, loadMicroApp } from 'qiankun';
import { useEffect, useRef } from 'react';
import { eventBusService, EventList } from '../../../utils/EventBus/event-bus.service';

export default function EditorContainerPage() {
	// 容器 ref，确保容器真实存在后再挂载微应用
	const containerRef = useRef<HTMLDivElement | null>(null);
	const appRef = useRef<MicroApp | null>(null);
	const token = localStorage.getItem('token');
	const theme = localStorage.getItem('theme');
	useEffect(() => {
		/* 主应用和微应用共享的state，用于通信 */
		const state = {
			token,
			theme
		};
		const actions: MicroAppStateActions = initGlobalState(state);
		actions.onGlobalStateChange((state, prev) => {
			console.log('global state change', state, prev);
		});
		const cb = () => {
			state.token = localStorage.getItem('token');
			state.theme = localStorage.getItem('theme');
			actions.setGlobalState(state);
		};
		eventBusService.on(EventList.tokenUpdated, cb);
		eventBusService.on(EventList.themeUpdated, cb);
		return () => {
			eventBusService.off(EventList.tokenUpdated, cb);
			eventBusService.off(EventList.themeUpdated, cb);
			actions.offGlobalStateChange();
		};
	}, []);

	useEffect(() => {
		if (containerRef.current && !appRef.current) {
			// 按需挂载 Next 微应用（purehtml 方案）
			appRef.current = loadMicroApp(
				{
					name: 'magic-resume',
					entry: `${import.meta.env.VITE_MAGIC_RESUME_BASE_URL}/mfe-entry.html`,
					container: containerRef.current, // 挂载容器
					props: {
						url: `${import.meta.env.VITE_MAGIC_RESUME_BASE_URL}/app/dashboard/resumes`, // 显示的页面
						iframeHeight: '90vh',
						iframeWidth: '100%',
						token: token || localStorage.getItem('token'), // 确保 token 传递
						theme: theme || localStorage.getItem('theme') // 确保 theme 传递
					}
				},
				{ sandbox: { experimentalStyleIsolation: true } }
			);
		}
		return () => {
			// 组件卸载时卸载微应用，避免内存泄漏
			appRef.current?.unmount();
			appRef.current = null;
		};
	}, []);

	if (!token) {
		return <div>请先登录</div>;
	}

	return <div id="magic-resume-container" ref={containerRef} />;
}
