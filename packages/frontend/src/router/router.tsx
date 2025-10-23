import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import EditorContainerPage from '../views/Main/ResumeEditor';
import PreloadChunk from './PreloadChunk';
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
const UserMemory = lazy(() => import('../views/Main/UserMemory'));
const UserConfig = lazy(() => import('../views/Main/userConfig'));
const AIChat = lazy(() => import('../views/Main/aichat/AIChat'));
const UserManagePage = lazy(() => import('../views/Main/Manage/User'));
const ServiceManagePage = lazy(() => import('../views/Main/Manage/Service'));
const NotificationManagePage = lazy(() => import('../views/Main/Manage/Notifaction'));
const UserNotificationPage = lazy(() => import('../views/Main/Notifaction'));
const isOnline = import.meta.env.VITE_IS_ONLINE === 'true';

const knowBaseRoute = {
	path: 'knowledge',
	element: (
		<UpdateBreadRouter>
			<PreloadChunk
				chunkPath={[
					'../views/Main/Knowbase/DeepwikiDown',
					'../views/Main/Knowbase/KnowledgeRead',
					'../views/Main/Skills',
					'../views/Main/Skills/SkillRead'
				]}
			>
				<Outlet />
			</PreloadChunk>
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
			<PreloadChunk chunkPath={['../views/Main/Projects/Action']}>
				<Outlet />
			</PreloadChunk>
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
			<PreloadChunk
				chunkPath={[
					'../views/Main/Resumes/ResumeRead',
					'../views/Main/Resumes/Action',
					'../views/Main/Skills',
					'../views/Main/Skills/SkillRead'
				]}
			>
				<Outlet />
			</PreloadChunk>
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

const manegeRoute = {
	path: '/main/manage',
	element: (
		<UpdateBreadRouter>
			<PreloadChunk chunkPath={[]}>
				<Outlet />
			</PreloadChunk>
		</UpdateBreadRouter>
	),
	children: [
		{
			path: '',
			element: <Navigate to="/main/manage/user" />
		},
		{
			path: 'user',
			element: (
				<UpdateBreadRouter>
					<UserManagePage />
				</UpdateBreadRouter>
			)
		},
		{
			path: 'service',
			element: (
				<UpdateBreadRouter>
					<ServiceManagePage />
				</UpdateBreadRouter>
			)
		},
		{
			path: 'notification',
			element: (
				<UpdateBreadRouter>
					<NotificationManagePage />
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
					<PreloadChunk
						chunkPath={[
							'../views/Main/Hjm/JobMatch',
							'../views/Main/Hjm/DataCrawl',
							'../views/Main/Resumes/ResumeRead'
						]}
					>
						<Outlet />
					</PreloadChunk>
				</UpdateBreadRouter>
			),
			children: [
				{
					path: '',
					element: <UpdateBreadRouter>{isOnline ? '' : <JobMatch />}</UpdateBreadRouter>
				},
				{
					path: 'get-jobs',
					element: <UpdateBreadRouter>{isOnline ? '' : <DataCrawl />}</UpdateBreadRouter>
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
					<PreloadChunk
						chunkPath={[
							'../views/Main/Resumes/MatchedResume',
							'../views/Main/Jobs/ResumeMatchedRead',
							'../views/Main/Jobs',
							'../views/Main/Jobs/JobRead',
							'../views/Main/Resumes/ResumeRead'
						]}
					>
						<Outlet />
					</PreloadChunk>
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
			path: 'anki',
			element: <UpdateBreadRouter>{isOnline ? '' : <Anki />}</UpdateBreadRouter>
		},
		{
			path: '',
			element: <UpdateBreadRouter>{isOnline ? '' : <Anki />}</UpdateBreadRouter>
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
				element: <Navigate to="/main/knowledge" />
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
			// 后台管理
			manegeRoute,
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
			},
			// 用户记忆
			{
				path: '/main/user-memory',
				element: (
					<UpdateBreadRouter>
						<UserMemory />
					</UpdateBreadRouter>
				)
			},
			// 用户配置
			{
				path: '/main/user-config',
				element: (
					<UpdateBreadRouter>
						<UserConfig />
					</UpdateBreadRouter>
				)
			},
			// 通知中心
			{
				path: '/main/notification',
				element: (
					<UpdateBreadRouter>
						<UserNotificationPage />
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
	'/main/user-memory': '用户记忆',
	'/main/user-config': '用户配置',

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

	'/main/offer/anki': '集成面试题库和 anki',

	'/main/notification': '通知中心',

	'/main/manage': '管理后台',
	'/main/manage/user': '用户管理',
	'/main/manage/service': '服务管理',
	'/main/manage/notification': '通知管理'
};

/* 用于侧边栏路由按钮hover时预加载 */
/**
 * 当前URL路径对应的页面的文件路径
 * 注意：动态import需要使用相对路径，@/别名在运行时无法解析
 */
export const sideBar_urlpath_filePath: Record<string, string> = {
	// 知识库
	'/main/knowledge': '../views/Main/Knowbase',
	'/main/knowledge/knowledge-detail': '../views/Main/Knowbase/KnowledgeRead',
	'/main/knowledge/deepwiki': '../views/Main/Knowbase/DeepwikiDown',
	'/main/knowledge/skills': '../views/Main/Skills',
	'/main/knowledge/skills/skill-detail': '../views/Main/Skills/SkillRead',

	// 项目经验
	'/main/projects': '../views/Main/Projects',
	'/main/projects/action': '../views/Main/Projects/Action',

	// 简历
	'/main/resumes': '../views/Main/Resumes',
	'/main/resumes/resume-detail': '../views/Main/Resumes/ResumeRead',
	'/main/resumes/action': '../views/Main/Resumes/Action',
	'/main/resumes/skills': '../views/Main/Skills',
	'/main/resumes/skills/skill-detail': '../views/Main/Skills/SkillRead',
	'/main/resumes/education': '../views/Main/Education',
	'/main/resumes/education/education-detail': '../views/Main/Education/Read',
	'/main/resumes/career': '../views/Main/Career',
	'/main/resumes/career/career-detail': '../views/Main/Career/Read',

	// 人岗匹配
	'/main/hjm/job': '../views/Main/Hjm/JobMatch',
	'/main/hjm/job/get-jobs': '../views/Main/Hjm/DataCrawl',
	'/main/hjm/job/resume-detail': '../views/Main/Resumes/ResumeRead',
	'/main/hjm/resume': '../views/Main/Resumes/MatchedResume',
	'/main/hjm/resume/resumeMatched-detail': '../views/Main/Jobs/ResumeMatchedRead',
	'/main/hjm/resume/custom-resume': '../views/Main/Jobs',
	'/main/hjm/resume/custom-resume/job-detail': '../views/Main/Jobs/JobRead',
	'/main/hjm/resume/custom-resume/resume-detail': '../views/Main/Resumes/ResumeRead',

	// 面向offer学习
	'/main/offer/anki': '../views/Main/Anki/Anki',

	// 管理后台
	'/main/manage/user': '../views/Main/Manage/User',
	'/main/manage/service': '../views/Main/Manage/Service',
	'/main/manage/notification': '../views/Main/Manage/Notifaction',

	// 其他功能
	'/main/resume-editor': '../views/Main/ResumeEditor',
	'/main/aichat': '../views/Main/aichat/AIChat',
	'/main/user-memory': '../views/Main/UserMemory',
	'/main/user-config': '../views/Main/userConfig',
	'/main/notification': '../views/Main/Notifaction'
};
