import React from 'react';

interface PageHeaderProps {
	title?: string;
	description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
	return (
		<>
			<div className=" h-fit p-8  border-b-1  mb-10">
				<div className="flex items-center justify-between space-y-2">
					<div>
						<h2 className="mb-2 text-2xl font-bold tracking-tight">{title}</h2>
						<p className="text-muted-foreground">{description}</p>
					</div>
				</div>
			</div>
		</>
	);
};
