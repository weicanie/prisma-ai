import type { MicroApp, MicroAppStateActions } from 'qiankun';
import { initGlobalState, loadMicroApp } from 'qiankun';
import { useEffect, useRef } from 'react';
import { eventBusService, EventList } from '../../../utils/EventBus/event-bus.service';

export default function EditorContainerPage() {
	// 容器 ref，确保容器真实存在后再挂载微应用
	const containerRef = useRef<HTMLDivElement | null>(null);
	const appRef = useRef<MicroApp | null>(null);
	const token = localStorage.getItem('token');
	useEffect(() => {
		/* 主应用和微应用共享的state，用于通信 */
		const state = {
			token
		};
		const actions: MicroAppStateActions = initGlobalState(state);
		actions.onGlobalStateChange((state, prev) => {
			console.log('global state change', state, prev);
		});
		const cb = () => {
			state.token = localStorage.getItem('token');
			actions.setGlobalState(state);
		};
		eventBusService.on(EventList.tokenUpdated, cb);
		setTimeout(() => {
			cb();
		}, 5000);
		return () => {
			eventBusService.off(EventList.tokenUpdated, cb);
			actions.offGlobalStateChange();
		};
	}, []);

	useEffect(() => {
		if (containerRef.current && !appRef.current) {
			// 按需挂载 Next 微应用（purehtml 方案）
			appRef.current = loadMicroApp(
				{
					name: 'magic-resume',
					entry: 'http://localhost:3009/mfe-entry.html',
					container: containerRef.current, // 挂载容器
					props: {
						url: 'http://localhost:3009/app/dashboard', //显示的页面
						iframeHeight: '90vh',
						iframeWidth: '100%',
						token: token
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
