import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import type { PropsWithChildren } from 'react';

const routeMap: Record<string, string> = {
	介绍: '/introduce',

	通用简历: '/resume',
	项目经验上传: '/resume/upload',
	'项目经验评估、改进': '/resume/polish',
	项目经验亮点挖掘: '/resume/mine',
	项目经验延申八股: '/resume/expand',

	专用简历: '/job',

	面向offer学习: '/offer'
};

type propsType = PropsWithChildren<{
	first: string;
	second: string;
}>;
export function BreadcrumbDemo({ first, second }: propsType) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={routeMap[first]}>{first}</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href={routeMap[second]}>{second}</BreadcrumbLink>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
