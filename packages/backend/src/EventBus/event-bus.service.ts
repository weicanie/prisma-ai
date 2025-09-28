import { Injectable } from '@nestjs/common';
import { StreamingChunk, UserMemoryAction } from '@prisma-ai/shared';
import { PersistentTask } from '../type/taskqueue';
import { EventBus } from './EventBus';
/* 事件名列表 */
export enum EventList {
	/* 任务队列 */
	taskCompleted = 'taskCompleted',
	taskFailed = 'taskFailed',
	taskAborted = 'taskAborted',
	/* sse */
	chunkGenerated = 'chunkGenerated',
	SBERT_INIT = 'SBERT_INIT',
	/* user memory */
	userMemoryChange = 'userMemoryChange',
	/* cache invalidate */
	cacheProjectRetrievedDocAndCodeInvalidate = 'cacheProjectRetrievedDocAndCodeInvalidate' //项目检索到的文档和代码的缓存失效
}

/* 事件名到payload类型的映射 */
export interface Event_Payload {
	/* 任务队列 */
	[EventList.taskCompleted]: { task: PersistentTask };
	[EventList.taskFailed]: {
		task: PersistentTask;
		error: any;
	};
	[EventList.taskAborted]: { task: PersistentTask };
	/* sse */
	[EventList.chunkGenerated]: {
		taskId: string;
		eventData: StreamingChunk;
	};
	[EventList.SBERT_INIT]: void;
	/* user memory */
	[EventList.userMemoryChange]: UserMemoryAction;
	/* cache invalidate */
	[EventList.cacheProjectRetrievedDocAndCodeInvalidate]: { projectName: string };
}

/**
 * 事件总线服务，提供全局事件发布订阅功能
 * 实现模块间解耦、通信
 * @template Event_Payload 事件名到参数类型的映射
 */
@Injectable()
export class EventBusService {
	eventBus: EventBus<Event_Payload>;

	constructor() {
		this.eventBus = new EventBus<Event_Payload>();
	}

	/**
	 * 监听事件，注册事件回调
	 * @param eventName 事件名
	 * @param eventCallback 事件回调函数
	 * @param thisArg 可选的this绑定
	 * @returns this，支持链式调用
	 */
	on<K extends keyof Event_Payload>(
		eventName: K,
		eventCallback: (payload: Event_Payload[K]) => void,
		thisArg?: any
	): this {
		this.eventBus.on(eventName, eventCallback, thisArg);
		return this;
	}

	/**
	 * 监听一次性事件，回调只会触发一次后自动移除
	 * @param eventName 事件名
	 * @param eventCallback 事件回调函数
	 * @param thisArg 可选的this绑定
	 * @returns this，支持链式调用
	 */
	once<K extends keyof Event_Payload>(
		eventName: K,
		eventCallback: (payload: Event_Payload[K]) => void,
		thisArg?: any
	): this {
		this.eventBus.once(eventName, eventCallback, thisArg);
		return this;
	}

	/**
	 * 触发事件，依次调用所有注册的监听器
	 * @param eventName 事件名
	 * @param payload 事件参数
	 * @returns this，支持链式调用
	 */
	emit<K extends keyof Event_Payload>(
		eventName: K,
		...payload: Event_Payload[K] extends any[] ? Event_Payload[K] : [Event_Payload[K]]
	): this {
		this.eventBus.emit(eventName, ...payload);
		return this;
	}

	/**
	 * 移除指定事件的特定回调函数
	 * @param eventName 事件名
	 * @param eventCallback 要移除的事件回调函数
	 */
	off<K extends keyof Event_Payload>(
		eventName: K,
		eventCallback: (payload: Event_Payload[K]) => void
	): void {
		this.eventBus.off(eventName, eventCallback);
	}

	/**
	 * 清空所有事件监听
	 * 谨慎使用，会移除系统中所有注册的事件处理器
	 */
	clear(): void {
		this.eventBus.clear();
	}

	/**
	 * 判断是否存在某个事件的监听器
	 * @param eventName 事件名
	 * @returns 是否存在监听器
	 */
	hasEvent(eventName: string): boolean {
		return this.eventBus.hasEvent(eventName);
	}
}
