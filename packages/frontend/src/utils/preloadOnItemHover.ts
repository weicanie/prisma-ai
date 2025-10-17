import { sideBar_urlpath_filePath } from '../router/router';

// 调用时传入urlPath，预加载对应的静态资源文件
export async function preloadOnItemHover(urlPath: string) {
	const modulePath = sideBar_urlpath_filePath[urlPath];
	if (modulePath) {
		try {
			console.log(`预加载${urlPath}对应的静态资源文件${modulePath}`);
			await import(/* @vite-ignore */ modulePath); //运行时决定
			console.log(`预加载成功: ${urlPath}`);
		} catch (error) {
			console.warn(`预加载失败 ${urlPath}:`, error);
		}
	} else {
		console.warn(`未找到路径 ${urlPath} 对应的模块映射`);
	}
}
