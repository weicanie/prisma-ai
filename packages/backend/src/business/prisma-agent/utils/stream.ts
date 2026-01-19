import { type Runnable, type RunnableSequence } from '@langchain/core/runnables';
import { InterruptType, jsonMd_obj, type StreamingChunk } from '@prisma-ai/shared';
import { from, shareReplay, type Observable } from 'rxjs';
import { type PrismaAgentService } from '../prisma-agent.service';

/**
 * 调用chain的stream方法，将流上报到agent服务，将最终结果返回给所在节点
 * @param interruptType 流结束后agent因何中断，默认HumanReview
 */
export async function chainStreamExecutor<
	T extends Runnable & {
		getStreamVersion?: () => RunnableSequence<
			T extends Runnable<infer U> ? U : any,
			StreamingChunk
		>;
	}
>(
	runId: string,
	chain: T,
	chainInput: T extends Runnable<infer U> ? U : any,
	manageCurStream: PrismaAgentService['manageCurStream'],
	interruptType: InterruptType = InterruptType.HumanReview
): Promise<T extends Runnable<any, infer K> ? K : any> {
	const streamVersion = chain.getStreamVersion?.()!;
	const stream = await streamVersion.stream(chainInput);

	// stream是异步迭代器，from(stream)是“cold Observable”（点播，订阅之间独立，不缓存数据、每次都去拿），先订阅者会消费掉流数据，导致后订阅者拿不到，且相互竞争时会导致数据错乱
	// 使用shareReplay转为“hot Observable”（直播，订阅的是同一份数据，缓存数据、只拿一次），并通过重放确保多个订阅者都能获得完整的流数据
	// 使用 shareReplay 确保多个订阅者（本地拼接逻辑 + 前端SSE）都能获得完整的流数据
	const observable = (from(stream) as Observable<StreamingChunk>).pipe(
		shareReplay({ bufferSize: Infinity, refCount: true })
	);

	manageCurStream(runId, 'create', observable, interruptType);

	let llmOutputString = '';

	// 使用 Promise 包装订阅过程，替代直接消费迭代器，避免争抢
	await new Promise<void>((resolve, reject) => {
		observable.subscribe({
			next: chunk => {
				llmOutputString += chunk.content;
			},
			error: err => reject(err),
			complete: () => resolve()
		});
	});

	const llmOutput = jsonMd_obj(llmOutputString);
	return llmOutput;
}
