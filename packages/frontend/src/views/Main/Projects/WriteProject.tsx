import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import MilkdownEditorWrapper from '../components/Editor/EditorWrapper';
import { ProjectForm } from '../components/ProjectForm';

interface WriteProjectProps {}

export const WriteProject: React.FC<WriteProjectProps> = props => {
	//FIXME magic ui 导致tabs默认样式异常?
	return (
		<>
			<Tabs defaultValue="md">
				<TabsList className="w-full grid grid-cols-4">
					<TabsTrigger value="md" className="col-start-1 col-end-3 lg:col-start-2 lg:col-end-3">
						md编辑器
					</TabsTrigger>
					<TabsTrigger value="form" className=" col-start-3  col-end-5 lg:col-start-3 lg:col-end-4">
						直接填写
					</TabsTrigger>
				</TabsList>
				<TabsContent value="md">
					{/* md编辑器 */}
					<MilkdownEditorWrapper />
				</TabsContent>
				<TabsContent value="form" className="mt-20">
					{/* 表单 */}
					<ProjectForm></ProjectForm>
				</TabsContent>
			</Tabs>
		</>
	);
};
