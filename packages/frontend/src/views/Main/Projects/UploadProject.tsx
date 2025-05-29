import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
/*前端转json还是后端转json?

前端优先、后端备选
  通过默认md和提示要求格式,llm解析作为备选应该比较合适
    因为格式固定,
    且llm解析耗时、不一定稳定
    
*/

export function UploadProject() {
	//TODO 实现上传文本（格式转换）和上传文件（提取文本,然后格式转换）的功能
	return (
		<>
			<Tabs defaultValue="text">
				<TabsList className="w-full grid grid-cols-4">
					<TabsTrigger value="text" className="col-start-1 col-end-3 lg:col-start-2 lg:col-end-3">
						上传文本
					</TabsTrigger>
					<TabsTrigger value="file" className="col-start-3  col-end-5 lg:col-start-3 lg:col-end-4">
						上传文件
					</TabsTrigger>
				</TabsList>
				<TabsContent value="text">在这里上传文本</TabsContent>
				<TabsContent value="file">在这里上传文件</TabsContent>
			</Tabs>
		</>
	);
}
