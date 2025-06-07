import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/utils/theme';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProjectMinedDto, ProjectPolishedDto } from '@prism-ai/shared';
import { Code, Lightbulb, Pyramid, Sparkles, Zap } from 'lucide-react';
import React from 'react';
import { MinedPolishedLightspotSection } from './MinedLightspotSection';
import { PolishedLightspotSection } from './PolishedLightspotSection';
import { headerMap, type ProjectResultProps } from './ProjectResult';
type ProejctPMResultCardProps = Pick<
	ProjectResultProps,
	'actionType' | 'resultData' | 'mergedData' | 'handleMerge'
>;

export const ProejctPMResultCard: React.FC<ProejctPMResultCardProps> = ({
	actionType,
	resultData,
	mergedData,
	handleMerge
}) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';
	resultData = resultData as ProjectPolishedDto | ProjectMinedDto | null;
	if (resultData === null) return;
	return (
		<>
			<Card
				className={`h-full mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
			>
				<CardHeader>
					<CardTitle
						className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
					>
						<Zap className="w-5 h-5" />
						{actionType && headerMap[actionType].title}
					</CardTitle>
					<CardDescription className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
						{actionType && headerMap[actionType].desc}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* 基本信息 */}
					<div className="space-y-4">
						{resultData.info.desc.role && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									角色职责
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{resultData.info.desc.role}
								</p>
							</div>
						)}

						{resultData.info.desc.contribute && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									核心贡献
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{resultData.info.desc.contribute}
								</p>
							</div>
						)}

						{resultData.info.desc.bgAndTarget && (
							<div>
								<h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
									项目背景
								</h4>
								<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									{resultData.info.desc.bgAndTarget}
								</p>
							</div>
						)}
					</div>
					<Separator />
					{/* 技术栈 */}
					{resultData.info.techStack?.length > 0 && (
						<div>
							<h4
								className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
							>
								<Code className="w-4 h-4" />
								技术栈
							</h4>
							<div className="flex flex-wrap gap-2">
								{resultData.info.techStack.map((tech, index) => (
									<Badge
										key={index}
										variant="outline"
										className={`${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
									>
										{tech}
									</Badge>
								))}
							</div>
						</div>
					)}
					<Separator />

					{/* 优化后的亮点 */}
					{resultData.lightspot && (
						<div>
							<h4
								className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								<Sparkles className="w-5 h-5" />
								{actionType === 'polish' ? '优化后亮点' : '原始亮点'}
							</h4>
							<PolishedLightspotSection
								lightspot={resultData.lightspot}
								isPolished={actionType === 'polish'}
							/>
						</div>
					)}

					{/* 如果是挖掘结果，显示新增亮点 */}
					{actionType === 'mine' && 'lightspotAdded' in resultData && resultData.lightspotAdded && (
						<>
							<Separator />
							<div>
								<h4
									className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
								>
									<Lightbulb className="w-5 h-5" />
									新增亮点
								</h4>
								<MinedPolishedLightspotSection lightspotAdded={resultData.lightspotAdded} />
							</div>
						</>
					)}
				</CardContent>
				{mergedData && (
					<Button
						onClick={handleMerge}
						variant="outline"
						className="fixed bottom-5 rounded-md right-5 w-full hover:bg-purple-700 text-white"
						size="lg"
					>
						<Pyramid className="w-4 h-4 mr-2" />
						完成优化
					</Button>
				)}
			</Card>
		</>
	);
};
