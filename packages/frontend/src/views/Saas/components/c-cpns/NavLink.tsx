import { Link } from 'react-router-dom';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (href.startsWith('#')) {
			// 阻止 react-router 的默认导航行为
			e.preventDefault();
			const id = href.substring(1);
			const element = document.getElementById(id);
			if (element) {
				// 平滑滚动到目标元素
				element.scrollIntoView({ behavior: 'smooth' });
				// 手动更新 URL 的 hash，而不会导致页面重新加载
				window.history.pushState(null, '', href);
			}
		}
	};

	return (
		<Link
			to={href}
			onClick={handleClick}
			className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
		>
			{children}
		</Link>
	);
}
