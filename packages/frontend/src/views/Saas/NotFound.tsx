import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Prism from '../../components/Prism';
import Wall from '../../components/Wall';
import { useTheme } from '../../utils/theme';
import { Button } from './components/c-cpns/Button';
import { Logo } from './components/c-cpns/Logo';
import { SlimLayout } from './components/c-cpns/SlimLayout';
export default function NotFound() {
	const { resolvedTheme } = useTheme();

	const [isLight, setIsLight] = useState(false);
	useEffect(() => {
		setTimeout(() => {
			setIsLight(true);
		}, 500);
	}, []);

	const background = (
		<div className="flex h-screen w-full flex-col items-center justify-center bg-background z-0 lg:flex-row">
			<div className="w-full lg:max-w-[40rem] lg:flex-1 relative bottom-2">
				<Prism light={isLight} className="z-[2]" />
				<div className="w-full relative bottom-20 text-center text-3xl text-white font-serif  z-[2]">
					PrismaAI
				</div>
			</div>

			{resolvedTheme === 'light' && (
				<Wall play={isLight} duration={1500} delay={1500} className="z-[1]"></Wall>
			)}
		</div>
	);
	return (
		<div className="h-screen">
			<SlimLayout background={background}>
				<div className="flex">
					<Link to="/" aria-label="Home">
						<Logo className="h-10 w-auto" />
					</Link>
				</div>
				<p className="mt-20 text-sm font-medium text-gray-700">404</p>
				<h1 className="mt-3 text-lg font-semibold text-gray-900">页面不存在</h1>
				<p className="mt-3 text-sm text-gray-700">很抱歉，您访问的页面不存在。</p>
				<Button to="/" className="mt-10">
					返回首页
				</Button>
			</SlimLayout>
		</div>
	);
}
