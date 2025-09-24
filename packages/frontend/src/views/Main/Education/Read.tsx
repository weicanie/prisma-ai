import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../query/config';
import { EducationQueryKey } from '../../../query/keys';
import { findOneEducation } from '../../../services/education';

const EducationRead: React.FC = () => {
	const { id } = useParams();
	const { data, status } = useCustomQuery(
		[EducationQueryKey.Educations, id],
		() => findOneEducation(id as string),
		{
			enabled: Boolean(id)
		}
	);

	if (status === 'pending') return <div></div>;
	if (status === 'error') return <div>错误:{data?.message}</div>;
	const edu = data.data;

	if (!edu) return <div className="text-center text-gray-500">没有找到教育经历</div>;

	return (
		<div className="container mx-auto px-4 pb-8">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-xl">{edu.school}</CardTitle>
					<CardDescription>
						{edu.major} · {edu.degree}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>入学：{edu.startDate?.slice(0, 10)}</div>
						<div>毕业：{edu.endDate?.slice(0, 10) || '在读/—'}</div>
						{edu.gpa && <div>绩点：{edu.gpa}</div>}
						<div>是否展示：{edu.visible ? '是' : '否'}</div>
					</div>
					{edu.description && <div className="mt-4 whitespace-pre-wrap">{edu.description}</div>}
				</CardContent>
			</Card>
		</div>
	);
};

export default EducationRead;
