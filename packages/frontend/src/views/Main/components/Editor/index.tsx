import { MilkdownProvider } from '@milkdown/react';
import React from 'react';
import { Editor } from './Editor';
interface MilkdownEditorProps {
	type?: 'edit' | 'show'; //编辑模式、展示模式
}
const MilkdownEditor: React.FC<MilkdownEditorProps> = ({ type }) => {
	return (
		<MilkdownProvider>
			<Editor type={type} />
		</MilkdownProvider>
	);
};

export default MilkdownEditor;
