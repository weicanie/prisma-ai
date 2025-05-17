import { useTheme } from '@/utils/theme.tsx';
import { useEffect, type FC } from 'react';

import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor, useInstance } from '@milkdown/react';

import '@milkdown/crepe/theme/common/style.css';
import type { Ctx } from '@milkdown/ctx';

const markdown = `# Milkdown React Crepe

> You're scared of a world where you're needed.

This is a demo for using Crepe with **React**.`;

export const MilkdownEditor: FC = () => {
	let crepe: Crepe;
	const onMarkdownUpdated = (ctx: Ctx, markdown: string, prevMarkdown: string) => {
		console.log('Markdown updated:', markdown);
	};
	const onDocUpdated = (ctx: Ctx, doc: Node, prevDoc: Node) => {
		console.log('Document updated:', doc);
	};
	const onFocus = () => {
		console.log('Editor focused');
	};
	const onBlur = () => {
		console.log('Editor blurred');
	};

	useEditor(root => {
		crepe = new Crepe({
			root,
			defaultValue: markdown
		});
		//事件监听（以进行数据处理）
		crepe.on(listener => {
			listener.markdownUpdated(onMarkdownUpdated);
			//@ts-expect-error
			listener.updated(onDocUpdated);
			listener.focus(onFocus);
			listener.blur(onBlur);
		});
		return crepe;
	}, []);

	//主题切换
	const { theme, resolvedTheme } = useTheme();
	//可用主题列表：frame、nord、frame-dark、classic-dark、nord-dark
	useEffect(() => {
		if ((theme ?? resolvedTheme) === 'dark') {
			import('@milkdown/crepe/theme/frame-dark.css');
		} else {
			console.log('first');
			import('@milkdown/crepe/theme/nord.css');
		}
	}, [theme]);

	//获取编辑器实例
	const [, getEditor] = useInstance();
	const crepeInstance = getEditor();

	//卸载时清理编辑器（释放DOM和其它资源）
	useEffect(() => {
		return () => {
			crepe?.destroy();
		};
	}, []);

	return <Milkdown />;
};
