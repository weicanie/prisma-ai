import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { FileSearch, Zap } from 'lucide-react';
import React from 'react';
import { FreeSession } from '../../../components/FlushSession';
import { ChangeLLMJob } from './ChangeLLMJob';
interface PreflightBtnsProps {
	availableActions: readonly string[];
	handleMatch: () => void;
}

/**
 * 可用操作按钮组
 * @description 根据可用操作，显示不同的操作按钮。此处为简历-岗位匹配。
 */
const PreflightBtns: React.FC<PreflightBtnsProps> = ({ availableActions, handleMatch }) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	return (
		<>
			<CardHeader>
				<CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
					<Zap className="w-5 h-5" />
					Prisma 定制岗位专用简历
					<ChangeLLMJob />
					<FreeSession></FreeSession>
				</CardTitle>
				<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
					Prisma 将会分析目标岗位和您的简历，让您的简历契合、匹配目标岗位
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{availableActions.includes('match') && (
						<Card
							className={`flex flex-col items-center justify-center text-center p-6 ${
								isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
							}`}
						>
							<FileSearch
								className={`w-12 h-12 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
							/>
							<h3
								className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								简历-岗位匹配
							</h3>
							<p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
								Prisma 会让招聘方第一眼就认为您是这个岗位的合适人选
							</p>
							<Button
								onClick={handleMatch}
								size="lg"
								className={`${
									isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'
								} text-white`}
							>
								<FileSearch className="mr-2 h-5 w-5" /> 使用 Prisma 定制岗位专用简历
							</Button>
						</Card>
					)}
				</div>
			</CardContent>
		</>
	);
};

export default PreflightBtns;
