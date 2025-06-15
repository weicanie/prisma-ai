import type { CreateResumeDto } from '@prism-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Resume {
	data: CreateResumeDto & {
		resumeId: string; //当前选中的简历ID
		jobId: string; //当前选中的岗位ID
	};
}

const initialState: Resume = {
	data: {
		name: '',
		skill: '', //当前选中的职业技能
		projects: [], //当前选中的项目经验
		resumeId: '',
		jobId: ''
	}
};

const ResumeSlice = createSlice({
	name: 'Resume',
	initialState,
	reducers: {
		setResumeData: (state, action: PayloadAction<Partial<Resume['data']>>) => {
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
