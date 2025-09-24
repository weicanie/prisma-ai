import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { CareerQueryKey } from '../../../query/keys';
import { findOneCareer } from '../../../services/career';

const CareerRead: React.FC = () => {
	const { id } = useParams();
	const { data, status } = useCustomQuery(
		[CareerQueryKey.Careers, id],
		() => findOneCareer(id as string),
		{
			enabled: Boolean(id)
		}
	);

	if (status === 'pending') return <div></div>;
	if (status === 'error') return <div>错误:{data?.message}</div>;
	const career = data.data;

	if (!career) return <div className="text-center text-gray-500">没有找到工作经历</div>;

	return (
		<div className="container mx-auto px-4 pb-8">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-xl">{career.company}</CardTitle>
					<CardDescription>{career.position}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>入职：{career.startDate?.slice(0, 10)}</div>
						<div>离职：{career.endDate?.slice(0, 10) || '在职'}</div>
						<div>是否展示：{career.visible ? '是' : '否'}</div>
					</div>
					{career.details && <div className="mt-4 whitespace-pre-wrap">{career.details}</div>}
				</CardContent>
			</Card>
		</div>
	);
};

export default CareerRead;
