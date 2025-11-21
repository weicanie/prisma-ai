import {
	selectAIChatLastConversation,
	selectAIChatLLM,
	selectAIChatProjectId,
	setAIChatLastConversation,
	setAIChatLLM,
	setAIChatProjectId
} from '@/store/aichat';
import { Bubble, Sender } from '@ant-design/x';
import type { ChatMessage, ConversationDto } from '@prisma-ai/shared';
import dayjs from 'dayjs';
import { Brain, Trash } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import AntdThemeHoc from '../../../components/AntdThemeHoc';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn } from '../../../lib/utils';
import { useCustomQuery } from '../../../query/config';
import { ProjectQueryKey } from '../../../query/keys';
import {
	getConversationList,
	startNewConversation,
	storeConversation
} from '../../../services/aichat';
import { findAllProjects } from '../../../services/project';
import { useSseAnswer } from '../../../services/sse/useSseAnswer';
import ClickCollapsible from '../components/ClickCollapsible';
import { FreeSession } from '../components/FlushSession';
import { ChangeLLM } from './components/ChangeLLM';
import { MySpin } from './components/MySpin';
import Conversations from './Conversations';
import { Logo } from './Logo';
import Projects from './Projects';
import TipsCard from './TipsCard';
const MarkdownEditor = React.lazy(() => import('../components/Editor_react_markdown'));
interface AIChatProps {
	className?: string;
}

