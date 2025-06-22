// --- Helper Functions for Formatting ---

import { Replan, Result_step } from '../types';

/**
 * 格式化开发者写入或修改的代码文件列表，以便在Prompt中使用。
 * @param files - 文件列表
 * @returns 格式化后的字符串
 */
export function formatWrittenCodeFiles(files: Result_step['output']['writtenCodeFiles']): string {
	if (!files || files.length === 0) {
		return '无';
	}
	return files.map(file => `- ${file.relativePath}: ${file.summary}`).join('\\n');
}

/**
 * 格式化所有步骤的执行结果历史，以便在Prompt中使用。
 * @param results - 步骤结果列表
 * @returns 格式化后的字符串
 */
export function formatStepResults(results: Result_step[]): string {
	if (!results || results.length === 0) {
		return '尚未执行任何步骤。';
	}
	return results
		.map(
			(r, i) => `
## 第 ${i + 1} 步执行结果

**步骤描述:** ${r.stepDescription}
**执行总结:** ${r.output.summary}
**用户反馈:** ${r.output.userFeedback}
**修改/新增文件:**
${formatWrittenCodeFiles(r.output.writtenCodeFiles)}
`
		)
		.join('\\n---\\n');
}

/**
 * 格式化从项目中读取的代码内容，以便在Prompt中使用。
 * @param codes - 代码文件及其内容列表
 * @returns 格式化后的字符串
 */
export function formatProjectCodes(codes: Replan['projectCodes']): string {
	if (!codes || codes.length === 0) {
		return '未提供任何项目代码。';
	}
	return codes.map(c => `// FILE: ${c.relativePath}\\n${c.content}`).join('\\n\\n---\\n\\n');
}
