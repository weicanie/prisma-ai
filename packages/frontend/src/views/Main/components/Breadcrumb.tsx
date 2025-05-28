import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { selectBreadRouterList } from '../../../store/bread-router';

export function BreadcrumbNav() {
	const list = useSelector(selectBreadRouterList, shallowEqual);
	const navigate = useNavigate();
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{list.map((item, index) => (
					<Fragment key={item.path}>
						<BreadcrumbItem className="cursor-pointer">
							<BreadcrumbLink
								onClick={() => {
									navigate(item.path);
								}}
							>
								{item.name}
							</BreadcrumbLink>
						</BreadcrumbItem>
						{index !== list.length - 1 && <BreadcrumbSeparator />}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
