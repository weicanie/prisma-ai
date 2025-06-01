import {
	markdownToProjectSchema,
	projectSchemaToMarkdown,
	type ProjectDto
} from '@prism-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ProjectState {
	data: ProjectDto;
	dataMd: string;
}

const initialMdWithComment = `### 1、项目信息

#### 1.1 项目名称

* 名称：


#### 1.2 项目介绍
* 角色和职责：

> 说明你在项目中的角色和职责
>


* 核心贡献和参与程度：

> 突出你的核心贡献和参与程度 
>


* 背景和目的：

> 简要介绍项目的背景和目的


#### 1.3 项目技术栈

<br />

> 在上方写下以逗号或顿号分隔的技术栈列表
>
> 例如：React、TypeScript、Tailwind CSS
### 2、项目亮点

#### 2.1 团队贡献
  * 
#### 2.2 技术亮点/难点
  * 
#### 2.3 用户体验/业务价值
  * `;

const initialMd = `### 1、项目信息

#### 1.1 项目名称

* 名称：


#### 1.2 项目介绍
* 角色和职责：



* 核心贡献和参与程度：




* 背景和目的：



#### 1.3 项目技术栈

<br />

### 2、项目亮点

#### 2.1 团队贡献
  * 
#### 2.2 技术亮点/难点
  * 
#### 2.3 用户体验/业务价值
  * `;

const initialState: ProjectState = {
	data: {
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
	dataMd: initialMd
};

const projectSlice = createSlice({
	name: 'project',
	initialState,
	reducers: {
		setDataFromDto: (state, { payload }: PayloadAction<ProjectDto>) => {
			const data = payload;
			state.data = data;
			state.dataMd = projectSchemaToMarkdown(data);
		},
		setDataFromMd: (state, { payload }: PayloadAction<string>) => {
			const dataMd = payload;
			console.log('🚀 ~ dataMd:', JSON.stringify(dataMd));
			state.dataMd = dataMd;
			state.data = markdownToProjectSchema(dataMd);
		},
		clear: () => {
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
export const { setDataFromDto, setDataFromMd, clear } = projectSlice.actions;

// Selectors
export const selectProjectData = (state: { project: ProjectState }) => state.project.data;
export const selectProjectMd = (state: { project: ProjectState }) => state.project.dataMd;

// Reducer
export const projectReducer = projectSlice.reducer;
