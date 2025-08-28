import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react';

interface FeedBackProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (content: string) => void; // 这将是 handleFeedback 函数
}

const FeedBack: React.FC<FeedBackProps> = ({ open, onOpenChange, onSubmit }) => {
	const [content, setContent] = useState('');

	const handleSubmit = () => {
		onSubmit(content); // 调用传入的-处理函数
		onOpenChange(false); // 关闭对话框
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>提供反馈</DialogTitle>
					<DialogDescription>
						您的反馈将帮助棱镜改进其优化结果。请输入您不满意的地方或改进建议。
					</DialogDescription>
				</DialogHeader>
				<Textarea
					placeholder="例如：我觉得项目亮点挖掘得不够深入，可以更关注XX方面..."
					value={content}
					onChange={e => {
						setContent(e.target.value);
					}}
					rows={6}
				/>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button onClick={handleSubmit} disabled={!content.trim()}>
						提交反馈
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default FeedBack;
