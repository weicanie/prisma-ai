import { Outlet } from 'react-router-dom';
import LoginRegist from '../views/LoginRegist/LoginRegist';
import { Main } from '../views/Main';
import { Projects } from '../views/Main/Projects';
import { Test } from '../views/MyTest/Test';
import PrivateRoute from './PrivateRoute';
import UpdateBreadRouter from './UpdateBreadRouter';

export const routes = [
	{
		path: '/',
		element: (
			<PrivateRoute>
				<Main />
			</PrivateRoute>
		)
	},
	{
		path: '/test',
		element: <Test />
	},
	{
		path: '/login',
		element: <LoginRegist />
	},
	{
		path: '/main',
		element: (
			<PrivateRoute>
				<Main />
			</PrivateRoute>
		),
		children: [
			// 首页
			{
				path: '/main/home',
				element: (
					<UpdateBreadRouter>
						<>首页</>
					</UpdateBreadRouter>
				)
			},
			// 职业技能
			{
				path: '/main/skills',
				element: (
					<UpdateBreadRouter>
						<>职业技能</>
					</UpdateBreadRouter>
				)
			},
			// 项目经验
			{
				path: '/main/projects',
				element: (
					<UpdateBreadRouter>
						<Projects />
					</UpdateBreadRouter>
				)
			},
			// 简历
			{
				path: '/main/resume',
				element: (
					<UpdateBreadRouter>
						<>简历</>
					</UpdateBreadRouter>
				)
			},
			// 岗位
			{
				path: '/main/job',
				element: (
					<UpdateBreadRouter>
						<>岗位</>
					</UpdateBreadRouter>
				)
			},
			// 面向offer学习
			{
				path: '/main/offer',
				element: (
					<UpdateBreadRouter>
						<Outlet />
					</UpdateBreadRouter>
				),
				children: [
					{
						path: '',
						element: (
							<UpdateBreadRouter>
								<>学习路线</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'road',
						element: (
							<UpdateBreadRouter>
								<>学习路线</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'questions',
						element: (
							<UpdateBreadRouter>
								<>简历延申八股</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'mock-interview',
						element: (
							<UpdateBreadRouter>
								<>模拟面试</>
							</UpdateBreadRouter>
						)
					}
				]
			}
		]
	}
];
/* 用于面包屑导航 */
export const path_name: Record<string, string> = {
	'/main/home': '首页',

	'/main/skills': '职业技能',
	// '/main/skills/upload': '职业技能-新建职业技能',
	// '/main/skills/list': '职业技能-我的职业技能',

	'/main/projects': '项目经验',
	// '/main/projects/new': '项目经验-新建项目经验',
	// '/main/projects/new/create': '项目经验-新建项目经验-新建',
	// '/main/projects/new/upload': '项目经验-新建项目经验-上传',
	// '/main/projects/list': '项目经验-我的项目经验',

	'/main/resume': '简历',
	// '/main/resume/new': '简历-简历组装',
	// '/main/resume/list': '简历-我的简历',

	'/main/job': '岗位',
	// '/main/job/match': '岗位-简历匹配',
	// '/main/job/list': '岗位-我的岗位专用简历',

	'/main/offer': '面向offer学习',
	'/main/offer/road': '面向offer学习-学习路线',
	'/main/offer/questions': '面向offer学习-简历延申八股',
	'/main/offer/mock-interview': '面向offer学习-模拟面试'
};
//TODO 代码从上面这个表自动生成路由?
