import { SelectedLLM } from '@prisma-ai/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { eventBusService, EventList } from '../../utils/EventBus/event-bus.service';
import {
	getSessionStatusAndDecide,
	getSseData,
	modelKey,
	pathKey,
	sessionStatusKey,
	type contextInput
} from './sse';

/**
 * 控制式 Hook：通过 start/cancel 明确触发/终止一次 LLM(Natrual Language Process) 流式会话
 * - 不再依赖 props 改变自动启动，避免渲染阶段副作用触发
 */
type StartParams = {
	path: string; // 请求的URL路径，如 '/project/lookup'
	input: contextInput; // 后端方法的输入
	model: SelectedLLM; // 选择的模型
};

export function useSseAnswer() {
	// 流式内容与状态
	const [content, setContent] = useState('');
	const [reasonContent, setReasonContent] = useState('');
	const [done, setDone] = useState(false);
	const [isReasoning, setIsReasoning] = useState(false);

	const [error, setError] = useState(false);
	const [errorCode, setErrorCode] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	// 控制同一时间只有一个对话
	const [answering, setAnswering] = useState(false);
	// EventSource 清理函数
	const cleanupRef = useRef<() => void>(() => {});

	// 启动一次会话：创建/检查会话 -> 建立 SSE 连接
	const start = useCallback(
		async ({ path, input, model }: StartParams) => {
			if (answering) return; // 避免并发开启
			setAnswering(true);
			try {
				await getSessionStatusAndDecide(input);
				// 建立 SSE 连接并保存清理函数
				const cleanup = getSseData(
					path,
					model,
					setContent,
					setReasonContent,
					setDone,
					setIsReasoning,
					setError,
					setErrorCode,
					setErrorMsg,
					setAnswering
				);

				// 直接保留 cleanup（释放锁由 getSseData 的 cleanup 负责）
				cleanupRef.current = cleanup;
			} catch (e) {
				setError(true);
				setErrorCode('9999');
				setErrorMsg('创建会话失败，请稍后重试');
				// 控制台输出错误便于排查
				console.error('useSseAnswer.start error:', e);
				setAnswering(false);
			}
		},
		[answering]
	);

	// 主动取消当前会话
	const cancel = useCallback(() => {
		if (cleanupRef.current) {
			cleanupRef.current();
		}
		setAnswering(false);
	}, []);

	/**
	 * 断点接传：页面刷新/重新打开后尝试恢复
	 * - 不影响正常的 start 调用
	 */
	useEffect(() => {
		(async () => {
			/* 
    getSessionStatusAndDecide设计为input传入''时
    只会查询并持久化当前持有的会话的状态
    不进行任何其它操作
    */
			await getSessionStatusAndDecide('');
			const status = localStorage.getItem(sessionStatusKey);
			if (status === 'backdone' || status === 'running') {
				const curPath = localStorage.getItem(pathKey);
				if (!curPath) {
					console.error('path不存在,断点接传失败');
					return;
				}
				const modelStr = localStorage.getItem(modelKey) || undefined;
				setAnswering(true);
				const cleanup = getSseData(
					curPath,
					modelStr as unknown as SelectedLLM | undefined,
					setContent,
					setReasonContent,
					setDone,
					setIsReasoning,
					setError,
					setErrorCode,
					setErrorMsg,
					setAnswering
				);
				cleanupRef.current = cleanup;
			}
		})();
		return () => {
			cleanupRef.current?.();
		};
	}, []);
	//监听用户释放会话事件
	useEffect(() => {
		eventBusService.on(EventList.sessionFree, () => {
			cancel();
		});
	}, [cancel]);

	return {
		content,
		reasonContent,
		done,
		isReasoning,
		error,
		errorCode,
		errorMsg,
		answering,
		start,
		cancel
	};
}
