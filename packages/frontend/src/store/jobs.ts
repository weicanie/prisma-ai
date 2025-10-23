import { JobOpenStatus, SelectedLLM, type CreateJobDto } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isOnline } from '../utils/constants';

interface JobState {
	data: CreateJobDto;
	model: SelectedLLM;
}

const initialState: JobState = {
	data: {
		jobName: '',
		companyName: '',
		description: '',
		location: '',
		salary: '',
		link: '',
		job_status: JobOpenStatus.OPEN // 默认状态为 "open"
	},
	model: isOnline ? SelectedLLM.gemini_2_5_pro_proxy : SelectedLLM.gemini_2_5_pro
};

const JobSlice = createSlice({
	name: 'Job',
	initialState,
	reducers: {
		setData: (state, action: PayloadAction<CreateJobDto>) => {
			state.data = action.payload;
		},
		reset: state => {
			Object.assign(state, initialState);
		},
		setJobModel: (state, action: PayloadAction<SelectedLLM>) => {
			state.model = action.payload;
		}
	}
});

// Actions
export const { setData, reset, setJobModel } = JobSlice.actions;

// Selectors
export const selectJobData = (state: { job: JobState }) => state.job.data;
export const selectJobModel = (state: { job: JobState }) => state.job.model;
// Reducer
export const JobReducer = JobSlice.reducer;
