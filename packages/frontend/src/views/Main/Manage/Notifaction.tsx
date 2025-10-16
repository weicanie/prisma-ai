import type { CreateNotificationDto } from '@prisma-ai/shared';
import { Button, Form, Input, message, Modal, Pagination, Table } from 'antd';
import React, { useState } from 'react';
import AntdThemeHoc from '../../../components/AntdThemeHoc';
import {
	useCreateNotification,
	useGetNotificationsAdmin
} from '../../../services/manage/notifaction-admin';
import { PageHeader } from '../components/PageHeader';

const NotificationManagePage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();

	const { data, isLoading } = useGetNotificationsAdmin({ page, limit });
	const createNotificationMutation = useCreateNotification();

	const handleCreate = async (values: CreateNotificationDto) => {
		try {
			await createNotificationMutation.mutateAsync(values);
			message.success('通知已创建');
			setIsModalVisible(false);
			form.resetFields();
		} catch (error) {
			message.error(error instanceof Error ? error.message : '操作失败');
		}
	};

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
			fixed: 'left' as const,
			width: 60
		},
		{
			title: '标题',
			dataIndex: 'title',
			key: 'title',
			ellipsis: true,
			width: 100
		},
		{
			title: '内容',
			dataIndex: 'content',
			key: 'content',
			ellipsis: true,
			width: 100
		},
		{
			title: '目标用户',
			dataIndex: 'target_user',
			key: 'target_user',
			render: (id: number) => id || '全体',
			width: 60,
			minWidth: 150
		},
		{
			title: '已读',
			dataIndex: 'read_count',
			key: 'read_count',
			width: 60
		},
		{
			title: '未读',
			dataIndex: 'unread_count',
			key: 'unread_count',
			width: 60
		},
		{
			title: '创建时间',
			dataIndex: 'create_at',
			key: 'create_at',
			ellipsis: true,
			width: 100
		}
	];
	return (
		<AntdThemeHoc>
			<div>
				<PageHeader title="通知管理" />
				<div className="pl-10 pr-10">
					<Button
						onClick={() => setIsModalVisible(true)}
						type="primary"
						style={{ marginBottom: 16 }}
					>
						创建通知
					</Button>
					<Table
						dataSource={data?.data.notifications}
						columns={columns}
						rowKey="id"
						loading={isLoading}
						pagination={false}
						scroll={{ x: 540 }}
					/>
					<Pagination
						current={page}
						total={data?.data.total || 0}
						pageSize={limit}
						onChange={p => setPage(p)}
						style={{ marginTop: '16px', textAlign: 'right' }}
					/>
					<Modal
						title="创建通知"
						visible={isModalVisible}
						onOk={() => form.submit()}
						onCancel={() => setIsModalVisible(false)}
					>
						<Form form={form} onFinish={handleCreate} layout="vertical">
							<Form.Item name="title" label="标题" rules={[{ required: true }]}>
								<Input />
							</Form.Item>
							<Form.Item name="content" label="内容" rules={[{ required: true }]}>
								<Input.TextArea />
							</Form.Item>
							<Form.Item name="target_user" label="目标用户ID (留空表示全体用户)">
								<Input type="number" />
							</Form.Item>
						</Form>
					</Modal>
				</div>
			</div>
		</AntdThemeHoc>
	);
};

export default NotificationManagePage;
