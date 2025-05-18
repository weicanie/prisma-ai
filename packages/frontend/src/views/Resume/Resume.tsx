import { Outlet } from 'react-router-dom';
import ResumeSidebarWrapper from './c-cpns/ResumeSidebarWrapper';

function Resume() {
	return (
		<>
			<ResumeSidebarWrapper>
				<Outlet />
			</ResumeSidebarWrapper>
		</>
	);
}

export default Resume;
