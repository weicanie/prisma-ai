import LoginRegist from '../views/LoginRegist/LoginRegist';
import Resume from '../views/Resume/Resume';
import UploadProject from '../views/Resume/UploadProject';
import PrivateRoute from './PrivateRoute';

export const routes = [
	// {
	// 	path: '/',
	// 	element: (
	// 		<PrivateRoute>
	// 			<Resume />
	// 		</PrivateRoute>
	// 	)
	// },
	{
		path: '/resume',
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
		element: <Resume />,
		children: [
			{
				path: '/resume/upload',
				element: <UploadProject />
			}
		]
	}
];
