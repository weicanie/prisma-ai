import { configureStore } from '@reduxjs/toolkit';
import { breadRouterReducer } from './bread-router';
import { JobReducer } from './jobs';
import { knowledgeReducer } from './knowbase';
import { projectReducer } from './projects';
import { ResumeReducer } from './resume';
import { skillReducer } from './skills';

const store = configureStore({
	reducer: {
		breadRouter: breadRouterReducer,
		project: projectReducer,
		skill: skillReducer,
		resume: ResumeReducer,
		job: JobReducer,
		knowledge: knowledgeReducer
	}
});

export default store;
