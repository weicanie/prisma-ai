import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetUserNotifications } from '@/services/manage/notifaction-user';
import { selectLimit, selectPage, selectUnreadCount, setNotifications } from '@/store/notification';
import { BellRing } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Notice() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const page = useSelector(selectPage);
	const limit = useSelector(selectLimit);

	const { data } = useGetUserNotifications({ page, limit });
	const unreadCount = useSelector(selectUnreadCount);

	useEffect(() => {
		if (data?.data) {
			dispatch(setNotifications(data.data));
		}
	}, [data, dispatch]);

	const handleClick = () => {
		navigate('/main/notification');
	};

	return (
		<>
			<Button
				size="icon"
				className="size-8 dark:bg-transparent group-data-[collapsible=icon]:opacity-0 relative"
				variant="outline"
				onClick={handleClick}
			>
				<BellRing className="dark:text-white!" />
				{/* 未读消息数量徽章 */}
				{unreadCount > 0 && (
					<Badge
						variant="destructive"
						className="absolute -top-[6px] -right-[5px] h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full min-w-0 z-10"
					>
						{unreadCount > 99 ? '99+' : unreadCount}
					</Badge>
				)}
			</Button>
		</>
	);
}
