import { configureStore } from '@reduxjs/toolkit';
import { AIChatReducer } from './aichat';
import { breadRouterReducer } from './bread-router';
import { JobReducer } from './jobs';
import { knowledgeReducer } from './knowbase';
import { loginReducer } from './login';
import { notificationReducer } from './notification';
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
		knowledge: knowledgeReducer,
		aichat: AIChatReducer,
		login: loginReducer,
		notification: notificationReducer
	}
});

export default store;
