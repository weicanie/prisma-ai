import { Button, Form, Input, Select, Slider, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { getTask, uploadArticle } from './services';

const { TextArea } = Input;
const { Option } = Select;

const ArticleUploadForm: React.FC = () => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	const [types, setTypes] = useState<string[]>([]);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const taskData = await getTask();
				setTypes(taskData.data.map(itme => itme.type));
			} catch (error) {
				console.error('Failed to fetch tasks:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchTasks();
	}, []);

	// 题目类别
	const articleTypes = types;

	const onFinish = async (values: any) => {
		console.log('🚀 ~ onFinish ~ values:', values);
		try {
			setLoading(true);
			const response = await uploadArticle(values);
			if (response.status !== 200) {
				//@ts-ignore
				message.error(response.message);
				return;
			}
			message.success('题目上传成功！');
			form.resetFields();
		} catch (error) {
			message.error('题目上传失败，请重试');
		} finally {
			setLoading(false);
		}
	};

	return (
		/* tailwind 封装的css 实现响应式

      max-w-2xl、text-2xl、mb-6: rem
      mx-auto: 让容器在水平方向上居中
      w-full: 让按钮宽度占满父容器

    */
		<div className="mx-auto p-6 bg-white rounded shadow">
			<h1 className="text-2xl font-bold mb-6">
				你好! 请上传完整的题目数据:
				<a
					href="https://fe.ecool.fun/topic-list"
					target="_blank"
					// noopener: 防止新页面通过 window.opener 访问原页面的 Window 对象
					//noreferrer: 阻止将原页面信息传递给新页面
					rel="noopener noreferrer"
					style={{ color: 'blue' }}
				>
					目标网站地址
				</a>
			</h1>

			<Form
				form={form}
				layout="vertical"
				onFinish={onFinish}
				autoComplete="off"
				style={{ backgroundColor: '#f0f2f5' }}
			>
				<Form.Item
					name="title"
					label={<h2 className="text-lg font-bold mb-6">1.题目</h2>}
					rules={[{ required: true, message: '请输入题目标题' }]}
				>
					<Input placeholder="请输入题目标题" />
				</Form.Item>

				<Form.Item
					name="content"
					label={<h2 className="text-lg font-bold mb-6">2.答案</h2>}
					rules={[
						{ required: true, message: '请输入题目答案' },
						{ min: 1, message: '内容不能少于1个字符' }
					]}
				>
					<TextArea placeholder="题目答案" rows={6} />
				</Form.Item>

				<Form.Item
					name="gist"
					label={<h2 className="text-lg font-bold mb-6">3.答案要点</h2>}
					rules={[{ required: false, message: '请输入题目要点,没有就忽略' }]}
				>
					<TextArea placeholder="请输入题目要点,没有就忽略" rows={4} />
				</Form.Item>

				<Form.Item
					name="type"
					label={<h2 className="text-lg font-bold mb-6">4.题目类别</h2>}
					rules={[{ required: true, message: '请选择题目类别' }]}
				>
					<Select placeholder="请选择题目类别">
						{articleTypes.map(type => (
							<Option key={type} value={type}>
								{type}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item
					name="hard"
					label={<h2 className="text-lg font-bold mb-6">5.题目难度星级</h2>}
					rules={[{ required: false, message: '请选择题目难度' }]}
				>
					<Slider
						min={1}
						max={5}
						marks={{
							1: '⭐',
							2: '⭐⭐',
							3: '⭐⭐⭐',
							4: '⭐⭐⭐⭐',
							5: '⭐⭐⭐⭐⭐'
						}}
						defaultValue={1}
					/>
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" loading={loading} className="w-full">
						提交题目
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};

export default ArticleUploadForm;
