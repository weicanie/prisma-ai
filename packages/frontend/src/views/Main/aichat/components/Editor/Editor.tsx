import { cn } from '@/lib/utils';
import { useTheme } from '@/utils/theme.tsx';
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
//编辑器基础样式
import { Milkdown, useEditor } from '@milkdown/react';
import { replaceAll } from '@milkdown/utils';
import { memo, useEffect, useRef, type FC } from 'react';
import './theme.css'; //编辑器主题样式
export interface EditorProps {
	text: string;
	isShwoMode: boolean;
	isTypingMode?: boolean;
	onChange?: (content: string) => void;
	className?: string;
}

export const Editor: FC<EditorProps> = memo(
	({ text, isShwoMode = true, isTypingMode = false, onChange, className }) => {
		const { resolvedTheme } = useTheme();

		const crepeRef = useRef<Crepe>();

		useEffect(() => {
			if (crepeRef.current && isTypingMode) {
				crepeRef.current.editor.action(replaceAll(text, true));
			}
		}, [text, isTypingMode]);

		const onFocus = () => {};
		const onBlur = () => {};
		const onContentChange = (_: unknown, markdown: string) => {
			onChange?.(markdown);
		};

		useEditor(root => {
			crepeRef.current = new Crepe({
				root,
				defaultValue: text
			});
			if (isShwoMode) {
				crepeRef.current.setReadonly(true);
			}
			//事件监听（以进行数据处理）
			crepeRef.current.on(listener => {
				listener.focus(onFocus);
				listener.blur(onBlur);
				listener.markdownUpdated(onContentChange);
			});
			return crepeRef.current;
		}, []);

		//卸载时清理编辑器（释放DOM和其它资源）
		useEffect(() => {
			return () => {
				crepeRef.current?.destroy();
			};
		}, []);

		return (
			<div
				className={cn(
					resolvedTheme === 'dark' ? 'theme-frame-dark' : 'theme-nord',
					isShwoMode ? 'editor-small' : '',
					'w-full',
					className
				)}
			>
				<Milkdown />
			</div>
		);
	}
);
