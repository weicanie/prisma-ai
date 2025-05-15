import { MilkdownProvider } from '@milkdown/react';
import React from 'react';
import { MilkdownEditor } from './Editor';

const MilkdownEditorWrapper: React.FC = () => {
	return (
		<MilkdownProvider>
			<MilkdownEditor />
		</MilkdownProvider>
	);
};

export default MilkdownEditorWrapper;
