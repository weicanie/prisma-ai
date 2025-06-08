import { Badge } from '@/components/ui/badge';
import type { ResumeVo } from '@prism-ai/shared';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { ResumeQueryKey } from '../../../query/keys';
import { findAllUserResumes } from '../../../services/resume';
import { setResumeData } from '../../../store/resume';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import Projects from '../Projects';
import Skills from '../Skills';
import ResumeCreate from './ResumeCreate';

interface ResumesProps {
	_?: string;
}

const Resumes: React.FC<ResumesProps> = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { data, status } = useCustomQuery([ResumeQueryKey.Resumes, 1, 10], ({ queryKey }) => {
		const [, page, limit] = queryKey; // 从 queryKey 中解构分页参数
		return findAllUserResumes(page as number, limit as number);
	});

	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const resumeDatas = data.data.data;

	const dataTableConfig: DataTableConfig<ResumeVo> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'name',
					header: ({ column }) => <DataTableColumnHeader column={column} title="简历名称" />,
					cell: ({ row }) => {
						return <div className="w-[200px] font-medium">{row.original.name}</div>;
					},
					enableHiding: false,
					enableSorting: true
				},
				{
					accessorKey: 'skill',
					header: ({ column }) => <DataTableColumnHeader column={column} title="职业技能" />,
					cell: ({ row }) => {
						const skill = row.original.skill;
						if (!skill?.content?.length) {
							return <div className="text-gray-500">未关联技能</div>;
						}
						const firstType = skill.content[0]?.type || '未分类';
						return <div className="w-[120px]">{firstType}</div>;
					},
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'projects',
					header: ({ column }) => <DataTableColumnHeader column={column} title="项目经验" />,
					cell: ({ row }) => {
						const projects = row.original.projects || [];
						if (projects.length === 0) {
							return <div className="text-gray-500">无项目经验</div>;
						}
						const displayProjects = projects.slice(0, 2);
						const remainingCount = projects.length - 2;

						return (
							<div className="flex flex-wrap gap-1 max-w-[300px]">
								{displayProjects.map((project, index) => (
									<Badge key={project.id || index} variant="secondary" className="text-xs">
										{project.name || project.info?.name || '未命名项目'}
									</Badge>
								))}
								{remainingCount > 0 && (
									<Badge variant="default" className="text-xs">
										+{remainingCount}个项目
									</Badge>
								)}
							</div>
						);
					}
				},
				{
					accessorKey: 'updatedAt',
					header: ({ column }) => <DataTableColumnHeader column={column} title="更新时间" />,
					cell: ({ row }) => {
						const date = row.original.updatedAt
							? new Date(row.original.updatedAt).toLocaleDateString()
							: '未知';
						return <div className="text-sm text-gray-500">{date}</div>;
					}
				}
			],

			selectCol: [],

			rowActionsCol: [
				{
					id: 'actions',
					cell: ({ row }) => <DataTableRowActions row={row} />
				}
			]
		},

		options: {
			toolbar: {
				enable: true,
				searchColId: 'name'
			},
			pagination: true
		},
		onRowClick: (index: number) => {
			return () => {
				navigate(`/main/resumes/detail/${index}`, { state: { param: index } });
			};
		},
		createBtn: <ResumeCreate />
	};
	const SkillsProps = {
		selectColShow: true,
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(setResumeData({ skill: (selectedRows[0] as ResumeVo)?.id }));
		},
		title: '',
		description: '选择一个职业技能'
	};
	const ProjectsProps = {
		selectColShow: true,
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(
				setResumeData({
					projects: selectedRows.map((row: unknown): string => (row as ResumeVo).id!)
				})
			);
		},
		title: '',
		description: '选择若干项目经验'
	};

	return (
		<>
			<PageHeader
				title="简历"
				description="选择一个职业技能, 若干项目经验, 组合成您的简历"
			></PageHeader>
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={resumeDatas} />
			</div>
			<Skills {...SkillsProps}></Skills>
			<Projects {...ProjectsProps}></Projects>
		</>
	);
};

export default Resumes;
