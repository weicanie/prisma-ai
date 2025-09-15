import { createSlice } from '@reduxjs/toolkit';
import { path_name } from '../router/router';
interface BreadRouterItem {
	name: string;
	path: string;
}
interface BreadRouterState {
	list: BreadRouterItem[];
}

const initialState: BreadRouterState = { list: [] };

const slice = createSlice({
	name: 'bread-router',
	initialState,
	reducers: {
		/* 路由跳转后,根据当前路由更新面包屑导航 */
		updateAction: (state, { payload: path }: { payload: string }) => {
			// path：去重路由参数后的URL Path
			if (!path || !path_name[path]) {
				return;
			}
			const paths = path.split('/').filter(item => item !== '');
			state.list = [];
			// 将paths中的元素映射为面包屑列表的元素,添加到state.list中用于面包屑组件渲染
			// 查找所有存在name的path
			for (let i = paths.length; i >= 0; i--) {
				const subPath = '/' + paths.slice(0, paths.length - i).join('/');
				if (path_name[subPath]) {
					state.list.push({ name: path_name[subPath], path: subPath });
				}
			}
		}
	}
});

export const { updateAction } = slice.actions;

export const selectBreadRouterList = (state: { breadRouter: BreadRouterState }) =>
	state.breadRouter.list;

export const breadRouterReducer = slice.reducer;
