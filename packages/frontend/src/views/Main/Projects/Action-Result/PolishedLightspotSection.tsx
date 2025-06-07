import { useTheme } from '@/utils/theme';
import { ArrowRight, Code, Target, Trash2, Users } from 'lucide-react';
import React from 'react';

interface PolishedLightspotSectionProps {
	lightspot: any;
	isPolished: boolean;
}

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
						{lightspot.team.map((item: any, index: number) => (
							<li key={index} className="space-y-1">
								<div
									className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
								>
									<ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
									<span>{typeof item === 'string' ? item : item.content}</span>
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
						))}
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
						{lightspot.skill.map((item: any, index: number) => (
							<li key={index} className="space-y-1">
								<div
									className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
								>
									<ArrowRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
									<span>{typeof item === 'string' ? item : item.content}</span>
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
						))}
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
						{lightspot.user.map((item: any, index: number) => (
							<li key={index} className="space-y-1">
								<div
									className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
								>
									<ArrowRight className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
									<span>{typeof item === 'string' ? item : item.content}</span>
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
						))}
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
						{lightspot.delete.map((item: any, index: number) => (
							<li key={index} className="space-y-1">
								<div
									className={`flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
								>
									<ArrowRight className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
									<span>{typeof item === 'string' ? item : item.content}</span>
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
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
