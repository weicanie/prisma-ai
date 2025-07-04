import { Separator } from '@/components/ui/separator';
import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import { BreadcrumbNav } from './components/Breadcrumb';
import { AppSidebar } from './components/Siderbar/app-sidebar';
import { ThemeSwitcher } from './components/ThemeSwitcher';
// 自定义触发器
// function CustomTrigger() {
// const { toggleSidebar } = useSidebar();
// return <button onClick={toggleSidebar}>Toggle Sidebar</button>;
//}
//TODO 定制不同业务的表格搜索：搜索哪列？还是直接全局搜索？
function Main() {
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
							<ThemeSwitcher className="fixed right-5"></ThemeSwitcher>
						</div>
					</header>
					{/* 路由到的组件 */}
					<Outlet />
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}

export default Main;
