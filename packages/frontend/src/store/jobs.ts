import { JobOpenStatus, type CreateJobDto } from '@prism-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface JobState {
	data: CreateJobDto;
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
	}
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
		}
	}
});

// Actions
export const { setData, reset } = JobSlice.actions;

// Selectors
export const selectJobData = (state: { job: JobState }) => state.job.data;
// Reducer
export const JobReducer = JobSlice.reducer;
