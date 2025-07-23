import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { type_content_Map } from '@prisma-ai/shared';
import { BookOpen, Calendar, Edit, ExternalLink } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { KnowledgeQueryKey } from '../../../query/keys';
import { findAllUserKnowledge } from '../../../services/knowbase';

interface KnowledgeReadProps {
	_?: string;
}

const KnowledgeRead: React.FC<KnowledgeReadProps> = () => {
	const { knowledgeId } = useParams();
	const { data, status } = useCustomQuery([KnowledgeQueryKey.Knowledges, 1, 1000], ({ queryKey }) =>
		findAllUserKnowledge({ page: queryKey[1] as number, limit: queryKey[2] as number })
	);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	if (status === 'pending') {
		return <div>Loading...</div>;
	}
	if (status === 'error') {
		return <div>错误:{data?.message}</div>;
	}
	const knowledgeData = data.data?.data?.find(knowledge => knowledge.id === knowledgeId);

	if (!knowledgeData || knowledgeId === undefined) {
		return <div className="text-center text-gray-500">没有找到知识数据</div>;
	}
	const isUrl = knowledgeData.fileType === 'url';

	return (
		<div className={`min-h-screen transition-colors duration-200 bg-global`}>
			<div className="container mx-auto px-4 pb-8">
				{/* 知识基本信息 */}
				<Card
					className={`mb-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
							{knowledgeData.name}
						</CardTitle>
						<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							创建于{' '}
							{knowledgeData.createdAt
								? new Date(knowledgeData.createdAt).toLocaleDateString()
								: '未知'}
							{knowledgeData.updatedAt && (
								<> · 更新于 {new Date(knowledgeData.updatedAt).toLocaleDateString()}</>
							)}
						</CardDescription>
					</CardHeader>
				</Card>

				{/* 知识类型 */}
				{knowledgeData.type && (
					<Card
						className={`mb-6 ${
							isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
						} transition-colors duration-200`}
					>
						<CardHeader>
							<CardTitle
								className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								<Edit className="w-5 h-5" />
								类型
							</CardTitle>
						</CardHeader>
						<CardContent className="flex space-x-2">
							<span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
								{knowledgeData.fileType}
							</span>
							<p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
								{type_content_Map[knowledgeData.type] ?? '未知类型'}
							</p>
						</CardContent>
					</Card>
				)}

				{/* 知识内容 */}
				<Card
					className={`mb-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<CardTitle
							className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
						>
							<BookOpen className="w-5 h-5" />
							知识内容
						</CardTitle>
						<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							共 {knowledgeData.content?.length || 0} 个字符
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div
							className={`whitespace-pre-wrap font-mono text-sm p-4 rounded-lg ${
								isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'
							} border overflow-auto max-h-96`}
						>
							{knowledgeData.content}
						</div>
					</CardContent>
					{isUrl && (
						<CardContent>
							<Button variant="outline" className="flex items-center gap-2" asChild>
								<a href={knowledgeData.content} target="_blank" rel="noopener noreferrer">
									<ExternalLink className="w-4 h-4" />
									查看知识内容
								</a>
							</Button>
						</CardContent>
					)}
				</Card>

				{/* 知识统计 */}
				<Card
					className={`mt-6 ${
						isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
					} transition-colors duration-200`}
				>
					<CardHeader>
						<CardTitle className={`${isDark ? 'text-white' : 'text-gray-900'}`}>知识统计</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
								<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
									{knowledgeData.content?.length || 0}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									字符数
								</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
								<div className="text-2xl font-bold text-green-600 dark:text-green-400">
									{knowledgeData.content?.split(/\s+/).length || 0}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									单词数
								</div>
							</div>
							<div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
								<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
									{knowledgeData.content?.split('\n').length || 0}
								</div>
								<div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>行数</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 标签信息 */}
				<div className="mt-6 flex items-center gap-2">
					<Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
					<span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
						最后更新:{' '}
						{knowledgeData.updatedAt ? new Date(knowledgeData.updatedAt).toLocaleString() : '未知'}
					</span>
				</div>
			</div>
		</div>
	);
};

export default KnowledgeRead;
