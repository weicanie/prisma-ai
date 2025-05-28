import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { updateAction } from '../store/bread-router';
interface UpdateBreadRouterProps {
	children: React.ReactElement;
}

/* 使用redux管理面包屑导航的路由状态
在路由变化时更新store,各组件通过在路由里包裹高阶组件UpdateBreadRouter来dispatch
面包屑导航组件中select
*/
const UpdateBreadRouter: React.FC<UpdateBreadRouterProps> = ({ children }) => {
	const location = useLocation();
	const dispatch = useDispatch();
	const path = location.pathname;

	useEffect(() => {
		dispatch(updateAction(path));
	}, [path]);
	return children;
};

export default UpdateBreadRouter;
