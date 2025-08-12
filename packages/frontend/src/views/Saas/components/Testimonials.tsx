import avatarImage1 from '@/assets/images/avatars/avatar-1.png';
import avatarImage2 from '@/assets/images/avatars/avatar-2.png';
import avatarImage3 from '@/assets/images/avatars/avatar-3.png';
import avatarImage4 from '@/assets/images/avatars/avatar-4.png';
import avatarImage5 from '@/assets/images/avatars/avatar-5.png';
import { Container } from './c-cpns/Container';

const testimonials = [
	[
		{
			content:
				'Prisma-AI 的项目分析功能简直是我的救星。它帮我挖掘出了我那些业余项目里被忽略的亮点，并清晰地阐述了它们的价值。我的简历因此大放异彩。',
			author: {
				name: 'Alex',
				role: '前端开发者',
				image: avatarImage1
			}
		},
		{
			content:
				'定制化简历功能太神奇了。以前我得花好几个小时为每个职位申请修改简历，现在几分钟内就能得到一份完美匹配的简历。这为我节省了大量时间和精力。',
			author: {
				name: 'Mia',
				role: '后端工程师',
				image: avatarImage4
			}
		}
	],
	[
		{
			content:
				'我之前很难找到真正适合我技能的职位。岗位匹配功能为我连接了那些我可能会错过的机会。感觉就像有了一个私人招聘顾问。',
			author: {
				name: 'Sam',
				role: '全栈开发者',
				image: avatarImage5
			}
		},
		{
			content:
				'将面试准备与 Anki 集成的想法非常棒。它让我的技术面试学习变得更高效、更有成效。我充满信心地参加了面试。',
			author: {
				name: 'Emily',
				role: '软件工程师',
				image: avatarImage2
			}
		}
	],
	[
		{
			content:
				'作为一名初级开发者，很难让自己的项目脱颖而出。Prisma-AI 帮助我重写了项目描述，突出了项目的影响力和技术挑战。我收到的招聘方回复也因此多了很多。',
			author: {
				name: 'Chris',
				role: '应届毕业生',
				image: avatarImage3
			}
		},
		{
			content:
				'从完善我的项目组合到顺利通过面试，Prisma-AI 在我整个求职过程中都是我的得力助手。对于任何正在寻找下一份工作的开发者来说，这都是一个不可或缺的工具。',
			author: {
				name: 'Jordan',
				role: 'DevOps 工程师',
				image: avatarImage4
			}
		}
	]
];

function QuoteIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg aria-hidden="true" width={105} height={78} {...props}>
			<path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z" />
		</svg>
	);
}

export function Testimonials() {
	return (
		<section
			id="testimonials"
			aria-label="What our customers are saying"
			className="bg-slate-50 py-20 sm:py-32"
		>
			<Container>
				<div className="mx-auto max-w-2xl md:text-center">
					<h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
						看看其他开发者如何评价我们
					</h2>
					<p className="mt-4 text-lg tracking-tight text-slate-700">
						了解 Prisma-AI 如何通过项目优化、简历定制、精准的岗位匹配和高效的面试准备，在求职过程中为他们提供帮助。
					</p>
				</div>
				<ul
					role="list"
					className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-3"
				>
					{testimonials.map((column, columnIndex) => (
						<li key={columnIndex}>
							<ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
								{column.map((testimonial, testimonialIndex) => (
									<li key={testimonialIndex}>
										<figure className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
											<QuoteIcon className="absolute top-6 left-6 fill-slate-100" />
											<blockquote className="relative">
												<p className="text-lg tracking-tight text-slate-900">
													{testimonial.content}
												</p>
											</blockquote>
											<figcaption className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
												<div>
													<div className="font-display text-base text-slate-900">
														{testimonial.author.name}
													</div>
													<div className="mt-1 text-sm text-slate-500">
														{testimonial.author.role}
													</div>
												</div>
												<div className="overflow-hidden rounded-full bg-slate-50">
													<img
														className="h-14 w-14 object-cover"
														src={testimonial.author.image}
														alt=""
														width={56}
														height={56}
													/>
												</div>
											</figcaption>
										</figure>
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}
