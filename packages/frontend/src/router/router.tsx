import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import EditorContainerPage from '../views/Main/ResumeEditor';
import PrivateRoute from './PrivateRoute';
import UpdateBreadRouter from './UpdateBreadRouter';
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
const MatchedResume = lazy(() => import('../views/Main/Resumes/MatchedResume'));
const Action = lazy(() => import('../views/Main/Projects/Action'));
const Skills = lazy(() => import('../views/Main/Skills'));
const SkillRead = lazy(() => import('../views/Main/Skills/SkillRead'));
const DataCrawl = lazy(() => import('../views/Main/Hjm/DataCrawl'));
const JobMatch = lazy(() => import('../views/Main/Hjm/JobMatch'));
const Anki = lazy(() => import('../views/Main/Anki/Anki'));
const Deepwiki = lazy(() => import('../views/Main/Knowbase/DeepwikiDown'));
const Education = lazy(() => import('../views/Main/Education'));
const EducationRead = lazy(() => import('../views/Main/Education/Read'));
const Career = lazy(() => import('../views/Main/Career'));
const CareerRead = lazy(() => import('../views/Main/Career/Read'));
const AIChat = lazy(() => import('../views/Main/aichat/AIChat'));

const knowBaseRoute = {
	path: 'knowledge',
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
			path: 'knowledge-detail/:knowledgeId',
			element: (
				<UpdateBreadRouter>
					<KnowledgeRead></KnowledgeRead>
				</UpdateBreadRouter>
			)
		},
		{
			path: 'deepwiki',
			element: (
				<UpdateBreadRouter>
					<Deepwiki />
				</UpdateBreadRouter>
			)
		},
		{
			path: 'skills',
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
					path: 'skill-detail/:skillId',
					element: (
						<UpdateBreadRouter>
							<SkillRead></SkillRead>
						</UpdateBreadRouter>
					)
				}
			]
		}
	]
};

const projectRoute = {
	path: 'projects',
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
};

const resumeRoute = {
	path: 'resumes',
	element: (
		<UpdateBreadRouter>
			<Outlet />
		</UpdateBreadRouter>
	),
	children: [
		// 简历组装
		{
			path: '',
			element: (
				<UpdateBreadRouter>
					<Resumes />
				</UpdateBreadRouter>
			)
		},
		{
			path: 'resume-detail/:resumeId',
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
		},
		// 职业技能
		{
			path: 'skills',
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
					path: 'skill-detail/:skillId',
					element: (
						<UpdateBreadRouter>
							<SkillRead></SkillRead>
						</UpdateBreadRouter>
					)
				}
			]
		},
		{
			path: 'skill-detail/:skillId',
			element: (
				<UpdateBreadRouter>
					<SkillRead></SkillRead>
				</UpdateBreadRouter>
			)
		},
		// 教育经历
		{
			path: 'education',
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
					path: 'education-detail/:id',
					element: (
						<UpdateBreadRouter>
							<EducationRead />
						</UpdateBreadRouter>
					)
				}
			]
		},
		{
			path: 'education-detail/:id',
			element: (
				<UpdateBreadRouter>
					<EducationRead />
				</UpdateBreadRouter>
			)
		},
		// 工作经历
		{
			path: 'career',
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
					path: 'career-detail/:id',
					element: (
						<UpdateBreadRouter>
							<CareerRead />
						</UpdateBreadRouter>
					)
				}
			]
		},
		{
			path: 'career-detail/:id',
			element: (
				<UpdateBreadRouter>
					<CareerRead />
				</UpdateBreadRouter>
			)
		}
	]
};

