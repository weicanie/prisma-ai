import React, { type PropsWithChildren } from 'react';

interface PageHeaderProps extends PropsWithChildren {
	title?: string;
	description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children }) => {
	return (
		<>
			<div className="relative h-fit p-8 border-b-1 mb-10">
				<div className="flex items-center justify-between space-y-2">
					<div>
						<h2 className="mb-2 text-2xl font-bold tracking-tight">{title}</h2>
						<p className="text-muted-foreground">{description}</p>
					</div>
				</div>
				<div className="absolute right-10 top-9 flex gap-x-4">{children}</div>
			</div>
		</>
	);
};
