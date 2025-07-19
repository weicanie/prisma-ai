/**
 * 将llm返回的内容解析为JSON格式的对象
 */
export function jsonMd_obj(content: string) {
	try {
		JSON.parse(content);
		return content;
	} catch (err) {
		console.log('jsonMd_obj 直接解析错误，尝试修复：', err);
		const jsonMd = content.match(/(?<=```json)(.*)(?=```)/gs)?.[0]; //.默认不匹配\n,需要启用s

		if (!jsonMd) {
			console.error(`jsonMd_obj没找到json内容块,输入: ${content}`);
			return;
		}

		let obj;
		try {
			obj = JSON.parse(jsonMd);
			console.log('修复成功');
		} catch (error) {
			console.error('jsonMd_obj JSON parsing error:', error);
			console.error('jsonMd_obj when parsing:', jsonMd);
		}
		return obj;
	}
}
