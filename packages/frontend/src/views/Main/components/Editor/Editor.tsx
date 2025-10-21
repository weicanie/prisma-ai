import { useTheme } from '@/utils/theme.tsx';
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css'; //编辑器基础样式
import type { Ctx } from '@milkdown/ctx';
import { Milkdown, useEditor } from '@milkdown/react';
import { replaceAll } from '@milkdown/utils';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { debounce, throttle } from 'lodash';
import { ArrowLeft, CheckIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';
import { selectProjectMd } from '../../../../store/projects';
import './theme.css'; //编辑器主题样式

export interface EditorProps {
	type?: 'edit' | 'show'; //编辑模式、展示模式(只读)
	submitHandler?: (md: string) => (...args: any) => void; //提交按钮回调
	updateAction?: ActionCreatorWithPayload<any>; //编辑后更新store的action
	mdSelector?: (state: any) => string; //同步store中的md,

	/* 在`新建`弹窗中控制使用表单还是md */
	isUseMdEditor?: boolean;
	setIsUseMdEditor?: React.Dispatch<React.SetStateAction<boolean>>;

	/* 在结果卡片中展示md */
	isCardMode?: boolean;
}

export const Editor: FC<EditorProps> = ({
	type,
	updateAction,
	submitHandler,
	mdSelector,
	setIsUseMdEditor,
	isCardMode
}) => {
	const isShwoMode = type === 'show';
	const md = useSelector(mdSelector ? mdSelector : selectProjectMd); //获取编辑器内容，默认为项目经验的md
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
	const onMarkdownUpdated = debounce((_: Ctx, markdown: string) => {
		//防止外部更新触发内部更新
		if (!isInternalUpdate.current && !isShwoMode && updateAction) {
			dispatch(updateAction(markdown));
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
		if (isShwoMode) crepe.setReadonly(true);
		//事件监听（以进行数据处理）
		crepe.on(listener => {
			listener.markdownUpdated(onMarkdownUpdated);
			listener.focus(onFocus);
			listener.blur(onBlur);
		});
		return crepe;
	}, []);

	const updateText = useCallback(
		throttle((content: string) => {
			crepeRef.current?.editor.action(replaceAll(content, true));
		}, 300),
		[]
	);

	// 展示模式：监听外部 md 变化，更新编辑器内容
	useEffect(
		throttle(() => {
			if (isShwoMode && crepeRef.current) {
				const currentContent = crepeRef.current.getMarkdown();
				if (currentContent !== md) {
					isInternalUpdate.current = true; // 标记为内部更新
					// 使用 replaceAll 命令更新编辑器内容
					updateText(md);
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

	return (
		<div
			className={cn(
				resolvedTheme === 'dark' ? 'theme-frame-dark' : 'theme-nord',
				isShwoMode ? 'editor-small' : '',
				isCardMode ? 'editor-card' : '',
				'w-full'
			)}
		>
			<Milkdown />
			{/* 提交按钮 */}
			{!isShwoMode && (
				<>
					<Button
						className="fixed bottom-3 left-3"
						onClick={() => setIsUseMdEditor && setIsUseMdEditor(false)}
						variant={'outline'}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						使用表单
					</Button>
					<Button className="fixed bottom-3 right-33" onClick={submitHandler && submitHandler(md)}>
						<CheckIcon className="h-4 w-4 mr-2" />
						提交
					</Button>
				</>
			)}
		</div>
	);
};
