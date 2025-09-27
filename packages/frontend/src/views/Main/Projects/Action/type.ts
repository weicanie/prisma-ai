import type {
	lookupResultDto,
	ProjectDto,
	projectLookupedDto,
	ProjectMinedDto,
	ProjectPolishedDto
} from '@prisma-ai/shared';

const actionHeaderMap = {
	lookup: {
		title: 'AI分析结果',
		desc: 'AI的深度分析结果'
	},
	polish: {
		title: 'AI优化结果',
		desc: '深度优化后的项目经验'
	},
	mine: {
		title: 'AI挖掘结果',
		desc: '深度挖掘的项目亮点'
	},
	collaborate: {
		title: 'AI协作结果',
		desc: '与AI Agent协作的结果'
	},
	businessLookup: {
		title: 'AI业务分析结果',
		desc: 'AI的业务分析结果'
	},
	businessPaper: {
		title: 'AI业务生成结果',
		desc: 'AI的业务生成结果'
	}
};

enum ActionType {
	lookup = 'lookup',
	polish = 'polish',
	mine = 'mine',
	collaborate = 'collaborate',
	businessLookup = 'businessLookup',
	businessPaper = 'businessPaper'
}

interface ActionHandlers extends Record<keyof typeof actionHeaderMap, (...args: any[]) => void> {
	lookup: () => void;
	polish: () => void;
	mine: () => void;
	collaborate: (content: string, projectPath: string) => void;
	businessLookup: () => void;
	businessPaper: () => void;
}

interface PreflightBtnsProps {
	availableActions: string[];
	actionHandlers: ActionHandlers;
}

interface ProjectResultProps {
	resultData: lookupResultDto | ProjectPolishedDto | ProjectMinedDto | string | null; //行动结果
	mergedData: projectLookupedDto | ProjectDto | null; //正式合并后的数据
	actionType: keyof typeof actionHeaderMap | null;
	availableActions: string[];

	actionHandlers: ActionHandlers;

	handleMerge?: () => void; //完成优化
	handleFeedback: (content: string) => void; //用户反馈,反思并重新优化

	content: string; //生成内容-流式
	reasonContent?: string; //推理内容-流式
	isReasoning?: boolean; //是否完成推理
	done?: boolean; //是否完成生成
}

export {
	actionHeaderMap,
	ActionType,
	type ActionHandlers,
	type PreflightBtnsProps,
	type ProjectResultProps
};
