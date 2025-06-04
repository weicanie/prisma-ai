import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { SkillVo } from '@prism-ai/shared';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { SkillQueryKey } from '../../../query/keys';
import { findAllUserSkills } from '../../../services/skill';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import { SkillCreate } from './SkillCreate';

interface SkillsProps {
	selectColShow?: boolean; // 是否显示选择列
	selectionHandler?: (...args: any) => void; //储存选中状态到store
	title?: string; // 页面标题
	description?: string; // 页面描述
}

export const Skills: React.FC<SkillsProps> = ({
	selectColShow,
	selectionHandler,
	title,
	description
}) => {
	const navigate = useNavigate();
	const { data, status } = useCustomQuery([SkillQueryKey.Skills], findAllUserSkills);

	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const skillDatas = data.data;

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,
					header: ({ table }: any) => (
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
					cell: ({ row }: any) => (
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
					}
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
					cell: ({ row }) => <DataTableRowActions row={row} />
				}
			]
		},

		options: {
			toolbar: {
				enable: true,
				searchColId: 'type'
			},
			pagination: true
		},
		onRowClick: (index: number) => {
			return () => {
				navigate(`/main/skills/detail/${index}`, { state: { param: index } });
			};
		},
		createBtn: <SkillCreate />,
		selectionHandler
	};

	return (
		<>
			<PageHeader
				title={title ?? '职业技能'}
				description={
					description ?? '上传您的专业技能, Prisma 会在优化您的简历时会着重参考您的专业技能'
				}
			></PageHeader>
			<div className="pl-10 pr-10">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={skillDatas} />
			</div>
		</>
	);
};
