import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import UpdateBreadRouter from './UpdateBreadRouter';
const AIChat = lazy(() => import('../components/aichat/AIChat'));
const LoginRegist = lazy(() => import('../views/LoginRegist/LoginRegist'));
const Main = lazy(() => import('../views/Main'));
const Home = lazy(() => import('../views/Main/Home'));
const Jobs = lazy(() => import('../views/Main/Jobs'));
const JobRead = lazy(() => import('../views/Main/Jobs/JobRead'));
const Knowledges = lazy(() => import('../views/Main/Knowbase'));
const KnowledgeRead = lazy(() => import('../views/Main/Knowbase/KnowledgeRead'));
const Projects = lazy(() => import('../views/Main/Projects'));
const Resumes = lazy(() => import('../views/Main/Resumes'));
const ResumeActions = lazy(() => import('../views/Main/Resumes/Action'));
const ResumeRead = lazy(() => import('../views/Main/Resumes/ResumeRead'));
const ResumeMatchedRead = lazy(() => import('../views/Main/Jobs/ResumeMatchedRead'));

const Action = lazy(() => import('../views/Main/Projects/Action'));
const Skills = lazy(() => import('../views/Main/Skills'));
const SkillRead = lazy(() => import('../views/Main/Skills/SkillRead'));
const DataCrawl = lazy(() => import('../views/Main/Hjm/DataCrawl'));
const JobMatch = lazy(() => import('../views/Main/Hjm/JobMatch'));
const Anki = lazy(() => import('../views/Main/Anki/Anki'));

export const routes = [
	{
		path: '',
		element: <Navigate to="/main/home" />
	},
	{
		path: '/login',
		element: <LoginRegist />
	},
	{
		path: '/aichat',
		element: <AIChat />
	},
	{
		path: '/main',
		element: (
			<PrivateRoute>
				<Main />
			</PrivateRoute>
		),
		children: [
			{
				path: '',
				element: <Navigate to="/main/home" />
			},
			// 首页
			{
				path: '/main/home',
				element: (
					<UpdateBreadRouter>
						<Home />
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
			// 人岗匹配
			{
				path: '/main/hjm',
				element: (
					<UpdateBreadRouter>
						<Outlet />
					</UpdateBreadRouter>
				),
				children: [
					{
						path: '/main/hjm/get-jobs',
						element: (
							<UpdateBreadRouter>
								<DataCrawl />
							</UpdateBreadRouter>
						)
					},
					{
						path: '/main/hjm/match-jobs',
						element: (
							<UpdateBreadRouter>
								<JobMatch />
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
					},
					{
						path: '/main/job/resumeMatched/:resumeMatchedId',
						element: (
							<UpdateBreadRouter>
								<ResumeMatchedRead></ResumeMatchedRead>
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
								<>技术学习路线 coming soon</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'road',
						element: (
							<UpdateBreadRouter>
								<>技术学习路线 coming soon</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'questions',
						element: (
							<UpdateBreadRouter>
								<>简历延申八股 coming soon</>
							</UpdateBreadRouter>
						)
					},
					{
						path: 'anki',
						element: (
							<UpdateBreadRouter>
								<Anki />
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
	'/main/projects/action': '项目经验-AI优化',

	'/main/resumes': '简历',
	'/main/resumes/detail': '简历-详情',
	'/main/resumes/action': '简历-AI优化',

	'/main/job': '岗位',
	'/main/job/detail': '岗位-详情',

	'/main/hjm/get-jobs': '人岗匹配-爬取岗位',
	'/main/hjm/match-jobs': '人岗匹配-匹配岗位',

	'/main/knowledge': '知识库',
	'/main/knowledge/detail': '知识库-详情',

	'/main/offer/anki': '面向offer学习-集成面试题库和 anki',
	'/main/offer/road': '面向offer学习-技术学习路线',
	'/main/offer/questions': '面向offer学习-简历延申八股'
};
