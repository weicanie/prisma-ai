/**
 * 异步 map 函数，使用 Promise.allSettled 等待所有异步操作完成
 *
 * @template T 输入数组的元素类型
 * @template R 输出数组的元素类型
 * @param array 输入数组
 * @param asyncFn 异步回调函数，接收元素、索引和原数组，返回 Promise<R>
 * @returns Promise<R[]> 等待所有异步操作完成后的结果数组
 *
 * @example
 * // 基本用法
 * const numbers = [1, 2, 3, 4, 5];
 * const doubled = await awaitMap(numbers, async (num) => {
 *   await someAsyncOperation();
 *   return num * 2;
 * });
 * console.log(doubled); // [2, 4, 6, 8, 10]
 *
 * @example
 * // 带索引和数组参数
 * const items = ['a', 'b', 'c'];
 * const results = await awaitMap(items, async (item, index, arr) => {
 *   console.log(`Processing ${item} at index ${index} of array with ${arr.length} items`);
 *   return `${item}_${index}`;
 * });
 * console.log(results); // ['a_0', 'b_1', 'c_2']
 *
 * @example
 * // 处理可能失败的异步操作
 * const urls = ['url1', 'url2', 'url3'];
 * const responses = await awaitMap(urls, async (url) => {
 *   try {
 *     return await fetch(url);
 *   } catch (error) {
 *     return null; // 即使某个请求失败，其他请求仍会继续
 *   }
 * });
 */
export async function asyncMap<T = any, R = any>(
	array: T[],
	asyncFn: (item: T, index: number, arr: T[]) => Promise<R>
): Promise<R[]> {
	if (!Array.isArray(array)) {
		throw new Error('First argument must be an array');
	}

	if (typeof asyncFn !== 'function') {
		throw new Error('Second argument must be a function');
	}

	if (array.length === 0) {
		return [];
	}

	// 创建 Promise 数组，每个 Promise 对应一个数组元素
	const promises = array.map((item, index) => asyncFn(item, index, array));

	// 等待所有 Promise 完成（无论成功还是失败）
	const results = await Promise.allSettled(promises);

	// 处理结果，成功的结果直接返回，失败的结果抛出错误
	return results.map((result, index) => {
		if (result.status === 'fulfilled') {
			return result.value;
		} else {
			// 如果某个异步操作失败，抛出错误，包含失败原因和索引信息
			throw new Error(
				`asyncMap ~ Async operation failed at index ${index}: ${result.reason?.message || result.reason}`
			);
		}
	});
}
