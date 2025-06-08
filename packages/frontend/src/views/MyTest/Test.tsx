import { Sparkles } from 'lucide-react';
import Tabs from '../Main/components/Tabs';

const Test = () => {
	const tabs = [
		{ name: '项目分析', href: '#', icon: Sparkles, current: false },
		{ name: '项目优化', href: '#', icon: Sparkles, current: false },
		{ name: '项目挖掘', href: '#', icon: Sparkles, current: false }
	];
	return (
		<>
			<Tabs tabs={tabs} />
		</>
	);
};

export default Test;
