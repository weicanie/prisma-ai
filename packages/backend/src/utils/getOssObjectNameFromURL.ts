export function getOssObjectNameFromURL(url: string): string {
	const parts = url.split('/');
	// 用户ID/文件名
	return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}
