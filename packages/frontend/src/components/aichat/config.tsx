import {
	AppstoreAddOutlined,
	CommentOutlined,
	FileSearchOutlined,
	HeartOutlined,
	PaperClipOutlined,
	ProductOutlined,
	ScheduleOutlined,
	SmileOutlined
} from '@ant-design/icons';
import { Prompts } from '@ant-design/x';
import type { GetProp } from 'antd';

export const HOT_TOPICS = {
	key: '1',
	label: 'Hot Topics',
	children: [
		{
			key: '1-1',
			description: 'What has Ant Design X upgraded?',
			icon: <span style={{ color: '#f93a4a', fontWeight: 700 }}>1</span>
		},
		{
			key: '1-2',
			description: 'New AGI Hybrid Interface',
			icon: <span style={{ color: '#ff6565', fontWeight: 700 }}>2</span>
		},
		{
			key: '1-3',
			description: 'What components are in Ant Design X?',
			icon: <span style={{ color: '#ff8f1f', fontWeight: 700 }}>3</span>
		},
		{
			key: '1-4',
			description: 'Come and discover the new design paradigm of the AI era.',
			icon: <span style={{ color: '#00000040', fontWeight: 700 }}>4</span>
		},
		{
			key: '1-5',
			description: 'How to quickly install and import components?',
			icon: <span style={{ color: '#00000040', fontWeight: 700 }}>5</span>
		}
	]
};

export const DESIGN_GUIDE = {
	key: '2',
	label: 'Design Guide',
	children: [
		{
			key: '2-1',
			icon: <HeartOutlined />,
			label: 'Intention',
			description: 'AI understands user needs and provides solutions.'
		},
		{
			key: '2-2',
			icon: <SmileOutlined />,
			label: 'Role',
			description: "AI's public persona and image"
		},
		{
			key: '2-3',
			icon: <CommentOutlined />,
			label: 'Chat',
			description: 'How AI Can Express Itself in a Way Users Understand'
		},
		{
			key: '2-4',
			icon: <PaperClipOutlined />,
			label: 'Interface',
			description: 'AI balances "chat" & "do" behaviors.'
		}
	]
};

export const SENDER_PROMPTS: GetProp<typeof Prompts, 'items'> = [
	{
		key: '1',
		description: 'Upgrades',
		icon: <ScheduleOutlined />
	},
	{
		key: '2',
		description: 'Components',
		icon: <ProductOutlined />
	},
	{
		key: '3',
		description: 'RICH Guide',
		icon: <FileSearchOutlined />
	},
	{
		key: '4',
		description: 'Installation Introduction',
		icon: <AppstoreAddOutlined />
	}
];
