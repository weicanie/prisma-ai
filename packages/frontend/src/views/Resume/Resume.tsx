import { MagicCardWrapper } from '../../components/MagicCard';
import { BreadcrumbDemo } from './c-cpns/Breadcrumb';
import { ProjectForm } from './c-cpns/ProjectForm';
import ResumeSidebarWrapper from './c-cpns/ResumeSidebarWrapper';

function Resume() {
	return (
		<>
			<ResumeSidebarWrapper>
				<BreadcrumbDemo first="通用简历" second="项目经验上传"></BreadcrumbDemo>
				{/* <MilkdownEditorWrapper /> */}
				<MagicCardWrapper cardTitle="">
					<ProjectForm></ProjectForm>
				</MagicCardWrapper>
			</ResumeSidebarWrapper>
		</>
	);
}

export default Resume;
