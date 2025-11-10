import { useIsMobile } from '../../../hooks/use-mobile';
import { isUserLogin } from '../../../utils/isUserLogin';
import { Button } from './c-cpns/Button';
import { Container } from './c-cpns/Container';

export function Hero() {
	const isLogin = isUserLogin();
	const isMobile = useIsMobile();
	console.log(isMobile);
	return (
		<Container className="pt-20 pb-56 text-center lg:pt-32">
			<h1
				className={`mx-auto max-w-4xl font-display font-medium tracking-tight text-slate-900 sm:text-7xl   ${isMobile ? 'text-4xl' : 'text-5xl'}`}
			>
				魔历，
				<span className="relative whitespace-nowrap text-blue-600">
					<svg
						aria-hidden="true"
						viewBox="0 0 418 42"
						className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-300/70"
						preserveAspectRatio="none"
					>
						<path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
					</svg>
					<span className="relative">简历变offer的魔法</span>
				</span>
			</h1>
			<p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
				开源免费，从简历到 offer，优化你的项目，定制你的简历，为你匹配工作，并帮助你做好面试准备
			</p>
			<div className="mt-10 flex justify-center gap-x-6">
				{isLogin ? (
					<Button to="/main">进入工作台</Button>
				) : (
					<Button to="/register">免费开始使用</Button>
				)}
				<Button to="https://github.com/weicanie/prisma-ai" variant="outline">
					{/* <svg
						aria-hidden="true"
						className="h-3 w-3 flex-none fill-blue-600 group-active:fill-current"
					>
						<path d="m9.997 6.91-7.583 3.447A1 1 0 0 1 1 9.447V2.553a1 1 0 0 1 1.414-.91L9.997 5.09c.782.355.782 1.465 0 1.82Z" />
					</svg> */}
					<svg
						className="size-6 fill-slate-500 group-hover:fill-slate-700"
						aria-hidden="true"
						viewBox="0 0 24 24"
					>
						<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
					</svg>
					<span className="ml-3">了解更多</span>
				</Button>
			</div>
			{/* 企业背书 */}

			{/* <div className="mt-36 lg:mt-44">
				<p className="font-display text-base text-slate-900">已有众多开发者在这里成长</p>
				<ul
					role="list"
					className="mt-8 flex items-center justify-center gap-x-8 sm:flex-col sm:gap-x-0 sm:gap-y-10 xl:flex-row xl:gap-x-12 xl:gap-y-0"
				>
					{[
						[
							{ name: 'Transistor', logo: logoTransistor },
							{ name: 'Tuple', logo: logoTuple },
							{ name: 'StaticKit', logo: logoStaticKit }
						],
						[
							{ name: 'Mirage', logo: logoMirage },
							{ name: 'Laravel', logo: logoLaravel },
							{ name: 'Statamic', logo: logoStatamic }
						]
					].map((group, groupIndex) => (
						<li key={groupIndex}>
							<ul
								role="list"
								className="flex flex-col items-center gap-y-8 sm:flex-row sm:gap-x-12 sm:gap-y-0"
							>
								{group.map(company => (
									<li key={company.name} className="flex">
										<img src={company.logo} alt={company.name} />
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</div> */}
		</Container>
	);
}
