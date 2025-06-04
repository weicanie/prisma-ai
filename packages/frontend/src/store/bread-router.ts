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
			if (!path || !path_name[path]) {
				return;
			}
			const names = path_name[path].split('-');
			const paths = path.split('/');

			if (paths[0] === '') paths.shift();
			if (paths[0] === 'main') paths.shift();

			state.list = [];
			for (let i = 0; i < paths.length; i++) {
				const name = names[i] || '';
				const path = '/main/' + paths.slice(0, i + 1).join('/');
				state.list.push({ name, path });
			}
		}
	}
});

export const { updateAction } = slice.actions;

export const selectBreadRouterList = (state: { breadRouter: BreadRouterState }) =>
	state.breadRouter.list;

export const breadRouterReducer = slice.reducer;
