import { SelectedLLM, type SsePipeHook } from '@prisma-ai/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { eventBusService, EventList } from '../../utils/EventBus/event-bus.service';
import type { StartParams } from './type';
import { sseUtil } from './util';

/**
 *
 * @param initialDoneStatus done初始状态，用于区分AI聊天（初始为ture，代表没有正在进行的生成）与AI单次调用（项目与简历优化，初始为false，代表生成没有进行或者没有结束）
 * @returns
 */
export const useSseAnswer: SsePipeHook = (initialDoneStatus = false) => {
	// 流式内容与状态
	const [content, setContent] = useState('');
	const [reasonContent, setReasonContent] = useState('');
	const [done, setDone] = useState(initialDoneStatus);
	const [isReasoning, setIsReasoning] = useState(false);

	const [error, setError] = useState(false);
	const [errorCode, setErrorCode] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	// 控制同一时间只有一个对话在进行
	const [answering, setAnswering] = useState(false);
	// EventSource 清理函数
	const cleanupRef = useRef<() => void>(() => {});

	// 启动一次会话：创建/检查会话 -> 建立 SSE 连接
	const start = useCallback(
		async ({ path, input, model }: StartParams) => {
			if (answering) return; // 避免并发开启
			setAnswering(true);
			setDone(false);
			try {
				await sseUtil.getSessionStatusAndDecide(input);
				// 建立 SSE 连接并保存清理函数
				const cleanup = sseUtil.getSseData(
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
	 * 页面类型 -> 页面URL，用于通过当前URL确定当前页面类型
	 */
	const UrlMap = {
		project: [
			'/project/lookup',
			'/project/polish',
			'/project/mine',
			'/project/business-lookup',
			'/project/business-paper'
		],
		resume: ['/resume/match'],
		aichat: ['/aichat/stream']
	};
	/**
	 * 项目、简历、对话共用一个异常恢复逻辑，需要区分当前页面是否对得上当前会话，然后再恢复
	 * @param curPath 当前调用的后端接口
	 */
	function shouldRecover(curPath: string) {
		const curUrl = window.location.pathname;
		const isAiChat = curUrl.includes('/aichat');
		const isProjectAction = curUrl.includes('/projects');
		const isResumeAction = curUrl.includes('/resumes');
		if (isAiChat) {
			return UrlMap.aichat.includes(curPath);
		}
		if (isProjectAction) {
			return UrlMap.project.includes(curPath);
		}
		if (isResumeAction) {
			return UrlMap.resume.includes(curPath);
		}
		return false;
	}

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
			await sseUtil.getSessionStatusAndDecide('');
			const status = localStorage.getItem(sseUtil.sessionStatusKey);
			if (status === 'backdone' || status === 'running') {
				const curPath = localStorage.getItem(sseUtil.pathKey);
				if (!curPath) {
					console.error('path不存在,断点接传失败');
					return;
				}
				if (!shouldRecover(curPath)) {
					console.warn('当前页面不进行断点接传,路径:', curPath);
					return;
				}
				const modelStr = localStorage.getItem(sseUtil.modelKey) || undefined;
				setAnswering(true);
				const cleanup = sseUtil.getSseData(
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
};
