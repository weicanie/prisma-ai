import { CodeComparison } from '@/components/magicui/code-comparison';
/* 
1、diff
  支持 Git 风格的 + 和 - 标记： // [!code --]、// [!code ++]

2、聚焦某行： // [!code focus]

3、行高亮：// [!code highlight]
*/
const beforeCode = `### 1、项目信息

#### 1.1 项目名称

* 名称：

<br />

#### 1.2 项目介绍
* 角色和职责：

> 说明你在项目中的角色和职责
>

<br />

* 核心贡献和参与程度：

> 突出你的核心贡献和参与程度 
>

<br />

* 背景和目的：
// [!code focus]
> 简要介绍项目的背景和目的

<br />

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
  *`;

const afterCode = `### 1、项目信息

#### 1.1 项目名称

* 名称：

<br />

#### 1.2 项目介绍
* 角色和职责：

> 说明你在项目中的角色和职责
>

<br />

* 核心贡献和参与程度：

> 突出你的核心贡献和参与程度 
>

<br />

* 背景和目的：

> 简要介绍项目的背景和目的

<br />

#### 1.3 项目技术栈

<br />
// [!code highlight]
> 在上方写下以逗号或顿号分隔的技术栈列表
>
> 例如：React、TypeScript、Tailwind CSS
### 2、项目亮点

#### 2.1 团队贡献
  * 
// [!code --]
#### 2.2 技术亮点/难点
  * 
// [!code ++]
#### 2.3 用户体验/业务价值
  *`;

export function CodeComparisonDemo() {
	return (
		<CodeComparison
			beforeCode={beforeCode}
			afterCode={afterCode}
			language="markdown"
			filename="middleware.ts"
			lightTheme="github-light"
			darkTheme="github-dark"
			highlightColor="rgba(101, 117, 133, 0.16)"
		/>
	);
}
