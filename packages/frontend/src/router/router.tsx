import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import UpdateBreadRouter from './UpdateBreadRouter';
const LoginRegist = lazy(() => import('../views/LoginRegist/LoginRegist'));
const Main = lazy(() => import('../views/Main'));
const Jobs = lazy(() => import('../views/Main/Jobs'));
const JobRead = lazy(() => import('../views/Main/Jobs/JobRead'));
const Knowledges = lazy(() => import('../views/Main/knowbase'));
const KnowledgeRead = lazy(() => import('../views/Main/knowbase/KnowledgeRead'));
const Projects = lazy(() => import('../views/Main/Projects'));
const Resumes = lazy(() => import('../views/Main/Resumes'));
const ResumeActions = lazy(() => import('../views/Main/Resumes/Action'));
const ResumeRead = lazy(() => import('../views/Main/Resumes/ResumeRead'));

const Test = lazy(() => import('../views/MyTest/Test'));
const Action = lazy(() => import('../views/Main/Projects/Action'));
const Skills = lazy(() => import('../views/Main/Skills'));
const SkillRead = lazy(() => import('../views/Main/Skills/SkillRead'));

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
								<Skills />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:skillId',
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
								<Projects />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:projectId',
						element: (
							<UpdateBreadRouter>
								<Action></Action>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'action/:projectId',
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
								<Resumes />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:resumeId',
						element: (
							<UpdateBreadRouter>
								<ResumeRead></ResumeRead>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'action/:resumeId/:jobId',
						element: (
							<UpdateBreadRouter>
								<ResumeActions></ResumeActions>
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
								<Jobs />
							</UpdateBreadRouter>
						)
					},
					{
						path: '/main/job/detail/:jobId',
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
								<Knowledges />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:knowledgeId',
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
	'/main/resumes/action': '简历-AI优化',

	'/main/job': '岗位',
	'/main/job/detail': '岗位-详情',

	'/main/knowledge': '知识库',
	'/main/knowledge/detail': '知识库-详情',

	'/main/offer': '面向offer学习',
	'/main/offer/road': '面向offer学习-学习路线',
	'/main/offer/questions': '面向offer学习-简历延申八股',
	'/main/offer/mock-interview': '面向offer学习-模拟面试'
};
