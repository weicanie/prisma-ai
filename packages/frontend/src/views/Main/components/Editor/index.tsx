import { MilkdownProvider } from '@milkdown/react';
import React from 'react';
import { Editor } from './Editor';
interface MilkdownEditorProps {
	type?: 'edit' | 'show'; //编辑模式、展示模式
}
const MilkdownEditor: React.FC<MilkdownEditorProps> = props => {
	return (
		<MilkdownProvider>
			<Editor {...props} />
		</MilkdownProvider>
	);
};

export default MilkdownEditor;
