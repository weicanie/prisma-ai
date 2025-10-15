import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { memo, useState } from 'react';
import { useTheme } from '../../../utils/theme';
import UserConfigUpdate from './Update';

/**
 * 用户配置管理主页面
 *
 * 功能特性:
 * - 配置展示: 以卡片形式展示所有配置项的状态
 * - 配置编辑: 完整的表单编辑界面，支持所有配置项
 * - 快速更新: 提供常用配置项的快速编辑功能
 * - 本地存储: 所有配置数据存储在浏览器localStorage中
 * - 数据验证: 对配置数据进行完整性和有效性验证
 * - 导入导出: 支持JSON格式的配置导入导出
 *
 * 用户数据配置项包括:
 * - LLM配置: DeepSeek, OpenAI, Google AI (API密钥和基础URL)
 * - 向量数据库: Pinecone (API密钥，必填项)
 * - 搜索服务: SerpAPI (API密钥)
 *
 */
const UserConfigPage = memo(() => {
	const [refreshKey, setRefreshKey] = useState(0);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';
	// 处理配置更新
	const handleConfigUpdate = () => {
		setRefreshKey(prev => prev + 1);
	};
	// 切换密钥显示状态
	const toggleSecrets = () => {
		setShowSecrets(!showSecrets);
	};
	const [showSecrets, setShowSecrets] = useState(false);

	return (
		<div className="w-full h-full flex flex-col">
			{/* 页面标题 */}
			<div className="flex-shrink-0 p-6 border-b">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">用户配置管理</h1>
						<p className="text-muted-foreground mt-1">
							管理应用程序的各项配置，包括API密钥、服务端点等设置
						</p>
					</div>
					<Button
						variant="outline"
						onClick={toggleSecrets}
						className={
							isDark
								? 'border-gray-600 text-gray-300 hover:bg-gray-700'
								: 'border-gray-300 text-gray-700 hover:bg-gray-50'
						}
					>
						{showSecrets ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
						{showSecrets ? '隐藏值' : '显示值'}
					</Button>
				</div>
			</div>

			{/* 主要内容区域 */}
			<div className="flex-1 overflow-hidden px-6 pb-7">
				<UserConfigUpdate onUpdate={handleConfigUpdate} showSecrets={showSecrets} />
			</div>
		</div>
	);
});

export default UserConfigPage;
