import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/utils/theme';
import { Code, Target, Users } from 'lucide-react';
import React from 'react';

interface MinedPolishedLightspotSectionProps {
	lightspotAdded: any;
}

export const MinedPolishedLightspotSection: React.FC<MinedPolishedLightspotSectionProps> = ({
	lightspotAdded
}) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	return (
		<div className="space-y-4">
			{lightspotAdded.team?.length > 0 && (
				<div>
					<h5
						className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
					>
						<Users className="w-4 h-4" />
						团队贡献
					</h5>
					<ul className="space-y-3">
						{lightspotAdded.team.map((item: any, index: number) => (
							<li
								key={index}
								className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}
							>
								<div className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
									{item.content}
								</div>
								{item.reason && item.reason !== 'NONE' && (
									<div className={`text-sm mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
										🔍 发现原因: {item.reason}
									</div>
								)}
								{item.tech?.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{item.tech.map((tech: string, techIndex: number) => (
											<Badge key={techIndex} variant="secondary" className="text-xs">
												{tech}
											</Badge>
										))}
									</div>
								)}
							</li>
						))}
					</ul>
				</div>
			)}

			{lightspotAdded.skill?.length > 0 && (
				<div>
					<h5
						className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}
					>
						<Code className="w-4 h-4" />
						技术亮点
					</h5>
					<ul className="space-y-3">
						{lightspotAdded.skill.map((item: any, index: number) => (
							<li
								key={index}
								className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}
							>
								<div className={`font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
									{item.content}
								</div>
								{item.reason && item.reason !== 'NONE' && (
									<div className={`text-sm mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
										🔍 发现原因: {item.reason}
									</div>
								)}
								{item.tech?.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{item.tech.map((tech: string, techIndex: number) => (
											<Badge key={techIndex} variant="secondary" className="text-xs">
												{tech}
											</Badge>
										))}
									</div>
								)}
							</li>
						))}
					</ul>
				</div>
			)}

			{lightspotAdded.user?.length > 0 && (
				<div>
					<h5
						className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
					>
						<Target className="w-4 h-4" />
						用户价值
					</h5>
					<ul className="space-y-3">
						{lightspotAdded.user.map((item: any, index: number) => (
							<li
								key={index}
								className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}
							>
								<div className={`font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
									{item.content}
								</div>
								{item.reason && item.reason !== 'NONE' && (
									<div className={`text-sm mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
										🔍 发现原因: {item.reason}
									</div>
								)}
								{item.tech?.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{item.tech.map((tech: string, techIndex: number) => (
											<Badge key={techIndex} variant="secondary" className="text-xs">
												{tech}
											</Badge>
										))}
									</div>
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
