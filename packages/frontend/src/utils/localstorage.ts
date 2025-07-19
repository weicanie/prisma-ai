/**
 * localStorage 管理类
 * 提供对浏览器本地存储的增删改查操作
 */
export class LocalStorageManager {
	private storage: Storage;

	constructor() {
		this.storage = window.localStorage;
	}

	/**
	 * 设置存储项
	 * @param key 键名
	 * @param value 值（会自动转换为JSON字符串）
	 * @param options 可选配置
	 */
	setItem<T = unknown>(
		key: string,
		value: T,
		options?: {
			expireTime?: number; // 过期时间（毫秒时间戳）
		}
	): boolean {
		try {
			const storageData = {
				value,
				timestamp: Date.now(),
				expireTime: options?.expireTime
			};

			const jsonString = JSON.stringify(storageData);
			this.storage.setItem(key, jsonString);
			return true;
		} catch (error) {
			console.error('设置localStorage失败:', error);
			return false;
		}
	}

	/**
	 * 获取存储项
	 * @param key 键名
	 * @param defaultValue 默认值（当键不存在或已过期时返回）
	 */
	getItem<T = unknown>(key: string, defaultValue?: T): T | null {
		try {
			const item = this.storage.getItem(key);
			if (item === null) {
				return defaultValue || null;
			}

			const storageData = JSON.parse(item);

			// 检查是否过期
			if (storageData.expireTime && Date.now() > storageData.expireTime) {
				this.removeItem(key);
				return defaultValue || null;
			}

			return storageData.value;
		} catch (error) {
			console.error('获取localStorage失败:', error);
			return defaultValue || null;
		}
	}

	/**
	 * 更新存储项（仅更新值，保持其他配置不变）
	 * @param key 键名
	 * @param value 新值
	 */
	updateItem<T = unknown>(key: string, value: T): boolean {
		try {
			const item = this.storage.getItem(key);
			if (item === null) {
				return false; // 键不存在，无法更新
			}

			const storageData = JSON.parse(item);

			// 更新值，保持其他配置不变
			storageData.value = value;
			storageData.timestamp = Date.now();

			const newJsonString = JSON.stringify(storageData);
			this.storage.setItem(key, newJsonString);
			return true;
		} catch (error) {
			console.error('更新localStorage失败:', error);
			return false;
		}
	}

	/**
	 * 删除存储项
	 * @param key 键名
	 */
	removeItem(key: string): boolean {
		try {
			this.storage.removeItem(key);
			return true;
		} catch (error) {
			console.error('删除localStorage失败:', error);
			return false;
		}
	}

	/**
	 * 批量删除存储项
	 * @param keys 键名数组
	 */
	removeItems(keys: string[]): boolean {
		try {
			keys.forEach(key => this.storage.removeItem(key));
			return true;
		} catch (error) {
			console.error('批量删除localStorage失败:', error);
			return false;
		}
	}

	/**
	 * 清空所有存储
	 */
	clear(): boolean {
		try {
			this.storage.clear();
			return true;
		} catch (error) {
			console.error('清空localStorage失败:', error);
			return false;
		}
	}

	/**
	 * 检查键是否存在
	 * @param key 键名
	 */
	hasItem(key: string): boolean {
		return this.storage.getItem(key) !== null;
	}

	/**
	 * 获取所有键名
	 */
	keys(): string[] {
		return Object.keys(this.storage);
	}

	/**
	 * 获取存储项信息
	 * @param key 键名
	 */
	getItemInfo(key: string): {
		exists: boolean;
		size: number;
		timestamp?: number; //创建时间
		expireTime?: number;
		isExpired: boolean;
	} | null {
		try {
			const item = this.storage.getItem(key);
			if (item === null) {
				return {
					exists: false,
					size: 0,
					isExpired: false
				};
			}

			const storageData = JSON.parse(item);
			const isExpired = storageData.expireTime ? Date.now() > storageData.expireTime : false;

			return {
				exists: true,
				size: item.length,
				timestamp: storageData.timestamp,
				expireTime: storageData.expireTime,
				isExpired
			};
		} catch (error) {
			console.error('获取存储项信息失败:', error);
			return null;
		}
	}

	/**
	 * 设置过期时间
	 * @param key 键名
	 * @param expireTime 过期时间（毫秒时间戳）
	 */
	setItemExpireTime(key: string, expireTime: number): boolean {
		try {
			const item = this.storage.getItem(key);
			if (item === null) {
				return false;
			}

			const storageData = JSON.parse(item);
			storageData.expireTime = expireTime;

			const newJsonString = JSON.stringify(storageData);

			this.storage.setItem(key, newJsonString);
			return true;
		} catch (error) {
			console.error('设置过期时间失败:', error);
			return false;
		}
	}

	/**
	 * 清理过期数据
	 */
	cleanExpiredItems(): number {
		let cleanedCount = 0;
		const keys = this.keys();

		keys.forEach(key => {
			const info = this.getItemInfo(key);
			if (info && info.isExpired) {
				this.removeItem(key);
				cleanedCount++;
			}
		});

		return cleanedCount;
	}
}

// 创建默认实例
export const localStorageManager = new LocalStorageManager();
// 导出便捷方法
export const {
	setItem,
	getItem,
	updateItem,
	removeItem,
	removeItems,
	clear,
	hasItem,
	keys,
	getItemInfo,
	setItemExpireTime,
	cleanExpiredItems
} = localStorageManager;
