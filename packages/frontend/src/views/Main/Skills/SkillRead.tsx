import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { Code } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { SkillQueryKey } from '../../../query/keys';
import { findAllUserSkills } from '../../../services/skill';

interface SkillReadProps {
	_?: string;
}

const SkillRead: React.FC<SkillReadProps> = () => {
	const { skillId } = useParams();
	console.log('skillId', skillId);
	const { data, status } = useCustomQuery([SkillQueryKey.Skills], findAllUserSkills);

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	if (status === 'pending') {
		return <div></div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const skillDatas = data.data;
	const skillData = skillDatas?.find(skill => skill.id === skillId);

	if (!skillData || skillId === undefined) {
		return <div className="text-center text-gray-500">没有找到职业技能数据</div>;
	}

	return (
		<div className={`min-h-screen transition-colors duration-200 bg-global`}>
			<div className="container mx-auto px-4 pb-8">
				{/* 技能基本信息 */}
				<Card
					className={`mb-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
							职业技能详情
						</CardTitle>
						<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							创建于{' '}
							{skillData.createdAt ? new Date(skillData.createdAt).toLocaleDateString() : '未知'}
							{skillData.updatedAt && (
								<> · 更新于 {new Date(skillData.updatedAt).toLocaleDateString()}</>
							)}
						</CardDescription>
					</CardHeader>
				</Card>

				{/* 技能详细信息 */}
				<div className="space-y-6">
					{skillData.content.map((skillGroup, index) => (
						<Card
							key={index}
							className={`${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							} transition-colors duration-200`}
						>
							<CardHeader>
								<CardTitle
									className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									<Code className="w-5 h-5" />
									{skillGroup.type}
								</CardTitle>
								<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									共 {skillGroup.content?.length || 0} 项技能
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{skillGroup.content?.map((skill, skillIndex) => (
										<Badge
											key={skillIndex}
											variant="outline"
											className={`${
												isDark
													? 'border-gray-600 text-gray-300 hover:bg-gray-700'
													: 'border-gray-300 text-gray-700 hover:bg-gray-50'
											} transition-colors cursor-default`}
										>
											{skill}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* 技能统计 */}
				<Card
					className={`mt-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<CardTitle className={`${isDark ? 'text-white' : 'text-gray-900'}`}>技能统计</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
								<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
									{skillData.content.length}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									技能分类
								</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
								<div className="text-2xl font-bold text-green-600 dark:text-green-400">
									{skillData.content.reduce((sum, group) => sum + (group.content?.length || 0), 0)}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									总技能数
								</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
								<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
									{Math.max(...skillData.content.map(group => group.content?.length || 0))}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									最大分类技能数
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default SkillRead;
