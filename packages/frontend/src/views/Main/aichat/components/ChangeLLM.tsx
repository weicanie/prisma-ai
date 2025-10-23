import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { isOnline } from '@/utils/constants';
import { useTheme } from '@/utils/theme';
import { AIChatLLM } from '@prisma-ai/shared';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { Bot, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const aichatModelConfigs = {
	...(isOnline
		? {}
		: {
				[AIChatLLM.gemini_2_5_flash]: {
					shortName: '2.5 Flash',
					fullName: '2.5 Flash',
					scenario: 'google'
				},
				[AIChatLLM.gemini_2_5_pro]: {
					shortName: '2.5 Pro',
					fullName: '2.5 Pro',
					scenario: 'google'
				}
			}),

	[AIChatLLM.gemini_2_5_pro_proxy]: {
		shortName: '2.5 Pro',
		fullName: '2.5 Pro',
		scenario: '国内代理'
	},
	[AIChatLLM.v3]: {
		shortName: 'V3',
		fullName: 'V3',
		scenario: 'deepseek'
	},
	[AIChatLLM.r1]: {
		shortName: 'V3 Thinking',
		fullName: 'V3 Thinking',
		scenario: 'deepseek'
	},
	[AIChatLLM.glm_4_6]: {
		shortName: 'GLM 4.6',
		fullName: 'GLM 4.6',
		scenario: 'zhipu'
	}
};

/**
 * ChangeLLM 组件的 Props 接口
 */
interface ChangeLLMProps {
	/** 用于读取当前选中模型的 selector 函数 */
	selector: (state: any) => any;
	/** 用于设置模型的 action creator */
	setModelAction: ActionCreatorWithPayload<any>;
	/** 可选的自定义类名 */
	className?: string;
	/** 可选的按钮尺寸 */
	size?: 'sm' | 'default' | 'lg';
}

/**
 * 可复用的 LLM 模型切换组件
 * @param props - 组件属性
 * @returns JSX 元素
 */
export function ChangeLLM({ selector, setModelAction, className, size = 'sm' }: ChangeLLMProps) {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';
	const dispatch = useDispatch();
	const currentModel = useSelector(selector);
	const [open, setOpen] = useState(false);

	const handleModelChange = (model: AIChatLLM) => {
		dispatch(setModelAction(model));
		setOpen(false);
	};
	const modelChoices = aichatModelConfigs;

	const currentConfig: {
		shortName: string;
		fullName: string;
		scenario: string;
		description?: string;
	} = modelChoices[currentModel as keyof typeof modelChoices]!;

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
	const isMobile = useIsMobile();

	return (
		<Popover open={open} onOpenChange={setOpen} modal={false}>
			<PopoverTrigger asChild>
				{isMobile ? (
					<Button
						variant="outline"
						size={size}
						className={`h-8 gap-1 text-sm font-medium ${colorScheme.button.bg} ${colorScheme.button.border} ${colorScheme.button.text} ${colorScheme.button.hover} ${className || ''}`}
					>
						<Bot className="size-4!" />
					</Button>
				) : (
					<Button
						variant="outline"
						size={size}
						className={`h-8 gap-1 text-sm font-medium ${colorScheme.button.bg} ${colorScheme.button.border} ${colorScheme.button.text} ${colorScheme.button.hover} ${className || ''}`}
					>
						{currentConfig.fullName}
						<ChevronDown className="h-3 w-3" />
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent
				className={` p-0 ${colorScheme.popover.bg} ${colorScheme.popover.border}  max-h-[80vh] overflow-y-auto scb-thin`}
				align="start"
				//! 当在Sheet中时，仍然通过Portal渲染到body而不是Sheet的组件树中，导致无法正常交互，hover、click都被Sheet的组件树拦截从而被判定为外部交互，hover会不响应、点击会导致关闭
				//通过 radix-ui的container api将PopoverContent渲染到Sheet的组件树中
				//@ts-expect-error container is not a valid prop for PopoverContent
				container={
					typeof document !== 'undefined' ? document.getElementById('ai-chat-sheet') : undefined
				}
			>
				<div className="p-2">
					<div className={`text-sm font-medium mb-2 px-2 ${colorScheme.title.text}`}>选择模型</div>
					<div className="space-y-1">
						{Object.entries(modelChoices).map(([modelKey, config]) => {
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
									onClick={() => handleModelChange(modelKey as AIChatLLM)}
								>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className={`text-sm font-medium ${colorScheme.item.name.text}`}>
												{config.fullName}
											</span>
											<span
												className={`text-xs px-2 py-0.5 rounded ${colorScheme.item.shortName.bg} ${colorScheme.item.shortName.text}`}
											>
												{config.shortName}
											</span>
											<span className={`text-xs mb-1 ${colorScheme.item.scenario.text}`}>
												{config.scenario}
											</span>
										</div>

										{/* <div className={`text-xs ${colorScheme.item.description.text}`}>
											{config.description}
										</div> */}
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
