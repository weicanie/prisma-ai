import PageSkeleton from '@/components/PageSkeleton';
import { Separator } from '@/components/ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import { prefetchApps } from 'qiankun';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import { BreadcrumbNav } from './components/Breadcrumb';
import { AppSidebar } from './components/Siderbar/app-sidebar';
import { ThemeSwitcher } from './components/ThemeSwitcher';

// 自定义触发器
// function CustomTrigger() {
// const { toggleSidebar } = useSidebar();
// return <button onClick={toggleSidebar}>Toggle Sidebar</button>;
//}
function Main() {
	// 预加载微应用
	useEffect(() => {
		prefetchApps([
			{
				name: 'magic-resume',
				entry: `${import.meta.env.VITE_MAGIC_RESUME_BASE_URL}/mfe-entry.html`
			}
		]);
	}, []);

	const location = useLocation();

	return (
		<>
			<SidebarProvider
				//宽度设置方式
				// style={{
				// 	//@ts-expect-error
				// 	'--sidebar-width': '20rem',
				// 	'--sidebar-width-mobile': '20rem'
				// }}
				defaultOpen={true}
				//这两个属性会开启受控模式
				// onOpenChange={open => {
				// 	console.log('open!', open);
				// }}
				// open={open}
			>
				{/* 侧边栏 */}
				<AppSidebar variant="inset" />
				{/* 内容 */}
				<SidebarInset className="bg-global">
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4!" />
							<BreadcrumbNav></BreadcrumbNav>
							<ThemeSwitcher className={`fixed right-5  dark:bg-zinc-500/20!`}></ThemeSwitcher>
						</div>
					</header>
					{/* 路由到的组件 */}
					{/* 用于页面加载和知识库新建表单加载时显示骨架屏 */}
					<Suspense fallback={<PageSkeleton />}>
						{/* 添加淡入动画，避免页面切换时出现闪烁 */}
						<AnimatePresence initial={false} mode="sync">
							<motion.div
								key={location.pathname}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.18 }}
							>
								<Outlet />
							</motion.div>
						</AnimatePresence>
					</Suspense>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}

export default Main;
