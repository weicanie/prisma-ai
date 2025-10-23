import { AIChatLLM } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isOnline } from '../utils/constants';

// AI聊天模块的状态接口
export interface AIChatState {
	model: AIChatLLM;
	lastConversation: string; // 上一次对话的keyname，用于恢复对话
	project_id: string; // 作为背景的项目经验id
}

// 初始化状态
const initialState: AIChatState = {
	model: isOnline ? AIChatLLM.v3 : AIChatLLM.gemini_2_5_pro,
	lastConversation: '',
	project_id: ''
};

// 创建 AI聊天 的 Redux Slice
const AIChatSlice = createSlice({
	name: 'aichat',
	initialState,
	reducers: {
		// 设置选中的LLM模型
		setAIChatLLM: (state, { payload }: PayloadAction<AIChatLLM>) => {
			state.model = payload;
		},
		setAIChatLastConversation: (state, { payload }: PayloadAction<string>) => {
			state.lastConversation = payload;
		},
		setAIChatProjectId: (state, { payload }: PayloadAction<string>) => {
			state.project_id = payload;
		}
	}
});

// 导出 Actions
export const { setAIChatLLM, setAIChatLastConversation, setAIChatProjectId } = AIChatSlice.actions;

// 导出 Selector，用于从 store 中获取 AI聊天 相关数据
export const selectAIChatLLM = (state: { aichat: AIChatState }) => state.aichat.model;
export const selectAIChatLastConversation = (state: { aichat: AIChatState }) =>
	state.aichat.lastConversation;
export const selectAIChatProjectId = (state: { aichat: AIChatState }) => state.aichat.project_id;

// 导出 Reducer，用于在 store 中注册
export const AIChatReducer = AIChatSlice.reducer;
