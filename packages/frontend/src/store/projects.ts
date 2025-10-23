import {
	markdownToProjectSchema,
	projectSchemaToMarkdown,
	SelectedLLM,
	type ProjectDto
} from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ProjectState {
	data: ProjectDto & { name?: string };
	dataMd: string;
	model: SelectedLLM;
}

const initialMd = `### 1、项目信息

#### 1.1 项目名称

* 名称：


#### 1.2 项目介绍
* 角色与职责：



* 核心贡献与参与程度：




* 背景与目的：



#### 1.3 项目技术栈

<br />

> 在上方写下以逗号或顿号分隔的技术列表。
> 例如：\`HTML、CSS、JavaScript\`。


### 2、项目亮点

#### 2.1 团队贡献
  * 
#### 2.2 技术亮点/难点
  * 
#### 2.3 用户体验/业务价值
  * `;
const isOnline = import.meta.env.VITE_IS_ONLINE === 'true';
const initialState: ProjectState = {
	data: {
		name: '',
		info: {
			name: '',
			desc: {
				role: '',
				contribute: '',
				bgAndTarget: ''
			},
			techStack: []
		},
		lightspot: {
			team: [],
			skill: [],
			user: []
		}
	},
	dataMd: initialMd,
	model: isOnline ? SelectedLLM.gemini_2_5_pro_proxy : SelectedLLM.gemini_2_5_pro
};

const projectSlice = createSlice({
	name: 'project',
	initialState,
	reducers: {
		setDataFromDto: (state, { payload }: PayloadAction<ProjectDto & { name: string }>) => {
			const data = payload;
			state.data = data;
			state.dataMd = projectSchemaToMarkdown(data);
		},
		setDataFromMd: (state, { payload }: PayloadAction<string>) => {
			const dataMd = payload;
			state.dataMd = dataMd;
			state.data = markdownToProjectSchema(dataMd);
		},
		setLLM: (state, { payload }: PayloadAction<SelectedLLM>) => {
			state.model = payload;
		},
		resetProjectData: () => {
			/* state = initialState;不会产生副作用、无法重置state对象。
			因为代理对象没有被操作,因此真正的state对象也不会通过immer修改。

			使用Object.assign(state, initialState)操作代理对象;
			或者直接返回initialState声明一个替换操作。
			 */
			return initialState;
		}
	}
});

// Actions
export const { setDataFromDto, setDataFromMd, setLLM, resetProjectData } = projectSlice.actions;

// Selectors
export const selectProjectData = (state: { project: ProjectState }) => state.project.data;
export const selectProjectMd = (state: { project: ProjectState }) => state.project.dataMd;
export const selectProjectLLM = (state: { project: ProjectState }) => state.project.model;
// Reducer
export const projectReducer = projectSlice.reducer;
