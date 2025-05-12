/**
 * 事件处理函数类型定义，T为事件参数类型
 */
type EventHandler<T = any> = (payload: T) => void;

/**
 * 事件处理器对象，包含回调和可选的this绑定
 */
interface Handler<T = any> {
	eventCallback: EventHandler<T>; // 事件回调函数
	thisArg?: any; // 可选的this绑定
}

/**
 * 泛型事件总线实现，支持自定义事件类型和参数类型
 * @template Events 事件名到参数类型的映射
 */
export class HYEventBus<Events extends Record<string, any> = any> {
	/**
	 * 存储所有事件及其对应的处理器数组
	 * key为事件名，value为处理器数组
	 */
	private eventBus: Record<string, Handler[]>;

	/**
	 * 构造函数，初始化事件总线存储对象
	 */
	constructor() {
		this.eventBus = {} as Record<string, Handler[]>;
	}

	/**
	 * 监听事件，注册事件回调
	 * @param eventName 事件名
	 * @param eventCallback 事件回调函数
	 * @param thisArg 可选的this绑定
	 * @returns this，支持链式调用
	 */
	on<K extends keyof Events>(
		eventName: K,
		eventCallback: EventHandler<Events[K]>,
		thisArg?: any
	): this {
		if (typeof eventName !== 'string') {
			throw new TypeError('the event name must be string type');
		}
		if (typeof eventCallback !== 'function') {
			throw new TypeError('the event callback must be function type');
		}
		let handlers = this.eventBus[eventName as string];
		if (!handlers) {
			handlers = [];
			// 这里用any规避TS索引类型限制
			(this.eventBus as any)[eventName as string] = handlers;
		}
		handlers.push({ eventCallback, thisArg });
		return this;
	}

	/**
	 * 监听一次性事件，回调只会触发一次
	 * @param eventName 事件名
	 * @param eventCallback 事件回调函数
	 * @param thisArg 可选的this绑定
	 * @returns this，支持链式调用
	 */
	once<K extends keyof Events>(
		eventName: K,
		eventCallback: EventHandler<Events[K]>,
		thisArg?: any
	): this {
		if (typeof eventName !== 'string') {
			throw new TypeError('the event name must be string type');
		}
		if (typeof eventCallback !== 'function') {
			throw new TypeError('the event callback must be function type');
		}
		// 包装一次性回调，触发后自动移除
		const tempCallback = (...payload: any[]) => {
			this.off(eventName, tempCallback);
			eventCallback.apply(thisArg, payload);
		};
		return this.on(eventName, tempCallback as EventHandler<Events[K]>, thisArg);
	}

	/**
	 * 触发事件，依次调用所有监听器
	 * @param eventName 事件名
	 * @param payload 事件参数
	 * @returns this，支持链式调用
	 */
	emit<K extends keyof Events>(
		eventName: K,
		...payload: Events[K] extends any[] ? Events[K] : [Events[K]]
	): this {
		if (typeof eventName !== 'string') {
			throw new TypeError('the event name must be string type');
		}
		const handlers = this.eventBus[eventName as string] || [];
		handlers.forEach(handler => {
			handler.eventCallback.apply(handler.thisArg, payload);
		});
		return this;
	}

	/**
	 * 移除指定事件的指定回调
	 * @param eventName 事件名
	 * @param eventCallback 事件回调函数
	 */
	off<K extends keyof Events>(eventName: K, eventCallback: EventHandler<Events[K]>): void {
		if (typeof eventName !== 'string') {
			throw new TypeError('the event name must be string type');
		}
		if (typeof eventCallback !== 'function') {
			throw new TypeError('the event callback must be function type');
		}
		const handlers = this.eventBus[eventName as string];
		if (handlers && eventCallback) {
			// 拷贝一份，避免遍历时修改原数组
			//?
			const newHandlers = [...handlers];
			for (let i = 0; i < newHandlers.length; i++) {
				const handler = newHandlers[i];
				if (handler.eventCallback === eventCallback) {
					const index = handlers.indexOf(handler);
					handlers.splice(index, 1);
				}
			}
		}
		// 如果该事件已无监听器，删除该事件
		if (handlers && handlers.length === 0) {
			delete this.eventBus[eventName as string];
		}
	}

	/**
	 * 清空所有事件监听
	 */
	clear() {
		this.eventBus = {} as Record<string, Handler[]>;
	}

	/**
	 * 判断是否有某个事件的监听器
	 * @param eventName 事件名
	 * @returns 是否存在
	 */
	hasEvent(eventName: string): boolean {
		return Object.prototype.hasOwnProperty.call(this.eventBus, eventName);
	}
}

// 默认导出，兼容import和require
export default HYEventBus;
