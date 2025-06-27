import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react';

interface ImplementRequestProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (content: string, projectPath: string) => void;
}

const ImplementRequest: React.FC<ImplementRequestProps> = ({ open, onOpenChange, onSubmit }) => {
	const [content, setContent] = useState('');
	const [projectPath, setProjectPath] = useState('');

	const handleSubmit = () => {
		onSubmit(content, projectPath); // 调用传入的处理函数
		onOpenChange(false); // 关闭对话框
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>和doro协同实现亮点</DialogTitle>
					<DialogDescription>请输入您想要实现的项目亮点和项目名称。</DialogDescription>
				</DialogHeader>
				<Textarea
					placeholder="例如：使用基于langchain、pinecone的RAG建立用户对好友的知识库"
					value={content}
					onChange={e => {
						setContent(e.target.value);
					}}
					rows={6}
				/>
				<Input
					placeholder="例如：prisma-ai"
					value={projectPath}
					onChange={e => {
						setProjectPath(e.target.value);
					}}
				/>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button onClick={handleSubmit} disabled={!content.trim() || !projectPath.trim()}>
						提交
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ImplementRequest;
