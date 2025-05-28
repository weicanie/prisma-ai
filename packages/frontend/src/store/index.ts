import { configureStore } from '@reduxjs/toolkit';
import { breadRouterReducer } from './bread-router';

const store = configureStore({
	reducer: {
		breadRouter: breadRouterReducer
	}
});

export default store;
