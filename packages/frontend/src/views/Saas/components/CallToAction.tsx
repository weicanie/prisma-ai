import backgroundImage from '@/assets/images/background-call-to-action.jpg';
import { isUserLogin } from '../../../utils/isUserLogin';
import { Button } from './c-cpns/Button';
import { Container } from './c-cpns/Container';

export function CallToAction() {
	const isLogin = isUserLogin();

	return (
		<section id="get-started-today" className="relative overflow-hidden bg-blue-600 py-32">
			<img
				className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
				src={backgroundImage}
				alt=""
				width={2347}
				height={1244}
			/>
			<Container className="relative">
				<div className="mx-auto max-w-lg text-center">
					<h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
						别再海投了，让简历主动替你出击
					</h2>
					<p className="mt-4 text-lg tracking-tight text-white">
						用 Prisma‑AI，3 分钟把项目写出亮点，1 次点击匹配最合适的岗位， AI
						还会把“想实现的亮点”变成“真的做到”。
					</p>
					{isLogin ? (
						<Button to="/main" color="white" className="mt-10">
							进入工作台
						</Button>
					) : (
						<Button to="/register" color="white" className="mt-10">
							免费体验一下
						</Button>
					)}
				</div>
			</Container>
		</section>
	);
}
