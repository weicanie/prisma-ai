import { SelectedLLM } from '@prisma-ai/shared';
import { onMounted, onUnmounted, ref } from 'vue';
import type { StartParams } from './type';
import { sseUtil } from './util';

export const useSseAnswer = (initialDoneStatus = false) => {
	// 流式内容与状态
	const content = ref('');
	const reasonContent = ref('');
	const done = ref(initialDoneStatus);
	const isReasoning = ref(false);

	const error = ref(false);
	const errorCode = ref('');
	const errorMsg = ref('');

	// 控制同一时间只有一个对话在进行
	const answering = ref(false);
	// EventSource 清理函数
	const cleanupRef = ref<() => void>(() => {});

	// 辅助函数：更新 ref 值的 wrapper，用于适配 sseUtil 的 API
	const setContent = (data: string | ((prevData: string) => string)) => {
		if (typeof data === 'function') {
			content.value = data(content.value);
		} else {
			content.value = data;
		}
	};

	const setReasonContent = (data: string | ((prevData: string) => string)) => {
		if (typeof data === 'function') {
			reasonContent.value = data(reasonContent.value);
		} else {
			reasonContent.value = data;
		}
	};

	const setDone = (status: boolean) => {
		done.value = status;
	};

	const setIsReasoning = (status: boolean) => {
		isReasoning.value = status;
	};

	const setError = (status: boolean) => {
		error.value = status;
	};

	const setErrorCode = (code: string) => {
		errorCode.value = code;
	};

	const setErrorMsg = (msg: string) => {
		errorMsg.value = msg;
	};

	const setAnswering = (status: boolean) => {
		answering.value = status;
	};

	// 启动一次会话：创建/检查会话 -> 建立 SSE 连接
	const start = async ({ path, input, model }: StartParams) => {
		if (answering.value) return; // 避免并发开启
		answering.value = true;
		done.value = false;
		content.value = '';
		reasonContent.value = '';
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
			cleanupRef.value = cleanup;
		} catch (e) {
			error.value = true;
			errorCode.value = '9999';
			errorMsg.value = '创建会话失败，请稍后重试';
			// 控制台输出错误便于排查
			console.error('useSseAnswer.start error:', e);
			answering.value = false;
		}
	};

	// 主动取消当前会话
	const cancel = () => {
		if (cleanupRef.value) {
			cleanupRef.value();
		}
		answering.value = false;
	};

	/**
	 * 断点接传：页面刷新/重新打开后尝试恢复
	 * - 不影响正常的 start 调用
	 */
	onMounted(async () => {
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
			// if (!shouldRecover(curPath)) {
			// 	console.warn('当前页面不进行断点接传,路径:', curPath);
			// 	return;
			// }
			const modelStr = localStorage.getItem(sseUtil.modelKey) || undefined;
			answering.value = true;
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
			cleanupRef.value = cleanup;
		}
	});

	onUnmounted(() => {
		cleanupRef.value?.();
	});

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
