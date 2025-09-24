import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { SkillVo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { SkillQueryKey } from '../../../query/keys';
import { findAllUserSkills, removeSkill } from '../../../services/skill';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import { SkillCreate } from './SkillCreate';
import SkillUpdate from './Update';

interface SkillsProps<TData> {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (rows: TData[]) => void; //储存选中状态到store
	title?: string; // 页面标题
	description?: string; // 页面描述
	mainTable?: boolean; // 是否为主表格
	collapsible?: boolean; // 是否为折叠组件
}

const Skills: React.FC<SkillsProps<SkillVo>> = ({
	selectColShow,
	selectionHandler,
	title,
	description,
	mainTable = true,
	collapsible = false
}) => {
	const navigate = useNavigate();
	const { data, status } = useCustomQuery([SkillQueryKey.Skills], findAllUserSkills);
	const queryClient = useQueryClient();
	const removeMutation = useCustomMutation(removeSkill, {
		onSuccess: () => {
			toast.success('删除成功');
			queryClient.invalidateQueries({ queryKey: [SkillQueryKey.Skills] });
		},
		onError: () => {
			toast.error('删除失败');
		}
	});

	if (status === 'pending') {
		return <div></div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const skillDatas = data.data;

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,
					header: ({ table }: { table: Table<SkillVo> }) => (
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
					cell: ({ row }: { row: Row<SkillVo> }) => (
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

	const dataTableConfig: DataTableConfig<SkillVo> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'type',
					header: ({ column }) => <DataTableColumnHeader column={column} title="技能类型" />,
					cell: ({ row }) => {
						const firstType = row.original.content[0]?.type || '未分类';
						return <div className="w-[120px]">{firstType}</div>;
					},
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'skills',
					header: ({ column }) => <DataTableColumnHeader column={column} title="技能详情" />,
					cell: ({ row }) => {
						const allSkills = row.original.content.flatMap(item => item.content || []);
						const displaySkills = allSkills.slice(0, 3);
						const remainingCount = allSkills.length - 3;

						return (
							<div className="flex flex-wrap gap-1 max-w-[400px]">
								{displaySkills.map((skill, index) => (
									<Badge key={index} variant="secondary" className="text-xs">
										{skill}
									</Badge>
								))}
								{remainingCount > 0 && (
									<Badge variant="default" className="text-xs">
										+{remainingCount}
									</Badge>
								)}
							</div>
						);
					},
					enableSorting: false
				},
				{
					accessorKey: 'count',
					header: ({ column }) => <DataTableColumnHeader column={column} title="技能数量" />,
					cell: ({ row }) => {
						const totalCount = row.original.content.reduce(
							(sum, item) => sum + (item.content?.length || 0),
							0
						);
						return <div className="">{totalCount}</div>;
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
								},
								{
									component: <SkillUpdate id={row.original.id} />
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
				searchColIds: ['type']
			},
			pagination: {
				enable: skillDatas.length > 10
			}
		},
		onRowClick: (rowData: SkillVo) => {
			return () => {
				navigate(`skill-detail/${rowData.id}`, {
					state: { param: rowData.id }
				});
			};
		},
		createBtn: <SkillCreate />,
		selectionHandler,
		mainTable
	};

	return (
		<>
			{!collapsible && (
				<PageHeader
					title={title ?? '职业技能'}
					description={
						description ?? '上传您的专业技能, Prisma 会在优化您的简历时会着重参考您的专业技能'
					}
				></PageHeader>
			)}
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={skillDatas} />
			</div>
		</>
	);
};

export default Skills;
