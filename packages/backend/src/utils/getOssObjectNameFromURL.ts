export function getOssObjectNameFromURL(url: string): string {
	return url.split('/').pop()!;
}
