import MilkdownEditorWrapper from '../../components/EditorWrapper';
import ResumeSidebarWrapper from '../../components/ResumeSidebarWrapper';

function Resume() {
	return (
		<>
			<ResumeSidebarWrapper>
				<MilkdownEditorWrapper />
			</ResumeSidebarWrapper>
		</>
	);
}

export default Resume;
