import { KnowledgeTypeEnum, type CreateKnowledgeDto } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface KnowledgeState {
	data: CreateKnowledgeDto;
}

const initialState: KnowledgeState = {
	data: {
		name: '',
		fileType: 'txt',
		tag: [],
		type: KnowledgeTypeEnum.other,
		content: ''
	}
};

const knowledgeSlice = createSlice({
	name: 'knowledge',
	initialState,
	reducers: {
		setKnowledgeDataFromDto: (state, { payload }: PayloadAction<CreateKnowledgeDto>) => {
			state.data = payload;
		},
		updateKnowledgeField: (
			state,
			{ payload }: PayloadAction<{ field: keyof CreateKnowledgeDto; value: any }>
		) => {
			const { field, value } = payload;
			(state.data as any)[field] = value;
		},
		resetKnowledgeData: () => {
			return initialState;
		}
	}
});

// Actions
export const { setKnowledgeDataFromDto, updateKnowledgeField, resetKnowledgeData } =
	knowledgeSlice.actions;

// Selectors
export const selectKnowledgeData = (state: { knowledge: KnowledgeState }) => state.knowledge.data;

// Reducer
export const knowledgeReducer = knowledgeSlice.reducer;
