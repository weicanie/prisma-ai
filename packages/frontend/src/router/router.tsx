import LoginRegist from '../views/LoginRegist/LoginRegist';
import Resume from '../views/Resume/Resume';
import PrivateRoute from './PrivateRoute';

export const routes = [
	{
		path: '/',
		element: (
			<PrivateRoute>
				<Resume />
			</PrivateRoute>
		)
	},
	{
		path: '/login',
		element: <LoginRegist />
	},
	{
		path: '/resume',
		element: <Resume />
	}
	// 其他路由...
];
