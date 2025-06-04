import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { Building, Calendar, DollarSign, ExternalLink, MapPin } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { JobQueryKey } from '../../../query/keys';
import { findAllUserJobs } from '../../../services/job';

interface JobReadProps {}

export const JobRead: React.FC<JobReadProps> = ({}) => {
	const { jobIndex } = useParams();
	const { data, status } = useCustomQuery([JobQueryKey.Jobs], () => findAllUserJobs(1, 100));

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const jobDatas = data.data?.data || [];
	const jobData = jobDatas?.[+jobIndex!];

	if (!jobData || jobIndex === undefined) {
		return <div className="text-center text-gray-500">没有找到岗位数据</div>;
	}

	return (
		<div className={`min-h-screen transition-colors duration-200 bg-global`}>
			<div className="container mx-auto px-4 pb-8">
				{/* 岗位基本信息 */}
				<Card
					className={`mb-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<div className="flex justify-between items-start">
							<div>
								<CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
									{jobData.jobName}
								</CardTitle>
								<CardDescription
									className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
								>
									{jobData.companyName}
								</CardDescription>
							</div>
							<Badge
								variant={jobData.status === 'open' ? 'default' : 'secondary'}
								className="text-sm text-foreground"
							>
								{jobData.status === 'open' ? '招聘中' : '停止招聘'}
							</Badge>
						</div>
						<div
							className={`flex flex-wrap gap-4 mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
						>
							{jobData.location && (
								<div className="flex items-center gap-1">
									<MapPin className="w-4 h-4" />
									{jobData.location}
								</div>
							)}
							{jobData.salary && (
								<div className="flex items-center gap-1">
									<DollarSign className="w-4 h-4" />
									{jobData.salary}
								</div>
							)}
							<div className="flex items-center gap-1">
								<Calendar className="w-4 h-4" />
								创建于{' '}
								{jobData.createdAt ? new Date(jobData.createdAt).toLocaleDateString() : '未知'}
							</div>
							{jobData.updatedAt && (
								<div className="flex items-center gap-1">
									<Calendar className="w-4 h-4" />
									更新于 {new Date(jobData.updatedAt).toLocaleDateString()}
								</div>
							)}
						</div>
					</CardHeader>
					{jobData.link && (
						<CardContent>
							<Button variant="outline" className="flex items-center gap-2" asChild>
								<a href={jobData.link} target="_blank" rel="noopener noreferrer">
									<ExternalLink className="w-4 h-4" />
									查看原始职位
								</a>
							</Button>
						</CardContent>
					)}
				</Card>

				{/* 职位描述 */}
				<Card
					className={`mb-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<CardTitle
							className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
						>
							<Building className="w-5 h-5" />
							职位描述
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
							{jobData.description}
						</div>
					</CardContent>
				</Card>

				{/* 职位统计信息 */}
				<Card
					className={`${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<CardTitle className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
							职位信息统计
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
								<div className="text-xl font-bold text-blue-600 dark:text-blue-400">
									{jobData.jobName.length}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									职位名称字符数
								</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
								<div className="text-xl font-bold text-green-600 dark:text-green-400">
									{jobData.description.length}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									描述字符数
								</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
								<div className="text-xl font-bold text-purple-600 dark:text-purple-400">
									{jobData.companyName.length}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									公司名称字符数
								</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
								<div className="text-xl font-bold text-orange-600 dark:text-orange-400">
									{jobData.status === 'open' ? '活跃' : '关闭'}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									当前状态
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
