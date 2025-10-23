import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { isOnline } from '@/utils/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UserConfig } from '@prisma-ai/shared';
import { Edit, Save } from 'lucide-react';
import { memo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '../../../components/ui/badge';
import {
	getUserConfig,
	saveUserConfig,
	validateUserConfig
} from '../../../services/localstorage/userConfig';
import { useTheme } from '../../../utils/theme';

// 单个配置项编辑的验证模式
const configItemSchema = z.object({
	key: z.string().min(1, '配置项名称不能为空'),
	value: z.string()
});

type ConfigItemFormData = z.infer<typeof configItemSchema>;

interface UserConfigUpdateProps {
	onUpdate?: (config: UserConfig) => void;
	showSecrets: boolean;
}

const UserConfigUpdate = memo(({ onUpdate, showSecrets }: UserConfigUpdateProps) => {
	// 主题钩子
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedConfigItem, setSelectedConfigItem] = useState<{
		key: string;
		value: string;
		label: string;
		description: string;
	} | null>(null);

	// 格式化密钥显示
	const formatSecret = (value?: string) => {
		if (!value) return '未设置';
		if (showSecrets) return value;
		return '••••••••';
	};

	const form = useForm<ConfigItemFormData>({
		resolver: zodResolver(configItemSchema),
		defaultValues: {
			key: '',
			value: ''
		}
	});

	// 获取当前配置
	const currentConfig = getUserConfig();

	// 配置项列表
	const configItems = [
		// LLM配置
		{
			key: 'llm.deepseek.apiKey',
			value: currentConfig.llm.deepseek.apiKey || '',
			label: 'DeepSeek API Key',
			description: 'DeepSeek平台的API密钥',
			category: 'LLM'
		},
		{
			key: 'llm.openai.apiKey',
			value: currentConfig.llm.openai.apiKey || '',
			label: '国内代理 API Key',
			description: '国内代理平台的API密钥',
			category: 'LLM'
		},
		{
			key: 'llm.openai.baseUrl',
			value: currentConfig.llm.openai.baseUrl || '',
			label: '国内代理 Base URL',
			description: '国内代理平台的API入口地址',
			category: 'LLM'
		},
		...(isOnline
			? []
			: [
					{
						key: 'llm.googleai.apiKey',
						value: currentConfig.llm.googleai.apiKey || '',
						label: 'Google AI API Key',
						description: 'Google AI平台的API密钥',
						category: 'LLM',
						required: false
					}
				]),
		{
			key: 'llm.zhipu.apiKey',
			value: currentConfig.llm.zhipu.apiKey || '',
			label: 'Zhipu AI API Key',
			description: 'Zhipu AI平台的API密钥',
			category: 'LLM',
			required: false
		},
		// {
		// 	key: 'llm.qwen.apiKey',
		// 	value: currentConfig.llm.qwen.apiKey || '',
		// 	label: 'Qwen API Key',
		// 	description: 'Qwen平台的API密钥',
		// 	category: 'LLM'
		// },
		// 向量数据库配置
		{
			key: 'vectorDb.pinecone.apiKey',
			value: currentConfig.vectorDb.pinecone.apiKey || '',
			label: 'Pinecone API Key',
			description: 'Pinecone向量数据库的API密钥',
			category: '向量数据库'
		},
		// 搜索服务配置
		{
			key: 'search.serpapi.apiKey',
			value: currentConfig.search.serpapi.apiKey || '',
			label: 'SerpAPI API Key',
			description: 'SerpAPI搜索服务的API密钥',
			category: '搜索服务',
			required: false
		}
	];

	// 按类别分组配置项
	const groupedConfigItems = configItems.reduce(
		(groups, item) => {
			const category = item.category;
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(item);
			return groups;
		},
		{} as Record<string, typeof configItems>
	);

	// 打开编辑对话框
	const openEditDialog = (item: (typeof configItems)[0]) => {
		setSelectedConfigItem(item);
		form.reset({
			key: item.key,
			value: item.value
		});
		setIsEditDialogOpen(true);
	};

	// 保存单个配置项
	const handleSaveConfigItem = (data: ConfigItemFormData) => {
		try {
			const config = { ...currentConfig };
			const keys = data.key.split('.');

			// 动态设置嵌套对象的值
			let current: any = config;
			for (let i = 0; i < keys.length - 1; i++) {
				if (!current[keys[i]]) {
					current[keys[i]] = {};
				}
				current = current[keys[i]];
			}
			current[keys[keys.length - 1]] = data.value;

			saveUserConfig(config);
			onUpdate?.(config);
			setIsEditDialogOpen(false);
			toast.success('配置项更新成功');
		} catch (error) {
			console.error('保存配置项失败:', error);
			toast.error('保存配置项失败，请重试');
		}
	};

	// 验证配置
	const validation = validateUserConfig(currentConfig);

	return (
		<div className={`space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
			<div className="flex items-center justify-between"></div>

			{/* 配置项列表 */}
			<div className="space-y-6">
				{/* 配置验证状态 */}
				{!validation.isValid && (
					<div
						className={`rounded-lg p-4 ${
							isDark
								? 'bg-yellow-900/30 border border-yellow-700/50'
								: 'bg-yellow-50 border border-yellow-200'
						}`}
					>
						<h4 className={`font-medium mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
							配置不完整
						</h4>
						<ul className={`text-sm space-y-1 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
							{validation.missingFields.map((field, index) => (
								<li key={index}>• {field}</li>
							))}
						</ul>
					</div>
				)}
				{Object.entries(groupedConfigItems).map(([category, items]) => (
					<div key={category} className="space-y-4">
						<h3
							className={`text-lg font-semibold border-b pb-2 ${
								isDark ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'
							}`}
						>
							{category}
						</h3>
						<div className="grid gap-4">
							{items.map(item => (
								<div
									key={item.key}
									className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
										isDark
											? 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'
											: 'border-gray-200 bg-white hover:bg-gray-50'
									}`}
								>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h4 className={`font-medium ${isDark ? 'text-white' : ''}`}>{item.label}</h4>
											{item.required === true && (
												<span
													className={`text-xs px-2 py-1 rounded ${
														isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
													}`}
												>
													必需
												</span>
											)}
											{item.required === false && (
												<span
													className={`text-xs px-2 py-1 rounded ${
														isDark
															? 'bg-green-900/30 text-green-300'
															: 'bg-green-100 text-green-800'
													}`}
												>
													可选
												</span>
											)}
										</div>
										<p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>
											<Badge variant={item.value ? 'default' : 'secondary'}>
												{item.value ? formatSecret(item.value) : '未设置'}
											</Badge>
										</p>
										<p
											className={`text-xs font-mono mt-1 ${
												isDark ? 'text-gray-400' : 'text-muted-foreground'
											}`}
										>
											{item.description}
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => openEditDialog(item)}
										className={isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}
									>
										<Edit className="h-4 w-4 mr-2" />
										编辑
									</Button>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* 编辑配置项对话框 */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent
					className={`${
						isDark
							? 'bg-gray-800 border-gray-700 text-white'
							: 'bg-white border-gray-200 text-gray-900'
					}`}
				>
					<DialogHeader>
						<DialogTitle className={isDark ? 'text-white' : ''}>编辑配置项</DialogTitle>
						<DialogDescription className={isDark ? 'text-gray-300' : ''}>
							{selectedConfigItem?.description}
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSaveConfigItem)} className="space-y-4">
							<FormField
								control={form.control}
								name="key"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={isDark ? 'text-gray-200' : ''}>配置项名称</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled
												className={isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="value"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={isDark ? 'text-gray-200' : ''}>配置值</FormLabel>
										<FormControl>
											<Input
												{...field}
												type={field.name?.includes('apiKey') ? 'password' : 'text'}
												placeholder="请输入配置值"
												className={
													isDark
														? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
														: ''
												}
											/>
										</FormControl>
										<FormDescription className={isDark ? 'text-gray-300' : ''}>
											{selectedConfigItem?.label}的值
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsEditDialogOpen(false)}
									className={isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}
								>
									取消
								</Button>
								<Button
									type="submit"
									className={isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
								>
									<Save className="h-4 w-4 mr-2" />
									保存
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
});

UserConfigUpdate.displayName = 'UserConfigUpdate';

export default UserConfigUpdate;
