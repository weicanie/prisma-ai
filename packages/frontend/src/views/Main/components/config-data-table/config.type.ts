import { type AccessorKeyColumnDef } from '@tanstack/react-table';

/* 表格配置流程
1、使用zod定义数据的schema,并提取类型作为Trow
2、按需定义3种col
3、配置options
*/

enum PropsAllowed {
	accessorKey = 'accessorKey', //数据列的ID、访问键
	id = 'id', //展示列的ID
	header = 'header', //列头格渲染函数
	cell = 'cell', //单元格渲染函数
	filterFn = 'filterFn', //过滤函数，用于按值过滤
	enableSorting = 'enableSorting', //是否启用排序
	enableHiding = 'enableHiding' //是否可隐藏
}

interface Colfilter {
	columnId: string; //列ID
	title: string; //列标题
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[]; //过滤选项
}

export type DataCol<TRow> = Pick<AccessorKeyColumnDef<TRow>, `${PropsAllowed}`>;

export type DataColWithFilter<TRow> = DataCol<TRow> & Partial<Colfilter>;

export type RowActionsCol<TRow> = Pick<
	DataCol<TRow>,
	'id' | 'header' | 'cell' | 'enableSorting' | 'enableHiding'
>;
export type SelectCol<TRow> = Pick<
	DataCol<TRow>,
	'id' | 'header' | 'cell' | 'enableSorting' | 'enableHiding'
>;

export interface DataTableConfig<TRow = unknown> {
	columns: {
		//数据列,过滤功能可选
		dataCols: DataColWithFilter<TRow>[];
		//操作列
		rowActionsCol: RowActionsCol<TRow>[];
		//选择列
		selectCol: (SelectCol<TRow> & { id: '_select' })[]; //id固定为'_select' ,因为内部需要特殊处理
	};
	options: {
		toolbar: {
			enable: boolean; //是否启用工具栏
			searchColId: string; //用于搜索的列ID
		};
		pagination: boolean; //是否启用分页
	};
	onRowClick?: (index: number) => () => void; //行点击事件处理函数
	createBtn?: React.ReactNode; //带创建弹窗的创建按钮
	actionBtn?: React.ReactNode; //点击后跳转到操作页面或者弹出操作弹窗的按钮,用于llm操作
	selectionHandler?: (selectedRows: TRow[]) => void; //行选择变化事件处理函数
	mainTable?: boolean; //是否为主表格,非主表格不展示新建按钮,默认为主表格
}
