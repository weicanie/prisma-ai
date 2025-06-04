import type { CreateResumeDto } from '@prism-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Resume {
	data: CreateResumeDto;
}

const initialState: Resume = {
	data: {
		name: '',
		skill: '',
		projects: []
	}
};

const ResumeSlice = createSlice({
	name: 'Resume',
	initialState,
	reducers: {
		setResumeData: (state, action: PayloadAction<Partial<CreateResumeDto>>) => {
			state.data = Object.assign(state.data, action.payload);
		},
		resetResumeData: () => initialState
	}
});

// Actions
export const { setResumeData, resetResumeData } = ResumeSlice.actions;

// Selectors
export const selectResumeData = (state: { resume: Resume }) => state.resume.data;

// Reducer
export const ResumeReducer = ResumeSlice.reducer;
