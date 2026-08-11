const HEADING = /^\s*(?:[-*+]\s*)?(#{1,6})\s+(.+?)\s*$/;

export function normalizePdfMindmap(input: string, question: string) {
	const lines = input.replace(/```(?:markdown|md)?/gi, '').replace(/```/g, '').split(/\r?\n/);
	const normalized: string[] = [];
	let previousLevel = 0;
	for (const raw of lines) {
		const line = raw.trim();
		if (!line) continue;
		const match = line.match(HEADING);
		if (!match) {
			normalized.push(line);
			continue;
		}
		let level = match[1].length;
		if (!previousLevel) level = 1;
		else level = Math.min(level, previousLevel + 1);
		previousLevel = level;
		normalized.push(`${'#'.repeat(level)} ${match[2].trim()}`);
	}
	if (!normalized.some(line => /^#\s+/.test(line))) {
		const content = normalized.length ? normalized : ['- 核心要点待补充'];
		return [`# ${question}`, '## 核心要点', ...content.map(line => line.startsWith('-') ? line : `- ${line}`)].join('\n');
	}
	const firstHeading = normalized.findIndex(line => /^#+\s+/.test(line));
	normalized[firstHeading] = `# ${normalized[firstHeading].replace(/^#+\s+/, '')}`;
	if (!normalized.some((line, index) => index > firstHeading && /^(##\s+|-\s+)/.test(line))) normalized.push('## 核心要点', '- 待补充');
	return normalized.join('\n');
}

export function hasValidPdfMindmap(input: string) {
	return /^#\s+.+/m.test(input) && (/^##\s+.+/m.test(input) || /^-\s+.+/m.test(input));
}
