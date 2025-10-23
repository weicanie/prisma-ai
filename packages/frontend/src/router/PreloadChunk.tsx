import { useEffect } from 'react';

export default function PreloadChunk({
	chunkPath,
	children
}: {
	chunkPath: string[];
	children?: React.ReactNode;
}) {
	useEffect(() => {
		if (chunkPath) {
			Promise.allSettled(chunkPath.map(path => import(/* @vite-ignore */ path))).then(results => {
				results.forEach(result => {
					if (result.status !== 'fulfilled') {
						console.warn(`预加载失败 ${result.reason}`);
					}
				});
			});
		}
	}, [chunkPath]);
	return children;
}
