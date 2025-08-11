import { markdownToSkills, skillsToMarkdown, type CreateSkillDto } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SkillState {
	data: CreateSkillDto;
	dataMd: string;
}

const initialMdWithComment = `## 职业技能

<br />

> 在上方写下某一类别的以逗号或顿号分隔的技能列表.
> 例如:\`- 前端基础: HTML、CSS、JavaScript\`.
> 表达技能的组合使用+或者和.
`;
// const initialMd = `## 职业技能

// <br />

// `;
// 生成默认简历名称
const generateDefaultSkillName = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	//随机生成6位数字
	const randomNumber = Math.floor(100000 + Math.random() * 900000);
	return `我的职业技能-${year}-${month}-${day}-${randomNumber}`;
};
const initialState: SkillState = {
	data: {
		name: generateDefaultSkillName(),
		content: []
	},
	dataMd: initialMdWithComment
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
