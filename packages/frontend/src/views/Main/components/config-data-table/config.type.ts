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
		value: any;
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
/**
 * 表格配置
 * @description 支持客户端分页、服务端分页。
 * @description 支持客户端过滤、服务端过滤。
 * @description 支持客户端搜索。
 * @description 支持排序、隐藏列。
 * @description 支持表格、行操作按钮。
 * @description 支持行选择。
 * @description 支持行点击事件。
 */
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
			// 服务端过滤，设置后前端不再进行值的过滤，而是交给后端API
			filterOptions?: {
				//selectedState：每个id的可过滤列的当前选中的过滤值
				selectorSet: (selectedState: { columnId: string; selectedFilterValues: string[] }) => void;
				selectorGet: (...args: any[]) => any; //获取某列选中的过滤值的selector
				resetFilter: (...args: any[]) => void; //重置所有过滤值
			};
		};
		pagination: {
			enable: boolean; //是否启用分页
			showSizeChanger?: boolean; //是否显示每页显示条数选择器

			/**
			 * 是否启用服务端分页。
			 *
			 * 客户端分页：得到的是所有数据，只是分页展示。
			 *
			 * 服务端分页：得到的是当前页数据。
			 */
			manualPagination?: boolean;
			//服务端分页下的后端数据总行数（和pageSize计算总页数）
			rowCount?: number;
			pageSize?: number; //每页显示条数
			pageSizeOptions?: number[]; //每页显示条数选项
			setPageSize?: (pageSize: number) => void; //设置每页显示条数
			pageIndex?: number; //当前页码
			setPageIndex?: (pageIndex: number) => void; //设置当前页码

			/**
			 * 当鼠标悬停在分页器上时，预获取下一页数据。
			 *
			 * 需要结合react-query的prefetchQuery使用。
			 */
			handleNextPageHover?: (currentPageIndex: number) => void;
		};
	};
	onRowClick?: (rowData: TRow) => () => void; //行点击事件处理函数
	createBtn?: React.ReactNode; //创建按钮
	actionBtns?: {
		label?: string;
		onClick?: (row: TRow, rowSelected: TRow[]) => void; // 其它操作按钮，点击按钮时，传入当前行和选中的行
		component?: React.ReactNode; // 作为组件代替默认的按钮
	}[];
	selectionHandler?: (selectedRows: TRow[]) => void; //行选择变化事件处理函数
	mainTable?: boolean; //是否为主表格,非主表格只展示数据,默认为主表格
}
