import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import type { JobVo } from '@prisma-ai/shared';
import {
	Briefcase,
	Building,
	Calendar,
	DollarSign,
	ExternalLink,
	MapPin,
	Plus,
	Target
} from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { useCustomMutation } from '../../../query/config';
import { becomeUserJob } from '../../../services/hjm';
import ClickCollapsible from '../components/ClickCollapsible';

interface JobCardProps {
	jobData: JobVo;
	addBtn?: boolean; //是否显示“添加到我的岗位”按钮
}

const JobCard: React.FC<JobCardProps> = ({ jobData, addBtn = false }) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';
	const becomeMutation = useCustomMutation(becomeUserJob, {
		onSuccess: () => {
			toast.success('添加成功');
		}
	});

	const matchReason = (jobData as JobVo & { reason?: string }).reason;

	return (
		<div className={`transition-colors duration-200 bg-global`}>
			<div className="container mx-auto  pb-8">
				{/* 岗位基本信息 */}
				<Card
					className={`mb-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<div className="flex justify-between items-start">
							<div>
								<CardTitle
									className={`flex items-center gap-2 text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									<Briefcase />
									{jobData.jobName}
								</CardTitle>
								<CardDescription
									className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
								>
									{jobData.companyName}
								</CardDescription>
							</div>
							<Badge
								variant={jobData.job_status === 'open' ? 'default' : 'secondary'}
								className="text-sm text-foreground"
							>
								{jobData.job_status === 'open' ? '招聘中' : '停止招聘'}
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
							{addBtn && (
								<Button
									variant="default"
									className="flex items-center mt-3 gap-2 bg-primary text-white"
									onClick={() => becomeMutation.mutate(jobData.id)}
								>
									<Plus className="w-4 h-4" />
									添加到我的岗位
								</Button>
							)}
						</CardContent>
					)}
					{/* 匹配理由 */}
					{matchReason && (
						<ClickCollapsible
							title={<h2 className="text-lg font-bold">匹配点</h2>}
							icon={<Target className="size-5" />}
							className="px-6"
							defaultOpen={true}
						>
							<CardContent>
								<div
									className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
								>
									{matchReason}
								</div>
							</CardContent>
						</ClickCollapsible>
					)}

					{/* 职位描述 */}

					<ClickCollapsible
						title={<h2 className="text-lg font-bold">职位描述</h2>}
						icon={<Building className="size-5" />}
						className="px-6"
						defaultOpen={false}
					>
						<CardContent>
							<div className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
								{jobData.description}
							</div>
						</CardContent>
					</ClickCollapsible>

					{/* 职位统计信息 */}

					{/* <CardHeader>
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
									{jobData.job_status === 'open' ? '活跃' : '关闭'}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									当前状态
								</div>
							</div>
						</div>
					</CardContent> */}
				</Card>
			</div>
		</div>
	);
};

export default JobCard;
