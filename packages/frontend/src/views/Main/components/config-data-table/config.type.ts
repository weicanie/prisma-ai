import { type AccessorFnColumnDef, type AccessorKeyColumnDef } from '@tanstack/react-table';

/* 表格配置流程
1、使用zod定义数据的schema,并提取类型作为Trow
2、按需定义3种col
3、配置options
*/
//用于真实字段列（数据中存在accessorKey字段）
enum PropsAllowed {
	accessorKey = 'accessorKey', //数据列的访问键

	header = 'header', //列头格渲染函数
	cell = 'cell', //单元格渲染函数
	filterFn = 'filterFn', //过滤函数，用于按值过滤
	enableSorting = 'enableSorting', //是否启用排序
	enableHiding = 'enableHiding' //是否可隐藏
}
//用于虚拟字段列（数据中不存在id字段，取id字段的值拿到的是accessorFn的返回值）
enum PropsAllowed2 {
	id = 'id', // 数据列的访问键
	accessorFn = 'accessorFn',
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

export type DataCol<TRow> =
	| Pick<AccessorKeyColumnDef<TRow>, `${PropsAllowed}`>
	| Pick<AccessorFnColumnDef<TRow>, `${PropsAllowed2}`>;

export type DataColWithFilter<TRow> = DataCol<TRow> & Partial<Colfilter>; //当指定某一列可用于过滤时，必须指定Colfilter

export type RowActionsCol<TRow> = Pick<
	DataCol<TRow>,
	'header' | 'cell' | 'enableSorting' | 'enableHiding'
> & { id: string };
export type SelectCol<TRow> = Pick<
	DataCol<TRow>,
	'header' | 'cell' | 'enableSorting' | 'enableHiding'
>;
//TODO 将不涉及hook的项抽取到外部,以减少重复代码
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
			searchColIds: string[]; //用于搜索的列ID（越靠前越优先）
		};
		pagination: boolean; //是否启用分页
	};
	onRowClick?: (index: number) => () => void; //行点击事件处理函数
	createBtn?: React.ReactNode; //创建按钮
	actionBtns?: {
		label: string;
		onClick: (row: TRow, rowSelected: TRow[]) => void; // 其它操作按钮，点击按钮时，传入当前行和选中的行
	}[];
	selectionHandler?: (selectedRows: TRow[]) => void; //行选择变化事件处理函数
	mainTable?: boolean; //是否为主表格,非主表格只展示数据,默认为主表格
}
