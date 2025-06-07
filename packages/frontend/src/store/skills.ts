import { markdownToSkills, skillsToMarkdown, type CreateSkillDto } from '@prism-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SkillState {
	data: CreateSkillDto;
	dataMd: string;
}

// const initialMdWithComment = `## 职业技能

// <br />

// > 在上方写下某一类别的以逗号或顿号分隔的技能列表
// > 例如：* 前端基础: HTML、CSS、JavaScript
// `;
const initialMd = `## 职业技能

<br />


`;
const initialState: SkillState = {
	data: {
		content: []
	},
	dataMd: initialMd
};

const skillSlice = createSlice({
	name: 'skill',
	initialState,
	reducers: {
		setSkillDataFromDto: (state, { payload }: PayloadAction<CreateSkillDto>) => {
			const data = payload;
			state.data = data;
			state.dataMd = skillsToMarkdown(data);
		},
		setSkillDataFromMd: (state, { payload }: PayloadAction<string>) => {
			const dataMd = payload;
			state.dataMd = dataMd;
			state.data = markdownToSkills(dataMd);
		},
		resetSkillData: () => {
			return initialState;
		}
	}
});
// Actions
export const { setSkillDataFromDto, setSkillDataFromMd, resetSkillData } = skillSlice.actions;

// Selectors
export const selectSkillData = (state: { skill: SkillState }) => state.skill.data;
export const selectSkillMd = (state: { skill: SkillState }) => state.skill.dataMd;

// Reducer
export const skillReducer = skillSlice.reducer;
