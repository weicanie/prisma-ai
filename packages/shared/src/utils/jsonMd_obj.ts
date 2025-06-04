export function jsonMd_obj(content: string) {
	let jsonMd = content.match(/(?<=```json)(.*)(?=```)/gs)?.[0]; //.默认不匹配\n

	if (!jsonMd) {
		console.error(`No JSON content found in the provided string: ${content}`);
		return;
	}
	// jsonMd = jsonMd.replace('```json', '');
	// jsonMd = jsonMd.replace('```', '');
	let obj;
	try {
		obj = JSON.parse(jsonMd);
	} catch (error) {
		console.error('JSON parsing error:', error);
		console.error('when parsing:', jsonMd);
	}
	return obj;
}
