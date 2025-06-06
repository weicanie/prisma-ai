/**
 * 将llm返回的内容解析为JSON格式的对象
 */
export function jsonMd_obj(content: string) {
	let jsonMd = content.match(/(?<=```json)(.*)(?=```)/gs)?.[0]; //.默认不匹配\n

	if (!jsonMd) {
		console.error(`jsonMd_obj没找到json内容块,输入: ${content}`);
		return;
	}

	let obj;
	try {
		obj = JSON.parse(jsonMd);
	} catch (error) {
		console.error('jsonMd_obj JSON parsing error:', error);
		console.error('jsonMd_obj when parsing:', jsonMd);
	}
	return obj;
}
