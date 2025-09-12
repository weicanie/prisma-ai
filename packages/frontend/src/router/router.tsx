import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import UpdateBreadRouter from './UpdateBreadRouter';
const AIChat = lazy(() => import('../components/aichat/AIChat'));
const LandingPage = lazy(() => import('../views/Saas/LandingPage'));
const LoginPage = lazy(() => import('../views/LoginRegist/login'));
const RegisterPage = lazy(() => import('../views/LoginRegist/regist'));
const NotFoundPage = lazy(() => import('../views/Saas/NotFound'));
const Main = lazy(() => import('../views/Main'));
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
const Education = lazy(() => import('../views/Main/Education'));
const EducationRead = lazy(() => import('../views/Main/Education/Read'));
const Career = lazy(() => import('../views/Main/Career'));
const CareerRead = lazy(() => import('../views/Main/Career/Read'));
export const routes = [
	{
		path: '',
		element: <Navigate to="/saas" />
	},
	{
		path: '*',
		element: <NotFoundPage />
	},
	{
		path: '/saas',
		element: <LandingPage />
	},
	{
		path: '/login',
		element: <LoginPage />
	},
	{
		path: '/register',
		element: <RegisterPage />
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
				element: <Navigate to="/main/projects" />
			},
			// 知识库
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
			// 简历组装
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
			// 教育经历
			{
				path: '/main/education',
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
								<Education />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:id',
						element: (
							<UpdateBreadRouter>
								<EducationRead />
							</UpdateBreadRouter>
						)
					}
				]
			},
			//工作经历
			{
				path: '/main/career',
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
								<Career />
							</UpdateBreadRouter>
						)
					},
					{
						path: 'detail/:id',
						element: (
							<UpdateBreadRouter>
								<CareerRead />
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
	'/main/knowledge': '知识库',
	'/main/knowledge/detail': '详情',

	'/main/skills': '职业技能',
	'/main/skills/detail': '详情',
	'/main/projects': '项目经验',
	'/main/projects/action': 'AI优化',

	'/main/education': '教育经历',
	'/main/education/detail': '详情',

	'/main/career': '工作经历',
	'/main/career/detail': '详情',

	'/main/resumes': '简历',
	'/main/resumes/detail': '详情',
	'/main/resumes/action': 'AI优化',

	'/main/job': '岗位',
	'/main/job/detail': '详情',

	'/main/hjm/get-jobs': '爬取岗位',
	'/main/hjm/match-jobs': '匹配岗位',

	'/main/offer/anki': '集成面试题库和 anki',
	'/main/offer/road': '技术学习路线',
	'/main/offer/questions': '简历延申八股'
};
