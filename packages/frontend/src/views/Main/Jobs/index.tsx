import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { JobVo, ResumeVo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { JobQueryKey, ResumeQueryKey } from '../../../query/keys';
import { findAllUserJobs, removeJob } from '../../../services/job';
import { findAllResumeMatched } from '../../../services/resume';
import { selectResumeData, setResumeData } from '../../../store/resume';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import Resumes from '../Resumes';
import JobCreate from './JobCreate';

interface JobsProps<TData> {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (rows: TData[]) => void; //储存选中状态到store
	title?: string; // 页面标题
	description?: string; // 页面描述
	mainTable?: boolean; // 是否为主表格
}

const Jobs: React.FC<JobsProps<JobVo>> = memo(
	({ selectColShow, selectionHandler, title, description }) => {
		const navigate = useNavigate();
		const dispatch = useDispatch();

		const { data, status } = useCustomQuery([JobQueryKey.Jobs], () => findAllUserJobs(1, 1000));

		const { data: resumeMatchedData, status: resumeMatchedStatus } = useCustomQuery(
			[ResumeQueryKey.ResumeMatched, 1, 1000],
			() => findAllResumeMatched(1, 1000)
		);
		const queryClient = useQueryClient();

		const removeMutation = useCustomMutation(removeJob, {
			onSuccess: () => {
				toast.success('删除成功');
				queryClient.invalidateQueries({ queryKey: [JobQueryKey.Jobs] });
			},
			onError: () => {
				toast.error('删除失败');
			}
		});

		// 从store获取选中的简历和岗位
		const selectedIds = useSelector(selectResumeData);
		const selectedResumeId = selectedIds?.resumeId;
		const selectedJobId = selectedIds?.jobId;

		if (status === 'pending' || resumeMatchedStatus === 'pending') {
			return <div>Loading...</div>;
		}
		if (status === 'error' || resumeMatchedStatus === 'error') {
			return <div>错误:{data?.message}</div>;
		}
		const jobDatas = data.data?.data || [];
		const resumeMatchedDatas = resumeMatchedData.data?.data || [];

		const selectCol = selectColShow
			? [
					{
						id: '_select' as const,
						header: ({ table }: { table: Table<JobVo> }) => (
							<Checkbox
								checked={
									table.getIsAllPageRowsSelected() ||
									(table.getIsSomePageRowsSelected() && 'indeterminate')
								}
								onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
								aria-label="Select all"
								className="translate-y-[2px]"
							/>
						),
						cell: ({ row }: { row: Row<JobVo> }) => (
							<Checkbox
								checked={row.getIsSelected()}
								onCheckedChange={value => row.toggleSelected(!!value)}
								aria-label="Select row"
								className="translate-y-[2px]"
							/>
						),
						enableSorting: false,
						enableHiding: false
					}
				]
			: [];

		const handleMatchClick = () => {
			navigate(`/main/resumes/action/${selectedResumeId}/${selectedJobId}`, {
				state: { param: [selectedResumeId, selectedJobId] }
			});
		};

		const dataTableConfig: DataTableConfig<JobVo> = {
			columns: {
				dataCols: [
					{
						accessorKey: 'jobName',
						header: ({ column }) => <DataTableColumnHeader column={column} title="职位名称" />,
						cell: ({ row }) => {
							return <div className="w-[120px] font-medium">{row.original.jobName}</div>;
						},
						enableHiding: false,
						enableSorting: false
					},
					{
						accessorKey: 'companyName',
						header: ({ column }) => <DataTableColumnHeader column={column} title="公司名称" />,
						cell: ({ row }) => {
							return <div className="w-[120px]">{row.original.companyName}</div>;
						}
					},
					{
						accessorKey: 'location',
						header: ({ column }) => <DataTableColumnHeader column={column} title="工作地点" />,
						cell: ({ row }) => {
							return <div className="w-[100px]">{row.original.location || '未知'}</div>;
						}
					},
					{
						accessorKey: 'salary',
						header: ({ column }) => <DataTableColumnHeader column={column} title="薪资范围" />,
						cell: ({ row }) => {
							return <div className="w-[100px]">{row.original.salary || '面议'}</div>;
						}
					},
					{
						accessorKey: 'jon_status',
						header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
						cell: ({ row }) => {
							const job_status = row.original.job_status;
							return (
								<Badge variant={job_status === 'open' ? 'default' : 'secondary'}>
									{job_status === 'open' ? '开放' : '关闭'}
								</Badge>
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

				selectCol,

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
											removeMutation.mutate(row.original.id);
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
					searchColIds: ['jobName']
				},
				pagination: {
					enable: true
				}
			},
			onRowClick: (rowData: JobVo) => {
				return () => {
					navigate(`/main/job/detail/${rowData.id}`, {
						state: { param: rowData.id }
					});
				};
			},
			createBtn: <JobCreate />,
			actionBtns: [
				{
					label: '定制岗位专用简历',
					onClick: handleMatchClick
				}
			],
			selectionHandler
		};

		//添加选择列
		const ResumeProps = {
			selectColShow: true,
			//将选中状态存储到store
			selectionHandler: (selectedRows: unknown[]) => {
				dispatch(
					setResumeData({
						resumeId: (selectedRows[0] as ResumeVo)?.id
					})
				);
			},
			title: '',
			description: '选择要匹配的简历',
			mainTable: false
		};
		const dataTableConfigResumeMatched: DataTableConfig<ResumeVo> = {
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
						cell: ({ row }) => <DataTableRowActions row={row} />
					}
				]
			},

			options: {
				toolbar: {
					enable: true,
					searchColIds: ['name']
				},
				pagination: {
					enable: true
				}
			},
			onRowClick: (rowData: ResumeVo) => {
				return () => {
					navigate(`/main/job/resumeMatched/${rowData.id}`, {
						state: { param: rowData.id }
					});
				};
			},
			mainTable: false
		};

		return (
			<>
				<PageHeader
					title={title ?? '岗位'}
					description={description ?? '追踪岗位, 并借助 Prisma 将您的简历与岗位信息进行匹配'}
				></PageHeader>
				<div className="pl-10 pr-10">
					<ConfigDataTable dataTableConfig={dataTableConfig} data={jobDatas} />
				</div>
				<Resumes {...ResumeProps}></Resumes>
				<PageHeader
					title={'岗位专用简历'}
					description={'已定制的契合、匹配岗位的专用简历'}
				></PageHeader>
				<div className="pl-10 pr-10">
					<ConfigDataTable
						dataTableConfig={dataTableConfigResumeMatched}
						data={resumeMatchedDatas}
					/>
				</div>
			</>
		);
	}
);

const JobsPage = () => {
	const dispatch = useDispatch();
	const JobsProps = {
		title: '岗位',
		description: '追踪岗位, 并借助 Prisma 将您的简历与岗位信息进行匹配',
		mainTable: true,
		selectColShow: true,
		selectionHandler: (selectedRows: unknown[]) => {
			dispatch(
				setResumeData({
					jobId: (selectedRows[0] as JobVo)?.id
				})
			);
		}
	};
	return (
		<>
			<Jobs {...JobsProps} />
		</>
	);
};

export default JobsPage;
