import { FileTextIcon, UploadIcon } from '@radix-ui/react-icons';
import { memo, useState } from 'react';
import { MagicCardWrapper } from '../../components/MagicCard';
import { BentoCard, BentoGrid } from '../../components/magicui/bento-grid';
import MilkdownEditorWrapper from './c-cpns/EditorWrapper';
import { ProjectForm } from './c-cpns/ProjectForm';

/*前端转json还是后端转json?

前端优先、后端备选
  通过默认md和提示要求格式,llm解析作为备选应该比较合适
    因为格式固定,
    且llm解析耗时、不一定稳定
    
*/

function UploadProject() {
	const [selected, setSelected] = useState('');

	const features = [
		{
			Icon: FileTextIcon,
			name: '已经写好项目经验了?',
			description: '',
			href: '/',
			cta: '去上传',
			background: <img className="absolute -right-20 -top-20 opacity-60" />,
			className: 'lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-3'
		},
		{
			Icon: UploadIcon,
			name: '从头开始写一个项目经验?',
			description: '',
			href: '/',
			cta: '开始写',
			background: <img className="absolute -right-20 -top-20 opacity-60" />,
			className: 'lg:row-start-1 lg:row-end-3 lg:col-start-3 lg:col-end-5'
		}
	];

	let show;
	switch (selected) {
		case '去上传':
			show = <MilkdownEditorWrapper />;
			break;
		case '开始写':
			show = (
				<div className="flex justify-center items-center w-full h-full">
					<div className="basis-170">
						<MagicCardWrapper cardTitle="">
							<ProjectForm></ProjectForm>
						</MagicCardWrapper>
					</div>
				</div>
			);
			break;
	}
	return (
		<>
			{/* 利用层叠实现padding的响应式 */}
			{!selected && (
				<BentoGrid className="lg:grid-rows-4 lg:grid-cols-4 w-full h-full p-10 lg:p-25">
					{features.map(feature => (
						<BentoCard
							key={feature.name}
							{...feature}
							onClick={() => {
								setSelected(feature.cta);
							}}
						/>
					))}
				</BentoGrid>
			)}
			{show}
		</>
	);
}
export default memo(UploadProject);
