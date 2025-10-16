import type { UserNotification } from '@prisma-ai/shared';
import { List, Pagination, Tabs } from 'antd';
import { Text } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AntdThemeHoc from '../../../components/AntdThemeHoc';
import { useMarkAllNotificationsAsRead } from '../../../services/manage/notifaction-user';
import {
	markAllAsRead,
	selectLimit,
	selectNotifications,
	selectPage,
	selectTotalNotifications,
	selectUnreadCount,
	setPage
} from '../../../store/notification';
import { useTheme } from '../../../utils/theme';
import ClickCollapsible from '../components/ClickCollapsible';
import MilkdownEditor from '../components/Editor';
import { PageHeader } from '../components/PageHeader';

const UserNotificationPage: React.FC = () => {
	const dispatch = useDispatch();
	const page = useSelector(selectPage);
	const limit = useSelector(selectLimit);

	const [filter, setFilter] = useState<'all' | 'unread'>('unread');
	const allNotifications = useSelector(selectNotifications);
	const total = useSelector(selectTotalNotifications);
	const unreadCount = useSelector(selectUnreadCount);

	const showPagenition = filter === 'all' ? total > 5 : unreadCount > 5;

	const notifications =
		filter === 'all' ? allNotifications : allNotifications.filter(n => !n.is_read);

	const markAllAsReadMutation = useMarkAllNotificationsAsRead();

	const { resolvedTheme } = useTheme();

	const isDark = resolvedTheme === 'dark';

	// 单个通知标记为已读
	// const markAsReadMutation = useMarkNotificationAsRead();
	// const handleMarkAsRead = async (notificationId: number) => {
	// 	try {
	// 		await markAsReadMutation.mutateAsync(notificationId);
	// 		dispatch(markAsRead(notificationId));
	// 		message.success('已标记为已读');
	// 	} catch (error) {
	// 		console.error(error);
	// 		message.error('标记失败，请重试');
	// 	}
	// };

	// 全部通知标记为已读
	const handleMarkAllAsRead = async () => {
		if (unreadCount === 0) {
			// message.info('没有未读通知');
			return;
		}

		try {
			await markAllAsReadMutation.mutateAsync({});
			dispatch(markAllAsRead());
			// message.success(`已将 ${unreadCount} 条通知标记为已读`);
		} catch (error) {
			console.error(error);
			// message.error('批量标记失败，请重试');
		}
	};

	//进入此页面并离开后，将用户全部通知标记为已读
	useEffect(() => {
		return () => {
			handleMarkAllAsRead();
		};
	}, []);

	const handlePageChange = (p: number) => {
		dispatch(setPage(p));
	};

	//通知内容的md展示
	const Content = ({
		content,
		title,
		is_read
	}: {
		content: string;
		title: string;
		is_read: boolean;
	}) => {
		return (
			<ClickCollapsible
				title={
					<span className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{title}</span>
				}
				icon={<Text className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-800'}`} />}
				defaultOpen={!is_read}
				enablePreload={true}
			>
				<Suspense fallback={<div>加载编辑器...</div>}>
					<MilkdownEditor isCardMode={true} mdSelector={() => content || '暂无内容'} />
				</Suspense>
			</ClickCollapsible>
		);
	};

	return (
		<AntdThemeHoc>
			<div>
				<PageHeader title="通知中心" />
				<div className="pl-10 pr-10">
					{/* 标签页和全部已读按钮 */}
					<div className="flex justify-between items-center mb-4">
						<Tabs
							defaultActiveKey="unread"
							onChange={key => setFilter(key as 'all' | 'unread')}
							items={[
								{
									key: 'unread',
									label: `未读 (${unreadCount || 0})`
								},
								{
									key: 'all',
									label: `全部 (${total || 0})`
								}
							]}
						/>
						{/* 全部已读按钮 */}
						{/* {unreadCount > 0 && (
							<Button
								type="primary"
								onClick={handleMarkAllAsRead}
								loading={markAllAsReadMutation.isPending}
								className="ml-4"
							>
								全部已读 ({unreadCount})
							</Button>
						)} */}
					</div>

					{/* 通知列表 */}
					<List
						itemLayout="horizontal"
						dataSource={notifications}
						renderItem={(item: UserNotification) => (
							<List.Item
							// actions={[
							// 	!item.is_read && (
							// 		<Button
							// 			type="link"
							// 			onClick={() => handleMarkAsRead(item.id)}
							// 			loading={markAsReadMutation.isPending}
							// 		>
							// 			已读
							// 		</Button>
							// 	)
							// ]}
							>
								<List.Item.Meta
									// title={
									// 	<Badge dot={!item.is_read}>
									// 		<span className=" text-lg font-semibold">{item.title}</span>
									// 	</Badge>
									// }
									description={
										<Content content={item.content} title={item.title} is_read={item.is_read} />
									}
								/>
							</List.Item>
						)}
					/>

					{/* 分页 */}
					{showPagenition && (
						<Pagination
							current={page}
							total={total || 0}
							pageSize={limit}
							onChange={handlePageChange}
							style={{ marginTop: '16px', textAlign: 'right' }}
						/>
					)}
				</div>
			</div>
		</AntdThemeHoc>
	);
};

export default UserNotificationPage;
