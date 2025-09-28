import { MilkdownProvider } from '@milkdown/react';
import React from 'react';
import { Editor, type EditorProps } from './Editor';

const MilkdownEditor: React.FC<EditorProps> = props => {
	return (
		<MilkdownProvider>
			<Editor {...props} />
		</MilkdownProvider>
	);
};

export default MilkdownEditor;