const hjmRoute = {
	path: 'hjm',
	element: (
		<UpdateBreadRouter>
			<Outlet />
		</UpdateBreadRouter>
	),
	children: [
		{
			path: 'job',
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
							<JobMatch />
						</UpdateBreadRouter>
					)
				},
				{
					path: 'get-jobs',
					element: (
						<UpdateBreadRouter>
							<DataCrawl />
						</UpdateBreadRouter>
					)
				},
				{
					path: 'resume-detail/:resumeId',
					element: (
						<UpdateBreadRouter>
							<ResumeRead></ResumeRead>
						</UpdateBreadRouter>
					)
				}
			]
		},
		{
			path: 'resume',
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
							<Outlet />
						</UpdateBreadRouter>
					),
					children: [
						{
							path: '',
							element: (
								<UpdateBreadRouter>
									<MatchedResume />
								</UpdateBreadRouter>
							)
						},
						{
							path: 'resumeMatched-detail/:resumeMatchedId',
							element: (
								<UpdateBreadRouter>
									<ResumeMatchedRead></ResumeMatchedRead>
								</UpdateBreadRouter>
							)
						}
					]
				},
				{
					path: 'custom-resume',
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
							path: 'job-detail/:jobId',
							element: (
								<UpdateBreadRouter>
									<JobRead></JobRead>
								</UpdateBreadRouter>
							)
						},
						{
							path: 'resume-detail/:resumeId',
							element: (
								<UpdateBreadRouter>
									<ResumeRead></ResumeRead>
								</UpdateBreadRouter>
							)
						}
					]
				},
				{
					path: 'job-detail/:jobId',
					element: (
						<UpdateBreadRouter>
							<JobRead></JobRead>
						</UpdateBreadRouter>
					)
				}
			]
		}
	]
};

const learnRoute = {
	path: 'offer',
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
};

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
			knowBaseRoute,
			// 项目经验
			projectRoute,
			// 简历
			resumeRoute,
			// 人岗匹配
			hjmRoute,
			// 面向offer学习
			learnRoute,
			// 简历编辑器
			{
				path: '/main/resume-editor',
				element: (
					<UpdateBreadRouter>
						<EditorContainerPage />
					</UpdateBreadRouter>
				)
			},
			// 问问 Prisma
			{
				path: '/main/aichat',
				element: (
					<UpdateBreadRouter>
						<AIChat />
					</UpdateBreadRouter>
				)
			}
		]
	}
];

/* 用于面包屑导航 */
export const path_name: Record<string, string> = {
	'/main/knowledge': '知识库',
	'/main/knowledge/knowledge-detail': '知识详情',
	'/main/knowledge/deepwiki': 'DeepWiki集成',
	'/main/knowledge/skills': '职业技能',
	'/main/knowledge/skills/skill-detail': '详情',

	'/main/projects': '项目经验',
	'/main/projects/action': 'AI优化',
	'/main/aichat': '问问 Prisma',

	'/main/hjm/job': '匹配岗位',
	'/main/hjm/job/match-jobs': '简历匹配岗位',
	'/main/hjm/job/get-jobs': '获取岗位数据',
	'/main/hjm/job/resume-detail': '简历详情',

	'/main/hjm/resume': '定制简历',
	'/main/hjm/resume/custom-resume': '根据岗位定制简历',
	'/main/hjm/resume/custom-resume/job-detail': '岗位详情',
	'/main/hjm/resume/custom-resume/resume-detail': '简历详情',
	'/main/hjm/resume/resumeMatched-detail': '岗位专用简历详情',

	'/main/resumes': '简历',
	'/main/resumes/resume-detail': '简历详情',
	'/main/resumes/skills': '职业技能',
	'/main/resumes/skills/skill-detail': '详情',
	'/main/resumes/skill-detail': '职业技能详情',
	'/main/resumes/career': '工作经历',
	'/main/resumes/career/career-detail': '详情',
	'/main/resumes/career-detail': '工作经历详情',
	'/main/resumes/education': '教育经历',
	'/main/resumes/education/education-detail': '详情',
	'/main/resumes/education-detail': '教育经历详情',
	'/main/resumes/action': 'AI优化',

	'/main/resume-editor': '简历编辑器',

	'/main/offer/anki': '集成面试题库和 anki'
};
