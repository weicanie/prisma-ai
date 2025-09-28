import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LoginState {
	username: string;
	password: string;
	isAutoFill: boolean;
}

const initialState: LoginState = {
	username: '',
	password: '',
	isAutoFill: false
};

const loginSlice = createSlice({
	name: 'login',
	initialState,
	reducers: {
		// 设置注册成功后的用户信息
		setRegistrationInfo: (
			state,
			action: PayloadAction<{
				username: string;
				password: string;
			}>
		) => {
			state.username = action.payload.username;
			state.password = action.payload.password;
			state.isAutoFill = true;
		},
		// 清除自动填写信息
		clearAutoFill: state => {
			state.username = '';
			state.password = '';
			state.isAutoFill = false;
		},
		// 登录成功后清除自动填写信息
		loginSuccess: state => {
			state.username = '';
			state.password = '';
			state.isAutoFill = false;
		}
	}
});

export const { setRegistrationInfo, clearAutoFill, loginSuccess } = loginSlice.actions;

// 选择器
export const selectUsername = (state: { login: LoginState }) => state.login.username;
export const selectPassword = (state: { login: LoginState }) => state.login.password;
export const selectIsAutoFill = (state: { login: LoginState }) => state.login.isAutoFill;

export const loginReducer = loginSlice.reducer;
