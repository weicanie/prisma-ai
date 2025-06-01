import type { ProjectVo } from '@prism-ai/shared';
import React, { useEffect } from 'react';
import { useCustomMutation } from '../../../query/config';
import { findAllProjects } from '../../../services/project';
import { ProjectCard } from '../components/ProjectCard';

interface ProjectListProps {}

export const ProjectList: React.FC<ProjectListProps> = props => {
	const [list, setList] = React.useState<ProjectVo[]>([]);
	//FIXME 用 useQuery 而不是 useMutation
	const mutation = useCustomMutation(findAllProjects, {
		onSuccess: data => {
			setList(data.data || []);
		}
	});
	useEffect(() => {
		mutation.mutate({});
	}, []);
	return (
		<div className="flex flex-col items-center gap-4">
			{list.map((project, index) => {
				return <ProjectCard data={project} key={project.id}></ProjectCard>;
			})}
		</div>
	);
};
