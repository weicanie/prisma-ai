/* eslint-disable @next/next/no-img-element */

'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/lib/utils';
type ChoiceCardProps = {
	title: string;
	description: string;
	href?: string;
	className?: string;
	icon?: React.ReactNode;
};
export function ChoiceCard({ href, title, description, className, icon }: ChoiceCardProps) {
	const navigate = useNavigate();
	return (
		<Card
			className={cn(
				'relative  shadow-none rounded-[5px] border-2 border-blue-950 bg-transparent hover:bg-[rgb(31,34,35)] cursor-pointer ',
				className
			)}
			onClick={() => {
				href && navigate(href);
			}}
		>
			<CardHeader>{icon}</CardHeader>
			<CardContent>
				<CardTitle className="text-2xl text-center text-zinc-300 mb-3">{title}</CardTitle>
				<CardDescription className="text-1xl text-center text-zinc-400">
					{description}
				</CardDescription>
			</CardContent>
		</Card>
	);
}
