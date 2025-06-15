import type { ColumnDef } from '@tanstack/react-table';
import type { DataTableConfig } from './config.type';
import { DataTable } from './data-table';

interface ConfigDataTableProps<TData> {
	dataTableConfig: DataTableConfig<TData>;
	data: TData[]; //由输入自动推导出TData
}

export function ConfigDataTable<TData>({ dataTableConfig, data }: ConfigDataTableProps<TData>) {
	if (!data) return;
	const { dataCols, selectCol, rowActionsCol } = dataTableConfig.columns;
	const columns = [...selectCol, ...dataCols, ...rowActionsCol] as ColumnDef<TData>[];
	const filterDataCols = dataTableConfig.columns.dataCols.filter(
		col => col.filterFn !== undefined && typeof col.filterFn === 'function'
	);
	return (
		<DataTable<TData>
			{...dataTableConfig}
			data={data}
			columns={columns}
			filterDataCols={filterDataCols}
		/>
	);
}
