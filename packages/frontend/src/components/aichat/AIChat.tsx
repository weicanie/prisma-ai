import {
	CloudUploadOutlined,
	CopyOutlined,
	DeleteOutlined,
	DislikeOutlined,
	EditOutlined,
	LikeOutlined,
	PaperClipOutlined,
	PlusOutlined,
	QuestionCircleOutlined,
	ReloadOutlined
} from '@ant-design/icons';
import { Attachments, Bubble, Conversations, Prompts, Sender } from '@ant-design/x';
import type { ChatMessage, ConversationDto } from '@prism-ai/shared';
import type { GetProp } from 'antd';
import { Avatar, Button, Flex, Space, Spin, message } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getConversationList, sendMessageToAI, storeConversation } from '../../services/aichat';
import { DESIGN_GUIDE, HOT_TOPICS, SENDER_PROMPTS } from './config';
import { useStyle } from './style';

const AIChat: React.FC = () => {
	const { styles } = useStyle();
	const abortController = useRef<AbortController | null>(null);

	// ==================== State ====================
	const [messageHistory, setMessageHistory] = useState<Record<string, ChatMessage[]>>({});
	const [conversations, setConversations] = useState<ConversationDto[]>([]);
	const [curConversation, setCurConversation] = useState<string>('');
	const [isFetchingHistory, setIsFetchingHistory] = useState(true);

	const [attachmentsOpen, setAttachmentsOpen] = useState(false);
	const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

	const [inputValue, setInputValue] = useState('');
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	console.log('🚀 ~ messages:', messages);

	// ==================== Event ====================
	const onSubmit = async (val: string) => {
		console.log('🚀 ~ onSubmit ~ val:', val);
		if (!val) return;
		if (loading) {
			message.error('Request is in progress, please wait for the request to complete.');
			return;
		}
		setLoading(true);

		const userMessage: ChatMessage = {
			id: `user-${Date.now()}`,
			role: 'user',
			content: val
		};

		const currentHistory = [...messages, userMessage];
		console.log('🚀 ~ onSubmit ~ currentHistory:', currentHistory);

		setMessages(currentHistory);

		try {
			const res = await sendMessageToAI(userMessage);
			const aiMessage: ChatMessage = {
				id: `assistant-${Date.now()}`,
				role: 'assistant',
				content: res.data
			};
			setMessages([...currentHistory, aiMessage]);
		} catch (err) {
			console.error(err);
			message.error('Failed to get response from AI.');
		} finally {
			setLoading(false);
		}
	};

	const handleNewConversation = useCallback(async () => {
		console.log('🚀 ~ handleNewConversation ~ handleNewConversation执行');

		if (loading) {
			message.error(
				'Message is Requesting, you can create a new conversation after request done or abort it right now...'
			);
			return;
		}

		const now = dayjs().valueOf().toString();
		const newConversation: ConversationDto = {
			keyname: now,
			label: `New Conversation ${now}`,
			id: -1, // Temporary id
			content: [],
			user_id: -1,
			create_at: new Date(),
			update_at: new Date()
		};

		// Add to UI immediately for better UX
		setConversations(prev => [newConversation, ...prev]);
		setCurConversation(now);
		setMessages([]);

		// Save the empty conversation to backend to get a persistent entry
		try {
			await storeConversation(newConversation.keyname, newConversation.label, []);
		} catch {
			message.error('Failed to create new conversation on server.');
			// Revert state if API call fails
			setConversations(prev => prev.filter(c => c.keyname !== now));
		}
	}, [loading]);

	// 组件挂载时获取会话列表
	useEffect(() => {
		const fetchHistory = async () => {
			setIsFetchingHistory(true);
			try {
				const res = await getConversationList();
				const historyConversations = res.data;
				setConversations(historyConversations);

				if (historyConversations.length > 0) {
					const historyMap = historyConversations.reduce(
						(acc, curr) => {
							acc[curr.keyname] = curr.content;
							return acc;
						},
						{} as Record<string, ChatMessage[]>
					);
					setMessageHistory(historyMap);
					const firstKey = historyConversations[0].keyname;
					setCurConversation(firstKey);
					const firstMessages = historyMap[firstKey] || [];
					setMessages(firstMessages);
				} else {
					// If no history, create a new conversation
					handleNewConversation();
				}
			} catch {
				message.error('Failed to fetch conversation history.');
			} finally {
				setIsFetchingHistory(false);
			}
		};
		fetchHistory();
	}, []);

	// 监听消息变化,保存会话到数据库
	useEffect(() => {
		const saveConversation = async () => {
			if (messages.length === 0 || !curConversation || loading) return;

			const currentConversation = conversations.find(c => c.keyname === curConversation);
			if (currentConversation) {
				try {
					await storeConversation(currentConversation.keyname, currentConversation.label, messages);
					// Update local history
					setMessageHistory(prev => ({ ...prev, [curConversation]: messages }));
				} catch {
					message.error('Failed to save conversation.');
				}
			}
		};

		const debounceSave = setTimeout(saveConversation, 1000); // Debounce to avoid too many requests
		return () => clearTimeout(debounceSave);
	}, [messages, curConversation, conversations, loading]);

	// ==================== Nodes ====================
	const chatSider = (
		<div className={styles.sider}>
			{/* 🌟 Logo */}
			<div className={styles.logo}>
				<img
					src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
					draggable={false}
					alt="logo"
					width={24}
					height={24}
				/>
				<span>Ant Design X</span>
			</div>

			{/* 🌟 添加会话 */}
			<Button
				onClick={handleNewConversation}
				type="link"
				className={styles.addBtn}
				icon={<PlusOutlined />}
			>
				New Conversation
			</Button>

			{/* 🌟 会话管理 */}
			<Conversations
				items={conversations.map(c => ({
					key: c.keyname,
					label: c.label,
					// You might want a 'group' property in your DTO or derive it from create_at
					group: dayjs(c.create_at).isSame(dayjs(), 'day')
						? 'Today'
						: dayjs(c.create_at).format('YYYY-MM-DD')
				}))}
				className={styles.conversations}
				activeKey={curConversation}
				onActiveChange={async val => {
					if (loading) {
						abortController.current?.abort();
					}
					setTimeout(() => {
						setCurConversation(val);
						const newMessages = messageHistory?.[val] || [];
						setMessages(newMessages);
					}, 100);
				}}
				groupable
				styles={{ item: { padding: '0 8px' } }}
				menu={conversation => ({
					items: [
						{
							label: 'Rename',
							key: 'rename',
							icon: <EditOutlined />
						},
						{
							label: 'Delete',
							key: 'delete',
							icon: <DeleteOutlined />,
							danger: true,
							onClick: () => {
								const newList = conversations.filter(item => item.keyname !== conversation.key);
								const newKey = newList?.[0]?.keyname;
								setConversations(newList);

								setTimeout(() => {
									if (conversation.key === curConversation) {
										setCurConversation(newKey);
										const newMessages = messageHistory?.[newKey] || [];
										setMessages(newMessages);
									}
								}, 200);
							}
						}
					]
				})}
			/>

			<div className={styles.siderFooter}>
				<Avatar size={24} />
				<Button type="text" icon={<QuestionCircleOutlined />} />
			</div>
		</div>
	);
	const chatList = (
		<div className={styles.chatList}>
			{messages?.length ? (
				/* 🌟 消息列表 */
				<Bubble.List
					items={messages}
					style={{ height: '100%', paddingInline: 'calc(calc(100% - 700px) /2)' }}
					roles={{
						assistant: {
							placement: 'start',
							footer: (
								<div style={{ display: 'flex' }}>
									<Button type="text" size="small" icon={<ReloadOutlined />} />
									<Button type="text" size="small" icon={<CopyOutlined />} />
									<Button type="text" size="small" icon={<LikeOutlined />} />
									<Button type="text" size="small" icon={<DislikeOutlined />} />
								</div>
							),
							loadingRender: () => <Spin size="small" />
						},
						user: { placement: 'end' }
					}}
				/>
			) : (
				<Space
					direction="vertical"
					size={16}
					style={{ paddingInline: 'calc(calc(100% - 700px) /2)' }}
					className={styles.placeholder}
				>
					<Flex gap={16}>
						<Prompts
							items={[HOT_TOPICS]}
							styles={{
								list: { height: '100%' },
								item: {
									flex: 1,
									backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
									borderRadius: 12,
									border: 'none'
								},
								subItem: { padding: 0, background: 'transparent' }
							}}
							onItemClick={info => {
								onSubmit(info.data.description as string);
							}}
							className={styles.chatPrompt}
						/>

						<Prompts
							items={[DESIGN_GUIDE]}
							styles={{
								item: {
									flex: 1,
									backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
									borderRadius: 12,
									border: 'none'
								},
								subItem: { background: '#ffffffa6' }
							}}
							onItemClick={info => {
								onSubmit(info.data.description as string);
							}}
							className={styles.chatPrompt}
						/>
					</Flex>
				</Space>
			)}
		</div>
	);
	const senderHeader = (
		<Sender.Header
			title="Upload File"
			open={attachmentsOpen}
			onOpenChange={setAttachmentsOpen}
			styles={{ content: { padding: 0 } }}
		>
			<Attachments
				beforeUpload={() => false}
				items={attachedFiles}
				onChange={info => setAttachedFiles(info.fileList)}
				placeholder={type =>
					type === 'drop'
						? { title: 'Drop file here' }
						: {
								icon: <CloudUploadOutlined />,
								title: 'Upload files',
								description: 'Click or drag files to this area to upload'
							}
				}
			/>
		</Sender.Header>
	);
	const chatSender = (
		<>
			{/* 🌟 提示词 */}
			<Prompts
				items={SENDER_PROMPTS}
				onItemClick={info => {
					onSubmit(info.data.description as string);
				}}
				styles={{
					item: { padding: '6px 12px' }
				}}
				className={styles.senderPrompt}
			/>
			{/* 🌟 输入框 */}
			<Sender
				value={inputValue}
				header={senderHeader}
				onSubmit={() => {
					onSubmit(inputValue);
					setInputValue('');
				}}
				onChange={setInputValue}
				onCancel={() => {
					abortController.current?.abort();
				}}
				prefix={
					<Button
						type="text"
						icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
						onClick={() => setAttachmentsOpen(!attachmentsOpen)}
					/>
				}
				loading={loading}
				className={styles.sender}
				allowSpeech
				actions={(_, info) => {
					const { SendButton, LoadingButton, SpeechButton } = info.components;
					return (
						<Flex gap={4}>
							<SpeechButton className={styles.speechButton} />
							{loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
						</Flex>
					);
				}}
				placeholder="Ask or input / use skills"
			/>
		</>
	);

	// ==================== Render =================
	return (
		<div className={styles.layout}>
			{chatSider}

			<div className={styles.chat}>
				{isFetchingHistory ? <Spin /> : chatList}
				{chatSender}
			</div>
		</div>
	);
};

export default AIChat;
