import { Card, Col, List, Progress, Row, Spin, Statistic, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { getTask } from './services';

const { Title, Text } = Typography;

export interface QuestionTask {
	type: string;
	count: number;
	finish_count: number;
}

const Task: React.FC = () => {
	const [tasks, setTasks] = useState<QuestionTask[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const taskData = await getTask();
				setTasks(taskData.data);
			} catch (error) {
				console.error('Failed to fetch tasks:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchTasks();
	}, []);

	return (
		<div style={{ padding: '20px', backgroundColor: '#f0f2f5' }}>
			<Title level={2}>任务列表</Title>

			{loading ? (
				<div style={{ textAlign: 'center', padding: '40px' }}>
					<Spin size="large" />
				</div>
			) : (
				<>
					{/* 进度列表 */}
					<List
						grid={{ gutter: 16, column: 1 }}
						dataSource={tasks}
						renderItem={task => {
							const percent =
								task.count > 0 ? Math.round((task.finish_count / task.count) * 100) : 0;
							return (
								<List.Item>
									<Card>
										<Title level={4}>{task.type}</Title>
										<Row align="middle" gutter={16}>
											<Col span={18}>
												<Progress
													percent={percent}
													status={percent === 100 ? 'success' : 'active'}
													strokeWidth={10}
												/>
											</Col>
											<Col span={6}>
												<Statistic
													value={task.finish_count}
													suffix={`/ ${task.count}`}
													valueStyle={{ color: percent === 100 ? '#3f8600' : '#1890ff' }}
												/>
											</Col>
										</Row>
										<Text type="secondary">
											已上传 {task.finish_count} / {task.count} 个题目数据
										</Text>
									</Card>
								</List.Item>
							);
						}}
					/>
				</>
			)}
		</div>
	);
};

export default Task;
