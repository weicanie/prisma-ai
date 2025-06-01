import { configureStore } from '@reduxjs/toolkit';
import { breadRouterReducer } from './bread-router';
import { projectReducer } from './projects';

const store = configureStore({
	reducer: {
		breadRouter: breadRouterReducer,
		project: projectReducer
	}
});

export default store;
