'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotFound() {
	const pathname = usePathname();

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
			<div className="max-w-2xl w-full text-center space-y-8">
				{/* 404 图标和标题 */}
				<div className="space-y-4">
					<div className="text-8xl font-bold text-primary animate-pulse">404</div>
					<h1 className="text-4xl font-bold text-foreground">页面未找到</h1>
					<p className="text-lg text-muted-foreground">抱歉，您访问的页面不存在或已被移除</p>
				</div>

				{/* 当前路由信息 */}
				<div className="bg-card border rounded-lg p-6 space-y-4">
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<Search className="h-4 w-4" />
						<span>当前路由：</span>
					</div>
					<div className="bg-muted rounded-md p-3 font-mono text-sm break-all">
						<code className="text-foreground">{pathname || '/'}</code>
					</div>
				</div>

				{/* 操作按钮 */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button asChild size="lg" className="w-full sm:w-auto">
						<Link href="/">
							<Home className="h-4 w-4 mr-2" />
							返回首页
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="w-full sm:w-auto"
						onClick={() => window.history.back()}
					>
						<button>
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回上页
						</button>
					</Button>
				</div>

				{/* 帮助信息 */}
				<div className="text-sm text-muted-foreground space-y-2">
					<p>如果您认为这是一个错误，请检查URL是否正确</p>
					<p>或者尝试使用导航菜单访问其他页面</p>
				</div>
			</div>
		</div>
	);
}
