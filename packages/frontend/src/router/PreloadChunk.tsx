import { useEffect } from 'react';

//注意：Vite不能在构建时处理像import（path）这样的动态导入。
//需要提供一个可能路径的静态映射，以便Vite可以正确处理。
const dynamicImports: Record<string, () => Promise<any>> = {
	// 知识库相关
	'../views/Main/Knowbase/DeepwikiDown': () => import('../views/Main/Knowbase/DeepwikiDown'),
	'../views/Main/Knowbase/KnowledgeRead': () => import('../views/Main/Knowbase/KnowledgeRead'),
	'../views/Main/Skills': () => import('../views/Main/Skills'),
	'../views/Main/Skills/SkillRead': () => import('../views/Main/Skills/SkillRead'),

	// 项目经验相关
	'../views/Main/Projects/Action': () => import('../views/Main/Projects/Action'),

	// 简历相关
	'../views/Main/Resumes/ResumeRead': () => import('../views/Main/Resumes/ResumeRead'),
	'../views/Main/Resumes/Action': () => import('../views/Main/Resumes/Action'),

	// 人岗匹配相关
	'../views/Main/Hjm/JobMatch': () => import('../views/Main/Hjm/JobMatch'),
	'../views/Main/Hjm/DataCrawl': () => import('../views/Main/Hjm/DataCrawl'),
	'../views/Main/Resumes/MatchedResume': () => import('../views/Main/Resumes/MatchedResume'),
	'../views/Main/Jobs/ResumeMatchedRead': () => import('../views/Main/Jobs/ResumeMatchedRead'),
	'../views/Main/Jobs': () => import('../views/Main/Jobs'),
	'../views/Main/Jobs/JobRead': () => import('../views/Main/Jobs/JobRead')
};

export default function PreloadChunk({
	chunkPath,
	children
}: {
	chunkPath: string[];
	children?: React.ReactNode;
}) {
	useEffect(() => {
		if (chunkPath) {
			const importPromises = chunkPath.map(path => {
				const importer = dynamicImports[path];
				if (importer) {
					return importer();
				} else {
					console.warn(`PreloadChunk: No dynamic import found for path: ${path}`);
					// 回退到动态导入，应该会在生产环境中失败
					return import(/* @vite-ignore */ path);
				}
			});

			Promise.allSettled(importPromises).then(results => {
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
