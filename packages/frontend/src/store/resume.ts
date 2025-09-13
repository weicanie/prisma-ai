import type { CreateResumeDto } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Resume {
	data: CreateResumeDto & {
		resumeId: string; //当前选中的简历ID
		jobId: string; //当前选中的岗位ID
		resuemIdToMatch: string; //当前选中的简历ID
	};
}

const initialState: Resume = {
	data: {
		name: '',
		skill: '', //当前选中的职业技能
		projects: [], //当前选中的项目经验
		careers: [], //当前选中的工作经历
		educations: [], //当前选中的教育经历
		/* 面向岗位定制简历 */
		resumeId: '', //当前选中的简历ID
		jobId: '', //当前选中的岗位ID
		/* 人岗匹配：简历匹配岗位 */
		resuemIdToMatch: '' //当前选中的简历ID
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
