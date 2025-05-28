import { useTheme } from '@/utils/theme.tsx';
import { useEffect, useState, type FC } from 'react';

import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor } from '@milkdown/react';

import '@milkdown/crepe/theme/common/style.css'; //编辑器基础样式
import type { Ctx } from '@milkdown/ctx';
import { markdownToProjectSchema } from '@prism-ai/shared';
import { CheckIcon, ChevronRightIcon } from 'lucide-react';
import { AnimatedSubscribeButton } from '../../../../components/magicui/animated-subscribe-button';
import { useCustomMutation } from '../../../../query/config';
import { createProject } from '../../../../services/project';
import './theme.css'; //编辑器主题样式

const defaultMd = `### 1、项目信息

#### 1.1 项目名称

* 名称：

<br />

#### 1.2 项目介绍
* 角色和职责：

> 说明你在项目中的角色和职责
>

<br />

* 核心贡献和参与程度：

> 突出你的核心贡献和参与程度 
>

<br />

* 背景和目的：

> 简要介绍项目的背景和目的

<br />

#### 1.3 项目技术栈

<br />

> 在上方写下以逗号或顿号分隔的技术栈列表
>
> 例如：React、TypeScript、Tailwind CSS
### 2、项目亮点

#### 2.1 团队贡献
  * 
#### 2.2 技术亮点/难点
  * 
#### 2.3 用户体验/业务价值
  * `;

export const MilkdownEditor: FC = () => {
	const [md, setMd] = useState(defaultMd);
	const [schema, setSchema] = useState(() => markdownToProjectSchema(md));
	const { theme, resolvedTheme } = useTheme();

	let crepe: Crepe;
	const onMarkdownUpdated = (ctx: Ctx, markdown: string, prevMarkdown: string) => {
		setMd(markdown);
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
			defaultValue: md
		});
		const themeClassName = theme === 'dark' ? 'milkdown-theme-frame-dark' : 'milkdown-theme-nord';
		root.classList.add(themeClassName);
		//事件监听（以进行数据处理）
		crepe.on(listener => {
			listener.markdownUpdated(onMarkdownUpdated);
			listener.focus(onFocus);
			listener.blur(onBlur);
		});
		return crepe;
	}, []);

	/* 获取编辑器实例	
	const [, getEditor] = useInstance();
	const crepeInstance = getEditor(); 
	*/

	//卸载时清理编辑器（释放DOM和其它资源）
	useEffect(() => {
		return () => {
			crepe?.destroy();
		};
	}, []);

	const uploadProjectMutation = useCustomMutation(createProject);

	return (
		<div className={theme === 'dark' ? 'theme-frame-dark' : 'theme-nord'}>
			<Milkdown />
			{/* 提交按钮 */}
			<div className="flex justify-start items-center pl-30">
				<AnimatedSubscribeButton
					className="w-36"
					onClick={() => {
						const projectMd = markdownToProjectSchema(md);
						console.log('提交的项目经验:', markdownToProjectSchema(md));
						uploadProjectMutation.mutate(projectMd);
					}}
				>
					<span className="group inline-flex items-center">
						提交
						<ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
					</span>
					<span className="group inline-flex items-center">
						<CheckIcon className="mr-2 size-4" />
						提交成功
					</span>
				</AnimatedSubscribeButton>
			</div>
		</div>
	);
};
