import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { updateAction } from '../store/bread-router';
interface UpdateBreadRouterProps {
	children: React.ReactNode;
}

/* 使用redux管理面包屑导航的路由状态
在路由变化时更新store,各组件通过在路由里包裹高阶组件UpdateBreadRouter来dispatch
面包屑导航组件中select
*/
const UpdateBreadRouter: React.FC<UpdateBreadRouterProps> = ({ children }) => {
	const location = useLocation();
	const dispatch = useDispatch();
	let path = location.pathname;

	//去除路由参数
	if (location.state && location.state.param !== undefined) {
		if (Array.isArray(location.state.param)) {
			for (const param of location.state.param) {
				path = path.replace('/' + param, '');
			}
		} else {
			path = path.replace('/' + location.state.param, '');
		}
	}

	useEffect(() => {
		dispatch(updateAction(path));
	}, [path]);
	return children;
};

export default UpdateBreadRouter;
