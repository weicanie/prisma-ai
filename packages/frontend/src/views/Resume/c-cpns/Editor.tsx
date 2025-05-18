import { useTheme } from '@/utils/theme.tsx';
import { useEffect, type FC } from 'react';

import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor, useInstance } from '@milkdown/react';

import '@milkdown/crepe/theme/common/style.css';
import type { Ctx } from '@milkdown/ctx';

const markdown = `### 项目信息

#### 基本信息

- 名称：xx低代码商城系统平台（LowCode Mall System Platform）

#### 项目介绍

- 说明你在项目中的角色和职责：
- 突出你的核心贡献和参与程度：
- 简要介绍项目的背景和目的：低代码商城系统平台是一个为企业快速定制H5/小程序商城系统的前端开发平台。 该平台通过预定义的组件库和可视化拖拉拽界面，使产品团队能够自主设计和部署商城应用，极大减少了开发和沟通成本。通过这种方式，企业能够在短时间内为客户提供定制化的商场应用，同时保持高度的灵活性和可扩展性。

#### 项目技术栈

Vue3、Vue Router、Pinia、 Element-plus、 axios、 vuedraggable、Swiper、sass

### 亮点

- 团队贡献
  - 组件库的构建和维护:开发和维护覆盖商城系统核心功能的组件库，如商品展示、商品详情、购物车、订单处理等。
- 技术亮点/难点
  - 项目核心:使用Vue3和Element- Plus构建可交互的用户界面。实现拖拉拽功能，允许用户自定义页面布局和组件配置。
  - 通用组件的适应性:设计灵活的组件库满足不同客户需求，适用于多种商城场景。
  - 系统性能优化:保持系统即使在复杂布局和大量组件的情况下也能保持良好的性能和响应速度。
- 用户体验/业务价值
  - 用户体验设计:确保拖拉拽界面直观易用，使非技术人员也能轻松操作，快速生成商城页面。
  - 提高开发效率:通过低代码平台，产品团队无需开发人员介入即可设计和部署商城系统，减少开发时间和成本80%。
  - 减少沟通成本:通过可视化配置简化客户、产品和开发之间的沟通，减少需求误差和频繁变更。`;

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
