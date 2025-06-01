import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import MilkdownEditor from '../components/Editor';
import { ProjectForm } from '../components/ProjectForm';

interface WriteProjectProps {}

export const WriteProject: React.FC<WriteProjectProps> = props => {
	return (
		<>
			<Tabs defaultValue="md" className="flex items-center">
				<TabsList className="w-3/4 grid grid-cols-4 bg-transparent">
					<TabsTrigger
						value="md"
						className="col-start-1 col-end-3 lg:col-start-2 lg:col-end-3 rounded-[5px]"
					>
						md编辑器
					</TabsTrigger>
					<TabsTrigger value="form" className=" col-start-3  col-end-5 lg:col-start-3 lg:col-end-4">
						直接填写
					</TabsTrigger>
				</TabsList>
				<TabsContent value="md" className="w-full h-full">
					{/* md编辑器 */}
					<MilkdownEditor />
				</TabsContent>
				<TabsContent value="form" className="mt-20 w-full h-full">
					{/* 表单 */}
					<ProjectForm></ProjectForm>
				</TabsContent>
			</Tabs>
		</>
	);
};
