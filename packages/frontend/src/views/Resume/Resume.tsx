import ResumeSidebarWrapper from './c-cpns/ResumeSidebarWrapper';
import { SSETest } from './SSETest';

function Resume() {
	return (
		<>
			<ResumeSidebarWrapper>
				{/* <Outlet /> */}
				<SSETest></SSETest>
			</ResumeSidebarWrapper>
		</>
	);
}

export default Resume;
