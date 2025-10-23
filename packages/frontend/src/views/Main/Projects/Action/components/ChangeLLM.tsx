import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { selectProjectLLM, setLLM } from '@/store/projects';
import { isOnline } from '@/utils/constants';
import { useTheme } from '@/utils/theme';
import { SelectedLLM } from '@prisma-ai/shared';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// 模型配置
const modelConfigs = {
	...(isOnline
		? {}
		: {
				[SelectedLLM.gemini_2_5_pro]: {
					shortName: '2.5 Pro',
					fullName: 'Gemini 2.5 Pro',
					scenario: '复杂推理 · 动态思考 · 首选模型'
				}
			}),
	[SelectedLLM.gemini_2_5_pro_proxy]: {
		shortName: '2.5 Pro',
		fullName: 'Gemini 2.5 Pro 国内代理',
		scenario: '复杂推理 · 动态思考 · 首选模型'
	},
	[SelectedLLM.deepseek_reasoner]: {
		shortName: 'R1',
		fullName: 'DeepSeek R1',
		scenario: '逻辑推理 · 思考过程 · 次选模型'
	},
	...(isOnline
		? {}
		: {
				[SelectedLLM.gemini_2_5_flash]: {
					shortName: '2.5 Flash',
					fullName: 'Gemini 2.5 Flash',
					scenario: '逻辑推理 · 高性价比 · 次选模型'
				}
			}),
	[SelectedLLM.glm_4_6]: {
		shortName: 'GLM 4.6',
		fullName: 'GLM 4.6',
		scenario: '逻辑推理 · 动态思考 · 次选模型'
	}
};

export function ChangeLLM() {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';
	const dispatch = useDispatch();
	const currentModel = useSelector(selectProjectLLM);
	const [open, setOpen] = useState(false);

	const handleModelChange = (model: SelectedLLM) => {
		dispatch(setLLM(model));
		setOpen(false);
	};

	const currentConfig = modelConfigs[currentModel]!;

	// 颜色方案
	const colorScheme = {
		// 按钮颜色
		button: {
			bg: isDark ? 'bg-gray-800' : 'bg-white',
			border: isDark ? 'border-gray-600' : 'border-gray-300',
			text: isDark ? 'text-gray-100' : 'text-gray-900',
			hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
		},
		// 弹窗颜色
		popover: {
			bg: isDark ? 'bg-gray-800' : 'bg-white',
			border: isDark ? 'border-gray-600' : 'border-gray-200'
		},
		// 标题颜色
		title: {
			text: isDark ? 'text-gray-100' : 'text-gray-900'
		},
		// 模型项颜色
		item: {
			selected: {
				bg: isDark ? 'bg-blue-900/50' : 'bg-blue-50',
				border: isDark ? 'border-blue-700' : 'border-blue-200'
			},
			unselected: {
				hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
				border: 'border-transparent'
			},
			name: {
				text: isDark ? 'text-gray-100' : 'text-gray-900'
			},
			shortName: {
				bg: isDark ? 'bg-gray-700' : 'bg-gray-100',
				text: isDark ? 'text-gray-300' : 'text-gray-500'
			},
			scenario: {
				text: isDark ? 'text-blue-400' : 'text-blue-600'
			},
			description: {
				text: isDark ? 'text-gray-400' : 'text-gray-500'
			}
		},
		// 选中图标颜色
		checkIcon: {
			text: isDark ? 'text-blue-400' : 'text-blue-600'
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={`h-8 gap-1 text-sm font-medium ${colorScheme.button.bg} ${colorScheme.button.border} ${colorScheme.button.text} ${colorScheme.button.hover}`}
				>
					{currentConfig.shortName}
					<ChevronDown className="h-3 w-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={`w-80 p-0 ${colorScheme.popover.bg} ${colorScheme.popover.border}`}
				align="start"
			>
				<div className="p-2">
					<div className={`text-sm font-medium mb-2 px-2 ${colorScheme.title.text}`}>选择模型</div>
					<div className="space-y-1">
						{Object.entries(modelConfigs).map(([modelKey, config]) => {
							const isSelected = currentModel === modelKey;
							return (
								<div
									key={modelKey}
									className={`
										flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors
										${
											isSelected
												? `${colorScheme.item.selected.bg} border ${colorScheme.item.selected.border}`
												: `${colorScheme.item.unselected.hover} border ${colorScheme.item.unselected.border}`
										}
									`}
									onClick={() => handleModelChange(modelKey as SelectedLLM)}
								>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className={`font-medium ${colorScheme.item.name.text}`}>
												{config.fullName}
											</span>
											<span
												className={`text-xs px-2 py-0.5 rounded ${colorScheme.item.shortName.bg} ${colorScheme.item.shortName.text}`}
											>
												{config.shortName}
											</span>
										</div>
										<div className={`text-xs mb-1 ${colorScheme.item.scenario.text}`}>
											{config.scenario}
										</div>
									</div>
									{isSelected && (
										<Check className={`h-4 w-4 flex-shrink-0 ml-2 ${colorScheme.checkIcon.text}`} />
									)}
								</div>
							);
						})}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
