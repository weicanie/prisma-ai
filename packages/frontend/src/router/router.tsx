import LoginRegist from '../views/LoginRegist/LoginRegist';
import Resume from '../views/Resume/Resume';
import UploadProject from '../views/Resume/UploadProject';
import PrivateRoute from './PrivateRoute';

export const routes = [
	{
		path: '/login',
		element: <LoginRegist />
	},
	{
		path: '/resume',
		element: (
			<PrivateRoute>
				<Resume />
			</PrivateRoute>
		),
		children: [
			{
				path: '/resume/upload',
				element: <UploadProject />
			}
		]
	}
];
