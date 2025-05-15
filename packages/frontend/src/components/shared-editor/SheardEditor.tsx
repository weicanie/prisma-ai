import React, { useEffect, useRef } from 'react';
import { createEditor } from './create-editor';

import { SheardEditorWrapper } from './style';
/**
 * SheardEditor 组件：封装 Milkdown 协同编辑器为 React 组件
 * @param rootId 编辑器挂载的 DOM id（如 #app1）
 * @param areaId 控制区挂载的 DOM id（如 #container1）
 */
const SheardEditor: React.FC<{
	rootId?: string;
	areaId?: string;
}> = ({ rootId = `shard-editor-root`, areaId = `shard-editor-area` }) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const areaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// 动态创建挂载节点
		if (rootRef.current && areaRef.current) {
			rootRef.current.id = rootId.replace('#', '');
			areaRef.current.id = areaId.replace('#', '');
			createEditor(`#${rootRef.current.id}`, `#${areaRef.current.id}`);
		}
		// 只在首次挂载时执行
		// eslint-disable-next-line
	}, []);

	return (
		<SheardEditorWrapper>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				<div ref={areaRef} id={`${areaRef.current?.id}`} />
				<div ref={rootRef} id={`${rootRef.current?.id}`} />
			</div>
		</SheardEditorWrapper>
	);
};

export { SheardEditor };
