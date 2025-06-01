import { useTheme } from '@/utils/theme.tsx';
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css'; //编辑器基础样式
import type { Ctx } from '@milkdown/ctx';
import { Milkdown, useEditor } from '@milkdown/react';
import { replaceAll } from '@milkdown/utils';
import { markdownToProjectSchema } from '@prism-ai/shared';
import { debounce, throttle } from 'lodash';
import { CheckIcon } from 'lucide-react';
import { useEffect, useRef, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';
import { useCustomMutation } from '../../../../query/config';
import { createProject } from '../../../../services/project';
import { selectProjectMd, setDataFromMd } from '../../../../store/projects';
import './theme.css'; //编辑器主题样式

interface EditorProps {
	type?: 'edit' | 'show'; //编辑模式、展示模式(只读)
}

export const Editor: FC<EditorProps> = ({ type }) => {
	const isShwoMode = type === 'show';
	const md = useSelector(selectProjectMd);
	const { resolvedTheme } = useTheme();

	let crepe: Crepe;
	const crepeRef = useRef<Crepe | null>(null);
	/* 
	由于replaceAll默认增量更新且异步, 因此即使md为字符串值也会引发循环更新。
	方案一、防止外部更新触发内部更新,且设置一个足够长的延时来确保内部更新完成后,再重置标记接受下一次更新。
	方案二、设置replaceAll的flush参数为true来同步（见源码）、全量更新。但这样md为对象时还是会引发循环更新。

	完整的方案：同步全量更新且防止外部更新触发内部更新。
	*/
	const isInternalUpdate = useRef(false); // 防止循环更新

	const dispatch = useDispatch();
	/* 防抖来防止正常编辑产生闪动、输入体验差问题 */
	const onMarkdownUpdated = debounce((ctx: Ctx, markdown: string, prevMarkdown: string) => {
		//防止外部更新触发内部更新
		if (!isInternalUpdate.current) {
			!isShwoMode && dispatch(setDataFromMd(markdown));
		}
	}, 500);

	const onFocus = () => {};
	const onBlur = () => {};

	useEditor(root => {
		crepe = new Crepe({
			root,
			defaultValue: md
		});
		crepeRef.current = crepe;
		isShwoMode && crepe.setReadonly(true);

		//事件监听（以进行数据处理）
		crepe.on(listener => {
			listener.markdownUpdated(onMarkdownUpdated);
			listener.focus(onFocus);
			listener.blur(onBlur);
		});
		return crepe;
	}, []);

	// 监听外部 md 变化，更新编辑器内容
	useEffect(
		throttle(() => {
			if (crepeRef.current) {
				const currentContent = crepeRef.current.getMarkdown();
				if (currentContent !== md) {
					isInternalUpdate.current = true; // 标记为内部更新
					// 使用 replaceAll 命令更新编辑器内容
					crepeRef.current.editor.action(replaceAll(md, true));
					// 确保内部更新完成再重置标记
					Promise.resolve().then(() => {
						isInternalUpdate.current = false; // 重置标记
					});
				}
			}
		}, 500),
		[md]
	);

	//卸载时清理编辑器（释放DOM和其它资源）
	useEffect(() => {
		return () => {
			crepe?.destroy();
		};
	}, []);

	const uploadProjectMutation = useCustomMutation(createProject);

	return (
		<div
			className={cn(
				resolvedTheme === 'dark' ? 'theme-frame-dark' : 'theme-nord',
				isShwoMode ? 'editor-small' : '',
				'w-full'
			)}
		>
			<Milkdown />
			{/* 提交按钮 */}
			{!isShwoMode && (
				<div className="flex justify-start items-center pl-30">
					<Button
						onClick={() => {
							const projectMd = markdownToProjectSchema(md);
							console.log('提交的项目经验:', markdownToProjectSchema(md));
							uploadProjectMutation.mutate(projectMd);
						}}
					>
						<CheckIcon className="h-4 w-4 mr-2" />
						提交项目
					</Button>
				</div>
			)}
		</div>
	);
};
