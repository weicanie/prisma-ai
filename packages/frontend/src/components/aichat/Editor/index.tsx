import { MilkdownProvider } from '@milkdown/react';
import React from 'react';
import { Editor, type EditorProps } from './Editor';
/**
 * 专门用于AIChat的md编辑器
 */
const MilkdownEditor: React.FC<EditorProps> = props => {
	return (
		<MilkdownProvider>
			<Editor {...props} />
		</MilkdownProvider>
	);
};

export default MilkdownEditor;
