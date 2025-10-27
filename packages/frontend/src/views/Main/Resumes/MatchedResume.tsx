import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ResumeMatchedVo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Database } from 'lucide-react';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '../../../hooks/use-mobile';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { ResumeQueryKey } from '../../../query/keys';
import {
	exportResumeToEditor,
	findAllResumeMatched,
	removeResumeMatched
} from '../../../services/resume';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';

interface MatchedResumeProps {
	title?: string; // 页面标题
	description?: string; // 页面描述
}

const MatchedResume: React.FC<MatchedResumeProps> = memo(({ title, description }) => {
	const navigate = useNavigate();
	const isMobile = useIsMobile();

	const { data: resumeMatchedData, status: resumeMatchedStatus } = useCustomQuery(
		[ResumeQueryKey.ResumeMatched, 1, 1000],
		() => findAllResumeMatched(1, 1000)
	);
	const queryClient = useQueryClient();

	const removeResumeMatchedMutation = useCustomMutation(removeResumeMatched, {
		onSuccess: () => {
			toast.success('删除成功');
			queryClient.invalidateQueries({ queryKey: [ResumeQueryKey.ResumeMatched] });
		},
		onError: () => {
			toast.error('删除失败');
		}
	});

	const exportToEditorMutation = useCustomMutation(exportResumeToEditor, {
		onSuccess: () => {
			toast.success('导出成功');
		},
		onError: () => {
			toast.error('导出失败');
		}
	});

	if (resumeMatchedStatus === 'pending') {
		return <div></div>;
	}
	if (resumeMatchedStatus === 'error') {
		return <div>错误:{resumeMatchedData?.message}</div>;
	}
	const resumeMatchedDatas = resumeMatchedData.data?.data || [];

	const dataTableConfigResumeMatched: DataTableConfig<ResumeMatchedVo> = {
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
						const displaySkill = skill.content.slice(0, 2);
						const remainingCount = skill.content.length - 2;
						return (
							<div className="flex flex-wrap gap-1 max-w-[300px]">
								{displaySkill.map((skill, index) => (
									<Badge key={skill.type || index} variant="secondary" className="text-xs">
										{skill.type || '未分类'}
									</Badge>
								))}
								{remainingCount > 0 && (
									<Badge variant="default" className="text-xs">
										+{remainingCount}个技能
									</Badge>
								)}
							</div>
						);
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
					cell: ({ row }) => (
						<DataTableRowActions
							row={row}
							actions={[
								{
									label: '删除',
									onClick: () => {
										removeResumeMatchedMutation.mutate(row.original.id);
									}
								},
								{
									label: '导出',
									onClick: () => {
										exportToEditorMutation.mutate(row.original.id);
									}
								}
							]}
						/>
					)
				}
			]
		},

		options: {
			toolbar: {
				enable: true,
				searchColIds: ['name']
			},
			pagination: {
				enable: resumeMatchedDatas.length > 10
			}
		},
		onRowClick: (rowData: ResumeMatchedVo) => {
			return () => {
				navigate(`resumeMatched-detail/${rowData.id}`, {
					state: { param: rowData.id }
				});
			};
		},
		mainTable: false
	};

	return (
		<>
			<PageHeader
				title={title ?? '岗位专用简历'}
				description={description ?? '已定制的契合、匹配岗位的专用简历'}
			>
				<Button
					variant="outline"
					onClick={() => navigate('/main/hjm/resume/custom-resume')}
					className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}
				>
					<Database className={`h-4 w-4 ${isMobile ? 'h-3 w-3' : ''}`} />
					定制简历
				</Button>
			</PageHeader>
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfigResumeMatched} data={resumeMatchedDatas} />
			</div>
		</>
	);
});

export default MatchedResume;
