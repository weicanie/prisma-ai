/**
 * 用户管理页面
 *
 * 接口调用：
 * 1、获取用户列表
 * 2、封禁用户
 * 3、解封用户
 *
 * 页面结构：
 * 1、用户列表
 * 2、用户封禁状态展示
 * 3、用户封禁状态更新按钮
 */
import type { UserProfile } from '@prisma-ai/shared';
import { ViolationType } from '@prisma-ai/shared';
import { Button, Input, Modal, Pagination, Table, Tabs, message } from 'antd';
import React, { useState } from 'react';
import AntdThemeHoc from '../../../components/AntdThemeHoc';
import {
	useBanUser,
	useGetUsers,
	useGetViolations,
	useRecordViolation,
	useUnbanUser
} from '../../../services/manage/user';
import { PageHeader } from '../components/PageHeader';

const UserManagePage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
	const [banReason, setBanReason] = useState('');
	const [isBanModalVisible, setIsBanModalVisible] = useState(false);
	const [isViolationModalVisible, setIsViolationModalVisible] = useState(false);
	const [isViewViolationsModalVisible, setIsViewViolationsModalVisible] = useState(false);
	const [violationType, setViolationType] = useState<ViolationType>(ViolationType.junkContent);
	const [violationDescription, setViolationDescription] = useState('');

	const { data, isLoading } = useGetUsers({ page, limit });
	const banUserMutation = useBanUser();
	const recordViolationMutation = useRecordViolation();
	const { data: violationsData, isLoading: violationsLoading } = useGetViolations(
		selectedUser?.id || 0
	);
	const unbanUserMutation = useUnbanUser();

	const handleBan = async () => {
		if (!selectedUser) return;
		try {
			await banUserMutation.mutateAsync({ userId: selectedUser.id, reason: banReason });
			message.success('用户已封禁');
			setSelectedUser(null);
			setBanReason('');
		} catch (error) {
			console.error(error);
			message.error('操作失败');
		}
	};

	const handleUnban = async (userId: number) => {
		try {
			await unbanUserMutation.mutateAsync(userId);
			message.success('用户已解封');
		} catch (error) {
			console.error(error);
			message.error('操作失败');
		}
	};

	const handleRecordViolation = async () => {
		if (!selectedUser) return;
		try {
			await recordViolationMutation.mutateAsync({
				userId: selectedUser.id,
				type: violationType,
				description: violationDescription
			});
			message.success('违规已记录');
			setIsViolationModalVisible(false);
			setViolationDescription('');
		} catch (error) {
			console.error(error);
			message.error('操作失败');
		}
	};

	const columns = [
		//这里的width由于处于flex布局中，只是设置一个基础宽度（min-w、max-w、flex-basis、width），会伸缩
		{ title: 'ID', dataIndex: 'id', key: 'id', width: 50, fixed: 'left' as const },
		{ title: '用户名', dataIndex: 'username', key: 'username', width: 100, ellipsis: true },
		{ title: '邮箱', dataIndex: 'email', key: 'email', width: 100, ellipsis: true },
		{
			title: '状态',
			dataIndex: 'is_banned',
			key: 'is_banned',
			render: (is_banned: boolean) => (is_banned ? '已封禁' : '正常'),
			width: 100
		},
		{
			title: '操作',
			key: 'action',
			render: (_: unknown, record: UserProfile) => (
				<span>
					{record.is_banned ? (
						<Button onClick={() => handleUnban(record.id)} type="link">
							解封
						</Button>
					) : (
						<Button
							onClick={() => {
								setSelectedUser(record);
								setIsBanModalVisible(true);
							}}
							type="link"
							danger
						>
							封禁
						</Button>
					)}
					<Button
						onClick={() => {
							setSelectedUser(record);
							setIsViolationModalVisible(true);
						}}
						type="link"
					>
						记录违规
					</Button>
					<Button
						onClick={() => {
							setSelectedUser(record);
							setIsViewViolationsModalVisible(true);
						}}
						type="link"
					>
						查看违规
					</Button>
				</span>
			),
			width: 300
		}
	];

	const violationColumns = [
		{ title: 'ID', dataIndex: 'id', key: 'id' },
		{ title: '违规类型', dataIndex: 'type', key: 'type' },
		{ title: '违规描述', dataIndex: 'description', key: 'description' },
		{
			title: '时间',
			dataIndex: 'create_at',
			key: 'create_at',
			render: (date: string) => new Date(date).toLocaleString()
		}
	];

	return (
		<AntdThemeHoc>
			<div>
				<PageHeader title="用户管理" />
				<div className="pl-10 pr-10">
					<Table
						dataSource={data?.data.users}
						columns={columns}
						rowKey="id"
						loading={isLoading}
						pagination={false}
						//表格宽度（flex盒子）低于x时触发横向滚动
						//设置为所设列宽的和，表示列伸展为0时触发横向滚动
						scroll={{ x: 650 }}
					/>
					<Pagination
						current={page}
						total={data?.data.total || 0}
						pageSize={limit}
						onChange={p => setPage(p)}
						style={{ marginTop: '16px', textAlign: 'right' }}
					/>

					{selectedUser && (
						<Modal
							title={`封禁用户: ${selectedUser.username}`}
							open={isBanModalVisible}
							onOk={handleBan}
							onCancel={() => {
								setIsBanModalVisible(false);
								setSelectedUser(null);
							}}
						>
							<Input.TextArea
								rows={4}
								placeholder="请输入封禁原因"
								value={banReason}
								onChange={e => setBanReason(e.target.value)}
							/>
						</Modal>
					)}

					{selectedUser && (
						<Modal
							title={`记录违规: ${selectedUser.username}`}
							open={isViolationModalVisible}
							onOk={handleRecordViolation}
							onCancel={() => {
								setIsViolationModalVisible(false);
								setSelectedUser(null);
							}}
						>
							<Tabs
								defaultActiveKey={ViolationType.junkContent}
								onChange={key => setViolationType(key as ViolationType)}
							>
								<Tabs.TabPane tab="上传垃圾内容" key={ViolationType.junkContent} />
								<Tabs.TabPane tab="上传敏感内容" key={ViolationType.sensitiveContent} />
								<Tabs.TabPane tab="其他" key={ViolationType.other} />
							</Tabs>
							<Input.TextArea
								rows={4}
								placeholder="请输入违规描述"
								value={violationDescription}
								onChange={e => setViolationDescription(e.target.value)}
							/>
						</Modal>
					)}

					{selectedUser && (
						<Modal
							title={`查看违规: ${selectedUser.username}`}
							open={isViewViolationsModalVisible}
							onCancel={() => {
								setIsViewViolationsModalVisible(false);
								setSelectedUser(null);
							}}
							footer={null}
						>
							<Table
								dataSource={violationsData?.data}
								columns={violationColumns}
								rowKey="id"
								pagination={false}
								loading={violationsLoading}
							/>
						</Modal>
					)}
				</div>
			</div>
		</AntdThemeHoc>
	);
};

export default UserManagePage;
