import { useTheme } from '@/utils/theme';
import type { ProjectPolishedDto } from '@prisma-ai/shared';
import { ArrowRight, Code, Target, Trash2, Users } from 'lucide-react';
import React from 'react';

type PolishedLightspotSectionProps = Pick<ProjectPolishedDto, 'lightspot'> & {
	isPolished: boolean;
};

export const PolishedLightspotSection: React.FC<PolishedLightspotSectionProps> = ({
	lightspot,
	isPolished
}) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	return (
		<div className="space-y-4">
			{lightspot.team?.length > 0 && (
				<div>
					<h5
						className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
					>
						<Users className="w-4 h-4" />
						团队贡献
					</h5>
					<ul className="space-y-2">
						{lightspot.team.map(
							(item: ProjectPolishedDto['lightspot']['team'][number], index: number) => (
								<li key={index} className="space-y-1">
									<div
										className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
									>
										<ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
										<span>{item.content}</span>
									</div>
									{isPolished &&
										typeof item === 'object' &&
										item.advice &&
										item.advice !== 'NONE' && (
											<div
												className={`ml-6 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
											>
												💡 建议: {item.advice}
											</div>
										)}
								</li>
							)
						)}
					</ul>
				</div>
			)}

			{lightspot.skill?.length > 0 && (
				<div>
					<h5
						className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}
					>
						<Code className="w-4 h-4" />
						技术亮点
					</h5>
					<ul className="space-y-2">
						{lightspot.skill.map(
							(item: ProjectPolishedDto['lightspot']['skill'][number], index: number) => (
								<li key={index} className="space-y-1">
									<div
										className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
									>
										<ArrowRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
										<span>{item.content}</span>
									</div>
									{isPolished &&
										typeof item === 'object' &&
										item.advice &&
										item.advice !== 'NONE' && (
											<div
												className={`ml-6 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
											>
												💡 建议: {item.advice}
											</div>
										)}
								</li>
							)
						)}
					</ul>
				</div>
			)}

			{lightspot.user?.length > 0 && (
				<div>
					<h5
						className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
					>
						<Target className="w-4 h-4" />
						用户价值
					</h5>
					<ul className="space-y-2">
						{lightspot.user.map(
							(item: ProjectPolishedDto['lightspot']['user'][number], index: number) => (
								<li key={index} className="space-y-1">
									<div
										className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
									>
										<ArrowRight className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
										<span>{item.content}</span>
									</div>
									{isPolished &&
										typeof item === 'object' &&
										item.advice &&
										item.advice !== 'NONE' && (
											<div
												className={`ml-6 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
											>
												💡 建议: {item.advice}
											</div>
										)}
								</li>
							)
						)}
					</ul>
				</div>
			)}

			{lightspot.delete?.length > 0 && (
				<div>
					<h5
						className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
					>
						<Trash2 className="w-4 h-4" />
						建议删除
					</h5>
					<ul className="space-y-2">
						{lightspot.delete.map(
							(item: ProjectPolishedDto['lightspot']['delete'][number], index: number) => (
								<li key={index} className="space-y-1">
									<div
										className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
									>
										<ArrowRight className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
										<span>{item.content}</span>
									</div>
									{isPolished &&
										typeof item === 'object' &&
										item.reason &&
										item.reason !== 'NONE' && (
											<div
												className={`ml-6 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
											>
												🔎 原因: {item.reason}
											</div>
										)}
								</li>
							)
						)}
					</ul>
				</div>
			)}
		</div>
	);
};
