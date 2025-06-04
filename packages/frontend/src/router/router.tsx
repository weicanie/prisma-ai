import { Outlet } from 'react-router-dom';
import LoginRegist from '../views/LoginRegist/LoginRegist';
import { Main } from '../views/Main';
import { Jobs } from '../views/Main/Jobs';
import { JobRead } from '../views/Main/Jobs/JobRead';
import { Knowledges } from '../views/Main/knowbase';
import { KnowledgeRead } from '../views/Main/knowbase/KnowledgeRead';
import { Projects } from '../views/Main/Projects';
import { Action } from '../views/Main/Projects/Action';
import { Read } from '../views/Main/Projects/Read';
import { Resumes } from '../views/Main/Resumes';
import { ResumeRead } from '../views/Main/Resumes/ResumeRead';
import { Skills } from '../views/Main/Skills';
import { SkillRead } from '../views/Main/Skills/SkillRead';
import { Test } from '../views/MyTest/Test';
import PrivateRoute from './PrivateRoute';
import UpdateBreadRouter from './UpdateBreadRouter';

export const routes = [
	{
		path: '',
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
						<Outlet />
					</UpdateBreadRouter>
				),
				children: [
					{
						path: '',
						element: (
							<UpdateBreadRouter>
								<>
									<Skills />
								</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:skillIndex',
						element: (
							<UpdateBreadRouter>
								<SkillRead></SkillRead>
							</UpdateBreadRouter>
						)
					}
				]
			},
			// 项目经验
			{
				path: '/main/projects',
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
								<>
									<Projects />
								</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:projectIndex',
						element: (
							<UpdateBreadRouter>
								<Read></Read>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'action/:projectIndex',
						element: (
							<UpdateBreadRouter>
								<Action></Action>
							</UpdateBreadRouter>
						)
					}
				]
			},
			// 简历
			{
				path: '/main/resumes',
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
								<>
									<Resumes />
								</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:resumeIndex',
						element: (
							<UpdateBreadRouter>
								<ResumeRead></ResumeRead>
							</UpdateBreadRouter>
						)
					}
				]
			},
			// 岗位
			{
				path: '/main/job',
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
								<>
									<Jobs />
								</>
							</UpdateBreadRouter>
						)
					},
					{
						path: '/main/job/detail/:jobIndex',
						element: (
							<UpdateBreadRouter>
								<JobRead></JobRead>
							</UpdateBreadRouter>
						)
					}
				]
			}, // 知识库
			{
				path: '/main/knowledge',
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
								<>
									<Knowledges />
								</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:knowledgeIndex',
						element: (
							<UpdateBreadRouter>
								<KnowledgeRead></KnowledgeRead>
							</UpdateBreadRouter>
						)
					}
				]
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
	'/main/skills/detail': '职业技能-详情',
	'/main/projects': '项目经验',
	'/main/projects/detail': '项目经验-详情',
	'/main/projects/action': '项目经验-AI优化',

	'/main/resumes': '简历',
	'/main/resumes/detail': '简历-详情',

	'/main/job': '岗位',
	'/main/job/detail': '岗位-详情',

	'/main/knowledge': '知识库',
	'/main/knowledge/detail': '知识库-详情',

	'/main/offer': '面向offer学习',
	'/main/offer/road': '面向offer学习-学习路线',
	'/main/offer/questions': '面向offer学习-简历延申八股',
	'/main/offer/mock-interview': '面向offer学习-模拟面试'
};
