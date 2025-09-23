import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { project_knowledge_type_label, type ProjectKnowledgeVo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import { AlignLeft, Database, Link, ListChecks } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomMutation, useCustomQuery } from '../../../query/config';
import { KnowledgeQueryKey } from '../../../query/keys';
import { findAllUserKnowledge, removeKnowledge } from '../../../services/knowbase';
import { ConfigDataTable } from '../components/config-data-table';
import type { DataTableConfig } from '../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../components/config-data-table/data-table/columns/row-actions';
import { PageHeader } from '../components/PageHeader';
import KnowledgeCreate from './KnowledgeCreate';

interface KnowledgesProps<TData> {
	selectColShow?: boolean;
	selectionHandler?: (rows: TData[]) => void;
}

const Knowledges: React.FC<KnowledgesProps<ProjectKnowledgeVo>> = ({
	selectColShow,
	selectionHandler
}) => {
	const navigate = useNavigate();
	const { data, status } = useCustomQuery([KnowledgeQueryKey.Knowledges], () =>
		findAllUserKnowledge({ page: 1, limit: 1000 })
	);
	const queryClient = useQueryClient();
	const removeMutation = useCustomMutation(removeKnowledge, {
		onSuccess: () => {
			toast.success('删除成功');
			queryClient.invalidateQueries({ queryKey: [KnowledgeQueryKey.Knowledges] });
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

	const knowledgeData = data.data.data;

	const selectCol = selectColShow
		? [
				{
					id: '_select' as const,
					header: ({ table }: { table: Table<ProjectKnowledgeVo> }) => (
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
					cell: ({ row }: { row: Row<ProjectKnowledgeVo> }) => (
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

	const dataTableConfig: DataTableConfig<ProjectKnowledgeVo> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'name',
					header: ({ column }) => <DataTableColumnHeader column={column} title="知识名称" />,
					cell: ({ row }) => {
						let icon;
						if (row.original.fileType === 'url') {
							icon = <Link className="size-5" />;
						} else {
							icon = <AlignLeft className="size-5" />;
						}
						return (
							<div className="flex space-x-2">
								{icon}
								<div className="w-[120px] font-medium">{row.original.name}</div>
							</div>
						);
					},
					enableHiding: false,
					enableSorting: false
				},
				{
					accessorKey: 'type',
					header: ({ column }) => <DataTableColumnHeader column={column} title="知识类型" />,
					cell: ({ row }) => {
						return (
							<div className="w-[120px]">
								{project_knowledge_type_label[row.original.type] || row.original.type}
							</div>
						);
					},
					enableSorting: false
				},
				{
					accessorKey: 'tag',
					header: ({ column }) => <DataTableColumnHeader column={column} title="标签" />,
					cell: ({ row }) => {
						const tags = row.original.tag as string[];
						return (
							<div className="flex flex-wrap gap-1">
								{tags.map((tag: string, index: number) => (
									<span
										key={index}
										className="px-2 py-1 text-xs rounded-full bg-blue-500  dark:bg-blue-700 text-zinc-100"
									>
										{tag}
									</span>
								))}
							</div>
						);
					},
					enableSorting: false
				},
				{
					accessorKey: 'projectName',
					header: ({ column }) => <DataTableColumnHeader column={column} title="所属项目" />,
					cell: ({ row }) => {
						const projectName = row.original.projectName ?? '无';
						return (
							<div className="flex flex-wrap gap-1">
								{[projectName].map((projectName: string, index: number) => (
									<span
										key={index}
										className="px-2 py-1 text-xs rounded-full bg-blue-600  dark:bg-blue-800 text-zinc-100"
									>
										{projectName}
									</span>
								))}
							</div>
						);
					},
					enableSorting: false
				},
				{
					accessorKey: 'createdAt',
					header: ({ column }) => <DataTableColumnHeader column={column} title="创建时间" />,
					cell: ({ row }) => {
						const date = new Date(row.original.createdAt!);
						return <div className="text-sm text-gray-500">{date.toLocaleDateString('zh-CN')}</div>;
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
				searchColIds: ['name', 'projectName', 'tag', 'type']
			},
			pagination: {
				enable: knowledgeData.length > 10
			}
		},
		onRowClick: (rowData: ProjectKnowledgeVo) => {
			return () => {
				navigate(`knowledge-detail/${rowData.id}`, {
					state: { param: rowData.id }
				});
			};
		},
		createBtn: <KnowledgeCreate />,
		selectionHandler
	};

	return (
		<>
			<PageHeader
				title="项目知识库"
				description="上传项目相关信息来和 Prisma 共享, Prisma 在思考时会使用这些信息, 这很重要 "
			>
				{' '}
				<div className="flex flex-wrap gap-3">
					<Button
						variant="outline"
						onClick={() => navigate('/main/knowledge/deepwiki')}
						className="flex items-center gap-2"
					>
						<Database className="h-4 w-4" />
						DeepWiki 集成
					</Button>
				</div>
				<div className="flex flex-wrap gap-3">
					<Button
						variant="outline"
						onClick={() => navigate('/main/knowledge/skills')}
						className="flex items-center gap-2"
					>
						<ListChecks className="h-4 w-4" />
						职业技能
					</Button>
				</div>
			</PageHeader>

			<div className="pl-10 pr-10 max-h-[calc(100vh-9)] overflow-y-scroll scb-thin">
				<ConfigDataTable dataTableConfig={dataTableConfig} data={knowledgeData} />
			</div>
		</>
	);
};

export default Knowledges;
