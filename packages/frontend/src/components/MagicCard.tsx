'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTheme } from '@/utils/theme.tsx';

import type { PropsWithChildren } from 'react';
import { MagicCard } from './magicui/magic-card';
type PropsType = PropsWithChildren<{
	cardTitle: string;
	contentPadding?: number;
}>;

export function MagicCardWrapper({ cardTitle, children, contentPadding = 4 }: PropsType) {
	const { theme } = useTheme();
	return (
		<Card className="p-0 max-w-lg w-full shadow-none border-none">
			<MagicCard gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'} className="p-0">
				<CardHeader
					className="border-b border-border p-4 [.border-b]:pb-4"
					style={{
						color: 'rgba(236, 29, 39, 0.777)',
						fontSize: '2rem'
					}}
				>
					<CardTitle>{cardTitle}</CardTitle>
				</CardHeader>
				<CardContent className={`p-${contentPadding}`}>{children}</CardContent>
				{/* <CardFooter className="p-4 border-t border-border [.border-t]:pt-4">
					<Button className="w-full">Sign In</Button>
				</CardFooter> */}
			</MagicCard>
		</Card>
	);
}
