import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { Code, FileText } from 'lucide-react';
import React, { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { ResumeQueryKey } from '../../../query/keys';
import { findAllUserResumes } from '../../../services/resume';
import { OriginalProject } from '../Projects/Action/components/OriginalProject';

interface ResumeReadProps {
	_?: string;
}

const ResumeRead: React.FC<ResumeReadProps> = () => {
	const { resumeId } = useParams();
	const { data, status } = useCustomQuery([ResumeQueryKey.Resumes, 1, 1000], ({ queryKey }) => {
		const [, page, limit] = queryKey; // 从 queryKey 中解构分页参数
		return findAllUserResumes(page as number, limit as number);
	});

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	if (status === 'pending') {
		return <div></div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const resumeDatas = data.data.data;
	const resumeData = resumeDatas?.find(resume => resume.id === resumeId);

	if (!resumeData || resumeId === undefined) {
		return <div className="text-center text-gray-500">没有找到简历数据</div>;
	}

	return (
		<div className={`min-h-screen transition-colors duration-200 bg-global`}>
			<div className="container mx-auto px-4 pb-8">
				{/* 简历基本信息 */}
				<Card
					className={`mb-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<CardTitle
							className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}
						>
							<FileText className="w-6 h-6" />
							{resumeData.name}
						</CardTitle>
						<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							创建于{' '}
							{resumeData.createdAt ? new Date(resumeData.createdAt).toLocaleDateString() : '未知'}
							{resumeData.updatedAt && (
								<> · 更新于 {new Date(resumeData.updatedAt).toLocaleDateString()}</>
							)}
						</CardDescription>
					</CardHeader>
				</Card>

				{/* 职业技能信息 */}
				{resumeData.skill && resumeData.skill.content && (
					<Card
						className={`mb-6 ${
							isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
						} transition-colors duration-200`}
					>
						<CardHeader>
							<CardTitle
								className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								<Code className="w-5 h-5" />
								职业技能
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{resumeData.skill.content.map((skillGroup, index) => (
									<div key={index}>
										<h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
											{skillGroup.type}
										</h4>
										<div className="flex flex-wrap gap-2">
											{skillGroup.content?.map((skill, skillIndex) => (
												<Badge
													key={skillIndex}
													variant="secondary"
													className={`${
														isDark
															? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
															: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
													}`}
												>
													{skill}
												</Badge>
											))}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* 项目经验信息 */}
				{resumeData.projects &&
					resumeData.projects.length > 0 &&
					resumeData.projects.map((project, index) => (
						<Fragment key={index}>
							<OriginalProject projectData={project} isDark={isDark} />
						</Fragment>
					))}
			</div>
		</div>
	);
};

export default ResumeRead;
