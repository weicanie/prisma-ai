import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Lightbulb, Pyramid } from 'lucide-react'; // Assuming lucide-react for icons
import React, { useState } from 'react';
import ClickCollapsible from '../../../../components/ClickCollapsible';
import MilkdownEditor from '../../../../components/Editor';
import type { ProjectResultProps } from '../../type';
import FeedBack from '../FeedBack';

type ProjectBusinessResultCardProps = Pick<ProjectResultProps, 'done' | 'handleMerge'> & {
	isDark: boolean;
	handleFeedback: (content: string) => void;
	resultData: string | any;
};
/**
 * 项目业务分析、生成结果展示组件
 * 用于展示AI对项目的拷打/分析结果，包括问题、解决方案和评分。
 */
export const ProjectBusinessResultCard: React.FC<ProjectBusinessResultCardProps> = ({
	resultData,
	isDark,
	done,
	handleMerge,
	handleFeedback
}) => {
	resultData = resultData as string | null;

	const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

	if (!resultData) return;

	return (
		<>
			<ClickCollapsible
				title={
					<h4
						className={`font-semibold text-lg mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
					>
						<Lightbulb className="w-5 h-5 text-yellow-500" />
						Prisma 业务分析、生成结果
					</h4>
				}
				defaultOpen={true}
			>
				<CardContent className="space-y-6 pl-7 pr-7">
					<MilkdownEditor type="show" mdSelector={() => resultData || ''} isCardMode={true} />
				</CardContent>
			</ClickCollapsible>

			{done && (
				<div className="flex justify-center items-center gap-4 fixed bottom-5 right-1/2 translate-x-1/2">
					<Button onClick={handleMerge} variant="default" className="w-40" size="lg">
						<Pyramid className="w-4 h-4 mr-2" />
						满意,采纳建议
					</Button>
					<Button
						onClick={() => setIsFeedbackOpen(true)}
						variant="outline"
						className="w-40"
						size="lg"
					>
						<Pyramid className="w-4 h-4 mr-2" />
						不满意,重新分析
					</Button>
				</div>
			)}
			<FeedBack open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} onSubmit={handleFeedback} />
		</>
	);
};
