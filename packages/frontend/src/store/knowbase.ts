import { ProjectKnowledgeTypeEnum, type CreateProjectKnowledgeDto } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface KnowledgeState {
	data: CreateProjectKnowledgeDto;
}

const initialState: KnowledgeState = {
	data: {
		name: '',
		fileType: 'txt',
		projectName: '',
		tag: [],
		type: ProjectKnowledgeTypeEnum.other,
		content: ''
	}
};

const knowledgeSlice = createSlice({
	name: 'knowledge',
	initialState,
	reducers: {
		setKnowledgeDataFromDto: (state, { payload }: PayloadAction<CreateProjectKnowledgeDto>) => {
			state.data = payload;
		},
		updateKnowledgeField: (
			state,
			{ payload }: PayloadAction<{ field: keyof CreateProjectKnowledgeDto; value: any }>
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
