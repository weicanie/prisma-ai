import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import { isUserLogin } from '../../../utils/isUserLogin';
import { Button } from './c-cpns/Button';
import { Container } from './c-cpns/Container';
import { Logo } from './c-cpns/Logo';
import { NavLink } from './c-cpns/NavLink';

function MobileNavLink({ to, children }: { to: string; children: React.ReactNode }) {
	return (
		<PopoverButton as={Link} to={to} className="block w-full p-2">
			{children}
		</PopoverButton>
	);
}

function MobileNavIcon({ open }: { open: boolean }) {
	return (
		<svg
			aria-hidden="true"
			className="h-3.5 w-3.5 overflow-visible stroke-slate-700"
			fill="none"
			strokeWidth={2}
			strokeLinecap="round"
		>
			<path
				d="M0 1H14M0 7H14M0 13H14"
				className={clsx('origin-center transition', open && 'scale-90 opacity-0')}
			/>
			<path
				d="M2 2L12 12M12 2L2 12"
				className={clsx('origin-center transition', !open && 'scale-90 opacity-0')}
			/>
		</svg>
	);
}

function MobileNavigation() {
	return (
		<Popover>
			<PopoverButton
				className="relative z-10 flex h-8 w-8 items-center justify-center focus:not-data-focus:outline-hidden"
				aria-label="Toggle Navigation"
			>
				{({ open }) => <MobileNavIcon open={open} />}
			</PopoverButton>
			<PopoverBackdrop
				transition
				className="fixed inset-0 bg-slate-300/50 duration-150 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in"
			/>
			<PopoverPanel
				transition
				className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-white p-4 text-lg tracking-tight text-slate-900 shadow-xl ring-1 ring-slate-900/5 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-150 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
			>
				{/* 手机端无法滚动至目标位置 */}
				{/* <NavLink href="#features">功能特性</NavLink>
				<NavLink href="#secondary-features">工作原理</NavLink>
				<NavLink href="#faq">常见问题</NavLink>
				<hr className="m-2 border-slate-300/40" /> */}
				<MobileNavLink to="/login">登录</MobileNavLink>
			</PopoverPanel>
		</Popover>
	);
}

export function Header() {
	const isLogin = isUserLogin();
	return (
		<header className="py-10 bg-white">
			<Container>
				<nav className="relative z-50 flex justify-between">
					<div className="flex items-center md:gap-x-12">
						<Link to="#" aria-label="Home">
							<Logo className="h-13 w-auto" />
						</Link>
						<div className="hidden md:flex md:gap-x-6">
							<NavLink href="#features">功能特性</NavLink>
							<NavLink href="#secondary-features">工作原理</NavLink>
							<NavLink href="#faq">常见问题</NavLink>
							{/* <NavLink href="#testimonials">用户评价</NavLink> */}
							{/* <NavLink href="#pricing">定价方案</NavLink> */}
						</div>
					</div>
					<div className="flex items-center gap-x-5 md:gap-x-8">
						<div className="hidden md:flex items-center gap-x-8">
							{!isLogin && <NavLink href="/login">登录</NavLink>}
							{isLogin ? (
								<Button to="/main" color="blue">
									<span>
										进入工作区
										{/* <span className="hidden lg:inline">今天就开始</span> */}
									</span>
								</Button>
							) : (
								<Button to="/register" color="blue">
									<span>
										免费注册
										{/* <span className="hidden lg:inline">今天就开始</span> */}
									</span>
								</Button>
							)}
						</div>

						<div className="-mr-1 md:hidden">
							<MobileNavigation />
						</div>
					</div>
				</nav>
			</Container>
		</header>
	);
}
