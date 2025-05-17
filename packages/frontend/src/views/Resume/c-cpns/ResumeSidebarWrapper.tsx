import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ResumeSidebar } from './ResumeSidebar';
// export function CustomTrigger() {
// 	const { toggleSidebar } = useSidebar();

// 	return <button onClick={toggleSidebar}>Toggle Sidebar</button>;
// }
export default function ResumeSidebarWrapper({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider
			//宽度设置方式
			style={{
				//@ts-expect-error
				'--sidebar-width': '20rem',
				'--sidebar-width-mobile': '20rem'
			}}
			defaultOpen={true}
			//这两个属性会开启受控模式
			// onOpenChange={open => {
			// 	console.log('open!', open);
			// }}
			// open={open}
		>
			<ResumeSidebar />
			<SidebarTrigger />
			<div className="flex flex-col w-full h-full pt-1 space-y-6">{children}</div>
		</SidebarProvider>
	);
}