const AIChat: React.FC<AIChatProps> = ({ className }) => {
	const abortController = useRef<AbortController | null>(null);
	const project_id = useSelector(selectAIChatProjectId);
	const dispatch = useDispatch();

	// ==================== State ====================
	//所有对话的历史记录
	const [messageHistory, setMessageHistory] = useState<Record<string, ChatMessage[]>>({});
	const [conversations, setConversations] = useState<ConversationDto[]>([]);
	const [curConversation, setCurConversation] = useState<string>('');

	const [isFetchingHistory, setIsFetchingHistory] = useState(true);

	const [attachmentsOpen, setAttachmentsOpen] = useState(false);
	// 文件附件
	// const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

	const [inputValue, setInputValue] = useState('');
	// ai是否正在生成
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	const lastConversationKeyname = useSelector(selectAIChatLastConversation);

	// ==================== Event ====================
	const model = useSelector(selectAIChatLLM);

	const { content, reasonContent, done, isReasoning, start } = useSseAnswer(true);
	// 生成结束后更新消息历史记录
	useEffect(() => {
		if (done) {
			const aiMessage: ChatMessage = {
				id: `assistant-${Date.now()}`,
				role: 'assistant',
				content: content,
				reasonContent: reasonContent,
				create_at: new Date()
			};
			const currentHistory = [...messages];
			// currentHistory.pop();
			setMessages([...currentHistory, aiMessage]);
		}
	}, [done]);

	const onSubmitStream = async (val: string) => {
		if (!val) return;
		if (loading) {
			toast.error('消息正在请求中，您可以等待请求完成或立即创建新对话...');
			return;
		}
		setLoading(true);
		//恢复自动滚动
		setUserScrolled(false);

		const userMessage: ChatMessage = {
			id: `user-${Date.now()}`,
			role: 'user',
			content: val
		};
		// const aiMessagePlaceholder: ChatMessage = {
		// 	id: `assistant-${Date.now()}`,
		// 	role: 'assistant',
		// 	content: '',
		// 	loading: true
		// };
		// const currentHistory = [...messages, userMessage, aiMessagePlaceholder];
		const currentHistory = [...messages, userMessage];
		setMessages(currentHistory);

		try {
			start({
				path: '/aichat/stream',
				input: {
					input: {
						message: userMessage,
						keyname: curConversation,
						project_id,
						modelConfig: {
							llm_type: model
						}
					}
				},
				model
			});
		} catch (err) {
			console.error(err);
			toast.error('没有得到AI的响应。');
		} finally {
			setLoading(false);
		}
	};

	const handleNewConversation = useCallback(async () => {
		if (loading) {
			toast.error('消息正在请求中，您可以等待请求完成或立即创建新对话...');
			return;
		}

		const uuid = crypto.randomUUID();
		const newConversation: ConversationDto = {
			keyname: uuid,
			label: `对话-${uuid}`,
			id: -1, // Temporary id
			content: [],
			user_id: -1,
			create_at: new Date(),
			update_at: new Date(),
			project_id
		};

		// Add to UI immediately for better UX
		setConversations(prev => [newConversation, ...prev]);
		setCurConversation(uuid);
		dispatch(setAIChatLastConversation(curConversation));

		setMessages([]);

		try {
			await startNewConversation(newConversation.keyname, newConversation.label, [], project_id);
			toast.success('创建成功');
		} catch {
			toast.error('创建新对话失败，请稍后重试...');
			// Revert state if API call fails
			setConversations(prev => prev.filter(c => c.keyname !== uuid));
		}
	}, [loading, project_id, curConversation, dispatch]);

	// 监听消息变化,保存会话到数据库
	useEffect(() => {
		const saveConversation = async () => {
			if (messages.length === 0 || !curConversation || loading) return;

			const currentConversation = conversations.find(c => c.keyname === curConversation);
			if (currentConversation) {
				try {
					await storeConversation(
						currentConversation.keyname,
						currentConversation.label,
						messages,
						project_id
					);
					// Update local history
					setMessageHistory(prev => ({ ...prev, [curConversation]: messages }));
				} catch {
					toast.error('保存对话失败，请稍后重试...');
				}
			}
		};

		const debounceSave = setTimeout(saveConversation, 1000); // Debounce to avoid too many requests
		return () => clearTimeout(debounceSave);
	}, [messages, curConversation, conversations, loading, project_id]);

	// 创建滚动容器的引用
	const rollContainerRef = useRef<HTMLDivElement>(null);
	// 用户是否手动滚动的状态
	const [userScrolled, setUserScrolled] = useState(false);

	// 检测用户是否手动滚动了内容
	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const isAtBottom =
			Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 35;
		setUserScrolled(!isAtBottom);
	};

	// 监听内容变化，自动滚动到底部
	useEffect(() => {
		if (rollContainerRef.current && !userScrolled) {
			const element = rollContainerRef.current;
			// 使用 requestAnimationFrame 确保DOM更新后再滚动
			requestAnimationFrame(() => {
				element.scrollTop = element.scrollHeight;
			});
		}
	}, [messages, content, reasonContent, userScrolled]);

	//切换到新的会话后自动滚动到底部
	useEffect(() => {
		const timer = setTimeout(() => {
			if (rollContainerRef.current) {
				rollContainerRef.current.scrollTop = rollContainerRef.current.scrollHeight;
			}
		}, 500);
		return () => clearTimeout(timer);
	}, [curConversation]);

	const isMobile = useIsMobile();

	// 获取项目经验数据
	const { data, status } = useCustomQuery([ProjectQueryKey.Projects], findAllProjects);

	// 在project_id获取后，获取会话列表
	useEffect(() => {
		const fetchHistory = async () => {
			setIsFetchingHistory(true);
			try {
				const res = await getConversationList(project_id);
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
					setCurConversation(lastConversationKeyname);
					const firstMessages = historyMap[lastConversationKeyname] || [];
					setMessages(firstMessages);
				} else {
					// If no history, create a new conversation
					handleNewConversation();
				}
			} catch {
				toast.error('获取对话历史失败，请稍后重试...');
			} finally {
				setIsFetchingHistory(false);
			}
		};
		if (project_id) {
			fetchHistory();
		}
	}, [project_id]);

	// 在project_id获取后，设置默认选中第一个项目
	useEffect(() => {
		const projects = data?.data;
		if (projects && projects.length > 0) {
			dispatch(setAIChatProjectId(projects[0].id));
		}
	}, [data, dispatch]);
	if (status === 'pending') return <div></div>;
	if (status === 'error') return <div>错误:{data?.message}</div>;

	// ==================== Nodes ====================

	const chatList = (
		<div
			className="overflow-auto h-[calc(100vh-200px)]! w-full scb-thin bg-global"
			ref={rollContainerRef}
			onScroll={handleScroll}
		>
			{messages?.length ? (
				/* 消息列表 */
				<div className={`flex flex-col ${isMobile ? 'px-1' : 'px-10'} gap-5`}>
					{messages.map((item, index) => {
						return (
							<Bubble
								key={item.id}
								content={item.content}
								messageRender={(content: string) => {
									return (
										<>
											{item.reasonContent && item.role !== 'user' && (
												<ClickCollapsible
													title={'思考过程'}
													icon={<Brain className="size-5 text-blue-400" />}
													defaultOpen={false}
													className="border-blue-400 border-l-1 pl-2"
												>
													<MarkdownEditor initialValue={item.reasonContent} isReadOnly={true} />
												</ClickCollapsible>
											)}
											<MarkdownEditor initialValue={content} isReadOnly={true} />
										</>
									);
								}}
								variant="filled"
								placement={item.role === 'user' ? 'end' : 'start'}
								loading={item.loading}
								typing={false}
								avatar={
									item.role === 'user' ? undefined : (
										<div
											className={`flex items-center justify-center ${isMobile ? 'size-7' : 'size-10'}`}
										>
											<Logo className={` text-zinc-100 ${isMobile ? 'size-7' : 'size-10'}`} />
										</div>
									)
								}
								shape="round"
							></Bubble>
						);
					})}
					{/* 当前正在生成的AI消息 */}
					{(done === false || isReasoning) && (
						<Bubble
							key={'latest'}
							content={content}
							messageRender={() => {
								return (
									<>
										{reasonContent && (
											<ClickCollapsible
												title={'思考过程'}
												icon={<Brain className="size-5 text-blue-400" />}
												defaultOpen={false}
												className="border-blue-400 border-l-1 pl-2"
											>
												<MarkdownEditor initialValue={reasonContent} isReadOnly={true} />
											</ClickCollapsible>
										)}
										<MarkdownEditor initialValue={content} isReadOnly={true} />
									</>
								);
							}}
							variant="filled"
							placement={'start'}
							loading={false}
							typing={false}
							avatar={
								<div
									className={`flex items-center justify-center ${isMobile ? 'size-7' : 'size-10'}`}
								>
									<Logo className={` text-zinc-100 ${isMobile ? 'size-7' : 'size-10'}`} />
								</div>
							}
							shape="round"
						></Bubble>
					)}
				</div>
			) : (
				<div className="w-full flex justify-center items-center">
					<TipsCard className="w-full max-w-5xl" />
				</div>
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
			{/* <Attachments
				beforeUpload={() => false}
				items={attachedFiles}
				onChange={info => setAttachedFiles(info.fileList)}
				placeholder={type =>
					type === 'drop'
						? { title: 'Drop file here' }
						: {
								icon: <CloudUpload />,
								title: 'Upload files',
								description: 'Click or drag files to this area to upload'
							}
				}
			/> */}
		</Sender.Header>
	);
	const chatSender = (
		<>
			<div className="w-full flex flex-col justify-center items-center gap-3">
				{/* 项目选择组件 */}
				<div className="flex justify-between w-full max-w-[700px] relative top-1 z-1">
					<Projects
						className="relative"
						onProjectSelect={projectId => {
							// 项目选择后可以在这里添加额外的逻辑
							console.log('选中项目:', projectId);
						}}
					/>
					<div>
						<FreeSession className="relative top-[1px]"></FreeSession>
						<ChangeLLM
							selector={selectAIChatLLM}
							setModelAction={setAIChatLLM}
							className="rounded-[20px]  z-1 dark:text-zinc-300"
						></ChangeLLM>
					</div>
				</div>

				{/* 输入框 */}
				<Sender
					value={inputValue}
					header={senderHeader}
					onSubmit={() => {
						onSubmitStream(inputValue);
						setInputValue('');
					}}
					onChange={setInputValue}
					onCancel={() => {
						abortController.current?.abort();
					}}
					// prefix={
					// 	<Button
					// 		type="text"
					// 		icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
					// 		onClick={() => setAttachmentsOpen(!attachmentsOpen)}
					// 	/>
					// }
					loading={loading}
					className="max-w-[700px]"
					// allowSpeech
					actions={(_, info) => {
						const { SendButton, LoadingButton } = info.components;
						return (
							<div className="flex gap-4">
								{/* <SpeechButton className={styles.speechButton} /> */}
								{loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
							</div>
						);
					}}
					placeholder="问问 Prisma"
				/>
			</div>
			{/* 会话管理 */}

			<div className="bg-global w-full px-3">
				<Conversations
					className="relative"
					handleNewConversation={handleNewConversation}
					items={
						conversations
							? conversations.map(c => ({
									key: c.keyname,
									label:
										messageHistory[c.keyname]?.length > 0
											? messageHistory[c.keyname][0].content.slice(0, 15) + `...`
											: `新对话 ${
													dayjs(c.create_at).isSame(dayjs(), 'day')
														? '今天'
														: dayjs(c.create_at).format('YYYY-MM-DD')
												}`,
									// You might want a 'group' property in your DTO or derive it from create_at
									group: dayjs(c.create_at).isSame(dayjs(), 'day')
										? '今天'
										: dayjs(c.create_at).format('YYYY-MM-DD')
								}))
							: []
					}
					activeKey={curConversation}
					// 会话切换
					onActiveChange={async val => {
						if (loading) {
							abortController.current?.abort();
						}
						const newMessages = messageHistory?.[val] || [];
						setMessages(newMessages);
						setCurConversation(val);
						dispatch(setAIChatLastConversation(val));
					}}
					menu={conversation => ({
						items: [
							{
								label: '删除',
								key: 'delete',
								icon: <Trash className="size-4" />,
								danger: true,
								onClick: () => {
									const newList = conversations.filter(item => item.keyname !== conversation.key);
									const newKey = newList?.[0]?.keyname;
									setConversations(newList);

									setTimeout(() => {
										if (conversation.key === curConversation) {
											setCurConversation(newKey);
											dispatch(setAIChatLastConversation(newKey));
											const newMessages = messageHistory?.[newKey] || [];
											setMessages(newMessages);
										}
									}, 200);
								}
							}
						]
					})}
				/>
			</div>
		</>
	);

	// ==================== Render =================
	return (
		<AntdThemeHoc>
			<div className={cn('w-full h-[calc(100vh-100px)]! bg-global font-sans', className)}>
				{/* {chatSider} */}
				<div className="h-full w-full flex flex-col justify-center items-center  box-border gap-4 relative">
					{isFetchingHistory ? <MySpin text="加载对话历史中..." /> : chatList}
					{chatSender}
				</div>
			</div>
		</AntdThemeHoc>
	);
};

export default AIChat;
