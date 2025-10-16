/**
 * 网站服务状态管理页面。
 *
 * 接口调用：
 * 1、获取网站服务状态
 * 2、进入更新、维护状态，并发送向全体用户的网站通知
 * 3、进入启用状态，并发送向全体用户的邮件通知
 *
 * 页面结构：
 * 1、网站服务状态展示卡片
 * 2、进入更新、维护状态按钮
 * 3、进入启用状态按钮
 * 4、通知撰写表单
 *
 */
import { WebsiteStatus } from '@prisma-ai/shared';
import { Button, Card, message, Spin } from 'antd';
import React from 'react';
import AntdThemeHoc from '../../../components/AntdThemeHoc';
import { Badge } from '../../../components/ui/badge';
import { useGetWebsiteStatus, useUpdateWebsiteStatus } from '../../../services/manage/service';
import { PageHeader } from '../components/PageHeader';

const ServiceManagePage: React.FC = () => {
	const { data, isLoading } = useGetWebsiteStatus();
	const updateStatusMutation = useUpdateWebsiteStatus();

	const handleUpdateStatus = async (status: WebsiteStatus) => {
		try {
			await updateStatusMutation.mutateAsync(status);
			message.success('服务状态已更新');
		} catch (error) {
			console.error(error);
			message.error('操作失败');
		}
	};

	if (isLoading) {
		return <Spin />;
	}

	return (
		<AntdThemeHoc>
			<div>
				<PageHeader title="服务状态管理" />
				<div className="pl-10 pr-10">
					<Card title="当前服务状态">
						<Badge variant="default" className="block mb-3">
							{data?.data.status || '未知'}
						</Badge>
						<Badge variant="default" className="block mb-3">
							{data?.data.pendingTasks ?? '未知'}个任务阻塞中
						</Badge>
						<Badge variant="default" className="block mb-3">
							{data?.data.runningTasks ?? '未知'}个任务运行中
						</Badge>
						<Button
							onClick={() => handleUpdateStatus(WebsiteStatus.ONLINE)}
							type="primary"
							style={{ marginRight: '8px' }}
						>
							设为运行中
						</Button>
						<Button onClick={() => handleUpdateStatus(WebsiteStatus.MAINTENANCE)} danger>
							设为维护中
						</Button>
					</Card>
				</div>
			</div>
		</AntdThemeHoc>
	);
};

export default ServiceManagePage;
